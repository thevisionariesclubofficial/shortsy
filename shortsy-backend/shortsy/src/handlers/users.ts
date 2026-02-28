import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from 'aws-lambda';
import { z } from 'zod';
import * as userService from '../services/user.service';
import { ok, noContent, apiError } from '../utils/response';
import { getUser, parseBody, reqId } from '../utils/lambda';

// ── Schemas ───────────────────────────────────────────────────────────────────
const updateSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  avatarUrl:   z.string().url().optional(),
}).refine(data => data.displayName || data.avatarUrl, {
  message: 'At least one field (displayName or avatarUrl) must be provided',
});

const deleteSchema = z.object({
  password: z.string().min(1),
});

// ── Handlers ──────────────────────────────────────────────────────────────────

/** GET /v1/users/me */
export const getMe: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (event) => {
  const rid  = reqId(event);
  const user = getUser(event);
  try {
    return ok(await userService.getUserProfile(user.id));
  } catch (err) {
    console.error('[users.getMe]', err);
    return apiError(500, 'INTERNAL_ERROR', 'Failed to get user profile', rid);
  }
};

/** PATCH /v1/users/me */
export const updateMe: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (event) => {
  const rid    = reqId(event);
  const user   = getUser(event);
  const parsed = updateSchema.safeParse(parseBody(event));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', parsed.error.errors[0].message, rid);

  try {
    return ok(await userService.updateUserProfile(user.id, parsed.data));
  } catch (err) {
    console.error('[users.updateMe]', err);
    return apiError(500, 'INTERNAL_ERROR', 'Failed to update profile', rid);
  }
};

/** DELETE /v1/users/me */
export const deleteMe: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (event) => {
  const rid    = reqId(event);
  const user   = getUser(event);
  const parsed = deleteSchema.safeParse(parseBody(event));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', parsed.error.errors[0].message, rid);

  try {
    await userService.deleteUser(user.id, user.email, parsed.data.password);
    return noContent();
  } catch (err) {
    const e = err as Record<string, unknown>;
    if (e.code === 'INVALID_CREDENTIALS') {
      return apiError(401, 'INVALID_CREDENTIALS', e.message as string, rid);
    }
    console.error('[users.deleteMe]', err);
    return apiError(500, 'INTERNAL_ERROR', 'Failed to delete account', rid);
  }
};
