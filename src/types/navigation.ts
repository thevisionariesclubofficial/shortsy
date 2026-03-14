import type { Content } from '../data/mockData';
import type { RentalRecord } from './api';

// ─── Screen state ─────────────────────────────────────────────────────────────
export type AppScreen =
  | { type: 'splash' }
  | { type: 'onboarding' }
  | { type: 'welcome' }
  | { type: 'login' }
  | { type: 'signup' }
  | { type: 'otpVerify'; email: string; password: string }
  | { type: 'forgotPassword' }
  | { type: 'home' }
  | { type: 'search' }
  | { type: 'browse' }
  | { type: 'profile' }
  | { type: 'history' }
  | { type: 'paymentHistory' }
  | { type: 'premiumPayment' }
  | { type: 'genreDetail';    genre: { id: string; name: string; emoji: string } }
  | { type: 'languageDetail'; language: string }
  | { type: 'helpCenter' }
  | { type: 'faq' }
  | { type: 'contactUs' }
  | { type: 'terms' }
  | { type: 'privacy' }
  | { type: 'cookies' }
  | { type: 'about' }
  | { type: 'detail';         content: Content }
  | { type: 'payment';        content: Content }
  | { type: 'paymentSuccess'; content: Content; rental: RentalRecord }
  | { type: 'player';         content: Content; videoUrl?: string; episodeNumber?: number }
;

/** Screens that hide the bottom navigation bar. */
export const SCREENS_WITHOUT_NAV: ReadonlyArray<AppScreen['type']> = [
  'player',
  'detail',
  'payment',
  'paymentSuccess',
  'premiumPayment',
  'search',
  'genreDetail',
  'history',
  'paymentHistory',
  'helpCenter',
  'faq',
  'contactUs',
  'terms',
  'privacy',
  'cookies',
  'about',
];

/** Screens that do not require the user to be authenticated. */
export const AUTH_EXEMPT_SCREENS: ReadonlyArray<AppScreen['type']> = [
  'splash',
  'onboarding',
  'welcome',
  'login',
  'signup',
  'otpVerify',
  'forgotPassword',
];
