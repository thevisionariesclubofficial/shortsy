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
  primary:      '#9333ea',
  /** Slightly darker purple — borders, focused states */
  primaryDark:  '#7c3aed',
  /** Deep purple — shimmer, disabled buttons */
  primaryDeep:  '#4a1f6e',
  /** Pink accent */
  pink:         '#ec4899',
  /** Dark pink — disabled gradient end */
  pinkDark:     '#7c2453',
  /** Deep pink used in receipt gradients */
  pinkDeep:     '#db2777',
  /** Bright purple for tints and selection dots */
  violet:       '#a855f7',
  /** Soft purple — success icon backgrounds etc. */
  violetMuted:  '#c084fc',
  /** Violet-500 */
  violet500:    '#8b5cf6',
  /** Violet-700 */
  violet700:    '#6d28d9',
  /** Light violet — sub-text on dark gradient */
  violetLight:  '#d8b4fe',
  /** Fuchsia — premium hero gradient accent */
  fuchsia:      '#c026d3',
  /** Purple-900 — splash screen gradient */
  purple900:    '#581c87',
} as const;

// ── Accent ────────────────────────────────────────────────────────────────────
const accent = {
  /** Festival winner gold */
  gold:        '#f59e0b',
  /** Amber-600 */
  amber600:    '#d97706',
  /** Amber-700 */
  amber700:    '#b45309',
  /** Amber-800 */
  amber800:    '#92400e',
  /** Amber-900 */
  amber900:    '#78350f',
  /** Amber-400 */
  amber400:    '#fbbf24',
  /** Yellow-400 for stars/diamonds */
  yellow400:   '#facc15',
  /** Yellow-300 for bright highlights */
  yellow:      '#fde047',
  /** Yellow-200 light */
  yellowLight: '#fde68a',
  /** Orange */
  orange:      '#f97316',
  /** Orange-600 */
  orange600:   '#ea580c',

  /** Success green */
  green:       '#22c55e',
  /** Green-700 */
  green700:    '#16a34a',
  /** Green-900 */
  green900:    '#14532d',
  /** Dark green bg — success icon background */
  greenDark:   '#052e16',
  /** Emerald-400 */
  emerald400:  '#34d399',
  /** Emerald-300 */
  emerald300:  '#6ee7b7',
  /** Emerald-500 */
  emerald:     '#10b981',
  /** Emerald-600 */
  emerald600:  '#059669',
  /** Emerald-800 */
  emerald800:  '#065f46',
  /** Emerald-900 */
  emerald900:  '#064e35',
  /** Green with transparency — shield tooltip border */
  greenTip:    '#22c55e44',

  /** Error / destructive red */
  red:         '#ef4444',
  /** Red-400 */
  red400:      '#f87171',
  /** Red-600 */
  red600:      '#dc2626',
  /** Red-700 */
  red700:      '#b91c1c',
  /** Red-800 */
  red800:      '#991b1b',
  /** Soft red — error text */
  redSoft:     '#fca5a5',
  /** Dark red — error box bg */
  redDark:     '#3b0a0a',
  /** Dark red — error box border */
  redBorder:   '#7f1d1d',
  /** Rose-600 */
  rose600:     '#e11d48',
  /** Rose-700 */
  rose700:     '#be185d',
  /** Rose-900 */
  rose900:     '#881337',
  /** Rose-950 */
  rose950:     '#4c0519',
  /** Pink-400 */
  pink400:     '#f472b6',
  /** Pink-900 — musical drama bg */
  pinkDark:    '#4a0d2e',
  /** Pink-900 mid */
  pink900:     '#831843',

  /** Info blue — titles in info boxes */
  blue:        '#60a5fa',
  /** Info blue soft — body text in info boxes */
  blueSoft:    '#93c5fd',
  /** Blue-500 */
  blue500:     '#3b82f6',
  /** Blue-600 */
  blue600:     '#2563eb',
  /** Sky-400 */
  sky400:      '#0ea5e9',
  /** Sky-600 */
  sky600:      '#0284c7',
  /** Sky-700 */
  sky700:      '#0369a1',
  /** Sky-900 */
  sky900:      '#0c4a6e',
  /** Sky-950 */
  sky950:      '#082f49',
  /** Cyan */
  cyan:        '#06b6d4',
  /** Cyan-700 */
  cyan700:     '#0e7490',
  /** Teal */
  teal:        '#0d9488',
  /** Teal-900 */
  teal900:     '#134e4a',
  /** Teal-950 */
  teal950:     '#042f2e',

  /** Indigo */
  indigo:      '#6366f1',
  /** Indigo-600 */
  indigo600:   '#4f46e5',
  /** Indigo-700 */
  indigo700:   '#4338ca',
  /** Indigo-900 */
  indigo900:   '#312e81',
  /** Indigo dark bg */
  indigoDark:  '#1e1b4b',
  /** Violet-900 */
  violet900:   '#4c1d95',
  /** Violet-950 */
  violet950:   '#2e1065',
  /** Violet bg for profile premium card */
  violetBg:    '#4f1fa3',
  /** Purple-800 — horror gradient start */
  purple800:   '#6b21a8',
  /** Purple-950 — horror gradient end */
  purple950:   '#3b0764',
} as const;

