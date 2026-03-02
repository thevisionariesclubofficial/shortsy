/**
 * rentalService.ts
 *
 * Service layer for all Rental & Payment APIs (Section 4 of API_SPEC.md).
 *
 * ── Mock mode (USE_MOCK = true) ───────────────────────────────────────────────
 *   Maintains in-memory stores for pending orders and confirmed rentals.
 *   Simulates 300ms network latency for each call.
 *   The mock rental store persists across component mounts within one app session
 *   (same module-level variable lifetime as the content cache).
 *
 * ── Real mode (USE_MOCK = false) ─────────────────────────────────────────────
 *   Delegates to apiClient which calls the live REST endpoints.
 *   No call-site changes required.
 *
 * ── Payment flow ─────────────────────────────────────────────────────────────
 *   1. initiateRental({ contentId })
 *        → Creates a pending order; returns gatewayOrderId + gatewayKey
 *   2. <Razorpay / Stripe SDK> completes payment, returns gatewayPaymentId + signature
 *   3. confirmPayment({ orderId, gatewayPaymentId, gatewaySignature })
 *        → Verifies signature server-side; creates RentalRecord; returns rental
 *
 * ── Switching ─────────────────────────────────────────────────────────────────
 *   In src/services/apiClient.ts, set USE_MOCK = false.
 *   That's it. No changes needed here or in any screen.
 */

import { mockContent } from '../data/mockData';
import type {
  CheckRentalStatusResponse,
  ConfirmPaymentRequest,
  ConfirmPaymentResponse,
  GetRentalsParams,
  GetRentalsResponse,
  GetPaymentHistoryResponse,
  InitiateRentalRequest,
  InitiateRentalResponse,
  RentalRecord,
  RentalWithContent,
} from '../types/api';
import { USE_MOCK, ApiClientError, apiClient, mockDelay } from './apiClient';
import { logger } from '../utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Mock rental store (module-level → survives component remounts)
// ─────────────────────────────────────────────────────────────────────────────

/** contentId → RentalRecord */
const _rentalStore = new Map<string, RentalRecord>();

/** orderId → { contentId, amountINR } */
const _pendingOrders = new Map<string, { contentId: string; amountINR: number }>();

/** Monotonically incrementing counter for mock IDs */
let _idCounter = 1;

function mockId(prefix: string): string {
  return `${prefix}_${Date.now()}_${_idCounter++}`;
}

/**
 * Clears all mock rental state.
 * Call on logout to reset the in-memory store.
 *
 * @example
 * import { clearRentalStore } from '../services/rentalService';
 * clearRentalStore(); // inside onLogout handler
 */
export function clearRentalStore(): void {
  _rentalStore.clear();
  _pendingOrders.clear();
  logger.info('RENTAL', 'Rental store cleared (logout)');
}

/**
 * Adds a free rental for premium users when they start watching content.
 * This allows premium content to appear in "Continue Watching" section.
 * Calls the backend endpoint that creates rental records directly without payment.
 *
 * @example
 * import { addPremiumRental } from '../services/rentalService';
 * await addPremiumRental('content_123');
 */
