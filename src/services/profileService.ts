/**
 * profileService.ts
 *
 * Service layer for all User Profile APIs (Section 7 of API_SPEC.md).
 *
 * ── Mock mode (USE_MOCK = true) ───────────────────────────────────────────────
 *   7.1 getCurrentUser  → returns _mockUser singleton (module-level)
 *   7.2 updateProfile   → mutates _mockUser fields; returns updated record
 *   7.3 deleteAccount   → validates password (non-empty = success) then
 *                         marks in-memory flag; returns { success: true }
 *
 * ── Real mode (USE_MOCK = false) ─────────────────────────────────────────────
 *   7.1 getCurrentUser  → GET    /users/me
 *   7.2 updateProfile   → PATCH  /users/me
 *   7.3 deleteAccount   → DELETE /users/me  (expects 204 No Content)
 *
 * ── Lifetime ─────────────────────────────────────────────────────────────────
 *   _mockUser persists for the entire app session (module-level variable).
 *   Call clearProfileStore() on logout so a fresh session starts with defaults.
 *
 * ── Switching ─────────────────────────────────────────────────────────────────
 *   In src/services/apiClient.ts, set USE_MOCK = false.
 *   No changes needed here or in any screen.
 */

import type {
  DeleteAccountRequest,
  DeleteAccountResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  UserProfile,
} from '../types/api';
import { USE_MOCK, ApiClientError, apiClient, mockDelay } from './apiClient';
import { logger } from '../utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Mock profile store (module-level → survives component remounts)
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_MOCK_USER: UserProfile = {
  id: 'usr_mock_001',
  email: 'filmfan@shortsy.app',
  displayName: 'Film Lover',
  createdAt: '2026-01-15T08:30:00Z',
  stats: {
    totalRentals: 0,
    totalWatchTimeMinutes: 0,
    favouriteGenre: 'Drama',
  },
};

/** Mutable singleton — updated by updateProfile() */
let _mockUser: UserProfile = {
  ...DEFAULT_MOCK_USER,
  stats: { ...DEFAULT_MOCK_USER.stats! },
};

/**
 * Resets the mock profile back to defaults.
 * Call on logout so the next session starts with a clean slate.
 */
export function clearProfileStore(): void {
  _mockUser = {
    ...DEFAULT_MOCK_USER,
    stats: { ...DEFAULT_MOCK_USER.stats! },
  };
  logger.info('PROFILE', 'Profile store cleared (logout)');
}

// ─────────────────────────────────────────────────────────────────────────────
// 7.1  Get Current User
// GET  /users/me
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the authenticated user's full profile including computed stats.
 *
 * In mock mode: returns a copy of _mockUser (safe to mutate at call-site).
 * In real mode: GET /users/me with the current Bearer token.
 *
 * @throws ApiClientError(401, 'UNAUTHORIZED') – missing or invalid access token
 *
 * @example
 * const user = await getCurrentUser();
 * setDisplayName(user.displayName);
 * setWatchTime(user.stats?.totalWatchTimeMinutes ?? 0);
 */
export async function getCurrentUser(): Promise<UserProfile> {
  if (USE_MOCK) {
    const timer = logger.startTimer('PROFILE', 'getCurrentUser');
    await mockDelay();
    // Return a deep copy so callers can't accidentally mutate the store
    const result: UserProfile = {
      ..._mockUser,
      stats: { ..._mockUser.stats! },
    };
    timer.end({ userId: result.id, displayName: result.displayName });
    return result;
  }

  return apiClient.get<UserProfile>('/users/me');
}

// ─────────────────────────────────────────────────────────────────────────────
// 7.2  Update Profile
// PATCH /users/me
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Updates the current user's displayName and/or avatarUrl.
 *
 * In mock mode: mutates _mockUser then returns the updated record.
 * In real mode: PATCH /users/me — response does NOT include stats.
 *
 * @throws ApiClientError(400, 'VALIDATION_ERROR') – displayName is blank
 * @throws ApiClientError(401, 'UNAUTHORIZED')     – missing or invalid token
 *
 * @example
 * const updated = await updateProfile({ displayName: 'Adarsh C.' });
 * setUser(prev => ({ ...prev, ...updated }));
 */
export async function updateProfile(
  params: UpdateProfileRequest,
): Promise<UpdateProfileResponse> {
  if (USE_MOCK) {
    const timer = logger.startTimer('PROFILE', 'updateProfile');
    await mockDelay();

    if (params.displayName !== undefined && params.displayName.trim() === '') {
      timer.fail({ code: 'VALIDATION_ERROR', field: 'displayName' });
      throw new ApiClientError(400, 'VALIDATION_ERROR', 'displayName cannot be empty');
    }

    if (params.displayName !== undefined) {
      _mockUser.displayName = params.displayName.trim();
    }
    if (params.avatarUrl !== undefined) {
      _mockUser.avatarUrl = params.avatarUrl;
    }

    const response: UpdateProfileResponse = {
      id:          _mockUser.id,
      email:       _mockUser.email,
      displayName: _mockUser.displayName,
      avatarUrl:   _mockUser.avatarUrl,
      createdAt:   _mockUser.createdAt,
    };

    timer.end({ userId: response.id, displayName: response.displayName });
    return response;
  }

  return apiClient.patch<UpdateProfileResponse>('/users/me', { body: params });
}

// ─────────────────────────────────────────────────────────────────────────────
// 7.3  Delete Account
// DELETE /users/me
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Permanently deletes the current user's account.
 * Requires the user's current password for confirmation.
 *
 * ⚠️  This is irreversible. After a successful call, the caller must:
 *   1. clearProfileStore()
 *   2. clearProgressStore()   (from playbackService)
 *   3. clearRentalStore()     (from rentalService)
 *   4. Navigate to the welcome / login screen
 *
 * In mock mode: any non-empty password is accepted.
 * In real mode: DELETE /users/me — server returns 204 No Content.
 *
 * @throws ApiClientError(401, 'INVALID_CREDENTIALS') – wrong password supplied
 * @throws ApiClientError(401, 'UNAUTHORIZED')         – missing or invalid token
 *
 * @example
 * await deleteAccount({ password: currentPassword });
 * clearProfileStore();
 * onLogout();
 */
export async function deleteAccount(
  params: DeleteAccountRequest,
): Promise<DeleteAccountResponse> {
  if (USE_MOCK) {
    const timer = logger.startTimer('PROFILE', 'deleteAccount');
    await mockDelay();

    if (!params.password.trim()) {
      timer.fail({ code: 'INVALID_CREDENTIALS', reason: 'Password required' });
      throw new ApiClientError(
        401,
        'INVALID_CREDENTIALS',
        'Password is required to confirm account deletion',
      );
    }

    timer.end({ userId: _mockUser.id, deleted: true });
    return { success: true };
  }

  // Real API returns 204 No Content — apiClient handles 204 → returns undefined
  await apiClient.delete('/users/me', { body: params });
  return { success: true };
}
