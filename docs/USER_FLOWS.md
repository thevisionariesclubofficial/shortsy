# INDIEPLAY - Complete User Flows

## 🚀 App Launch Flow

```
┌─────────────┐
│ App Starts  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Splash Screen   │ (2.5s animation)
└──────┬──────────┘
       │
       ├──── [First Time] ────▶ Onboarding (4 slides) ────▶ Login/Signup Choice
       │
       ├──── [Returning, Not Logged In] ────▶ Login Screen
       │
       └──── [Logged In] ────▶ Home Screen
```

## 📝 Authentication Flows

### New User Registration

```
Welcome Choice
    │
    ▼
Signup Screen
    │
    ├─── Enter Details (Name, Email, Password)
    ├─── Accept Terms
    ├─── [OR] Google Sign-Up
    │
    ▼
Account Created
    │
    ▼
Home Screen (Auto-login)
```

### Returning User Login

```
Login Screen
    │
    ├─── Email + Password
    ├─── [OR] Google Sign-In
    │
    ▼
Authenticated
    │
    ▼
Home Screen
```

### Forgot Password

```
Login Screen
    │
    └─── Click "Forgot Password"
         │
         ▼
    Forgot Password Screen
         │
         ├─── Enter Email
         │
         ▼
    Email Sent Confirmation
         │
         ▼
    Back to Login
```

## 🏠 Main Navigation Flow

```
Home ←→ Browse ←→ Profile
 │       │         │
 │       │         └─── My Rentals
 │       │         └─── Settings
 │       │         └─── Upgrade to Plus
 │       │
 │       └─── Filter by Type/Genre/Language
 │
 └─── Search
 └─── Content Detail
```

## 🎬 Content Discovery Flows

### Browse by Mood

```
Home Screen
    │
    ▼
Mood Discovery Section
    │
    ├─── 💔 5-min Heartbreak
    ├─── 🌙 Late Night
    ├─── 😱 Suspense
    ├─── ❤️ Heartwarming
    └─── etc.
         │
         ▼
    Filtered Content Grid
```

### Search Flow

```
Home Screen
    │
    └─── Click Search Icon
         │
         ▼
    Search Screen
         │
         ├─── [Empty State]
         │    ├─── Recent Searches
         │    ├─── Trending Searches
         │    └─── Popular This Week
         │
         └─── [With Query]
              └─── Search Results Grid
                   │
                   ▼
              Content Detail
```

### Browse & Filter

```
Browse Tab
    │
    ├─── Filter: All | Short Films | Vertical Series
    │
    ├─── [Optional] Advanced Filters
    │    ├─── Genre (Drama, Thriller, Romance, etc.)
    │    └─── Language (Hindi, English, Tamil, etc.)
    │
    ▼
Filtered Results
    │
    └─── Click Content Card
         │
         ▼
    Content Detail
```

## 💰 Rental & Payment Flow

### Complete Purchase Journey

```
Content Detail Screen
    │
    ├─── [If Already Rented] ──▶ Direct to Player
    │
    └─── [If Not Rented]
         │
         ▼
    Click "Rent & Watch" (₹29-149)
         │
         ▼
    Payment Page
         │
         ├─── Select Payment Method
         │    ├─── UPI (Enter UPI ID)
         │    ├─── Card (Enter Card Details)
         │    ├─── Wallet (Select Provider)
         │    └─── Net Banking (Select Bank)
         │
         ▼
    Click "Pay ₹XX"
         │
         ▼
    Payment Processing (2.5s animation)
         │
         ▼
    Payment Success Screen
         │
         ├─── Show Receipt
         ├─── Creator Revenue Message
         ├─── Access Duration Info
         │
         ├─── [Option 1] Watch Now ──▶ Player
         ├─── [Option 2] Download Receipt
         ├─── [Option 3] Share
         └─── [Option 4] Back to Home
```

### Quick Rental Flow

```
Home Screen Featured Content
    │
    └─── Click "Rent for ₹XX" (Hero CTA)
         │
         ▼
    Payment Page
         │
         └─── (Same as above)
```

## 🎥 Viewing Flow

### Watch Rented Content

```
My Rentals (Profile)
    │
    ├─── OR ───
    │         │
Home Screen   │
    │         │
    └─────────┘
         │
         ▼
    Click Rented Content
         │
         ▼
    Player (Full Screen)
         │
         ├─── Play/Pause
         ├─── Seek (Progress Bar)
         ├─── Volume Control
         ├─── [For Series] Episode List
         │
         └─── Back Arrow ──▶ Home
```

### Player Controls

```
Player Screen
    │
    ├─── Tap to Show/Hide Controls
    │
    ├─── Controls Auto-Hide (3s)
    │
    ├─── Top Bar:
    │    ├─── Back Button
    │    ├─── Content Title
    │    └─── More Options
    │
    ├─── Center: Play/Pause (Large)
    │
    └─── Bottom Bar:
         ├─── Progress Bar (Clickable)
         ├─── Time Display (Current/Total)
         ├─── Play/Pause
         ├─── Volume/Mute
         └─── Fullscreen
```

## 👤 Profile & Account Flows

### Profile Features

