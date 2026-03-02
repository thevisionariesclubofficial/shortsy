import type { APIGatewayProxyHandlerV2, APIGatewayProxyHandlerV2WithJWTAuthorizer } from 'aws-lambda';
import { z } from 'zod';
import { apiError, ok } from '../utils/response';
import { parseBody, reqId } from '../utils/lambda';
import * as premium from '../services/premium.service';

// ── Schemas ───────────────────────────────────────────────────────────────────
const confirmSubscriptionSchema = z.object({
  orderId: z.string().min(1),
  gatewayPaymentId: z.string().min(1),
  gatewaySignature: z.string().min(1),
});

// ── Handlers ──────────────────────────────────────────────────────────────────

/** POST /v1/premium/initiate — Create Razorpay order for premium subscription */
export const initiate: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (event) => {
  const rid = reqId(event);
  const userId = event.requestContext.authorizer?.jwt?.claims?.sub as string;

  if (!userId) {
    return apiError(401, 'UNAUTHORIZED', 'User ID not found in token', rid);
  }

  try {
    const order = await premium.initiatePremiumSubscription(userId);
    return ok(order);
  } catch (err: any) {
    console.error('[premium:initiate] Error:', err);
    return apiError(500, 'INTERNAL_ERROR', err.message || 'Failed to initiate subscription', rid);
  }
};

/** POST /v1/premium/confirm — Confirm premium subscription payment */
export const confirm: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (event) => {
  const rid = reqId(event);
  const userId = event.requestContext.authorizer?.jwt?.claims?.sub as string;

  if (!userId) {
    return apiError(401, 'UNAUTHORIZED', 'User ID not found in token', rid);
  }

  const parsed = confirmSubscriptionSchema.safeParse(parseBody(event));
  if (!parsed.success) {
    return apiError(422, 'VALIDATION_ERROR', parsed.error.errors[0].message, rid);
  }

  try {
    const subscription = await premium.confirmPremiumSubscription(parsed.data);
    return ok({ subscription });
  } catch (err: any) {
    console.error('[premium:confirm] Error:', err);
    return apiError(500, 'INTERNAL_ERROR', err.message || 'Failed to confirm subscription', rid);
  }
};

/** GET /v1/premium/status — Get user's premium subscription status */
export const status: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (event) => {
  const rid = reqId(event);
  const userId = event.requestContext.authorizer?.jwt?.claims?.sub as string;

  if (!userId) {
    return apiError(401, 'UNAUTHORIZED', 'User ID not found in token', rid);
  }

  try {
    const subscription = await premium.getUserPremiumSubscription(userId);
    return ok({ 
      isPremium: !!subscription,
      subscription: subscription || null,
    });
  } catch (err: any) {
    console.error('[premium:status] Error:', err);
    return apiError(500, 'INTERNAL_ERROR', err.message || 'Failed to get subscription status', rid);
  }
};
