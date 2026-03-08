/**
 * premiumService.ts
 * Premium subscription service layer
 */

import { apiClient, USE_MOCK, mockDelay } from './apiClient';
import { logger } from '../utils/logger';
import { ENV } from '../constants/env';

export interface PremiumOrder {
  orderId: string;
  gatewayOrderId: string;
  gatewayKey: string;
  amountINR: number;
  currency: string;
}

export interface PremiumSubscription {
  userId: string;
  subscriptionId: string;
  orderId: string;
  gatewayPaymentId: string;
  amountINR: number;
  currency: string;
  status: 'pending' | 'active' | 'expired';
  subscribedAt: string;
  expiresAt: string;
}

export interface PremiumStatus {
  isPremium: boolean;
  subscription: PremiumSubscription | null;
}

/**
 * Initiate premium subscription purchase
 */
export async function initiatePremiumSubscription(): Promise<PremiumOrder> {
  if (USE_MOCK) {
    const timer = logger.startTimer('PREMIUM', 'initiate');
    await mockDelay();
    timer.end({ mock: true });
    return {
      orderId: `mock_premium_order_${Date.now()}`,
      gatewayOrderId: `mock_rzp_order_${Date.now()}`,
      gatewayKey: ENV.RAZORPAY_KEY_ID,
      amountINR: ENV.PREMIUM_PRICE_INR,
      currency: 'INR',
    };
  }

  const timer = logger.startTimer('PREMIUM', 'initiate');
  try {
    const response = await apiClient.post<PremiumOrder>('/premium/initiate', {});
    timer.end({ orderId: response.orderId });
    return response;
  } catch (err) {
    timer.end({ error: true });
    throw err;
  }
}

/**
 * Confirm premium subscription payment
 */
export async function confirmPremiumSubscription(params: {
  orderId: string;
  gatewayPaymentId: string;
  gatewaySignature: string;
}): Promise<{ subscription: PremiumSubscription }> {
  if (USE_MOCK) {
    const timer = logger.startTimer('PREMIUM', 'confirm');
    await mockDelay();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    timer.end({ mock: true });
    return {
      subscription: {
        userId: 'mock_user',
        subscriptionId: params.orderId,
        orderId: params.orderId,
        gatewayPaymentId: params.gatewayPaymentId,
        amountINR: ENV.PREMIUM_PRICE_INR,
        currency: 'INR',
        status: 'active',
        subscribedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      },
    };
  }

  const timer = logger.startTimer('PREMIUM', 'confirm');
  try {
    const response = await apiClient.post<{ subscription: PremiumSubscription }>(
      '/premium/confirm',
      { body: params }
    );
    timer.end({ subscriptionId: response.subscription.subscriptionId });
    return response;
  } catch (err) {
    timer.end({ error: true });
    throw err;
  }
}

/**
 * Get user's premium subscription status
 */
export async function getPremiumStatus(): Promise<PremiumStatus> {
  if (USE_MOCK) {
    const timer = logger.startTimer('PREMIUM', 'status');
    await mockDelay();
    timer.end({ isPremium: false });
    return {
      isPremium: false,
      subscription: null,
    };
  }

  const timer = logger.startTimer('PREMIUM', 'status');
  try {
    const response = await apiClient.get<PremiumStatus>('/premium/status');
    timer.end({ isPremium: response.isPremium });
    return response;
  } catch (err) {
    timer.end({ error: true });
    throw err;
  }
}
