/**
 * env.ts
 *
 * Single source of truth for all environment-driven configuration.
 * Values are injected at build time by react-native-config from the
 * appropriate .env file (.env · .env.staging · .env.production).
 *
 * Usage:
 *   import { ENV } from '../constants/env';
 *   ENV.API_BASE_URL   // → 'https://...'
 *   ENV.USE_MOCK_API   // → false
 *
 * Adding a new variable:
 *   1. Add it to .env / .env.staging / .env.production
 *   2. Add the typed field below with a safe fallback
 *   3. Use ENV.YOUR_KEY everywhere — never import Config directly
 */

import Config from 'react-native-config';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function str(key: string, fallback: string): string {
  const v = (Config as Record<string, string | undefined>)[key];
  return v !== undefined && v !== '' ? v : fallback;
}

function bool(key: string, fallback: boolean): boolean {
  const v = (Config as Record<string, string | undefined>)[key];
  if (v === undefined || v === '') return fallback;
  return v.toLowerCase() === 'true';
}

function num(key: string, fallback: number): number {
  const v = (Config as Record<string, string | undefined>)[key];
  const parsed = parseFloat(v ?? '');
  return isNaN(parsed) ? fallback : parsed;
}

function int(key: string, fallback: number): number {
  const v = (Config as Record<string, string | undefined>)[key];
  const parsed = parseInt(v ?? '', 10);
  return isNaN(parsed) ? fallback : parsed;
}

// ─── Config ───────────────────────────────────────────────────────────────────

export const ENV = {
  // ── API ────────────────────────────────────────────────────────────────────
  /** Base URL for all REST API calls — set API_BASE_URL in .env */
  API_BASE_URL: str('API_BASE_URL', ''),

  // ── Feature Flags ──────────────────────────────────────────────────────────
  /** When true, all service calls use in-memory mock data — set USE_MOCK_API in .env */
  USE_MOCK_API: bool('USE_MOCK_API', false),
  /** Artificial latency (ms) added to every mock response — set MOCK_DELAY_MS in .env */
  MOCK_DELAY_MS: int('MOCK_DELAY_MS', 300),

  // ── Google OAuth ───────────────────────────────────────────────────────────
  /** iOS OAuth 2.0 client ID — set GOOGLE_IOS_CLIENT_ID in .env */
  GOOGLE_IOS_CLIENT_ID: str('GOOGLE_IOS_CLIENT_ID', ''),
  /** Web OAuth 2.0 client ID — set GOOGLE_WEB_CLIENT_ID in .env */
  GOOGLE_WEB_CLIENT_ID: str('GOOGLE_WEB_CLIENT_ID', ''),
  /** Redirect URI — set GOOGLE_OAUTH_REDIRECT_URI in .env */
  GOOGLE_OAUTH_REDIRECT_URI: str('GOOGLE_OAUTH_REDIRECT_URI', ''),

  // ── Payment — Razorpay ─────────────────────────────────────────────────────
  /** Razorpay publishable key — set RAZORPAY_KEY_ID in .env */
  RAZORPAY_KEY_ID: str('RAZORPAY_KEY_ID', ''),

  // ── App Web URLs ───────────────────────────────────────────────────────────
  /** Base URL for deep links and share messages — set APP_WEB_URL in .env */
  APP_WEB_URL: str('APP_WEB_URL', ''),
  /** Public brand domain for receipts and footer — set APP_DOMAIN in .env */
  APP_DOMAIN: str('APP_DOMAIN', 'shortsy.app'),

  // ── Business Logic — Revenue Split ─────────────────────────────────────────
  /** Fraction of payment that goes to the creator — set CREATOR_REVENUE_SHARE in .env */
  CREATOR_REVENUE_SHARE: num('CREATOR_REVENUE_SHARE', 0.7),
  /** Fraction retained as platform fee — set PLATFORM_FEE_SHARE in .env */
  PLATFORM_FEE_SHARE: num('PLATFORM_FEE_SHARE', 0.3),

  // ── Rental Access Windows ──────────────────────────────────────────────────
  /** Days a short-film renter has viewing access — set RENTAL_EXPIRY_SHORT_FILM_DAYS in .env */
  RENTAL_EXPIRY_SHORT_FILM_DAYS: int('RENTAL_EXPIRY_SHORT_FILM_DAYS', 1),
  /** Days a vertical-series renter has viewing access — set RENTAL_EXPIRY_VERTICAL_SERIES_DAYS in .env */
  RENTAL_EXPIRY_VERTICAL_SERIES_DAYS: int('RENTAL_EXPIRY_VERTICAL_SERIES_DAYS', 3),

  // ── Premium Subscription ───────────────────────────────────────────────────
  /** Monthly subscription price in INR — set PREMIUM_PRICE_INR in .env */
  PREMIUM_PRICE_INR: int('PREMIUM_PRICE_INR', 199),

  // ── Home Page Section Limits ──────────────────────────────────────────────
  /** Max Vertical Series cards shown on Home (0 = show all) — set HOME_VERTICAL_SERIES_COUNT in .env */
  HOME_VERTICAL_SERIES_COUNT: int('HOME_VERTICAL_SERIES_COUNT', 6),
  /** Max Festival Winners cards shown on Home (0 = show all) — set HOME_FESTIVAL_WINNERS_COUNT in .env */
  HOME_FESTIVAL_WINNERS_COUNT: int('HOME_FESTIVAL_WINNERS_COUNT', 6),

  // ── Content Cache ──────────────────────────────────────────────────────────
  /** Cache TTL in ms — set CONTENT_CACHE_TTL_MS in .env */
  CONTENT_CACHE_TTL_MS: int('CONTENT_CACHE_TTL_MS', 300_000),
} as const;

export type AppEnv = typeof ENV;
