/**
 * authService.ts
 *
 * Service layer for all Authentication APIs (Section 2 of API_SPEC.md).
 *
 * ── Mock mode (USE_MOCK = true) ───────────────────────────────────────────────
 *   2.1 signup        → creates a mock user from supplied params; stores session
 *   2.2 login         → accepts any non-empty email + password; stores session
 *   2.3 forgotPassword → always succeeds (spec: 200 regardless of email existence)
 *   2.4 refreshToken  → generates new mock tokens for the active session
 *   2.5 logout        → clears the in-memory session + access token
 *
 * ── Real mode (USE_MOCK = false) ─────────────────────────────────────────────
 *   All functions delegate to apiClient hitting the live REST endpoints.
 *   setAccessToken() is called automatically after login / signup / refresh
 *   so every subsequent apiClient call carries the correct Bearer token.
 *
 * ── Session lifecycle ────────────────────────────────────────────────────────
 *   _session is module-level (survives component remounts).
 *   Call clearSession() on logout — useAppState.onLogout does this already.
 *   getSession() lets useAppState read the authenticated user without re-fetching.
 *
 * ── Switching ────────────────────────────────────────────────────────────────
 *   In src/services/apiClient.ts, set USE_MOCK = false.
 *   No changes needed here or in any screen.
 */

import type {
  AuthTokens,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  SignupRequest,
  SignupResponse,
  UserBasic,
} from '../types/api';
import { USE_MOCK, ApiClientError, apiClient, mockDelay, setAccessToken } from './apiClient';
import { logger } from '../utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Session store (module-level → survives component remounts)
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthSession {
  user: UserBasic;
  tokens: AuthTokens;
}

/** Active session. Null when no user is logged in. */
let _session: AuthSession | null = null;

/** Monotonically incrementing counter for mock user IDs */
let _idCounter = 1;

// ── Helpers ──────────────────────────────────────────────────────────────────

function mockId(prefix: string): string {
  return `${prefix}_${Date.now()}_${_idCounter++}`;
}

function mockTokens(): AuthTokens {
  return {
    accessToken:  `mock_access_${Date.now()}`,
    refreshToken: `mock_refresh_${Date.now()}`,
    expiresIn:    900, // 15 minutes (matches production JWT lifetime)
  };
}

// ── Public session accessors ─────────────────────────────────────────────────

/**
 * Returns the current session (user + tokens), or null if not logged in.
 * Use this in useAppState after onLogin/onSignup to grab the access token.
 */
export function getSession(): AuthSession | null {
  return _session;
}

/**
 * Clears the in-memory session and revokes the apiClient Bearer token.
 * Called internally by logout(). Also exported so useAppState can call it
 * during a force-logout (e.g. 401 from a background refresh).
 */
export function clearSession(): void {
  _session = null;
  setAccessToken(null);
  logger.info('AUTH', 'Session cleared');
}

// ─────────────────────────────────────────────────────────────────────────────
// 2.1  Sign Up
// POST /auth/signup
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a new account and returns the user + auth tokens.
 * Stores the session and wires the access token into apiClient.
 *
 * In mock mode: any valid email + password (≥ 8 chars) succeeds.
 *
 * @throws ApiClientError(409, 'EMAIL_ALREADY_EXISTS') – email taken
 * @throws ApiClientError(422, 'VALIDATION_ERROR')     – weak password / bad email
 *
 * @example
 * const { user } = await signup({ email, password, displayName: name });
 * onSignup(); // navigate to home
 */
