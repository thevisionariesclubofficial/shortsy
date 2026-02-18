<div align="center">
  <img src="src/assets/logo.png" alt="Shortsy Logo" width="160"/>

  # Shortsy
  ### Short Films & Vertical Series — Creator-Owned Cinema

  ![React Native](https://img.shields.io/badge/React%20Native-0.84.0-61dafb?style=flat-square&logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript)
  ![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey?style=flat-square)
  ![Status](https://img.shields.io/badge/Status-MVP%20Complete-brightgreen?style=flat-square)
</div>

---

## Overview

**Shortsy** is a mobile OTT platform for indie short films and vertical series, built on a **pay-per-story** model. Creators keep 70% of revenue. Content is rented per title (₹29–₹149) — no subscription required.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.84.0 |
| Language | TypeScript 5.8 |
| UI | Pure-View components — no icon libraries |
| Gradients | `react-native-linear-gradient` |
| Safe Area | `react-native-safe-area-context` |
| Navigation | Custom `useState` discriminated-union state machine |
| Animations | React Native `Animated` API (`useNativeDriver: true`) |
| Build | Metro bundler |

---

## Project Structure

```
src/
├── app/
│   └── App.tsx                  # Root state machine & navigation
├── assets/
│   └── logo.png                 # App logo (splash screen + launcher icon)
├── components/
│   ├── BottomNav.tsx            # Persistent bottom tab bar (Home/Browse/Profile)
│   ├── ContentCard.tsx          # Reusable content thumbnail card
│   ├── MoodCard.tsx             # Mood discovery pill card
│   └── RentalModal.tsx          # Quick-rent bottom sheet
├── data/
│   └── mockData.ts              # 8 content items + mood/genre/language lists
└── screens/
    ├── SplashScreen.tsx         # Animated splash with real logo
    ├── OnboardingScreen.tsx     # 4-slide swipeable intro
    ├── WelcomeChoice.tsx        # Login / Sign up choice screen
    ├── LoginScreen.tsx          # Email + social login
    ├── SignupScreen.tsx         # Registration with validation
    ├── ForgotPasswordScreen.tsx # Password reset flow
    ├── HomePage.tsx             # Featured hero, moods, curated rows
    ├── SearchScreen.tsx         # Live search + trending + recent history
    ├── BrowsePage.tsx           # Filter by content type / genre / language
    ├── ProfilePage.tsx          # Stats, My Rentals grid, settings
    ├── ContentDetailScreen.tsx  # Synopsis, festival badge, rent/watch CTA
    ├── PaymentScreen.tsx        # UPI / Card / Wallet / Net Banking
    ├── PaymentSuccessScreen.tsx # Receipt + Watch Now / Go Home
    ├── PlayerScreen.tsx         # Full-screen video player with controls
    ├── LoadingScreen.tsx        # Generic loading state (bouncing dots)
    └── ErrorScreen.tsx          # Error state with retry / go home
```

---

## Screens (16 total)

### Pre-Auth (6)
| Screen | Notes |
|---|---|
| Splash | Logo bounce + pulsing blobs, auto-advances after 5.5 s |
| Onboarding | 4-slide horizontal pager — shown to first-time users only |
| Welcome Choice | Login / Signup selector |
| Login | Email + password + Google sign-in, forgot password link |
| Signup | Name / email / password with validation + terms acceptance |
| Forgot Password | Email-based reset confirmation |

### Main App (4)
| Screen | Notes |
|---|---|
| Home | Featured hero card, mood discovery carousel, curated content rows |
| Search | Real-time filter across title / director / genre / language / mood; trending tags; search history |
| Browse | Content type, genre and language filter chips; result count badge |
| Profile | Rental count / spend stats, INDIEPLAY Plus upsell, My Rentals grid |

### Transaction (3)
| Screen | Notes |
|---|---|
| Content Detail | Full info, director, synopsis, festival winner badge, rent or watch CTA |
| Payment | 4 methods: UPI, Card, Wallet, Net Banking — 2.5 s mock processing animation |
| Payment Success | Order receipt, 70% creator revenue message, Watch Now + Go Home |

### Playback (1)
| Screen | Notes |
|---|---|
| Player | Full-screen, play/pause, seek bar, volume toggle, auto-hide controls after 3 s |

### Utility (2)
| Screen | Notes |
|---|---|
| Loading | Pulsing gradient film-icon + 3 staggered bouncing dots |
| Error | Configurable title / message, optional retry + go-home action buttons |

---

## Navigation

`App.tsx` uses a **discriminated union `AppState`** — no React Navigation dependency.

```
Splash
  ├── [authenticated]     → Home
  ├── [seen onboarding]   → Login
  └── [first time]        → Onboarding → WelcomeChoice → Login / Signup
                                                              ↓
Home / Browse / Profile  ←────────────────────── handleLogin / handleSignup
  │  (BottomNav visible)
  └── Content click
        ├── [already rented] → Player
        └── [not rented]     → ContentDetail → Payment → PaymentSuccess → Player

Search / ContentDetail / Player
  └── Back → Home

Profile → Logout → Login  (clears isAuthenticated)
```

### BottomNav visibility rules

| Screen | BottomNav shown? |
|---|---|
| Home / Browse / Profile | ✅ |
| Search / ContentDetail / Payment / PaymentSuccess / Player | ❌ |

---

## Getting Started

### Prerequisites

- Node.js ≥ 22.11.0
- Xcode (iOS)
- Android Studio + JDK 17 (Android)
- CocoaPods (`gem install cocoapods`)

### Install dependencies

```sh
git clone <repo-url>
cd shortsy
npm install
```

### Run on iOS

```sh
bundle install            # first time only
bundle exec pod install   # after any native dep change
npm run ios
```

### Run on Android

```sh
npm run android
```

### Start Metro only

```sh
npm start
```

---

## Release Build (Android)

A signed release keystore (`shortsy-release.keystore`) is pre-configured in `android/app/build.gradle`.

```sh
# Signed APK — install directly on device
cd android && ./gradlew assembleRelease

# AAB bundle — upload to Google Play
cd android && ./gradlew bundleRelease
```

| Output | Path | Size |
|---|---|---|
| APK | `android/app/build/outputs/apk/release/app-release.apk` | ~46 MB |
| AAB | `android/app/build/outputs/bundle/release/app-release.aab` | — |

Install APK on a connected device:

```sh
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## App Icon

The Shortsy logo is embedded as the launcher icon across all Android mipmap densities:

| Density | Size |
|---|---|
| mdpi | 48 × 48 |
| hdpi | 72 × 72 |
| xhdpi | 96 × 96 |
| xxhdpi | 144 × 144 |
| xxxhdpi | 192 × 192 |

Both `ic_launcher.png` and `ic_launcher_round.png` are generated for each density.

---

## Mock Content Library

| Title | Type | Language | Price | Access |
|---|---|---|---|---|
| The Last Train | Short Film | Hindi | ₹49 | 48 hrs |
| Midnight Caller | Vertical Series | English | ₹79 | 7 days |
| Colors of Home | Short Film | Tamil | ₹99 | 48 hrs |
| City Lights | Vertical Series | Bengali | ₹49 | 7 days |
| The Confession | Short Film | Hindi | ₹29 | 48 hrs |
| Abstract Minds | Short Film | English | ₹39 | 48 hrs |
| First Love | Vertical Series | Hindi | ₹69 | 7 days |
| Behind the Lens | Documentary | Malayalam | ₹89 | 48 hrs |

---

## Payment Methods

1. **UPI** — enter any UPI ID (GPay, PhonePe, Paytm)
2. **Card** — card number, name, expiry, CVV
3. **Wallet** — Paytm, PhonePe, Mobikwik, Amazon Pay
4. **Net Banking** — HDFC, ICICI, SBI, Axis, Other

---

## Roadmap

### Phase 1 — Backend Integration
- [ ] Auth APIs (signup / login / JWT / logout)
- [ ] Content APIs with pagination & filters
- [ ] Razorpay / Stripe payment gateway
- [ ] Video CDN with HLS / DASH streaming
- [ ] `AsyncStorage` for `hasSeenOnboarding` persistence

### Phase 2 — Enhanced Features
- [ ] Real video playback
- [ ] Offline downloads
- [ ] Push notifications
- [ ] Watch history & favourites persistence
- [ ] Chromecast support

### Phase 3 — Creator Tools
- [ ] Creator dashboard & upload workflow
- [ ] Earnings & payout dashboard
- [ ] Per-title analytics

---

## Business Model

| Revenue stream | Split |
|---|---|
| Per-title rental (primary) | 70% creator / 30% platform |
| INDIEPLAY Plus (₹199/mo) | Platform |
| Brand integrations | Platform |

---

*Built with React Native · TypeScript · Creator-first*
