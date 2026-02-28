// ── Validation schema for adding content ─────────────────────────────────────
const episodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  duration: z.string(),
  thumbnail: z.string().url(),
  videoUrl: z.string().url(),
});

const addContentSchema = z.object({
  title: z.string().min(1),
  type: z.enum(['short-film', 'vertical-series']),
  thumbnail: z.string().url(),
  duration: z.string().min(1),
  price: z.number().int().nonnegative(),
  director: z.string().min(1),
  language: z.string().min(1),
  genre: z.string().min(1),
  mood: z.string().min(1),
  rating: z.number().min(0).max(5).optional(),
  views: z.number().int().nonnegative().optional(),
  description: z.string().min(1),
  trailer: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  episodes: z.number().int().optional(),
  episodeList: z.array(episodeSchema).optional(),
  featured: z.boolean().optional(),
  festivalWinner: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'short-film') {
    if (!data.videoUrl) {
      ctx.addIssue({
        path: ['videoUrl'],
        code: z.ZodIssueCode.custom,
        message: 'videoUrl is required for short-film',
      });
    }
    if (data.episodes !== undefined) {
      ctx.addIssue({
        path: ['episodes'],
        code: z.ZodIssueCode.custom,
        message: 'episodes is not allowed for short-film',
      });
    }
    if (data.episodeList !== undefined) {
      ctx.addIssue({
        path: ['episodeList'],
        code: z.ZodIssueCode.custom,
        message: 'episodeList is not allowed for short-film',
      });
    }
  }
  if (data.type === 'vertical-series') {
    if (data.videoUrl !== undefined) {
      ctx.addIssue({
        path: ['videoUrl'],
        code: z.ZodIssueCode.custom,
        message: 'videoUrl is not allowed for vertical-series',
      });
    }
    if (typeof data.episodes !== 'number' || data.episodes < 1) {
      ctx.addIssue({
        path: ['episodes'],
        code: z.ZodIssueCode.custom,
        message: 'episodes is required and must be > 0 for vertical-series',
      });
    }
    if (!Array.isArray(data.episodeList) || data.episodeList.length !== data.episodes) {
      ctx.addIssue({
        path: ['episodeList'],
        code: z.ZodIssueCode.custom,
        message: 'episodeList is required and must match episodes count for vertical-series',
      });
    }
  }
});

/** POST /v1/content */
export const add: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (event) => {
  const rid = reqId(event);
  let body;
  try {
    body = event.body ? JSON.parse(event.body) : null;
  } catch {
    return apiError(400, 'INVALID_BODY', 'Request body must be valid JSON', rid);
  }
  const parsed = addContentSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(422, 'VALIDATION_ERROR', parsed.error.errors[0].message, rid);
  }
  try {
    const result = await contentService.addContent(parsed.data);
    return ok(result, 201);
  } catch (err) {
    console.error('[content.add]', err);
    return apiError(500, 'INTERNAL_ERROR', 'Failed to add content', rid);
  }
};
import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from 'aws-lambda';
import { z } from 'zod';
import * as contentService from '../services/content.service';
import { ok, apiError } from '../utils/response';
import { reqId } from '../utils/lambda';

// ── Static metadata (matches API spec §3.5 + mockData.ts) ────────────────────
const METADATA = {
  moods: [
    { id: '1', name: '5-min Heartbreak', emoji: '💔' },
    { id: '2', name: 'Late Night',        emoji: '🌙' },
    { id: '3', name: 'Suspense',          emoji: '😱' },
    { id: '4', name: 'Heartwarming',      emoji: '❤️' },
    { id: '5', name: 'Emotional',         emoji: '😢' },
    { id: '6', name: 'Artistic',          emoji: '🎨' },
    { id: '7', name: 'Inspiring',         emoji: '✨' },
  ],
  genres:    ['All', 'Drama', 'Thriller', 'Romance', 'Comedy', 'Documentary', 'Experimental', 'Family'],
  languages: ['All', 'Hindi', 'English', 'Tamil', 'Telugu', 'Bengali', 'Malayalam', 'Kannada', 'No Dialogue'],
} as const;

// ── Validation schemas ────────────────────────────────────────────────────────
const listQuerySchema = z.object({
  type:           z.enum(['short-film', 'vertical-series']).optional(),
  genre:          z.string().optional(),
  language:       z.string().optional(),
  mood:           z.string().optional(),
  featured:       z.string().transform(v => v === 'true').optional(),
  festivalWinner: z.string().transform(v => v === 'true').optional(),
  page:           z.coerce.number().int().positive().default(1),
  limit:          z.coerce.number().int().positive().max(100).default(20),
});

const searchQuerySchema = z.object({
  q:     z.string().min(1, 'Search query (q) is required'),
  type:  z.enum(['short-film', 'vertical-series']).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ── Handlers ──────────────────────────────────────────────────────────────────

/** GET /v1/content */
export const list: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (event) => {
  const rid    = reqId(event);
  const parsed = listQuerySchema.safeParse(event.queryStringParameters ?? {});
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', parsed.error.errors[0].message, rid);

  try {
    return ok(await contentService.listContent(parsed.data));
  } catch (err) {
    console.error('[content.list]', err);
    return apiError(500, 'INTERNAL_ERROR', 'Failed to list content', rid);
  }
};

/** GET /v1/content/featured */
export const featured: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (event) => {
  const rid = reqId(event);
  try {
    return ok(await contentService.getFeaturedContent());
  } catch (err) {
    console.error('[content.featured]', err);
    return apiError(500, 'INTERNAL_ERROR', 'Failed to get featured content', rid);
  }
};

/** GET /v1/content/metadata */
export const metadata: APIGatewayProxyHandlerV2WithJWTAuthorizer = async () => {
  return ok(METADATA);
};

/** GET /v1/content/search?q=... */
export const search: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (event) => {
  const rid    = reqId(event);
  const parsed = searchQuerySchema.safeParse(event.queryStringParameters ?? {});
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', parsed.error.errors[0].message, rid);

  try {
    return ok(await contentService.searchContent(parsed.data.q, parsed.data.type, parsed.data.limit));
  } catch (err) {
    console.error('[content.search]', err);
    return apiError(500, 'INTERNAL_ERROR', 'Failed to search content', rid);
  }
};

/** GET /v1/content/{id} */
export const getById: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (event) => {
  const rid = reqId(event);
  const id  = event.pathParameters?.id;
  if (!id) return apiError(400, 'VALIDATION_ERROR', 'Content ID is required', rid);

  try {
    const content = await contentService.getContentById(id);
    if (!content) return apiError(404, 'CONTENT_NOT_FOUND', `No content found with id '${id}'`, rid);
    return ok(content);
  } catch (err) {
    console.error('[content.getById]', err);
    return apiError(500, 'INTERNAL_ERROR', 'Failed to get content', rid);
  }
};
