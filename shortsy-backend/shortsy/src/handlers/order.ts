import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from 'aws-lambda';
import { z } from 'zod';
import { ok, apiError } from '../utils/response';
import { reqId, getUser, parseBody } from '../utils/lambda';
import { createGatewayOrder } from '../services/rental.service';
import { dynamo, TABLES } from '../config/aws';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuid } from 'uuid';

const orderSchema = z.object({
  contentId: z.string().min(1),
  amountINR: z.number().min(1),
  currency: z.string().optional(),
  receipt: z.string().min(1),
});

export const createOrder: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (event) => {
  const rid = reqId(event);
  const user = getUser(event);
  const parsed = orderSchema.safeParse(parseBody(event));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', parsed.error.errors[0].message, rid);

  try {
    const { amountINR, receipt, contentId } = parsed.data;
    const order = await createGatewayOrder(amountINR, receipt);
    
    // Create custom orderId and store in DynamoDB
    const customOrderId = `ord_${uuid().replace(/-/g, '').slice(0, 12)}`;
    const orderRecord = {
      orderId: customOrderId,
      userId: user.id,
      contentId,
      amountINR,
      gatewayOrderId: order.id,
      status: 'pending',
      ttl: Math.floor(Date.now() / 1000) + 1800, // 30-min TTL
      createdAt: new Date().toISOString(),
    };
    
    await dynamo.send(new PutCommand({ TableName: TABLES.ORDERS, Item: orderRecord }));
    
    console.log(`[rentals.createOrder] User ${user.id} created order ${customOrderId} (gateway: ${order.id}) for amount INR ${amountINR}`);
    return ok({ 
      orderId: customOrderId,
      gatewayOrderId: order.id,
      gatewayKey: process.env.RAZORPAY_KEY_ID || 'rzp_test_dev',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });
  } catch (err) {
    return apiError(500, 'ORDER_CREATION_FAILED', (err as Error).message, rid);
  }
};

/**
 * GET /v1/order/history
 * Retrieves payment history for the authenticated user
 */
export const getPaymentHistory: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (event) => {
  const rid = reqId(event);
  const user = getUser(event);

  try {
    // Query Orders table by userId using GSI
    const result = await dynamo.send(new QueryCommand({
      TableName: TABLES.ORDERS,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': user.id,
      },
      ScanIndexForward: false, // Sort by creation time descending (most recent first)
    }));

    const orders = (result.Items || []).map(item => ({
      orderId: item.orderId,
      contentId: item.contentId,
      amountINR: item.amountINR,
      gatewayOrderId: item.gatewayOrderId,
      gatewayPaymentId: item.gatewayPaymentId || null,
      transactionId: item.transactionId || null,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt || item.createdAt,
    }));

    console.log(`[order.getPaymentHistory] Retrieved ${orders.length} order(s) for user ${user.id}`);
    return ok({ 
      orders,
      count: orders.length,
    });
  } catch (err) {
    console.error('[order.getPaymentHistory]', err);
    return apiError(500, 'FAILED_TO_FETCH_HISTORY', (err as Error).message, rid);
  }
};
