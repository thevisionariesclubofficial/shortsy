import type { Content } from '../data/mockData';

// ─── Screen state ─────────────────────────────────────────────────────────────
export type AppScreen =
  | { type: 'splash' }
  | { type: 'onboarding' }
  | { type: 'welcome' }
  | { type: 'login' }
  | { type: 'signup' }
  | { type: 'forgotPassword' }
  | { type: 'home' }
  | { type: 'search' }
  | { type: 'browse' }
  | { type: 'profile' }
  | { type: 'detail';         content: Content }
  | { type: 'payment';        content: Content }
  | { type: 'paymentSuccess'; content: Content }
  | { type: 'player';         content: Content; videoUrl?: string; episodeNumber?: number };

/** Screens that hide the bottom navigation bar. */
export const SCREENS_WITHOUT_NAV: ReadonlyArray<AppScreen['type']> = [
  'player',
  'detail',
  'payment',
  'paymentSuccess',
  'search',
];

/** Screens that do not require the user to be authenticated. */
export const AUTH_EXEMPT_SCREENS: ReadonlyArray<AppScreen['type']> = [
  'splash',
  'onboarding',
  'welcome',
  'login',
  'signup',
  'forgotPassword',
];