export async function signup(params: SignupRequest): Promise<SignupResponse> {
  if (USE_MOCK) {
    const timer = logger.startTimer('AUTH', 'signup');
    await mockDelay();

    if (!params.email.includes('@') || params.email.trim().length < 5) {
      timer.fail({ code: 'VALIDATION_ERROR', field: 'email' });
      throw new ApiClientError(422, 'VALIDATION_ERROR', 'Please enter a valid email address');
    }
    if (params.password.length < 8) {
      timer.fail({ code: 'VALIDATION_ERROR', field: 'password' });
      throw new ApiClientError(422, 'VALIDATION_ERROR', 'Password must be at least 8 characters');
    }
    if (!params.displayName.trim()) {
      timer.fail({ code: 'VALIDATION_ERROR', field: 'displayName' });
      throw new ApiClientError(422, 'VALIDATION_ERROR', 'Display name cannot be empty');
    }

    const user: UserBasic = {
      id:          mockId('usr'),
      email:       params.email.trim().toLowerCase(),
      displayName: params.displayName.trim(),
      createdAt:   new Date().toISOString(),
    };
    const tokens = mockTokens();
    _session = { user, tokens };
    setAccessToken(tokens.accessToken);

    timer.end({ userId: user.id, email: user.email });
    return { user, tokens };
  }

  const result = await apiClient.post<SignupResponse>('/auth/signup', { body: params });
  _session = { user: result.user, tokens: result.tokens };
  setAccessToken(result.tokens.accessToken);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2.2  Log In
// POST /auth/login
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Authenticates an existing user and returns user + auth tokens.
 * Stores the session and wires the access token into apiClient.
 *
 * In mock mode: any non-empty email + password succeeds.
 * The display name is derived from the email prefix for convenience.
 *
 * @throws ApiClientError(401, 'INVALID_CREDENTIALS') – wrong email or password
 * @throws ApiClientError(429, 'RATE_LIMITED')         – too many attempts
 *
 * @example
 * const { user } = await login({ email, password });
 * onLogin(); // navigate to home
 */
export async function login(params: LoginRequest): Promise<LoginResponse> {
  if (USE_MOCK) {
    const timer = logger.startTimer('AUTH', 'login');
    await mockDelay();

    if (!params.email.trim() || !params.password.trim()) {
      timer.fail({ code: 'INVALID_CREDENTIALS' });
      throw new ApiClientError(401, 'INVALID_CREDENTIALS', 'Email and password are required');
    }

    // Derive display name from email prefix (e.g. "adarsh.c@..." → "adarsh.c")
    const displayName = params.email.split('@')[0];

    const user: UserBasic = {
      id:          mockId('usr'),
      email:       params.email.trim().toLowerCase(),
      displayName,
      createdAt:   new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30d ago
    };
    const tokens = mockTokens();
    _session = { user, tokens };
    setAccessToken(tokens.accessToken);

    timer.end({ userId: user.id, email: user.email });
    return { user, tokens };
  }

  const result = await apiClient.post<LoginResponse>('/auth/login', { body: params });
  _session = { user: result.user, tokens: result.tokens };
  setAccessToken(result.tokens.accessToken);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2.3  Forgot Password
// POST /auth/forgot-password
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends a password reset email to the supplied address.
 *
 * Per spec: always returns 200 regardless of whether the email is registered
 * (prevents user enumeration attacks).
 *
 * @example
 * await forgotPassword({ email });
 * setIsSuccess(true);
 */
export async function forgotPassword(
  params: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  if (USE_MOCK) {
    const timer = logger.startTimer('AUTH', 'forgotPassword');
    await mockDelay();
    const result: ForgotPasswordResponse = {
      message: `Password reset link sent to ${params.email}`,
    };
    timer.end({ email: params.email });
    return result;
  }

  return apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', { body: params });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2.4  Refresh Token
// POST /auth/refresh
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Exchanges a valid refresh token for a new access + refresh token pair.
 * Updates the stored session and apiClient Bearer token automatically.
 *
 * @throws ApiClientError(401, 'TOKEN_EXPIRED') – refresh token expired
 * @throws ApiClientError(401, 'TOKEN_INVALID') – malformed token
 *
 * @example
 * const { tokens } = await refreshToken({ refreshToken: _session.tokens.refreshToken });
 */
export async function refreshToken(
  params: RefreshTokenRequest,
): Promise<RefreshTokenResponse> {
  if (USE_MOCK) {
    const timer = logger.startTimer('AUTH', 'refreshToken');
    await mockDelay();

    if (!_session) {
      timer.fail({ code: 'TOKEN_INVALID', reason: 'No active session' });
      throw new ApiClientError(401, 'TOKEN_INVALID', 'No active session to refresh');
    }

    const tokens = mockTokens();
    _session = { ..._session, tokens };
    setAccessToken(tokens.accessToken);

    timer.end({ expiresIn: tokens.expiresIn });
    return { tokens };
  }

  const result = await apiClient.post<RefreshTokenResponse>('/auth/refresh', { body: params });
  if (_session) {
    _session = { ..._session, tokens: result.tokens };
  }
  setAccessToken(result.tokens.accessToken);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2.5  Log Out
// POST /auth/logout
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Invalidates the current session server-side and clears local state.
 *
 * ⚠️  After calling this, also call:
 *   clearRentalStore()   (rentalService)
 *   clearProgressStore() (playbackService)
 *   clearProfileStore()  (profileService)
 *
 * These are orchestrated in useAppState.onLogout — no need to call them here.
 *
 * In mock mode: clears session immediately.
 * In real mode: fires POST /auth/logout then clears local state regardless
 * of the server response (ensures user is always logged out locally).
 *
 * @example
 * await logout();
 * onLogout(); // navigate to login screen
 */
export async function logout(params?: Partial<LogoutRequest>): Promise<void> {
  if (USE_MOCK) {
    const timer = logger.startTimer('AUTH', 'logout');
    await mockDelay();
    clearSession();
    timer.end({ loggedOut: true });
    return;
  }

  // Fire-and-forget: clear local state whether or not the server responds
  if (_session) {
    const body: LogoutRequest = {
      refreshToken: params?.refreshToken ?? _session.tokens.refreshToken,
    };
    apiClient.post('/auth/logout', { body }).catch(() => {});
  }
  clearSession();
}
