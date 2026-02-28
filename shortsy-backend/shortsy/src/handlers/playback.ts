import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from 'aws-lambda';
import { z } from 'zod';
import * as playbackService from '../services/playback.service';
import * as contentService  from '../services/content.service';
import * as rentalService   from '../services/rental.service';
import { ok, apiError } from '../utils/response';
import { getUser, parseBody, reqId } from '../utils/lambda';

// ── Schema ────────────────────────────────────────────────────────────────────
const progressSchema = z.object({
  currentTime:   z.number().nonnegative(),
  duration:      z.number().positive(),
  completed:     z.boolean().optional(),
  episodeId:     z.string().optional(),
  episodeNumber: z.number().int().positive().optional(),
});

// ── Shared helpers ────────────────────────────────────────────────────────────
async function requireContent(id: string, rid: string) {
  const content = await contentService.getContentById(id);
  if (!content) return { content: null, err: apiError(404, 'CONTENT_NOT_FOUND', `No content found with id '${id}'`, rid) };
  return { content, err: null };
}

async function requireRental(userId: string, contentId: string, rid: string) {
  const active = await rentalService.isRented(userId, contentId);
  if (!active) return { ok: false, err: apiError(403, 'NOT_RENTED', 'No active rental found for this content', rid) };
  return { ok: true, err: null };
}

// ── Handlers ──────────────────────────────────────────────────────────────────

/** GET /v1/content/{id}/stream */
export const streamFilm: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (event) => {
  const rid  = reqId(event);
  const user = getUser(event);
  const id   = event.pathParameters?.id;
  if (!id) return apiError(400, 'VALIDATION_ERROR', 'Content ID is required', rid);

  try {
    const { content, err: ce } = await requireContent(id, rid);
    if (ce || !content) return ce!;

    if (content.type !== 'short-film') {
      return apiError(400, 'VALIDATION_ERROR', 'Use /episodes/:episodeId/stream for vertical-series', rid);
    }

    const { err: re } = await requireRental(user.id, id, rid);
    if (re) return re;

    return ok(await playbackService.buildFilmStream(content));
  } catch (err) {
    console.error('[playback.streamFilm]', err);
    return apiError(500, 'INTERNAL_ERROR', 'Failed to generate stream URL', rid);
  }
};

/** GET /v1/content/{id}/episodes/{episodeId}/stream */
export const streamEpisode: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (event) => {
  const rid       = reqId(event);
  const user      = getUser(event);
  const id        = event.pathParameters?.id;
  const episodeId = event.pathParameters?.episodeId;
  if (!id || !episodeId) return apiError(400, 'VALIDATION_ERROR', 'Content ID and Episode ID are required', rid);

  try {
    const { content, err: ce } = await requireContent(id, rid);
    if (ce || !content) return ce!;

    const { err: re } = await requireRental(user.id, id, rid);
    if (re) return re;

    const stream = await playbackService.buildEpisodeStream(content, episodeId);
    if (!stream) return apiError(404, 'EPISODE_NOT_FOUND', `Episode '${episodeId}' not found in content '${id}'`, rid);

    return ok(stream);
  } catch (err) {
    console.error('[playback.streamEpisode]', err);
    return apiError(500, 'INTERNAL_ERROR', 'Failed to generate episode stream URL', rid);
  }
};

/** POST /v1/content/{id}/progress */
export const saveProgress: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (event) => {
  const rid  = reqId(event);
  const user = getUser(event);
  const id   = event.pathParameters?.id;
  if (!id) return apiError(400, 'VALIDATION_ERROR', 'Content ID is required', rid);

  const parsed = progressSchema.safeParse(parseBody(event));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', parsed.error.errors[0].message, rid);

  try {
    const { content, err: ce } = await requireContent(id, rid);
    if (ce || !content) return ce!;

    return ok(await playbackService.saveProgress(user.id, id, content.type, parsed.data));
  } catch (err) {
    console.error('[playback.saveProgress]', err);
    return apiError(500, 'INTERNAL_ERROR', 'Failed to save progress', rid);
  }
};

/** GET /v1/content/{id}/progress */
export const getProgress: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (event) => {
  const rid  = reqId(event);
  const user = getUser(event);
  const id   = event.pathParameters?.id;
  if (!id) return apiError(400, 'VALIDATION_ERROR', 'Content ID is required', rid);

  try {
    const progress = await playbackService.getProgress(user.id, id);
    return ok(progress ?? {
      contentId: id, type: 'short-film',
      currentTime: 0, duration: 0, progressPercent: 0,
      completed: false, lastWatchedAt: null,
    });
  } catch (err) {
    console.error('[playback.getProgress]', err);
    return apiError(500, 'INTERNAL_ERROR', 'Failed to get progress', rid);
  }
};
