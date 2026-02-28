import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from 'aws-lambda';
import { z } from 'zod';
import { ok, apiError } from '../utils/response';
import { reqId, getUser, parseBody } from '../utils/lambda';
import { createGatewayOrder } from '../services/rental.service';

const orderSchema = z.object({
  amountINR: z.number().min(1),
  receipt: z.string().min(1),
});

export const createOrder: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (event) => {
  const rid = reqId(event);
  const user = getUser(event);
  const parsed = orderSchema.safeParse(parseBody(event));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', parsed.error.errors[0].message, rid);

  try {
    const { amountINR, receipt } = parsed.data;
    const order = await createGatewayOrder(amountINR, receipt);
    console.log(`[rentals.createOrder] User ${user.id} created order ${order.id} for amount INR ${amountINR}`);
    return ok({ orderId: order.id });
  } catch (err) {
    return apiError(500, 'ORDER_CREATION_FAILED', (err as Error).message, rid);
  }
};