```
Profile Tab
    │
    ├─── User Info & Avatar
    │
    ├─── Statistics
    │    ├─── Total Rentals: X
    │    ├─── Amount Spent: ₹X
    │    └─── Favorites: X
    │
    ├─── INDIEPLAY Plus (Upgrade Prompt)
    │    └─── Click "Upgrade Now" ──▶ [Future: Subscription Flow]
    │
    ├─── My Favorites ──▶ [Future: Saved Content]
    │
    ├─── Watch History ──▶ [Future: Viewing History]
    │
    ├─── Settings ──▶ [Future: App Settings]
    │
    ├─── Logout ──▶ Login Screen
    │
    └─── My Rentals Section
         │
         └─── Grid of Rented Content
              │
              └─── Click ──▶ Player
```

## 🔄 State Transitions

### App State Machine

```
NOT_AUTHENTICATED
    │
    ├─── Login Success ──▶ AUTHENTICATED
    ├─── Signup Success ──▶ AUTHENTICATED
    └─── [Default] ──▶ LOGIN_SCREEN

AUTHENTICATED
    │
    ├─── HOME (Default)
    │    ├─── Click Content ──▶ DETAIL
    │    ├─── Click Search ──▶ SEARCH
    │    └─── Bottom Nav ──▶ BROWSE | PROFILE
    │
    ├─── DETAIL
    │    ├─── Click Rent ──▶ PAYMENT
    │    └─── Click Watch (Rented) ──▶ PLAYER
    │
    ├─── PAYMENT
    │    ├─── Success ──▶ PAYMENT_SUCCESS
    │    └─── Back ──▶ DETAIL
    │
    ├─── PAYMENT_SUCCESS
    │    ├─── Watch Now ──▶ PLAYER
    │    └─── Back to Home ──▶ HOME
    │
    └─── PLAYER
         └─── Back ──▶ HOME
```

## 📊 Content Types & Pricing

### Short Films
- Duration: 5-40 minutes
- Price: ₹29 - ₹99
- Access: 48 hours
- Format: Horizontal

### Vertical Series
- Duration: 1-3 min/episode
- Episodes: 5-20 per season
- Price: ₹49 - ₹149 per season
- Access: 7 days full season
- Format: 9:16 vertical

## 🎯 Key User Journeys

### Journey 1: First-Time User to First Watch

```
1. Install App
2. Splash Screen (2.5s)
3. Onboarding (4 slides)
4. Sign Up (Name, Email, Password)
5. Land on Home
6. Browse Featured Content
7. Click "The Last Train"
8. View Details & Synopsis
9. Click "Rent for ₹49"
10. Select UPI Payment
11. Enter UPI ID
12. Pay ₹49
13. Payment Success
14. Click "Watch Now"
15. Player Opens
16. Watch Film
17. Back to Home

Time: ~5 minutes (excluding watch time)
```

### Journey 2: Returning User - Quick Watch

```
1. Open App
2. Splash Screen (2.5s)
3. Auto-Login to Home
4. Go to Profile Tab
5. See "My Rentals"
6. Click Previously Rented Content
7. Player Opens Immediately
8. Continue Watching

Time: ~30 seconds
```

### Journey 3: Discovery to Rental

```
1. On Home Screen
2. Click Search Icon
3. Type "Thriller"
4. See Results
5. Click "Midnight Caller" Series
6. Read Details (12 episodes, ₹79)
7. Decide to Rent
8. Click "Rent & Watch"
9. Payment Page Opens
10. Select Card Payment
11. Enter Card Details
12. Pay ₹79
13. Success Screen
14. Watch Episode 1

Time: ~3 minutes
```

## 💡 Edge Cases & Error Handling

### Payment Failures
```
Payment Page
    │
    └─── Payment Error
         │
         ▼
    Error Message
         │
         ├─── Try Again ──▶ Payment Page
         └─── Change Method ──▶ Payment Method Selection
```

### Network Errors
```
Any Screen
    │
    └─── Network Error
         │
         ▼
    Error Screen
         │
         ├─── Retry ──▶ Reload Current Screen
         └─── Go Home ──▶ Home Screen
```

### Invalid Session
```
Expired Token
    │
    └─── Auto-Logout ──▶ Login Screen
         └─── Show Message: "Session expired, please login"
```

## 📱 Navigation Patterns

### Bottom Navigation (Always Visible)
- **Home**: Main feed, featured content
- **Browse**: Filters & discovery
- **Profile**: User account & rentals

### Hidden on These Screens:
- Player (full-screen)
- Content Detail (to maximize space)
- Payment screens (focused flow)
- Success screens (dedicated actions)
- Auth screens (not logged in)

### Back Navigation:
- Hardware/Software Back Button
- Top-left Back Arrow
- Gesture (swipe from left edge)

All follow: Current Screen → Previous Screen

## 🎨 Visual Flow Indicators

### Loading States
- Splash Screen: Animated logo
- Payment Processing: Spinner + "Processing..."
- Page Transitions: Smooth fade
- Content Loading: Skeleton cards

### Success States
- Payment Success: Green checkmark animation
- Login Success: Immediate transition
- Content Added: Toast notification

### Error States
- Payment Failed: Red alert
- Network Error: Full-screen error
- Form Validation: Inline error messages

---

**Document Version**: 1.0  
**Last Updated**: February 2026  
**Platform**: INDIEPLAY Mobile Web App
