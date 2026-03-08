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
  ConfirmOtpRequest,
  ConfirmOtpResponse,
  ConfirmResetPasswordRequest,
  ConfirmResetPasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ResendOtpRequest,
  ResendOtpResponse,
  SignupPendingResponse,
  SignupRequest,
  UserBasic,
} from '../types/api';
import { USE_MOCK, ApiClientError, apiClient, mockDelay, setAccessToken } from './apiClient';
import { logger } from '../utils/logger';
import { saveAuthTokens, saveAuthUser, saveAuthFlag, clearAuthStorage, getAuthTokens, getAuthUser } from '../utils/storage';
import { authorize } from 'react-native-app-auth';

// ── Google OAuth configuration (react-native-app-auth, browser-based PKCE) ───
// Values are loaded from .env via react-native-config → src/constants/env.ts
import { ENV } from '../constants/env';

const GOOGLE_CLIENT_ID      = ENV.GOOGLE_IOS_CLIENT_ID;
const GOOGLE_REDIRECT        = ENV.GOOGLE_OAUTH_REDIRECT_URI;
const GOOGLE_WEB_CLIENT_ID  = ENV.GOOGLE_WEB_CLIENT_ID;

const GOOGLE_OAUTH_CONFIG = {
  issuer:      'https://accounts.google.com',
  clientId:    GOOGLE_CLIENT_ID,
  redirectUrl: GOOGLE_REDIRECT,
  scopes:      ['openid', 'profile', 'email'],
};

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
 * Restores the session from AsyncStorage if it exists.
 * Should be called on app initialization to restore the user's login state.
 * Returns true if session was restored, false otherwise.
 */
export async function restoreSession(): Promise<boolean> {
  try {
    const [user, tokens] = await Promise.all([getAuthUser(), getAuthTokens()]);
    
    if (user && tokens) {
      _session = { user, tokens };
      setAccessToken(tokens.accessToken);
      logger.info('AUTH', `Session restored for user: ${user.email}`);
      return true;
    }
    
    logger.info('AUTH', 'No saved session found');
    return false;
  } catch (error) {
    logger.error('AUTH', 'Failed to restore session', error);
    return false;
  }
}

/**
 * Clears the in-memory session and revokes the apiClient Bearer token.
 * Called internally by logout(). Also exported so useAppState can call it
 * during a force-logout (e.g. 401 from a background refresh).
 */
export function clearSession(): void {
  _session = null;
  setAccessToken(null);
  clearAuthStorage();
  logger.info('AUTH', 'Session cleared');
}

// ── Force-logout callback (registered by useAppState) ────────────────────────

/**
 * Callback registered by useAppState so that apiClient can trigger a full
 * React-state logout (clear stores + navigate to login) when the refresh
 * token is found to be expired or invalid.
 */
let _forceLogoutCallback: (() => void) | null = null;

/**
 * Register the callback that will be invoked on a forced logout.
 * Call this once from useAppState on mount.
 */
export function registerForceLogoutCallback(cb: () => void): void {
  _forceLogoutCallback = cb;
}

/**
 * Trigger a forced logout — clears the session and invokes the registered
 * React-state callback so the UI navigates to the login screen.
 */
