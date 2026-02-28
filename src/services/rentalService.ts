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
  if (USE_MOCK) {
    const timer = logger.startTimer('RENTAL', `initiateRental(${params.contentId})`);
    await mockDelay();

    const existing = _rentalStore.get(params.contentId);
    if (existing && new Date(existing.expiresAt) > new Date()) {
      timer.fail({ code: 'ALREADY_RENTED' });
      throw new ApiClientError(409, 'ALREADY_RENTED', 'User already has an active rental for this content');
    }

    const content = mockContent.find(c => c.id === params.contentId);
    if (!content) {
      timer.fail({ code: 'CONTENT_NOT_FOUND' });
      throw new ApiClientError(404, 'CONTENT_NOT_FOUND', `No content found with id '${params.contentId}'`);
    }

    const orderId = mockId('ord');
    const orderExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min

    _pendingOrders.set(orderId, { contentId: params.contentId, amountINR: content.price });

    const result: InitiateRentalResponse = {
      orderId,
      contentId: params.contentId,
      contentTitle: content.title,
      amountINR: content.price,
      currency: 'INR',
      gatewayOrderId: mockId('rzp_order'),
      gatewayKey: 'rzp_test_MOCK_KEY',
      expiresAt: orderExpiresAt,
    };

    timer.end({ orderId, amountINR: content.price, contentTitle: content.title });
    return result;
  }

  return apiClient.post<InitiateRentalResponse>('/rentals/initiate', {
    body: params,
  });
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
