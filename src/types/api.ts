/**
 * api.ts
 *
 * Request / Response types for all Shortsy REST APIs.
 * These match the shapes defined in docs/API_SPEC.md exactly.
 *
 * When moving from mock → real APIs, only the service implementations
 * need to change — these types (and all call-sites) stay the same.
 */

import type { Content, ContentType } from '../data/mockData';

// ─────────────────────────────────────────────────────────────────────────────
// Section 2 — Authentication APIs
// ─────────────────────────────────────────────────────────────────────────────

/** JWT access + refresh token pair returned by login / signup / refresh. */
export interface AuthTokens {
  /** Short-lived JWT (15 min in production). */
  accessToken: string;
  /** Long-lived refresh token (30 days in production). */
  refreshToken: string;
  /** Seconds until accessToken expires. */
  expiresIn: number;
}

/**
 * Lightweight user object returned by auth endpoints.
 * Does NOT include `stats` — use `UserProfile` (profileService) for that.
 */
export interface UserBasic {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
}

// ── 2.1 Sign Up ──────────────────────────────────────────────────────────────

export interface SignupRequest {
  email: string;
  password: string;
  displayName: string;
}

/** Returned by signup when email OTP verification is required. */
export interface SignupPendingResponse {
  pendingConfirmation: true;
  email: string;
  userId?: string;
}

// ── OTP Verification ─────────────────────────────────────────────────────────

export interface ConfirmOtpRequest {
  email: string;
  /** 6-digit code sent to the registered email. */
  code: string;
  /** The password used at signup (needed to auto-login after confirmation). */
  password: string;
}

export interface ConfirmOtpResponse {
  user: UserBasic;
  tokens: AuthTokens;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ResendOtpResponse {
  message: string;
}

// ── 2.2 Log In ───────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserBasic;
  tokens: AuthTokens;
}

// ── 2.3 Forgot Password ──────────────────────────────────────────────────────

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  /** Always returns 200 regardless of whether email exists (prevents enumeration). */
  message: string;
}

// ── 2.3b Confirm Reset Password ──────────────────────────────────────────────

export interface ConfirmResetPasswordRequest {
  email:       string;
  code:        string;
  newPassword: string;
}

export interface ConfirmResetPasswordResponse {
  message: string;
}

// ── 2.4 Refresh Token ────────────────────────────────────────────────────────

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  tokens: AuthTokens;
}

// ── 2.5 Log Out ───────────────────────────────────────────────────────────────

export interface LogoutRequest {
  /** The refresh token to invalidate server-side. */
  refreshToken: string;
}

