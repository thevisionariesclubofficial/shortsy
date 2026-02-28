import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { createHmac } from 'crypto';
import { v4 as uuid } from 'uuid';
import { dynamo, TABLES, ENV } from '../config/aws';
import type { Content } from './content.service';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface RentalRecord {
  userId:        string;
  contentId:     string;
  rentedAt:      string;
  expiresAt:     string;
  amountPaid:    number;
  transactionId: string;
  status:        'active' | 'expired';
}

export interface OrderRecord {
  orderId:        string;
  userId:         string;
  contentId:      string;
  amountINR:      number;
  gatewayOrderId: string;
  status:         'pending' | 'paid' | 'failed';
  ttl:            number;
  createdAt:      string;
}

class RentalError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'RentalError';
  }
}

// ── Razorpay (no SDK — plain HTTP to avoid cold-start bloat) ─────────────────
async function createGatewayOrder(
  amountINR: number,
  receipt: string,
): Promise<{ id: string }> {
  if (!ENV.razorpayKeyId || !ENV.razorpaySecret) {
    // Dev mode — return a deterministic mock order ID
    return { id: `mock_order_${receipt}` };
  }

  const auth = Buffer.from(`${ENV.razorpayKeyId}:${ENV.razorpaySecret}`).toString('base64');
  const res  = await fetch('https://api.razorpay.com/v1/orders', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
    body:    JSON.stringify({ amount: amountINR * 100, currency: 'INR', receipt }),
  });

  if (!res.ok) throw new Error(`Razorpay error: ${await res.text()}`);
  return res.json() as Promise<{ id: string }>;
}

function verifyGatewaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  if (!ENV.razorpaySecret) return true; // Dev bypass

  const expected = createHmac('sha256', ENV.razorpaySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expected === signature;
}

// ── Rental DB operations ──────────────────────────────────────────────────────
export async function getRental(
  userId: string,
  contentId: string,
): Promise<RentalRecord | null> {
  const res = await dynamo.send(new GetCommand({
    TableName: TABLES.RENTALS,
    Key: { userId, contentId },
  }));
  if (!res.Item) return null;

  const rental = res.Item as RentalRecord;
  if (new Date(rental.expiresAt) < new Date()) rental.status = 'expired';
  return rental;
}

export async function isRented(userId: string, contentId: string): Promise<boolean> {
  const r = await getRental(userId, contentId);
  return !!r && new Date(r.expiresAt) > new Date();
}

export async function getUserRentals(
  userId: string,
  activeOnly: boolean,
): Promise<RentalRecord[]> {
  const res = await dynamo.send(new QueryCommand({
    TableName:                 TABLES.RENTALS,
    KeyConditionExpression:    'userId = :uid',
    ExpressionAttributeValues: { ':uid': userId },
  }));

  let rentals = (res.Items ?? []) as RentalRecord[];
  if (activeOnly) rentals = rentals.filter(r => new Date(r.expiresAt) > new Date());
  return rentals;
}

// ── Rental flow ───────────────────────────────────────────────────────────────
export async function initiateRental(userId: string, content: Content) {
  // Guard: no duplicate active rental
  if (await isRented(userId, content.id)) {
    throw new RentalError(409, 'ALREADY_RENTED', 'You already have an active rental for this content');
  }

  const orderId  = `ord_${uuid().replace(/-/g, '').slice(0, 12)}`;
  const gwOrder  = await createGatewayOrder(content.price, orderId);

  const order: OrderRecord = {
    orderId,
    userId,
    contentId:      content.id,
    amountINR:      content.price,
    gatewayOrderId: gwOrder.id,
    status:         'pending',
    ttl:            Math.floor(Date.now() / 1000) + 1800, // 30-min TTL
    createdAt:      new Date().toISOString(),
  };

  await dynamo.send(new PutCommand({ TableName: TABLES.ORDERS, Item: order }));

  return {
    orderId,
    contentId:     content.id,
    contentTitle:  content.title,
    amountINR:     content.price,
    currency:      'INR',
    gatewayOrderId: gwOrder.id,
    gatewayKey:    ENV.razorpayKeyId || 'rzp_test_dev',
    expiresAt:     new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  };
}

export async function confirmRental(
  userId:           string,
  orderId:          string,
  gatewayPaymentId: string,
  gatewaySignature: string,
): Promise<RentalRecord> {
  const orderRes = await dynamo.send(new GetCommand({
    TableName: TABLES.ORDERS,
    Key: { orderId },
  }));

  if (!orderRes.Item) {
    throw new RentalError(402, 'PAYMENT_FAILED', 'Order not found or has expired');
  }

  const order = orderRes.Item as OrderRecord;

  if (order.userId !== userId) {
    throw new RentalError(403, 'FORBIDDEN', 'Order does not belong to this user');
  }

  if (!verifyGatewaySignature(order.gatewayOrderId, gatewayPaymentId, gatewaySignature)) {
    throw new RentalError(400, 'INVALID_SIGNATURE', 'Payment signature verification failed');
  }

  const now           = new Date();
  const expiresAt     = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48h rental window
  const transactionId = `txn_${uuid().replace(/-/g, '').slice(0, 12)}`;

  const rental: RentalRecord = {
    userId,
    contentId:     order.contentId,
    rentedAt:      now.toISOString(),
    expiresAt:     expiresAt.toISOString(),
    amountPaid:    order.amountINR,
    transactionId,
    status:        'active',
  };

  await Promise.all([
    dynamo.send(new PutCommand({ TableName: TABLES.RENTALS, Item: rental })),
    dynamo.send(new UpdateCommand({
      TableName:                 TABLES.ORDERS,
      Key:                       { orderId },
      UpdateExpression:          'SET #s = :s',
      ExpressionAttributeNames:  { '#s': 'status' },
      ExpressionAttributeValues: { ':s': 'paid' },
    })),
  ]);

  return rental;
}