// ── Backgrounds ───────────────────────────────────────────────────────────────
const bg = {
  /** True black — root screens */
  black:        '#000000',
  /** Near-black — cards, modals */
  dark:         '#0a0a0a',
  /** Very near-black — premium screens */
  nearBlack:    '#0d0d0d',
  /** Slightly-lighter near-black — payment cards, modals */
  subtle:       '#111111',
  /** Dark grey — card surfaces / input backgrounds */
  card:         '#171717',
  /** Shimmer placeholder */
  shimmer:      '#262626',
  /** Slightly lighter surface */
  elevated:     '#1a1a1a',
  /** Modal overlay background */
  modal:        '#1f1f1f',
  /** iOS-style modal background */
  modalIOS:     '#1c1c1e',
  /** Purple-tinted dark — mail icon circle, etc. */
  tintedDark:   '#2d1a4a',
  /** Hero gradient start */
  heroStart:    '#1a0533',
  /** Hero gradient end */
  heroEnd:      '#1a0519',
  /** Slate dark — payment history card bg */
  slate:        '#111827',
  /** Splash screen dark bg */
  splash:       '#0f0e30',
  /** Legal screens gradient start */
  legal:        '#1a1a2e',
  /** Legal screens gradient end */
  legalEnd:     '#16213e',
  /** Onboarding gradient start */
  onboardingStart: '#0d001a',
  /** Premium hero gradient dark */
  premiumDark:  '#1e0a3c',
  /** Stone black — thriller bg */
  stoneBlack:   '#0c0a09',
  /** Stone-900 */
  stone900:     '#1c1917',
  /** Stone-800 */
  stone800:     '#292524',
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
  default:    '#262626',
  /** Subtle divider — slightly lighter than default */
  subtle:     '#1e1e1e',
  /** Medium — badge outlines */
  medium:     '#404040',
  /** Muted — modal drawer handles */
  muted:      '#2a2a2a',
  /** Handle — sheet drag handle */
  handle:     '#333333',
  /** Focused input border */
  focus:      '#7c3aed',
  /** Google button border */
  google:     '#dadce0',
  /** Gray-300 — receipt dashes */
  gray300:    '#d1d5db',
  /** Premium card border */
  premiumCard: '#2a1d4e',
} as const;

// ── Text ──────────────────────────────────────────────────────────────────────
const text = {
  /** Primary white */
  primary:    '#ffffff',
  /** Secondary — descriptions */
  secondary:  '#d4d4d4',
  /** Tertiary — subtitles, meta */
  tertiary:   '#a3a3a3',
  /** Muted — labels, captions */
  muted:      '#737373',
  /** Dimmed — section subtitles, dots */
  dimmed:     '#525252',
  /** Black — used on white buttons */
  inverse:    '#000000',
  /** Purple link colour */
  link:       '#c084fc',
  /** Gold — festival winner label */
  gold:       '#f59e0b',
  /** Google sign-in button text */
  googleDark: '#3c4043',
  /** Gray-400 — secondary muted text */
  gray400:    '#9ca3af',
  /** Gray-500 — tertiary muted text */
  gray500:    '#6b7280',
  /** Gray-600 */
  gray600:    '#4b5563',
  /** Gray-700 — placeholder thumbnail icon */
  gray700:    '#374151',
  /** Zinc-600 — footer/shield text */
  zinc600:    '#3f3f46',
} as const;