/** Shape of a single mood entry (derived from the moods array in mockData). */
export interface Mood {
  id: string;
  name: string;
  emoji: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
  timestamp: string;
  requestId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 3 — Content APIs
// ─────────────────────────────────────────────────────────────────────────────

// ── 3.1 List All Content ─────────────────────────────────────────────────────

export interface ListContentParams {
  type?: ContentType;
  genre?: string;
  language?: string;
  mood?: string;
  featured?: boolean;
  festivalWinner?: boolean;
  page?: number;
  limit?: number;
}

export interface ListContentResponse {
  data: Content[];
  pagination: PaginationMeta;
}

// ── 3.2 Get Content Detail ───────────────────────────────────────────────────

/** Same shape as Content — alias for clarity at call-sites. */
export type GetContentDetailResponse = Content;

// ── 3.3 Search Content ───────────────────────────────────────────────────────

export interface SearchContentParams {
  q: string;
  type?: ContentType;
  limit?: number;
}

export interface SearchContentResponse {
  query: string;
  data: Content[];
  total: number;
}

// ── 3.4 Featured Content ─────────────────────────────────────────────────────

export interface FeaturedHero {
  id: string;
  title: string;
  type: ContentType;
  thumbnail: string;
  /** Looping muted background video for the hero section on HomePage */
  videoUrl?: string;
  genre: string;
  language: string;
  duration: string;
  price: number;
  rating: number;
  description: string;
  festivalWinner?: boolean;
}

export interface GetFeaturedResponse {
  hero: FeaturedHero;
  featured: Content[];
}

// ── 3.5 Discovery Metadata ───────────────────────────────────────────────────

export interface GetMetadataResponse {
  moods: Mood[];
  genres: string[];
  languages: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 4 — Rental & Payment APIs
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared: RentalRecord ─────────────────────────────────────────────────────

export interface RentalRecord {
  contentId: string;
  userId: string;
  rentedAt: string;      // ISO 8601
  expiresAt: string;     // ISO 8601 (48h for short-film, 7 days for series)
  amountPaid: number;    // INR
  transactionId: string;
}

// ── 4.1 Initiate Rental ──────────────────────────────────────────────────────

export interface InitiateRentalRequest {
  contentId: string;
  amountINR: number;
  currency: 'INR';
}

export interface InitiateRentalResponse {
  orderId: string;         // Internal order id, e.g. "ord_xyz789"
  contentId: string;
  contentTitle: string;
  amountINR: number;
  currency: 'INR';
  /** Pass directly to Razorpay / Stripe SDK */
  gatewayOrderId: string;
  gatewayKey: string;
  expiresAt: string;       // Order expiry (15 min window)
}

// ── 4.2 Confirm Payment ──────────────────────────────────────────────────────

export interface ConfirmPaymentRequest {
  orderId: string;
  gatewayPaymentId: string;
  gatewaySignature: string;
}

export interface ConfirmPaymentResponse {
  rental: RentalRecord;
  message: string;
}

// ── 4.3 Get User Rentals ─────────────────────────────────────────────────────

export interface GetRentalsParams {
  /** If true, only return rentals where expiresAt > now */
  active?: boolean;
}

/** A rental record with its full content object attached */
export interface RentalWithContent {
  contentId: string;
  userId: string;
  rentedAt: string;
  expiresAt: string;
  amountPaid: number;
  transactionId: string;
  /** Full content object — subset returned by real API, full object in mock */
  content: Content;
}

export interface GetRentalsResponse {
  rentals: RentalWithContent[];
}

// ── 4.4 Check Rental Status ──────────────────────────────────────────────────

export interface CheckRentalStatusResponse {
  isRented: boolean;
  rental: RentalRecord | null;
}

// ── 4.5 Payment History ──────────────────────────────────────────────────────

export interface PaymentHistoryRecord {
  orderId: string;
  contentId: string;
  amountINR: number;
  gatewayOrderId: string;
  gatewayPaymentId: string | null;
  transactionId: string | null;
  status: 'pending' | 'paid' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface GetPaymentHistoryResponse {
  orders: PaymentHistoryRecord[];
  count: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 5 — Playback APIs
// ─────────────────────────────────────────────────────────────────────────────

// ── 5.1 Get Stream URL — Short Film ──────────────────────────────────────────

export interface GetStreamUrlResponse {
  contentId: string;
  type: 'short-film';
  /** Time-limited signed CDN URL (real API). In mock mode: the raw Firebase URL. */
  streamUrl: string;
  trailerUrl?: string;
  /** When the signed URL expires (real API only). */
  expiresAt: string;
}

// ── 5.2 Get Episode Stream URL — Vertical Series ──────────────────────────────

export interface NextEpisodeInfo {
  episodeId: string;
  episodeNumber: number;
  title: string;
}

export interface GetEpisodeStreamUrlResponse {
  contentId: string;
  episodeId: string;
  episodeNumber: number;
  episodeTitle: string;
  streamUrl: string;
  nextEpisode: NextEpisodeInfo | null;
  expiresAt: string;
}

// ── 5.3 Save Watch Progress ───────────────────────────────────────────────────

export interface SaveProgressRequest {
  currentTime: number;    // seconds elapsed
  duration: number;       // total seconds
  completed: boolean;
  // Vertical-series only:
  episodeId?: string;
  episodeNumber?: number;
}

export interface SaveProgressResponse {
  saved: boolean;
  progressPercent: number;
}

// ── 5.4 Get Watch Progress ────────────────────────────────────────────────────

export interface WatchProgress {
  contentId: string;
  type: ContentType;
  currentTime: number;
  duration: number;
  progressPercent: number;
  /**
   * Whether the content (or its last-watched episode) was watched to completion.
   * Optional: the real API omits this field for vertical-series responses.
   * Treat as `false` (not completed) when absent.
   */
  completed?: boolean;
  lastWatchedAt: string;
  // Vertical-series only:
  lastEpisodeId?: string;
  lastEpisodeNumber?: number;
  completedEpisodes?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Section 7 — User Profile APIs
// ─────────────────────────────────────────────────────────────────────────────

// ── 7.1 Get Current User ─────────────────────────────────────────────────────

export interface UserStats {
  /** Number of rentals the user has made (active + expired). */
  totalRentals: number;
  /** Cumulative watch time across all rented content, in minutes. */
  totalWatchTimeMinutes: number;
  /** The genre the user has rented most often. */
  favouriteGenre: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  /** CDN URL of the user's avatar. Absent if no custom avatar set. */
  avatarUrl?: string;
  createdAt: string;
  /** Only present on GET /users/me (not on PATCH response). */
  stats?: UserStats;
}

// ── 7.2 Update Profile ───────────────────────────────────────────────────────

export interface UpdateProfileRequest {
  /** Trimmed; must not be empty if provided. */
  displayName?: string;
  /** Full CDN URL of the new avatar. */
  avatarUrl?: string;
}

/** Same shape as UserProfile but without stats (per spec 7.2 response). */
export type UpdateProfileResponse = Omit<UserProfile, 'stats'>;

// ── 7.3 Delete Account ───────────────────────────────────────────────────────

export interface DeleteAccountRequest {
  /** User's current password — required for account deletion confirmation. */
  password: string;
}

/**
 * Real API returns 204 No Content (no body).
 * Mock returns { success: true } for convenience.
 */
export interface DeleteAccountResponse {
  success: boolean;
}