export function triggerForceLogout(): void {
  logger.warn('AUTH', 'Force logout triggered — refresh token expired or invalid');
  clearSession();
  if (_forceLogoutCallback) {
    _forceLogoutCallback();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2.1  Sign Up
// POST /auth/signup
// ─────────────────────────────────────────────────────────────────────────────

/** Temporarily stores pending signup data in mock mode so confirmOtp can complete the flow. */
const _mockPending = new Map<string, { request: SignupRequest; user: UserBasic }>();

/**
 * Registers a new account. Returns { pendingConfirmation: true, email } — the user
 * is NOT logged in yet. A 6-digit OTP is sent to their email by Cognito.
 * Call confirmOtp() with the code to complete registration and receive tokens.
 *
 * @throws ApiClientError(409, 'EMAIL_ALREADY_EXISTS') – email taken
 * @throws ApiClientError(422, 'VALIDATION_ERROR')     – weak password / bad email
 */
export async function signup(params: SignupRequest): Promise<SignupPendingResponse> {
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

    const email = params.email.trim().toLowerCase();
    const user: UserBasic = {
      id:          mockId('usr'),
      email,
      displayName: params.displayName.trim(),
      createdAt:   new Date().toISOString(),
    };

    // Store pending signup — confirmOtp will pick this up
    _mockPending.set(email, { request: params, user });

    timer.end({ email, pendingConfirmation: true });
    return { pendingConfirmation: true, email };
  }

  const result = await apiClient.post<SignupPendingResponse>('/auth/signup', { body: params });
  // Session is NOT set here — awaiting OTP confirmation
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2.1b  Confirm OTP
// POST /auth/confirm-otp
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verifies the 6-digit OTP sent to the user's email after signup.
 * On success, the user is confirmed and auto-logged in (tokens returned).
 *
 * @throws ApiClientError(422, 'INVALID_OTP')  – wrong code
 * @throws ApiClientError(422, 'OTP_EXPIRED')  – code expired (resend required)
 */
export async function confirmOtp(params: ConfirmOtpRequest): Promise<ConfirmOtpResponse> {
  if (USE_MOCK) {
    const timer = logger.startTimer('AUTH', 'confirmOtp');
    await mockDelay();

    // In mock mode any 6-digit code is accepted
    if (!/^\d{6}$/.test(params.code)) {
      timer.fail({ code: 'INVALID_OTP' });
      throw new ApiClientError(422, 'INVALID_OTP', 'Enter the 6-digit code sent to your email');
    }

    const email = params.email.trim().toLowerCase();
    const pending = _mockPending.get(email);
    if (!pending) {
      timer.fail({ code: 'VALIDATION_ERROR', reason: 'No pending signup' });
      throw new ApiClientError(400, 'VALIDATION_ERROR', 'No pending signup found for this email');
    }
    _mockPending.delete(email);

    const tokens = mockTokens();
    _session = { user: pending.user, tokens };
    setAccessToken(tokens.accessToken);
    await saveAuthTokens(tokens);
    await saveAuthUser(pending.user);
    await saveAuthFlag(true);

    timer.end({ userId: pending.user.id, email });
    return { user: pending.user, tokens };
  }

  const result = await apiClient.post<ConfirmOtpResponse>('/auth/confirm-otp', { body: params });
  _session = { user: result.user, tokens: result.tokens };
  setAccessToken(result.tokens.accessToken);
  await saveAuthTokens(result.tokens);
  await saveAuthUser(result.user);
  await saveAuthFlag(true);
  logger.info('AUTH', 'OTP confirmed, session created', { email: params.email });
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2.1c  Resend OTP
// POST /auth/resend-otp
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resends the email verification code. The previous code is invalidated.
 */
export async function resendOtp(params: ResendOtpRequest): Promise<ResendOtpResponse> {
  if (USE_MOCK) {
    await mockDelay();
    return { message: 'Verification code resent successfully' };
  }

  return apiClient.post<ResendOtpResponse>('/auth/resend-otp', { body: params });
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
    await saveAuthTokens(tokens);
    await saveAuthUser(user);
    await saveAuthFlag(true);

    timer.end({ userId: user.id, email: user.email });
    return { user, tokens };
  }

  const result = await apiClient.post<LoginResponse>('/auth/login', { body: params });
  _session = { user: result.user, tokens: result.tokens };
  setAccessToken(result.tokens.accessToken);
  await saveAuthTokens(result.tokens);
  await saveAuthUser(result.user);
  await saveAuthFlag(true);
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
// 2.3b  Confirm Reset Password
// POST /auth/confirm-reset-password
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Submits the reset code + new password to complete the password reset flow.
 *
 * @throws ApiClientError(422, 'INVALID_OTP')  – code is wrong
 * @throws ApiClientError(422, 'OTP_EXPIRED')  – code has expired
 * @throws ApiClientError(422, 'VALIDATION_ERROR') – password too short, etc.
 *
 * @example
 * await confirmResetPassword({ email, code, newPassword });
 */
export async function confirmResetPassword(
  params: ConfirmResetPasswordRequest,
): Promise<ConfirmResetPasswordResponse> {
  if (USE_MOCK) {
    const timer = logger.startTimer('AUTH', 'confirmResetPassword');
    await mockDelay();
    // In mock mode accept any 6-digit code
    if (!/^\d{6}$/.test(params.code)) {
      timer.fail({ code: 'INVALID_OTP' });
      throw new ApiClientError(422, 'INVALID_OTP', 'The verification code is incorrect');
    }
    const result: ConfirmResetPasswordResponse = { message: 'Password updated successfully' };
    timer.end({ email: params.email });
    return result;
  }

  return apiClient.post<ConfirmResetPasswordResponse>('/auth/confirm-reset-password', { body: params });
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
  await saveAuthTokens(result.tokens);
  await saveAuthUser(_session?.user || result.tokens);
  logger.info('AUTH', 'Token refreshed and saved to storage');
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

// ─────────────────────────────────────────────────────────────────────────────
// 2.6  Google Sign-In
// POST /auth/google  (real mode)  |  mock auto-login (mock mode)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Launches the native Google Sign-In UI, obtains an ID token, then exchanges
 * it with the backend for app-level Cognito JWTs.
 *
 * The backend creates a new Cognito user on first sign-in and links the
 * Google sub on subsequent sign-ins — no password required from the user.
 *
 * @throws ApiClientError(401, 'INVALID_GOOGLE_TOKEN') – bad or expired ID token
 * @throws ApiClientError(401, 'GOOGLE_SIGN_IN_CANCELLED') – user dismissed the UI
 * @throws ApiClientError(503, 'GOOGLE_PLAY_SERVICES_UNAVAILABLE') – Android only
 *
 * @example
 * await googleSignIn();
 * onLogin(); // navigate to home
 */
export async function googleSignIn(): Promise<LoginResponse> {
  if (USE_MOCK) {
    const timer = logger.startTimer('AUTH', 'googleSignIn');
    await mockDelay();
    const user: UserBasic = {
      id:          mockId('usr_g'),
      email:       'google.user@gmail.com',
      displayName: 'Google User',
      createdAt:   new Date().toISOString(),
    };
    const tokens = mockTokens();
    _session = { user, tokens };
    setAccessToken(tokens.accessToken);
    await saveAuthTokens(tokens);
    await saveAuthUser(user);
    await saveAuthFlag(true);
    timer.end({ userId: user.id, provider: 'google' });
    return { user, tokens };
  }

  // 1. Browser-based Google OAuth 2.0 PKCE (Chrome Custom Tabs / SFSafariViewController)
  //    No SHA-1 fingerprint, no Firebase SDK, no google-services.json OAuth entry needed.
  let idToken: string;
  try {
    const authResult = await authorize(GOOGLE_OAUTH_CONFIG);
    if (!authResult.idToken) throw new Error('No ID token returned by Google OAuth');
    idToken = authResult.idToken;
  } catch (err: any) {
    const message: string = err?.message ?? '';
    if (
      message.includes('cancel') ||
      message.includes('Cancel') ||
      message.includes('dismiss') ||
      message.includes('user_cancelled_authorize')
    ) {
      throw new ApiClientError(401, 'GOOGLE_SIGN_IN_CANCELLED', 'Sign in was cancelled');
    }
    logger.error('AUTH', 'Google Sign-In browser error', err);
    throw new ApiClientError(500, 'GOOGLE_SIGN_IN_ERROR', err?.message ?? 'Google Sign-In failed');
  }

  // 2. Exchange ID token with backend (Cognito via our API)
  const result = await apiClient.post<LoginResponse>('/auth/google', {
    body: { idToken, googleClientId: GOOGLE_WEB_CLIENT_ID },
  });

  _session = { user: result.user, tokens: result.tokens };
  setAccessToken(result.tokens.accessToken);
  await saveAuthTokens(result.tokens);
  await saveAuthUser(result.user);
  await saveAuthFlag(true);

  logger.info('AUTH', 'Google Sign-In successful', { userId: result.user.id, email: result.user.email });
  return result;
}