// ── Overlays ──────────────────────────────────────────────────────────────────
const overlay = {
  /** Search FAB semi-transparent background */
  fab:              '#00000088',
  /** Card image overlay */
  card:             'rgba(0,0,0,0.35)',
  /** Play button background */
  playBtn:          'rgba(0,0,0,0.6)',
  /** Play button border */
  playBtnBorder:    '#ffffff88',
  /** Progress track */
  progress:         'rgba(255,255,255,0.15)',
  /** Hero fade overlay colour stop */
  heroDark:         '#000000dd',
  /** Decorative circle 1 */
  circle1:          '#ffffff10',
  /** Decorative circle 2 */
  circle2:          '#ffffff08',
  /** Header background — near-opaque black */
  headerBg:         'rgba(0,0,0,0.97)',
  /** Modal overlay scrim */
  modal:            'rgba(0,0,0,0.85)',
  /** Info box background — blue tint */
  infoBg:           'rgba(59,130,246,0.08)',
  /** Info box border — blue tint */
  infoBorder:       'rgba(59,130,246,0.2)',
  /** Info box border strong */
  infoBorderStrong: 'rgba(59, 130, 246, 0.3)',
  /** Active payment method background — purple tint */
  brandTint:        'rgba(124,58,237,0.08)',
  /** Brand tint 12% */
  brandTint12:      'rgba(124,58,237,0.12)',
  /** Brand tint 25% */
  brandTint25:      'rgba(124,58,237,0.25)',
  /** Spinner track */
  spinner:          'rgba(255,255,255,0.25)',
  /** Spinner border (transparent side) */
  spinnerBorder:    '#ffffff40',
  /** Ripple on dark — android_ripple */
  ripple:           '#ffffff20',
  /** Ripple on dark, medium */
  rippleMed:        '#ffffff30',
  /** Very subtle surface overlay */
  surfaceXFaint:    '#ffffff08',
  /** Faint surface overlay */
  surfaceFaint:     '#ffffff12',
  /** Light surface overlay */
  surfaceLight:     '#ffffff18',
  /** Dark overlay 70% */
  dark70:           'rgba(0,0,0,0.7)',
  /** Dark overlay 75% */
  dark75:           'rgba(0,0,0,0.75)',
  /** Dark overlay 80% */
  dark80:           'rgba(0, 0, 0, 0.8)',
  /** Dark overlay 82% */
  dark82:           'rgba(0,0,0,0.82)',
  /** Dark overlay 88% */
  dark88:           'rgba(0,0,0,0.88)',
  /** Dark overlay 92% */
  dark92:           'rgba(0,0,0,0.92)',
  /** CTA fade end stop */
  ctaFadeEnd:       'rgba(0,0,0,0.95)',
  /** BG dim for player */
  bgDim:            'rgba(0,0,0,0.45)',
  /** Control background */
  controlBg:        'rgba(0,0,0,0.55)',
  /** White 4% */
  white04:          'rgba(255,255,255,0.04)',
  /** White 5% */
  white05:          'rgba(255, 255, 255, 0.05)',
  /** White 7% */
  white07:          'rgba(255,255,255,0.07)',
  /** White 8% */
  white08:          'rgba(255,255,255,0.08)',
  /** White 10% */
  white10:          'rgba(255,255,255,0.1)',
  /** White 12% */
  white12:          'rgba(255,255,255,0.12)',
  /** White 18% */
  white18:          'rgba(255,255,255,0.18)',
  /** White 20% */
  white20:          'rgba(255,255,255,0.2)',
  /** White 22% */
  white22:          'rgba(255,255,255,0.22)',
  /** White 40% */
  white40:          'rgba(255,255,255,0.4)',
  /** White 50% */
  white50:          'rgba(255,255,255,0.5)',
  /** White 55% */
  white55:          'rgba(255,255,255,0.55)',
  /** White 60% */
  white60:          'rgba(255,255,255,0.6)',
  /** White 65% */
  white65:          'rgba(255,255,255,0.65)',
  /** Brand receipt tagline (white 75%) */
  brandTagline:     'rgba(255,255,255,0.75)',
  /** White 70% */
  white70:          'rgba(255, 255, 255, 0.7)',
  /** White 80% */
  white80:          'rgba(255,255,255,0.8)',
  /** White 90% */
  white90:          'rgba(255, 255, 255, 0.9)',
  /** White 95% */
  white95:          'rgba(255,255,255,0.95)',
  /** Primary purple tint 8% */
  primaryTint08:    'rgba(147,51,234,0.08)',
  /** Primary purple tint 12% */
  primaryTint12:    'rgba(147,51,234,0.12)',
  /** Violet tint 8% */
  violetTint08:     'rgba(168,85,247,0.08)',
  /** Violet tint 10% */
  violetTint10:     'rgba(168,85,247,0.1)',
  /** Violet tint 14% */
  violetTint14:     'rgba(168,85,247,0.14)',
  /** Violet tint 20% */
  violetTint20:     'rgba(168,85,247,0.2)',
  /** Violet tint 25% */
  violetTint25:     'rgba(168,85,247,0.25)',
  /** Violet tint 30% */
  violetTint30:     'rgba(168,85,247,0.3)',
  /** Violet strong 85% */
  violetStrong:     'rgba(168,85,247,0.85)',
  /** Violet-500 tint 10% */
  violet4Tint10:    'rgba(139, 92, 246, 0.1)',
  /** Violet-500 tint 30% */
  violet4Tint30:    'rgba(139, 92, 246, 0.3)',
  /** Fuchsia tint */
  fuchsiaTint:      'rgba(192,38,211,0.3)',
  /** Pink tint */
  pinkTint:         'rgba(236,72,153,0.08)',
  /** Green tint 15% */
  greenTint15:      'rgba(34,197,94,0.15)',
  /** Green tint 40% */
  greenTint40:      'rgba(34,197,94,0.4)',
  /** Emerald tint */
  emeraldTint:      'rgba(52,211,153,0.15)',
  /** Emerald-300 15% */
  emeraldLight15:   'rgba(110,231,183,0.15)',
  /** Emerald-300 20% */
  emeraldLight20:   'rgba(110,231,183,0.2)',
  /** Emerald-300 30% */
  emeraldLight30:   'rgba(110,231,183,0.3)',
  /** Emerald-300 strong */
  emeraldStrong:    'rgba(110,231,183,0.9)',
  /** Emerald bg */
  emeraldBg:        'rgba(16, 185, 129, 0.1)',
  /** Emerald border */
  emeraldBorder:    'rgba(16, 185, 129, 0.3)',
  /** Red tint 10% */
  redTint10:        'rgba(239, 68, 68, 0.1)',
  /** Red tint 12% */
  redTint12:        'rgba(239,68,68,0.12)',
  /** Red tint 15% */
  redTint15:        'rgba(239,68,68,0.15)',
  /** Red tint 25% */
  redTint25:        'rgba(239,68,68,0.25)',
  /** Red tint 30% */
  redTint30:        'rgba(239, 68, 68, 0.3)',
  /** Amber bg */
  amberBg:          'rgba(245, 158, 11, 0.1)',
  /** Amber border */
  amberBorder:      'rgba(245, 158, 11, 0.3)',
  /** Yellow tint 12% */
  yellowTint12:     'rgba(253,224,71,0.12)',
  /** Yellow tint 28% */
  yellowTint28:     'rgba(253,224,71,0.28)',
  /** Yellow strong 90% */
  yellowStrong:     'rgba(253,224,71,0.9)',
  /** Neutral gray 20% */
  neutral20:        'rgba(82,82,82,0.2)',
  /** Heavy black overlay */
  heavy:            '#000000b0',
  /** Dark overlay token alias */
  dark:             '#000000cc',
} as const;

