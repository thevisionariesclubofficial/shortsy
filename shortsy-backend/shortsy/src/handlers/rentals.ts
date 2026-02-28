import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from 'aws-lambda';
import { z } from 'zod';
import * as rentalService from '../services/rental.service';
import * as contentService from '../services/content.service';
import { ok, created, apiError } from '../utils/response';
import { getUser, parseBody, reqId } from '../utils/lambda';

// ── Schemas ───────────────────────────────────────────────────────────────────
const initiateSchema = z.object({
  contentId: z.string().min(1),
});

const confirmSchema = z.object({
  orderId:          z.string().min(1),
  gatewayPaymentId: z.string().min(1),
  gatewaySignature: z.string().min(1),
});

// ── Error helper ──────────────────────────────────────────────────────────────
function handleErr(err: unknown, rid: string) {
  const e = err as Record<string, unknown>;
  if (typeof e.status === 'number' && typeof e.code === 'string') {
    return apiError(e.status, e.code, (e.message as string) ?? 'Rental error', rid);
  }
  console.error('[rentals]', err);
  return apiError(500, 'INTERNAL_ERROR', 'Rental operation failed', rid);
}

// ── Handlers ──────────────────────────────────────────────────────────────────

/** POST /v1/rentals/initiate */
export const initiate: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (event) => {
  const rid    = reqId(event);
  const user   = getUser(event);
  const parsed = initiateSchema.safeParse(parseBody(event));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', parsed.error.errors[0].message, rid);

  try {
    const content = await contentService.getContentById(parsed.data.contentId);
    if (!content) return apiError(404, 'CONTENT_NOT_FOUND', `No content found with id '${parsed.data.contentId}'`, rid);

    return ok(await rentalService.initiateRental(user.id, content));
  } catch (err) {
    return handleErr(err, rid);
  }
};

/** POST /v1/rentals/confirm */
export const confirm: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (event) => {
  const rid    = reqId(event);
  const user   = getUser(event);
  const parsed = confirmSchema.safeParse(parseBody(event));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', parsed.error.errors[0].message, rid);

  try {
    const rental = await rentalService.confirmRental(
      user.id,
      parsed.data.orderId,
      parsed.data.gatewayPaymentId,
      parsed.data.gatewaySignature,
    );
    return created({ rental, message: 'Rental confirmed. Enjoy watching!' });
  } catch (err) {
    return handleErr(err, rid);
  }
};

/** GET /v1/rentals */
export const list: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (event) => {
  const rid       = reqId(event);
  const user      = getUser(event);
  const activeOnly = event.queryStringParameters?.active === 'true';

  try {
    const rentals = await rentalService.getUserRentals(user.id, activeOnly);

    // Enrich with lightweight content metadata
    const enriched = await Promise.all(
      rentals.map(async (rental) => {
        const content = await contentService.getContentById(rental.contentId);
        return {
          ...rental,
          content: content
            ? { id: content.id, title: content.title, type: content.type, thumbnail: content.thumbnail, duration: content.duration, genre: content.genre }
            : null,
        };
      }),
    );

    return ok({ rentals: enriched });
  } catch (err) {
    console.error('[rentals.list]', err);
    return apiError(500, 'INTERNAL_ERROR', 'Failed to list rentals', rid);
  }
};

/** GET /v1/rentals/{contentId} */
export const getStatus: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (event) => {
  const rid       = reqId(event);
  const user      = getUser(event);
  const contentId = event.pathParameters?.contentId;
  if (!contentId) return apiError(400, 'VALIDATION_ERROR', 'Content ID is required', rid);

  try {
    const rental   = await rentalService.getRental(user.id, contentId);
    const isRented = !!rental && new Date(rental.expiresAt) > new Date();

    return ok({
      isRented,
      rental: isRented
        ? { contentId: rental!.contentId, rentedAt: rental!.rentedAt, expiresAt: rental!.expiresAt, transactionId: rental!.transactionId }
        : null,
    });
  } catch (err) {
    console.error('[rentals.getStatus]', err);
    return apiError(500, 'INTERNAL_ERROR', 'Failed to get rental status', rid);
  }
};
