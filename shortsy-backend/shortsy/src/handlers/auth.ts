import type {
  APIGatewayProxyHandlerV2,
  APIGatewayProxyHandlerV2WithJWTAuthorizer,
} from 'aws-lambda';
import { z } from 'zod';
import * as cognito from '../services/cognito.service';
import { ok, created, noContent, apiError } from '../utils/response';
import { parseBody, getUser, reqId } from '../utils/lambda';

// ── Validation schemas ────────────────────────────────────────────────────────
const signupSchema = z.object({
  email:       z.string().email(),
  password:    z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(1).max(100),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

const forgotSchema = z.object({
  email: z.string().email(),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});

// ── Error mapping helper ──────────────────────────────────────────────────────
function handleCognitoErr(err: unknown, rid: string) {
  if (err instanceof cognito.CognitoError) {
    return apiError(err.statusCode, err.code, err.message, rid);
  }
  console.error('[auth] Unexpected error:', err);
  return apiError(500, 'INTERNAL_ERROR', 'An unexpected error occurred', rid);
}

// ── Handlers ─────────────────────────────────────────────────────────────────

/** POST /v1/auth/signup */
export const signup: APIGatewayProxyHandlerV2 = async (event) => {
  const rid    = reqId(event);
  const parsed = signupSchema.safeParse(parseBody(event));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', parsed.error.errors[0].message, rid);

  try {
    const result = await cognito.signup(
      parsed.data.email,
      parsed.data.password,
      parsed.data.displayName,
    );
    return created(result);
  } catch (err) {
    return handleCognitoErr(err, rid);
  }
};

/** POST /v1/auth/login */
export const login: APIGatewayProxyHandlerV2 = async (event) => {
  const rid    = reqId(event);
  const parsed = loginSchema.safeParse(parseBody(event));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', parsed.error.errors[0].message, rid);

  try {
    return ok(await cognito.login(parsed.data.email, parsed.data.password));
  } catch (err) {
    return handleCognitoErr(err, rid);
  }
};

/** POST /v1/auth/forgot-password */
export const forgotPassword: APIGatewayProxyHandlerV2 = async (event) => {
  const rid    = reqId(event);
  const parsed = forgotSchema.safeParse(parseBody(event));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', parsed.error.errors[0].message, rid);

  await cognito.forgotPassword(parsed.data.email); // always succeeds (anti-enumeration)
  return ok({ message: `Password reset link sent to ${parsed.data.email}` });
};

/** POST /v1/auth/refresh */
export const refreshToken: APIGatewayProxyHandlerV2 = async (event) => {
  const rid    = reqId(event);
  const parsed = refreshSchema.safeParse(parseBody(event));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', parsed.error.errors[0].message, rid);

  try {
    return ok(await cognito.refreshToken(parsed.data.refreshToken));
  } catch (err) {
    return handleCognitoErr(err, rid);
  }
};

/** POST /v1/auth/logout — requires Bearer token */
export const logout: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (event) => {
  const rid    = reqId(event);
  const parsed = logoutSchema.safeParse(parseBody(event));
  if (!parsed.success) return apiError(422, 'VALIDATION_ERROR', parsed.error.errors[0].message, rid);

  const authHeader = event.headers?.['authorization'] ?? event.headers?.['Authorization'] ?? '';
  const accessToken = authHeader.replace(/^Bearer\s+/i, '').trim();
  
  // If no access token, just return success (logout is idempotent)
  if (!accessToken) {
    console.log(`[auth:logout] No access token provided, returning success (rid=${rid})`);
    return noContent();
  }

  try {
    await cognito.logout(accessToken);
    return noContent();
  } catch (err) {
    // Even if Cognito logout fails (expired token, etc.), return success
    // because the client is clearing local state anyway
    console.log(`[auth:logout] Cognito logout failed but returning success (rid=${rid})`, err);
    return noContent();
  }
};
