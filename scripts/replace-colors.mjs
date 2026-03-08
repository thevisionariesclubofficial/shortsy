/**
 * replace-colors.mjs
 * Replaces hardcoded color literals in .tsx files with COLORS.* token references.
 * Run once from the shortsy/ directory: node scripts/replace-colors.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// ─── Map: raw color literal → COLORS token expression ────────────────────────
// Order matters: longer/more-specific strings first to avoid partial matches.
const COLOR_MAP = [
  // ── Whites / near-whites ──────────────────────────────────────────────────
  ["'#ffffff'", "COLORS.text.primary"],
  ['"#ffffff"', "COLORS.text.primary"],
  ["'#fff'",    "COLORS.text.primary"],
  ['"#fff"',    "COLORS.text.primary"],
  ["'#fafafa'", "COLORS.receipt.bgLight"],
  ['"#fafafa"', "COLORS.receipt.bgLight"],
  ["'#f0f0f0'", "COLORS.receipt.divider"],
  ['"#f0f0f0"', "COLORS.receipt.divider"],

  // ── Blacks / near-blacks ──────────────────────────────────────────────────
  ["'#000000'", "COLORS.bg.black"],
  ['"#000000"', "COLORS.bg.black"],
  ["'#000'",    "COLORS.bg.black"],
  ['"#000"',    "COLORS.bg.black"],
  ["'#0a0a0a'", "COLORS.bg.dark"],
  ['"#0a0a0a"', "COLORS.bg.dark"],
  ["'#080808'", "COLORS.bg.nearBlack"],
  ['"#080808"', "COLORS.bg.nearBlack"],
  ["'#0d0d0d'", "COLORS.bg.nearBlack"],
  ['"#0d0d0d"', "COLORS.bg.nearBlack"],
  ["'#111111'", "COLORS.bg.subtle"],
  ['"#111111"', "COLORS.bg.subtle"],
  ["'#111'",    "COLORS.bg.subtle"],
  ['"#111"',    "COLORS.bg.subtle"],
  ["'#171717'", "COLORS.bg.card"],
  ['"#171717"', "COLORS.bg.card"],
  ["'#1a1a1a'", "COLORS.bg.elevated"],
  ['"#1a1a1a"', "COLORS.bg.elevated"],
  ["'#1f1f1f'", "COLORS.bg.modal"],
  ['"#1f1f1f"', "COLORS.bg.modal"],
  ["'#1c1c1e'", "COLORS.bg.modalIOS"],
  ['"#1c1c1e"', "COLORS.bg.modalIOS"],
  ["'#262626'", "COLORS.border.default"],
  ['"#262626"', "COLORS.border.default"],
  ["'#1e1e1e'", "COLORS.border.subtle"],
  ['"#1e1e1e"', "COLORS.border.subtle"],
  ["'#2a2a2a'", "COLORS.border.muted"],
  ['"#2a2a2a"', "COLORS.border.muted"],
  ["'#333333'", "COLORS.border.handle"],
  ['"#333333"', "COLORS.border.handle"],
  ["'#333'",    "COLORS.border.handle"],
  ['"#333"',    "COLORS.border.handle"],
  ["'#404040'", "COLORS.border.medium"],
  ['"#404040"', "COLORS.border.medium"],
  ["'#1a0533'", "COLORS.bg.heroStart"],
  ['"#1a0533"', "COLORS.bg.heroStart"],
  ["'#1a0519'", "COLORS.bg.heroEnd"],
  ['"#1a0519"', "COLORS.bg.heroEnd"],
  ["'#2d1a4a'", "COLORS.bg.tintedDark"],
  ['"#2d1a4a"', "COLORS.bg.tintedDark"],
  ["'#111827'", "COLORS.bg.slate"],
  ['"#111827"', "COLORS.bg.slate"],

  // ── Brand purples ─────────────────────────────────────────────────────────
  ["'#9333ea'", "COLORS.brand.primary"],
  ['"#9333ea"', "COLORS.brand.primary"],
  ["'#7c3aed'", "COLORS.brand.primaryDark"],
  ['"#7c3aed"', "COLORS.brand.primaryDark"],
  ["'#4a1f6e'", "COLORS.brand.primaryDeep"],
  ['"#4a1f6e"', "COLORS.brand.primaryDeep"],
  ["'#ec4899'", "COLORS.brand.pink"],
  ['"#ec4899"', "COLORS.brand.pink"],
  ["'#7c2453'", "COLORS.brand.pinkDark"],
  ['"#7c2453"', "COLORS.brand.pinkDark"],
  ["'#a855f7'", "COLORS.brand.violet"],
  ['"#a855f7"', "COLORS.brand.violet"],
  ["'#c084fc'", "COLORS.brand.violetMuted"],
  ['"#c084fc"', "COLORS.brand.violetMuted"],
  ["'#c026d3'", "COLORS.brand.fuchsia"],
  ['"#c026d3"', "COLORS.brand.fuchsia"],
  ["'#db2777'", "COLORS.brand.pinkDeep"],
  ['"#db2777"', "COLORS.brand.pinkDeep"],
  ["'#d8b4fe'", "COLORS.brand.violetLight"],
  ['"#d8b4fe"', "COLORS.brand.violetLight"],
  ["'#8b5cf6'", "COLORS.brand.violet500"],
  ['"#8b5cf6"', "COLORS.brand.violet500"],
  ["'#6d28d9'", "COLORS.brand.violet700"],
  ['"#6d28d9"', "COLORS.brand.violet700"],

  // ── Accent gold / amber ───────────────────────────────────────────────────
  ["'#f59e0b'", "COLORS.accent.gold"],
  ['"#f59e0b"', "COLORS.accent.gold"],
  ["'#d97706'", "COLORS.accent.amber600"],
  ['"#d97706"', "COLORS.accent.amber600"],
  ["'#fde047'", "COLORS.accent.yellow"],
  ['"#fde047"', "COLORS.accent.yellow"],
  ["'#facc15'", "COLORS.accent.yellow400"],
  ['"#facc15"', "COLORS.accent.yellow400"],
  ["'#fbbf24'", "COLORS.accent.amber400"],
  ['"#fbbf24"', "COLORS.accent.amber400"],
  ["'#fde68a'", "COLORS.accent.yellowLight"],
  ['"#fde68a"', "COLORS.accent.yellowLight"],
  ["'#78350f'", "COLORS.accent.amber900"],
  ['"#78350f"', "COLORS.accent.amber900"],
  ["'#92400e'", "COLORS.accent.amber800"],
  ['"#92400e"', "COLORS.accent.amber800"],
  ["'#b45309'", "COLORS.accent.amber700"],
  ['"#b45309"', "COLORS.accent.amber700"],
  ["'#ea580c'", "COLORS.accent.orange600"],
  ['"#ea580c"', "COLORS.accent.orange600"],
  ["'#f97316'", "COLORS.accent.orange"],
  ['"#f97316"', "COLORS.accent.orange"],

  // ── Accent green ──────────────────────────────────────────────────────────
  ["'#22c55e'", "COLORS.accent.green"],
  ['"#22c55e"', "COLORS.accent.green"],
  ["'#16a34a'", "COLORS.accent.green700"],
  ['"#16a34a"', "COLORS.accent.green700"],
  ["'#10b981'", "COLORS.accent.emerald"],
  ['"#10b981"', "COLORS.accent.emerald"],
  ["'#34d399'", "COLORS.accent.emerald400"],
  ['"#34d399"', "COLORS.accent.emerald400"],
  ["'#6ee7b7'", "COLORS.accent.emerald300"],
  ['"#6ee7b7"', "COLORS.accent.emerald300"],
  ["'#059669'", "COLORS.accent.emerald600"],
  ['"#059669"', "COLORS.accent.emerald600"],
  ["'#065f46'", "COLORS.accent.emerald800"],
  ['"#065f46"', "COLORS.accent.emerald800"],
  ["'#064e35'", "COLORS.accent.emerald900"],
  ['"#064e35"', "COLORS.accent.emerald900"],
  ["'#052e16'", "COLORS.accent.greenDark"],
  ['"#052e16"', "COLORS.accent.greenDark"],
  ["'#14532d'", "COLORS.accent.green900"],
  ['"#14532d"', "COLORS.accent.green900"],
  ["'#dcfce7'", "COLORS.receipt.statusPaidBorder"],
  ['"#dcfce7"', "COLORS.receipt.statusPaidBorder"],
  ["'#f0fdf4'", "COLORS.receipt.statusPaidBg"],
  ['"#f0fdf4"', "COLORS.receipt.statusPaidBg"],

  // ── Accent red ────────────────────────────────────────────────────────────
  ["'#ef4444'", "COLORS.accent.red"],
  ['"#ef4444"', "COLORS.accent.red"],
  ["'#fca5a5'", "COLORS.accent.redSoft"],
  ['"#fca5a5"', "COLORS.accent.redSoft"],
  ["'#3b0a0a'", "COLORS.accent.redDark"],
  ['"#3b0a0a"', "COLORS.accent.redDark"],
  ["'#7f1d1d'", "COLORS.accent.redBorder"],
  ['"#7f1d1d"', "COLORS.accent.redBorder"],
  ["'#f87171'", "COLORS.accent.red400"],
  ['"#f87171"', "COLORS.accent.red400"],
  ["'#dc2626'", "COLORS.accent.red600"],
  ['"#dc2626"', "COLORS.accent.red600"],
  ["'#b91c1c'", "COLORS.accent.red700"],
  ['"#b91c1c"', "COLORS.accent.red700"],
  ["'#991b1b'", "COLORS.accent.red800"],
  ['"#991b1b"', "COLORS.accent.red800"],
  ["'#881337'", "COLORS.accent.rose900"],
  ['"#881337"', "COLORS.accent.rose900"],
  ["'#be185d'", "COLORS.accent.rose700"],
  ['"#be185d"', "COLORS.accent.rose700"],
  ["'#e11d48'", "COLORS.accent.rose600"],
  ['"#e11d48"', "COLORS.accent.rose600"],
  ["'#4c0519'", "COLORS.accent.rose950"],
  ['"#4c0519"', "COLORS.accent.rose950"],
  ["'#4a0d2e'", "COLORS.accent.pinkDark"],
  ['"#4a0d2e"', "COLORS.accent.pinkDark"],
  ["'#831843'", "COLORS.accent.pink900"],
  ['"#831843"', "COLORS.accent.pink900"],
  ["'#f472b6'", "COLORS.accent.pink400"],
  ['"#f472b6"', "COLORS.accent.pink400"],
  ["'#fee2e2'", "COLORS.receipt.statusFailedBorder"],
  ['"#fee2e2"', "COLORS.receipt.statusFailedBorder"],
  ["'#fef2f2'", "COLORS.receipt.statusFailedBg"],
  ['"#fef2f2"', "COLORS.receipt.statusFailedBg"],
  ["'#fffbeb'", "COLORS.receipt.statusPendingBg"],
  ['"#fffbeb"', "COLORS.receipt.statusPendingBg"],
  ["'#fef3c7'", "COLORS.receipt.statusPendingBorder"],
  ['"#fef3c7"', "COLORS.receipt.statusPendingBorder"],

  // ── Accent blue ───────────────────────────────────────────────────────────
  ["'#60a5fa'", "COLORS.accent.blue"],
  ['"#60a5fa"', "COLORS.accent.blue"],
  ["'#93c5fd'", "COLORS.accent.blueSoft"],
  ['"#93c5fd"', "COLORS.accent.blueSoft"],
  ["'#3b82f6'", "COLORS.accent.blue500"],
  ['"#3b82f6"', "COLORS.accent.blue500"],
  ["'#2563eb'", "COLORS.accent.blue600"],
  ['"#2563eb"', "COLORS.accent.blue600"],
  ["'#0ea5e9'", "COLORS.accent.sky400"],
  ['"#0ea5e9"', "COLORS.accent.sky400"],
  ["'#0369a1'", "COLORS.accent.sky700"],
  ['"#0369a1"', "COLORS.accent.sky700"],
  ["'#0284c7'", "COLORS.accent.sky600"],
  ['"#0284c7"', "COLORS.accent.sky600"],
  ["'#0c4a6e'", "COLORS.accent.sky900"],
  ['"#0c4a6e"', "COLORS.accent.sky900"],
  ["'#082f49'", "COLORS.accent.sky950"],
  ['"#082f49"', "COLORS.accent.sky950"],
  ["'#06b6d4'", "COLORS.accent.cyan"],
  ['"#06b6d4"', "COLORS.accent.cyan"],
  ["'#0e7490'", "COLORS.accent.cyan700"],
  ['"#0e7490"', "COLORS.accent.cyan700"],
  ["'#0d9488'", "COLORS.accent.teal"],
  ['"#0d9488"', "COLORS.accent.teal"],
  ["'#134e4a'", "COLORS.accent.teal900"],
  ['"#134e4a"', "COLORS.accent.teal900"],
  ["'#042f2e'", "COLORS.accent.teal950"],
  ['"#042f2e"', "COLORS.accent.teal950"],

  // ── Indigo / violet ───────────────────────────────────────────────────────
  ["'#6366f1'", "COLORS.accent.indigo"],
  ['"#6366f1"', "COLORS.accent.indigo"],
  ["'#4f46e5'", "COLORS.accent.indigo600"],
  ['"#4f46e5"', "COLORS.accent.indigo600"],
  ["'#4338ca'", "COLORS.accent.indigo700"],
  ['"#4338ca"', "COLORS.accent.indigo700"],
  ["'#312e81'", "COLORS.accent.indigo900"],
  ['"#312e81"', "COLORS.accent.indigo900"],
  ["'#4c1d95'", "COLORS.accent.violet900"],
  ['"#4c1d95"', "COLORS.accent.violet900"],
  ["'#2e1065'", "COLORS.accent.violet950"],
  ['"#2e1065"', "COLORS.accent.violet950"],
  ["'#1e1b4b'", "COLORS.accent.indigoDark"],
  ['"#1e1b4b"', "COLORS.accent.indigoDark"],
  ["'#4f1fa3'", "COLORS.accent.violetBg"],
  ['"#4f1fa3"', "COLORS.accent.violetBg"],
  ["'#2a1d4e'", "COLORS.border.premiumCard"],
  ['"#2a1d4e"', "COLORS.border.premiumCard"],
  ["'#1e0a3c'", "COLORS.bg.premiumDark"],
  ['"#1e0a3c"', "COLORS.bg.premiumDark"],

  // ── Text greys ────────────────────────────────────────────────────────────
  ["'#d4d4d4'", "COLORS.text.secondary"],
  ['"#d4d4d4"', "COLORS.text.secondary"],
  ["'#a3a3a3'", "COLORS.text.tertiary"],
  ['"#a3a3a3"', "COLORS.text.tertiary"],
  ["'#737373'", "COLORS.text.muted"],
  ['"#737373"', "COLORS.text.muted"],
  ["'#525252'", "COLORS.text.dimmed"],
  ['"#525252"', "COLORS.text.dimmed"],
  ["'#000000'", "COLORS.text.inverse"],  // will hit bg.black first — fine as both resolve the same
  ["'#3c4043'", "COLORS.text.googleDark"],
  ['"#3c4043"', "COLORS.text.googleDark"],
  ["'#9ca3af'", "COLORS.text.gray400"],
  ['"#9ca3af"', "COLORS.text.gray400"],
  ["'#6b7280'", "COLORS.text.gray500"],
  ['"#6b7280"', "COLORS.text.gray500"],
  ["'#4b5563'", "COLORS.text.gray600"],
  ['"#4b5563"', "COLORS.text.gray600"],
  ["'#374151'", "COLORS.text.gray700"],
  ['"#374151"', "COLORS.text.gray700"],
  ["'#3f3f46'", "COLORS.text.zinc600"],
  ['"#3f3f46"', "COLORS.text.zinc600"],
  ["'#111111'", "COLORS.receipt.textDark"],  // used in receipt rows  (duplicate, first match wins)
  ["'#666666'", "COLORS.receipt.textMid"],
  ['"#666666"', "COLORS.receipt.textMid"],
  ["'#666'",    "COLORS.receipt.textMid"],
  ['"#666"',    "COLORS.receipt.textMid"],
  ["'#999999'", "COLORS.receipt.textLight"],
  ['"#999999"', "COLORS.receipt.textLight"],
  ["'#999'",    "COLORS.receipt.textLight"],
  ['"#999"',    "COLORS.receipt.textLight"],
  ["'#ccc'",    "COLORS.receipt.textLight"],
  ['"#ccc"',    "COLORS.receipt.textLight"],
  ["'#111'",    "COLORS.receipt.textDark"],   // used in receipt rows
  ['"#111"',    "COLORS.receipt.textDark"],

  // ── Google button ─────────────────────────────────────────────────────────
  ["'#dadce0'", "COLORS.border.google"],
  ['"#dadce0"', "COLORS.border.google"],

  // ── Overlays ──────────────────────────────────────────────────────────────
  ["'#00000088'", "COLORS.overlay.fab"],
  ['"#00000088"', "COLORS.overlay.fab"],
  ["'#ffffff40'", "COLORS.overlay.spinnerBorder"],
  ['"#ffffff40"', "COLORS.overlay.spinnerBorder"],
  ["'#ffffff20'", "COLORS.overlay.ripple"],
  ['"#ffffff20"', "COLORS.overlay.ripple"],
  ["'#ffffff30'", "COLORS.overlay.rippleMed"],
  ['"#ffffff30"', "COLORS.overlay.rippleMed"],
  ["'#ffffff12'", "COLORS.overlay.surfaceFaint"],
  ['"#ffffff12"', "COLORS.overlay.surfaceFaint"],
  ["'#ffffff18'", "COLORS.overlay.surfaceLight"],
  ['"#ffffff18"', "COLORS.overlay.surfaceLight"],
  ["'#ffffff08'", "COLORS.overlay.surfaceXFaint"],
  ['"#ffffff08"', "COLORS.overlay.surfaceXFaint"],
  ["'#000000b0'", "COLORS.overlay.heavy"],
  ['"#000000b0"', "COLORS.overlay.heavy"],
  ["'#000000cc'", "COLORS.overlay.dark"],
  ['"#000000cc"', "COLORS.overlay.dark"],

  // Misc backgrounds
  ["'#d1d5db'", "COLORS.border.gray300"],
  ['"#d1d5db"', "COLORS.border.gray300"],

  // Onboarding gradient colours not in existing COLORS
  ["'#0d001a'", "COLORS.bg.onboardingStart"],
  ['"#0d001a"', "COLORS.bg.onboardingStart"],
  ["'#581c87'", "COLORS.brand.purple900"],
  ['"#581c87"', "COLORS.brand.purple900"],
  ["'#831843'", "COLORS.accent.pink900"],
  ['"#831843"', "COLORS.accent.pink900"],
  ["'#4f1fa3'", "COLORS.accent.violetBg"],

  // SplashScreen extras
  ["'#0f0e30'", "COLORS.bg.splash"],
  ['"#0f0e30"', "COLORS.bg.splash"],
  ["'#1a1a2e'", "COLORS.bg.legal"],
  ['"#1a1a2e"', "COLORS.bg.legal"],
  ["'#16213e'", "COLORS.bg.legalEnd"],
  ['"#16213e"', "COLORS.bg.legalEnd"],

  // WelcomeChoice
  ["'#1c1c1e'", "COLORS.bg.modalIOS"],

  // ProfilePage extras
  ["'#0c0a09'", "COLORS.bg.stoneBlack"],
  ['"#0c0a09"', "COLORS.bg.stoneBlack"],
  ["'#1c1917'", "COLORS.bg.stone900"],
  ['"#1c1917"', "COLORS.bg.stone900"],
  ["'#292524'", "COLORS.bg.stone800"],
  ['"#292524"', "COLORS.bg.stone800"],

  // rgba versions — do these last since they overlap
  ["rgba(0,0,0,0.35)",   "COLORS.overlay.card"],
  ["rgba(0, 0, 0, 0.35)","COLORS.overlay.card"],
  ["rgba(0,0,0,0.45)",   "COLORS.overlay.bgDim"],
  ["rgba(0,0,0,0.55)",   "COLORS.overlay.controlBg"],
  ["rgba(0,0,0,0.6)",    "COLORS.overlay.playBtn"],
  ["rgba(0, 0, 0, 0.6)", "COLORS.overlay.playBtn"],
  ["rgba(0,0,0,0.7)",    "COLORS.overlay.dark70"],
  ["rgba(0, 0, 0, 0.7)", "COLORS.overlay.dark70"],
  ["rgba(0, 0, 0, 0.8)", "COLORS.overlay.dark80"],
  ["rgba(0,0,0,0.75)",   "COLORS.overlay.dark75"],
  ["rgba(0,0,0,0.82)",   "COLORS.overlay.dark82"],
  ["rgba(0,0,0,0.85)",   "COLORS.overlay.modal"],
  ["rgba(0,0,0,0.88)",   "COLORS.overlay.dark88"],
  ["rgba(0,0,0,0.92)",   "COLORS.overlay.dark92"],
  ["rgba(0,0,0,0.95)",   "COLORS.overlay.ctaFadeEnd"],
  ["rgba(0,0,0,0.97)",   "COLORS.overlay.headerBg"],
  ["rgba(0, 0, 0, 0.97)","COLORS.overlay.headerBg"],

  ["rgba(255,255,255,0.04)",   "COLORS.overlay.white04"],
  ["rgba(255,255,255,0.07)",   "COLORS.overlay.white07"],
  ["rgba(255, 255, 255, 0.05)","COLORS.overlay.white05"],
  ["rgba(255,255,255,0.08)",   "COLORS.overlay.white08"],
  ["rgba(255, 255, 255, 0.08)","COLORS.overlay.white08"],
  ["rgba(255,255,255,0.1)",    "COLORS.overlay.white10"],
  ["rgba(255, 255, 255, 0.1)", "COLORS.overlay.white10"],
  ["rgba(255,255,255,0.12)",   "COLORS.overlay.white12"],
  ["rgba(255,255,255,0.15)",   "COLORS.overlay.progress"],
  ["rgba(255, 255, 255, 0.15)","COLORS.overlay.progress"],
  ["rgba(255,255,255,0.18)",   "COLORS.overlay.white18"],
  ["rgba(255,255,255,0.2)",    "COLORS.overlay.white20"],
  ["rgba(255, 255, 255, 0.2)", "COLORS.overlay.white20"],
  ["rgba(255,255,255,0.22)",   "COLORS.overlay.white22"],
  ["rgba(255,255,255,0.25)",   "COLORS.overlay.spinner"],
  ["rgba(255,255,255,0.4)",    "COLORS.overlay.white40"],
  ["rgba(255, 255, 255, 0.4)", "COLORS.overlay.white40"],
  ["rgba(255,255,255,0.5)",    "COLORS.overlay.white50"],
  ["rgba(255, 255, 255, 0.5)", "COLORS.overlay.white50"],
  ["rgba(255,255,255,0.55)",   "COLORS.overlay.white55"],
  ["rgba(255,255,255,0.6)",    "COLORS.overlay.white60"],
  ["rgba(255, 255, 255, 0.6)", "COLORS.overlay.white60"],
  ["rgba(255,255,255,0.65)",   "COLORS.overlay.white65"],
  ["rgba(255,255,255,0.75)",   "COLORS.overlay.brandTagline"],
  ["rgba(255, 255, 255, 0.7)", "COLORS.overlay.white70"],
  ["rgba(255,255,255,0.8)",    "COLORS.overlay.white80"],
  ["rgba(255, 255, 255, 0.8)", "COLORS.overlay.white80"],
  ["rgba(255, 255, 255, 0.9)", "COLORS.overlay.white90"],
  ["rgba(255,255,255,0.95)",   "COLORS.overlay.white95"],

  // Brand tints
  ["rgba(124,58,237,0.08)",    "COLORS.overlay.brandTint"],
  ["rgba(124,58,237,0.12)",    "COLORS.overlay.brandTint12"],
  ["rgba(124,58,237,0.25)",    "COLORS.overlay.brandTint25"],
  ["rgba(147,51,234,0.08)",    "COLORS.overlay.primaryTint08"],
  ["rgba(147,51,234,0.12)",    "COLORS.overlay.primaryTint12"],
  ["rgba(168,85,247,0.08)",    "COLORS.overlay.violetTint08"],
  ["rgba(168,85,247,0.1)",     "COLORS.overlay.violetTint10"],
  ["rgba(168,85,247,0.14)",    "COLORS.overlay.violetTint14"],
  ["rgba(168,85,247,0.2)",     "COLORS.overlay.violetTint20"],
  ["rgba(168,85,247,0.25)",    "COLORS.overlay.violetTint25"],
  ["rgba(168,85,247,0.3)",     "COLORS.overlay.violetTint30"],
  ["rgba(168,85,247,0.85)",    "COLORS.overlay.violetStrong"],
  ["rgba(192,38,211,0.3)",     "COLORS.overlay.fuchsiaTint"],
  ["rgba(236,72,153,0.08)",    "COLORS.overlay.pinkTint"],
  ["rgba(139, 92, 246, 0.1)",  "COLORS.overlay.violet4Tint10"],
  ["rgba(139, 92, 246, 0.3)",  "COLORS.overlay.violet4Tint30"],

  // Green tints
  ["rgba(34,197,94,0.15)",     "COLORS.overlay.greenTint15"],
  ["rgba(34,197,94,0.4)",      "COLORS.overlay.greenTint40"],
  ["rgba(22c55e,0.4)",         "COLORS.overlay.greenTint40"],
  ["rgba(52,211,153,0.15)",    "COLORS.overlay.emeraldTint"],
  ["rgba(110,231,183,0.15)",   "COLORS.overlay.emeraldLight15"],
  ["rgba(110,231,183,0.2)",    "COLORS.overlay.emeraldLight20"],
  ["rgba(110,231,183,0.3)",    "COLORS.overlay.emeraldLight30"],
  ["rgba(110,231,183,0.9)",    "COLORS.overlay.emeraldStrong"],

  // Red tints
  ["rgba(239,68,68,0.12)",     "COLORS.overlay.redTint12"],
  ["rgba(239,68,68,0.15)",     "COLORS.overlay.redTint15"],
  ["rgba(239,68,68,0.25)",     "COLORS.overlay.redTint25"],
  ["rgba(239, 68, 68, 0.1)",   "COLORS.overlay.redTint10"],
  ["rgba(239, 68, 68, 0.3)",   "COLORS.overlay.redTint30"],

  // Blue tints
  ["rgba(59,130,246,0.08)",    "COLORS.overlay.infoBg"],
  ["rgba(59,130,246,0.2)",     "COLORS.overlay.infoBorder"],
  ["rgba(59, 130, 246, 0.1)",  "COLORS.overlay.infoBg"],
  ["rgba(59, 130, 246, 0.3)",  "COLORS.overlay.infoBorderStrong"],
  ["rgba(16, 185, 129, 0.1)",  "COLORS.overlay.emeraldBg"],
  ["rgba(16, 185, 129, 0.3)",  "COLORS.overlay.emeraldBorder"],

  // Amber/yellow tints
  ["rgba(253,224,71,0.12)",    "COLORS.overlay.yellowTint12"],
  ["rgba(253,224,71,0.28)",    "COLORS.overlay.yellowTint28"],
  ["rgba(253,224,71,0.9)",     "COLORS.overlay.yellowStrong"],
  ["rgba(245, 158, 11, 0.1)",  "COLORS.overlay.amberBg"],
  ["rgba(245, 158, 11, 0.3)",  "COLORS.overlay.amberBorder"],

  // Misc
  ["rgba(82,82,82,0.2)",       "COLORS.overlay.neutral20"],
];

// ─── Walk directories ─────────────────────────────────────────────────────────
function walk(dir) {
  const entries = readdirSync(dir);
  const files = [];
  for (const e of entries) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) {
      if (e === 'node_modules' || e === 'build' || e === 'Pods') continue;
      files.push(...walk(full));
    } else if (extname(e) === '.tsx') {
      files.push(full);
    }
  }
  return files;
}

// ─── Process each file ────────────────────────────────────────────────────────
const BASE = new URL('..', import.meta.url).pathname;
const targets = walk(join(BASE, 'src'));

let totalReplacements = 0;
let filesChanged = 0;

for (const file of targets) {
  let src = readFileSync(file, 'utf8');
  const original = src;
  let replacements = 0;

  for (const [from, to] of COLOR_MAP) {
    while (src.includes(from)) {
      src = src.replaceAll(from, to);
      replacements++;
    }
  }

  if (src !== original) {
    writeFileSync(file, src, 'utf8');
    filesChanged++;
    totalReplacements += replacements;
    console.log(`✓ ${file.replace(BASE, '')} (${replacements} replacement${replacements === 1 ? '' : 's'})`);
  }
}

console.log(`\nDone: ${totalReplacements} replacements across ${filesChanged} files.`);
