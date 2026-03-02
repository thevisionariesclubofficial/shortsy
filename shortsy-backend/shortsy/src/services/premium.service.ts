import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { ENV } from '../config/aws';

const ddbClient = new DynamoDBClient({ region: ENV.region });
const docClient = DynamoDBDocumentClient.from(ddbClient);

export interface PremiumSubscription {
  userId: string;
  subscriptionId: string;
  orderId: string;
  gatewayPaymentId: string;
  gatewayOrderId?: string;
  gatewaySignature?: string;
  amountINR: number;
  currency: string;
  status: 'pending' | 'active' | 'expired';
  subscribedAt: string;
  expiresAt: string;
  createdAt: string;
}

/**
 * Create a Razorpay order for premium subscription
 */
export async function initiatePremiumSubscription(userId: string): Promise<{
  orderId: string;
  gatewayOrderId: string;
  gatewayKey: string;
  amountINR: number;
  currency: string;
}> {
  const orderId = uuidv4();
  const amountINR = 199; // ₹199 for premium subscription
  const currency = 'INR';

  // Create Razorpay order
  const Razorpay = await import('razorpay');
  const razorpay = new Razorpay.default({
    key_id: ENV.razorpayKeyId,
    key_secret: ENV.razorpayKeySecret,
  });

  const razorpayOrder = await razorpay.orders.create({
    amount: amountINR * 100, // paise
    currency,
    receipt: orderId,
  });

  // Store pending subscription in DynamoDB
  const now = new Date().toISOString();
  const subscription: PremiumSubscription = {
    userId,
    subscriptionId: orderId,
    orderId,
    gatewayPaymentId: '', // Will be filled after payment
    gatewayOrderId: razorpayOrder.id,
    amountINR,
    currency,
    status: 'pending',
    subscribedAt: '',
    expiresAt: '',
    createdAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: ENV.premiumsTableName,
      Item: {
        ...subscription,
        ttl: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes TTL for pending orders
      },
    })
  );

  return {
    orderId,
    gatewayOrderId: razorpayOrder.id,
    gatewayKey: ENV.razorpayKeyId,
    amountINR,
    currency,
  };
}

/**
 * Confirm premium subscription payment
 */
export async function confirmPremiumSubscription(params: {
  orderId: string;
  gatewayPaymentId: string;
  gatewaySignature: string;
}): Promise<PremiumSubscription> {
  const { orderId, gatewayPaymentId, gatewaySignature } = params;

  // Get the pending subscription
  const result = await docClient.send(
    new QueryCommand({
      TableName: ENV.premiumsTableName,
      IndexName: 'OrderIdIndex',
      KeyConditionExpression: 'orderId = :orderId',
      ExpressionAttributeValues: {
        ':orderId': orderId,
      },
    })
  );

  if (!result.Items || result.Items.length === 0) {
    throw new Error('Subscription order not found');
  }

  const subscription = result.Items[0] as PremiumSubscription;

  // Verify Razorpay signature
  const crypto = await import('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', ENV.razorpayKeySecret)
    .update(`${subscription.gatewayOrderId}|${gatewayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== gatewaySignature) {
    throw new Error('Invalid payment signature');
  }

  // Update subscription status to active
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  const updatedSubscription: PremiumSubscription = {
    ...subscription,
    gatewayPaymentId,
    gatewaySignature,
    status: 'active',
    subscribedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: ENV.premiumsTableName,
      Item: updatedSubscription,
      // Remove TTL for active subscriptions
      ConditionExpression: 'attribute_exists(orderId)',
    })
  );

  return updatedSubscription;
}

/**
 * Get user's active premium subscription
 */
export async function getUserPremiumSubscription(userId: string): Promise<PremiumSubscription | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: ENV.premiumsTableName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false, // Most recent first
      Limit: 1,
    })
  );

  if (!result.Items || result.Items.length === 0) {
    return null;
  }

  const subscription = result.Items[0] as PremiumSubscription;

  // Check if subscription is expired
  if (subscription.status === 'active' && new Date(subscription.expiresAt) < new Date()) {
    // Mark as expired
    await docClient.send(
      new PutCommand({
        TableName: ENV.premiumsTableName,
        Item: {
          ...subscription,
          status: 'expired',
        },
      })
    );
    return null;
  }

  return subscription.status === 'active' ? subscription : null;
}