export async function addPremiumRental(contentId: string): Promise<RentalRecord | null> {
  const timer = logger.startTimer('RENTAL', `addPremiumRental(${contentId})`);
  
  try {
    // Check if rental already exists
    const { isRented, rental } = await checkRentalStatus(contentId);
    if (isRented && rental) {
      timer.end({ status: 'already_exists' });
      return rental;
    }

    if (USE_MOCK) {
      // Mock mode: Create rental directly
      await mockDelay();
      const rental: RentalRecord = {
        contentId,
        userId: 'mock_user_001',
        rentedAt: new Date().toISOString(),
        expiresAt: rentalExpiresAt(contentId),
        amountPaid: 0,
        transactionId: mockId('premium_txn'),
      };
      _rentalStore.set(contentId, rental);
      timer.end({ contentId, status: 'created' });
      return rental;
    }

    // Real mode: Call backend endpoint for premium rental
    const response = await apiClient.post<{ rental: RentalRecord; message: string }>(
      '/rentals/premium',
      { body: { contentId } }
    );

    timer.end({ contentId, status: 'created' });
    return response.rental;
  } catch (error) {
    timer.fail({ error });
    logger.error('RENTAL', 'Failed to add premium rental', error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Access duration helpers
// ─────────────────────────────────────────────────────────────────────────────

function rentalExpiresAt(contentId: string): string {
  const content = mockContent.find(c => c.id === contentId);
  const durationMs =
    content?.type === 'vertical-series'
      ? 7 * 24 * 60 * 60 * 1000   // 7 days for series
      : 48 * 60 * 60 * 1000;       // 48 hours for short-films
  return new Date(Date.now() + durationMs).toISOString();
}

// ─────────────────────────────────────────────────────────────────────────────
// 4.1  Initiate Rental — POST /rentals/initiate
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a pending payment order for the given content.
 * Returns the order details needed to launch the payment gateway SDK.
 *
 * In mock mode: immediately creates a pending order and returns a mock
 * gateway order ID and key (no real gateway is invoked).
 *
 * @throws ApiClientError(409, 'ALREADY_RENTED') if the content is already rented.
 * @throws ApiClientError(404, 'CONTENT_NOT_FOUND') if contentId is unknown.
 *
 * @example
 * const order = await initiateRental({ contentId: '1' });
 * // → pass order.gatewayOrderId + order.gatewayKey to Razorpay SDK
 */
export async function initiateRental(
  params: InitiateRentalRequest,
): Promise<InitiateRentalResponse> {
  const timer = logger.startTimer('RENTAL', `initiateRental(${params.contentId})`);
  if (USE_MOCK) {
    await mockDelay();
    const content = mockContent.find(c => c.id === params.contentId);
    if (!content) {
      timer.fail({ code: 'CONTENT_NOT_FOUND' });
      throw new ApiClientError(404, 'CONTENT_NOT_FOUND', `No content found with id '${params.contentId}'`);
    }
    // Bypass Razorpay, mark payment as successful
    const orderId = mockId('order');
    const orderExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    // Store mock pending order for confirmPayment
    const amountINR = params.amountINR ?? content.price;
    const currency = params.currency ?? 'INR';
    _pendingOrders.set(orderId, { contentId: params.contentId, amountINR });
    return {
      orderId,
      contentId: params.contentId,
      contentTitle: content.title,
      amountINR,
      currency,
      gatewayOrderId: orderId,
      gatewayKey: 'rzp_test_SLajOeA4k89FaD',
      expiresAt: orderExpiresAt,
    };
  } else {
    // Real mode: create order via backend API, then proceed with Razorpay
    // Requires Authorization token from logged in user
    // Razorpay receipt must be <= 40 chars
    let receiptBase = `rental_${params.contentId}`;
    let timestamp = Date.now().toString();
    let maxReceiptLength = 40;
    let receipt = (receiptBase + '_' + timestamp).slice(0, maxReceiptLength);
    const orderRequestBody = {
      contentId: params.contentId,
      amountINR: params.amountINR,
      currency: 'INR',
      receipt,
    };
    logger.info('RENTAL', 'Order API request body', orderRequestBody);
    let orderRes;
    try {
      orderRes = await apiClient.post<{ orderId: string; gatewayOrderId: string; gatewayKey: string; expiresAt: string; contentTitle: string; amountINR: number }>(
        '/order',
        { body: orderRequestBody }
      );
      logger.info('RENTAL', 'Order API response', orderRes);
    } catch (err) {
      logger.error('RENTAL', 'Order API error', err);
      throw err;
    }
    return {
      orderId: orderRes.orderId,
      contentId: params.contentId,
      contentTitle: orderRes.contentTitle ?? '',
      amountINR: orderRes.amountINR ?? params.amountINR,
      currency: 'INR',
      gatewayOrderId: orderRes.gatewayOrderId ?? orderRes.orderId,
      gatewayKey: orderRes.gatewayKey ?? 'rzp_test_SLajOeA4k89FaD',
      expiresAt: orderRes.expiresAt ?? new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4.2  Confirm Payment — POST /rentals/confirm
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Confirms payment after the gateway SDK completes.
 * Server verifies the HMAC signature, then creates a RentalRecord.
 *
 * In mock mode: validates that the orderId exists, then moves the pending order
 * into the confirmed rental store.
 *
 * @throws ApiClientError(402, 'PAYMENT_FAILED') if orderId is unknown.
 *
 * @example
 * const { rental } = await confirmPayment({
 *   orderId: order.orderId,
 *   gatewayPaymentId: 'rzp_pay_ABC',
 *   gatewaySignature: 'hmac_sha256_...',
 * });
 */
export async function confirmPayment(
  params: ConfirmPaymentRequest,
): Promise<ConfirmPaymentResponse> {
  if (USE_MOCK) {
    const timer = logger.startTimer('RENTAL', `confirmPayment(${params.orderId})`);
    await mockDelay();

    const pending = _pendingOrders.get(params.orderId);
    if (!pending) {
      timer.fail({ code: 'PAYMENT_FAILED', orderId: params.orderId });
      throw new ApiClientError(402, 'PAYMENT_FAILED', `No pending order found with id '${params.orderId}'`);
    }

    _pendingOrders.delete(params.orderId);

    const rental: RentalRecord = {
      contentId: pending.contentId,
      userId: 'mock_user_001',
      rentedAt: new Date().toISOString(),
      expiresAt: rentalExpiresAt(pending.contentId),
      amountPaid: pending.amountINR,
      transactionId: mockId('txn'),
    };

    _rentalStore.set(pending.contentId, rental);

    const result: ConfirmPaymentResponse = {
      rental,
      message: 'Rental confirmed. Enjoy watching!',
    };

    timer.end({
      contentId: rental.contentId,
      amountPaid: rental.amountPaid,
      expiresAt: rental.expiresAt,
      transactionId: rental.transactionId,
    });

    return result;
  }

  return apiClient.post<ConfirmPaymentResponse>('/rentals/confirm', {
    body: params,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4.3  Get User Rentals — GET /rentals
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all rental records for the current user, optionally filtered to
 * only active (non-expired) rentals.
 *
 * In mock mode: reads from the in-memory rental store and joins with mockContent.
 * Used by Continue Watching on HomePage and the ProfilePage rentals list.
 *
 * @example
 * const { rentals } = await getUserRentals({ active: true });
 * // rentals[0].content → full Content object
 */
export async function getUserRentals(
  params: GetRentalsParams = {},
): Promise<GetRentalsResponse> {
  if (USE_MOCK) {
    const timer = logger.startTimer('RENTAL', 'getUserRentals');
    await mockDelay();

    const now = new Date();
    let records = Array.from(_rentalStore.values());

    if (params.active) {
      records = records.filter(r => new Date(r.expiresAt) > now);
    }

    const rentals: RentalWithContent[] = records
      .map(r => {
        const content = mockContent.find(c => c.id === r.contentId);
        if (!content) { return null; }
        return { ...r, content };
      })
      .filter((r): r is RentalWithContent => r !== null);

    timer.end({ count: rentals.length, activeOnly: !!params.active });
    return { rentals };
  }

  return apiClient.get<GetRentalsResponse>('/rentals', {
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4.4  Check Rental Status — GET /rentals/:contentId
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Checks whether the current user has an active (non-expired) rental for
 * the given content id.
 *
 * In mock mode: queries the in-memory rental store.
 * Used by ContentDetailScreen on mount to verify rental status from the
 * service layer (ground truth when switching to a real API).
 *
 * @example
 * const { isRented, rental } = await checkRentalStatus('2');
 * if (isRented) { // show Watch Now CTA }
 */
export async function checkRentalStatus(
  contentId: string,
): Promise<CheckRentalStatusResponse> {
  if (USE_MOCK) {
    const timer = logger.startTimer('RENTAL', `checkRentalStatus(${contentId})`);
    await mockDelay();

    const rental = _rentalStore.get(contentId) ?? null;
    const isRented = rental !== null && new Date(rental.expiresAt) > new Date();

    // Auto-evict expired rentals from the store
    if (rental && !isRented) {
      _rentalStore.delete(contentId);
      logger.debug('RENTAL', `Evicted expired rental for ${contentId}`);
    }

    timer.end({ isRented, contentId });
    return { isRented, rental: isRented ? rental : null };
  }

  return apiClient.get<CheckRentalStatusResponse>(`/rentals/${contentId}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4.5  Get Payment History — GET /order/history
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches all payment/order history for the current user.
 * Returns a list of orders with payment details including status, amounts, and transaction IDs.
 *
 * In mock mode: returns an empty array (no mock implementation for payment history).
 *
 * @example
 * const { orders } = await getPaymentHistory();
 * // orders[0] → { orderId, amountINR, status, gatewayPaymentId, ... }
 */
export async function getPaymentHistory(): Promise<GetPaymentHistoryResponse> {
  if (USE_MOCK) {
    const timer = logger.startTimer('RENTAL', 'getPaymentHistory');
    await mockDelay();
    
    // Mock: return empty history for now
    timer.end({ count: 0 });
    return { orders: [], count: 0 };
  }

  return apiClient.get<GetPaymentHistoryResponse>('/order/history');
}
