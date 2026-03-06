/**
 * colors.ts — Shortsy Design System
 *
 * Single source of truth for all colours in the app.
 * Import from this file instead of using raw hex strings anywhere in the UI.
 *
 * Palette structure
 * ─────────────────
 *   COLORS.brand.*      — purple / pink brand gradient colours
 *   COLORS.accent.*     — gold, green, red used for badges / states
 *   COLORS.bg.*         — background layers (darkest → lightest)
 *   COLORS.surface.*    — card / modal surfaces
 *   COLORS.border.*     — border / divider colours
 *   COLORS.text.*       — text hierarchy
 *   COLORS.overlay.*    — semi-transparent overlays
 *   COLORS.gradient.*   — gradient stop arrays (pass straight to LinearGradient)
 *   COLORS.icon.*       — named icon tint shortcuts
 */

// ── Brand ─────────────────────────────────────────────────────────────────────
const brand = {
  /** Primary purple */
  primary:   '#9333ea',
  /** Slightly darker purple — borders, focused states */
  primaryDark: '#7c3aed',
  /** Deep purple — shimmer, disabled buttons */
  primaryDeep: '#4a1f6e',
  /** Pink accent */
  pink:      '#ec4899',
  /** Dark pink — disabled gradient end */
  pinkDark:  '#7c2453',
  /** Bright purple for tints and selection dots */
  violet:    '#a855f7',
  /** Soft purple — success icon backgrounds etc. */
  violetMuted: '#c084fc',
} as const;

// ── Accent ────────────────────────────────────────────────────────────────────
const accent = {
  /** Festival winner gold */
  gold:        '#f59e0b',
  /** Success green */
  green:       '#22c55e',
  /** Error / destructive red */
  red:         '#ef4444',
  /** Soft red — error text */
  redSoft:     '#fca5a5',
  /** Dark red — error box bg */
  redDark:     '#3b0a0a',
  /** Dark red — error box border */
  redBorder:   '#7f1d1d',
  /** Dark green bg — success icon background */
  greenDark:   '#052e16',
  /** Info blue — titles in info boxes */
  blue:        '#60a5fa',
  /** Info blue soft — body text in info boxes */
  blueSoft:    '#93c5fd',
  /** Green with transparency — shield tooltip border */
  greenTip:    '#22c55e44',
} as const;

// ── Backgrounds ───────────────────────────────────────────────────────────────
const bg = {
  /** True black — root screens */
  black:       '#000000',
  /** Near-black — cards, modals */
  dark:        '#0a0a0a',
  /** Slightly-lighter near-black — payment cards, modals */
  subtle:      '#111111',
  /** Dark grey — card surfaces / input backgrounds */
  card:        '#171717',
  /** Shimmer placeholder */
  shimmer:     '#262626',
  /** Slightly lighter surface */
  elevated:    '#1a1a1a',
  /** Purple-tinted dark — mail icon circle, etc. */
  tintedDark:  '#2d1a4a',
  /** Hero gradient start */
  heroStart:   '#1a0533',
  /** Hero gradient end */
  heroEnd:     '#1a0519',
} as const;

// ── Surfaces ──────────────────────────────────────────────────────────────────
const surface = {
  /** Default card background */
  card:    '#171717',
  /** Active / pressed card */
  pressed: '#1a1a1a',
} as const;

// ── Borders ───────────────────────────────────────────────────────────────────
const border = {
  /** Default input / card border */
  default:  '#262626',
  /** Subtle divider — slightly lighter than default */
  subtle:   '#1e1e1e',
  /** Medium — badge outlines */
  medium:   '#404040',
  /** Focused input border */
  focus:    '#7c3aed',
  /** Google button border */
  google:   '#dadce0',
} as const;

// ── Text ──────────────────────────────────────────────────────────────────────
const text = {
  /** Primary white */
  primary:   '#ffffff',
  /** Secondary — descriptions */
  secondary: '#d4d4d4',
  /** Tertiary — subtitles, meta */
  tertiary:  '#a3a3a3',
  /** Muted — labels, captions */
  muted:     '#737373',
  /** Dimmed — section subtitles, dots */
  dimmed:    '#525252',
  /** Black — used on white buttons */
  inverse:   '#000000',
  /** Purple link colour */
  link:      '#c084fc',
  /** Gold — festival winner label */
  gold:      '#f59e0b',
} as const;

// ── Overlays ──────────────────────────────────────────────────────────────────
const overlay = {
  /** Search FAB semi-transparent background */
  fab:       '#00000088',
  /** Card image overlay */
  card:      'rgba(0,0,0,0.35)',
  /** Play button background */
  playBtn:   'rgba(0,0,0,0.6)',
  /** Play button border */
  playBtnBorder: '#ffffff88',
  /** Progress track */
  progress:  'rgba(255,255,255,0.15)',
  /** Hero fade overlay colour stop */
  heroDark:  '#000000dd',
  /** Decorative circle 1 */
  circle1:   '#ffffff10',
  /** Decorative circle 2 */
  circle2:   '#ffffff08',
  /** Header background — near-opaque black */
  headerBg:  'rgba(0,0,0,0.97)',
  /** Modal overlay scrim */
  modal:     'rgba(0,0,0,0.85)',
  /** Info box background — blue tint */
  infoBg:    'rgba(59,130,246,0.08)',
  /** Info box border — blue tint */
  infoBorder:'rgba(59,130,246,0.2)',
  /** Active payment method background — purple tint */
  brandTint: 'rgba(124,58,237,0.08)',
  /** Spinner track */
  spinner:   'rgba(255,255,255,0.25)',
} as const;

// ── Gradients ─────────────────────────────────────────────────────────────────
const gradient = {
  /** Primary brand button — left → right */
  brand:           [brand.primary,    brand.pink]      as [string, string],
  /** Disabled brand button */
  brandDisabled:   [brand.primaryDeep, brand.pinkDark] as [string, string],
  /** Progress bar */
  progress:        [brand.primaryDark, '#db2777']       as [string, string],
  /** Hero bottom fade */
  heroBg:          ['transparent', overlay.heroDark, bg.black] as [string, string, string],
  /** Full-screen background */
  screenBg:        [bg.heroStart, bg.black, bg.heroEnd] as [string, string, string],
  /** Thumbnail placeholder gradient */
  thumbFallback:   ['#1e1b4b', '#4338ca'] as [string, string],
  /** CTA area bottom fade */
  ctaFade:         ['transparent', 'rgba(0,0,0,0.95)', '#000000'] as [string, string, string],
} as const;

// ── Icon tints ────────────────────────────────────────────────────────────────
const icon = {
  /** Default brand purple icon */
  brand:    brand.violet,
  /** Gold — trophies, awards */
  gold:     accent.gold,
  /** White — nav, search */
  white:    text.primary,
  /** Grey — input field icons */
  input:    text.muted,
  /** Success */
  success:  accent.green,
} as const;

// ── Exported palette ──────────────────────────────────────────────────────────
export const COLORS = {
  brand,
  accent,
  bg,
  surface,
  border,
  text,
  overlay,
  gradient,
  icon,
} as const;

export type AppColors = typeof COLORS;