// ── Receipt (light background paper) ─────────────────────────────────────────
const receipt = {
  bgLight:            '#fafafa',
  divider:            '#f0f0f0',
  textDark:           '#111111',
  textMid:            '#666666',
  textLight:          '#999999',
  statusPaidBg:       '#f0fdf4',
  statusPaidBorder:   '#dcfce7',
  statusPendingBg:    '#fffbeb',
  statusPendingBorder:'#fef3c7',
  statusFailedBg:     '#fef2f2',
  statusFailedBorder: '#fee2e2',
} as const;

// ── Genre gradient palettes ───────────────────────────────────────────────────
// Used in ContentCard, ContentDetailScreen, and MoodCard for thumbnail backgrounds.
const genre = {
  drama:          ['#2e1065', '#4c1d95', '#7c3aed'] as [string,string,string],
  thriller:       ['#0c0a09', '#1c1917', '#78350f'] as [string,string,string],
  thrillerCard:   ['#0c0a09', '#1c1917', '#92400e'] as [string,string,string],
  musicalDrama:   ['#4a0d2e', '#831843', '#be185d'] as [string,string,string],
  comedy:         ['#052e16', '#14532d', '#16a34a'] as [string,string,string],
  romance:        ['#4c0519', '#881337', '#e11d48'] as [string,string,string],
  sciFi:          ['#082f49', '#0c4a6e', '#0284c7'] as [string,string,string],
  family:         ['#1c1917', '#292524', '#f97316'] as [string,string,string],
  documentary:    ['#042f2e', '#134e4a', '#0d9488'] as [string,string,string],
  experimental:   ['#1e1b4b', '#312e81', '#6366f1'] as [string,string,string],
  default3:       ['#0f0e30', '#1e1b4b', '#4338ca'] as [string,string,string],
  // 2-stop mood card gradients
  dramaMood:      ['#7c3aed', '#4f46e5'] as [string,string],
  thrillerMood:   ['#dc2626', '#991b1b'] as [string,string],
  romanceMood:    ['#ec4899', '#be185d'] as [string,string],
  comedyMood:     ['#f59e0b', '#d97706'] as [string,string],
  documentaryMood:['#0ea5e9', '#0369a1'] as [string,string],
  experimentalMood:['#10b981', '#065f46'] as [string,string],
  familyMood:     ['#8b5cf6', '#6d28d9'] as [string,string],
  actionMood:     ['#ef4444', '#b91c1c'] as [string,string],
  horrorMood:     ['#6b21a8', '#3b0764'] as [string,string],
  sciFiMood:      ['#06b6d4', '#0e7490'] as [string,string],
  fallback2:      ['#6366f1', '#4338ca'] as [string,string],
} as const;

// ── Gradients ─────────────────────────────────────────────────────────────────
const gradient = {
  /** Primary brand button — left → right */
  brand:           [brand.primary,    brand.pink]      as [string, string],
  /** Disabled brand button */
  brandDisabled:   [brand.primaryDeep, brand.pinkDark] as [string, string],
  /** Progress bar */
  progress:        [brand.primaryDark, brand.pinkDeep] as [string, string],
  /** Hero bottom fade */
  heroBg:          ['transparent', overlay.heroDark, bg.black] as [string, string, string],
  /** Full-screen background */
  screenBg:        [bg.heroStart, bg.black, bg.heroEnd] as [string, string, string],
  /** Thumbnail placeholder gradient */
  thumbFallback:   [accent.indigoDark, accent.indigo700] as [string, string],
  /** CTA area bottom fade */
  ctaFade:         ['transparent', overlay.ctaFadeEnd, bg.black] as [string, string, string],
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
  receipt,
  genre,
} as const;

export type AppColors = typeof COLORS;
