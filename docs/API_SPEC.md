# Shortsy — API Specification

> **Version:** 1.0.0  
> **Base URL:** `https://api.shortsy.app/v1`  
> **Auth:** Bearer token (JWT) in `Authorization` header  
> **Content-Type:** `application/json`

---

## Table of Contents

1. [Data Models / Interfaces](#1-data-models--interfaces)
2. [Authentication APIs](#2-authentication-apis)
3. [Content APIs](#3-content-apis)
4. [Rental & Payment APIs](#4-rental--payment-apis)
5. [Playback APIs](#5-playback-apis)
6. [Discovery APIs](#6-discovery-apis)
7. [User Profile APIs](#7-user-profile-apis)
8. [Navigation State Contract](#8-navigation-state-contract)
9. [Error Schema](#9-error-schema)

---

## 1. Data Models / Interfaces

### 1.1 `ContentType`
```typescript
type ContentType = 'short-film' | 'vertical-series';
```

### 1.2 `Episode`
```typescript
interface Episode {
  id: string;           // "2-1"
  title: string;        // "The First Call"
  duration: string;     // "2:05" (mm:ss display string)
  thumbnail: string;    // CDN URL
  videoUrl: string;     // Signed streaming URL
}
```

### 1.3 `Content`
```typescript
interface Content {
  id: string;                  // Unique identifier, e.g. "1"
  title: string;
  type: ContentType;
  thumbnail: string;           // CDN image URL (landscape for short-films, portrait for vertical-series)
  duration: string;            // "18 min" | "2 min/ep"
  price: number;               // INR rental price, e.g. 49
  director: string;
  language: string;            // "Hindi" | "English" | "Tamil" | "No Dialogue" ...
  genre: string;               // "Drama" | "Thriller" | "Romance" ...
  mood: string;                // "Emotional" | "Suspense" | "Late Night" ...
  rating: number;              // 1.0 – 5.0
  views: number;               // Total view count
  description: string;
  trailer?: string;            // Muted preview URL (auto-plays on ContentDetail)
  videoUrl?: string;           // Full film URL (short-films only)
  episodes?: number;           // Episode count (vertical-series only)
  episodeList?: Episode[];     // Full episode array (vertical-series only)
  featured?: boolean;          // Appears in Hero / Featured row
  festivalWinner?: boolean;    // Shows "Festival Winner" badge
}
```

### 1.4 `Mood`
```typescript
interface Mood {
  id: string;
  name: string;    // "5-min Heartbreak"
  emoji: string;   // "💔"
}
```

### 1.5 `AppScreen` (Client Navigation State)
```typescript
type AppScreen =
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
```

### 1.6 `RentalRecord`
```typescript
interface RentalRecord {
  contentId: string;
  userId: string;
  rentedAt: string;      // ISO 8601
  expiresAt: string;     // ISO 8601 (typically 48h from rentedAt)
  amountPaid: number;    // INR
  transactionId: string;
}
```

### 1.7 `User`
```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;     // ISO 8601
}
```

### 1.8 `AuthTokens`
```typescript
interface AuthTokens {
  accessToken: string;   // JWT, short-lived (15 min)
  refreshToken: string;  // Long-lived (30 days)
  expiresIn: number;     // seconds
}
```

---

## 2. Authentication APIs

### 2.1 Sign Up

```
POST /auth/signup
```

**Request**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "displayName": "Adarsh Chaudhary"
}
```

**Response `201 Created`**
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "displayName": "Adarsh Chaudhary",
    "avatarUrl": null,
    "createdAt": "2026-02-19T10:00:00Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
    "expiresIn": 900
  }
}
```

**Errors**
| Status | Code | Description |
|--------|------|-------------|
| 409 | `EMAIL_ALREADY_EXISTS` | Email is already registered |
| 422 | `VALIDATION_ERROR` | Password too weak / invalid email |

---

### 2.2 Log In

```
POST /auth/login
```

**Request**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response `200 OK`**
```json
{
  "user": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "displayName": "Adarsh Chaudhary",
    "avatarUrl": "https://cdn.shortsy.app/avatars/usr_abc123.jpg",
    "createdAt": "2026-01-15T08:30:00Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
    "expiresIn": 900
  }
}
```

**Errors**
| Status | Code | Description |
|--------|------|-------------|
| 401 | `INVALID_CREDENTIALS` | Wrong email or password |
| 429 | `RATE_LIMITED` | Too many login attempts |

---

### 2.3 Forgot Password

```
POST /auth/forgot-password
```

**Request**
```json
{
  "email": "user@example.com"
}
```

**Response `200 OK`**
```json
{
  "message": "Password reset link sent to user@example.com"
}
```

> Always returns 200 to prevent email enumeration.

---

### 2.4 Refresh Token

```
POST /auth/refresh
```

**Request**
```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

**Response `200 OK`**
```json
{
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "bmV3UmVmcmVzaFRva2Vu...",
    "expiresIn": 900
  }
}
```

**Errors**
| Status | Code | Description |
|--------|------|-------------|
| 401 | `TOKEN_EXPIRED` | Refresh token expired |
| 401 | `TOKEN_INVALID` | Malformed or tampered token |

---

### 2.5 Log Out

```
POST /auth/logout
Authorization: Bearer <accessToken>
```

**Request**
```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
}
```

**Response `204 No Content`**

---

## 3. Content APIs

### 3.1 List All Content (Home Feed)

```
GET /content
Authorization: Bearer <accessToken>
```

**Query Parameters**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | `short-film \| vertical-series` | — | Filter by content type |
| `genre` | `string` | — | Filter by genre |
| `language` | `string` | — | Filter by language |
| `mood` | `string` | — | Filter by mood |
| `featured` | `boolean` | — | Only featured content |
| `festivalWinner` | `boolean` | — | Only festival winners |
| `page` | `number` | `1` | Pagination page |
| `limit` | `number` | `20` | Items per page |

**Response `200 OK`**
```json
{
  "data": [
    {
      "id": "1",
      "title": "The Last Train",
      "type": "short-film",
      "thumbnail": "https://cdn.shortsy.app/thumbnails/1.jpg",
      "duration": "18 min",
      "price": 49,
      "director": "Arjun Mehta",
      "language": "Hindi",
      "genre": "Drama",
      "mood": "Emotional",
      "rating": 4.7,
      "views": 12500,
      "description": "A touching story about missed connections and second chances on Mumbai's last local train.",
      "trailer": "https://cdn.shortsy.app/trailers/1.mp4",
      "videoUrl": null,
      "featured": true,
      "festivalWinner": true,
      "episodes": null,
      "episodeList": null
    },
    {
      "id": "2",
      "title": "Midnight Caller",
      "type": "vertical-series",
      "thumbnail": "https://cdn.shortsy.app/thumbnails/2.jpg",
      "duration": "2 min/ep",
      "price": 79,
      "director": "Priya Sharma",
      "language": "English",
      "genre": "Thriller",
      "mood": "Suspense",
      "rating": 4.8,
      "views": 25000,
      "description": "A psychological thriller series shot entirely in vertical format. 12 episodes of pure adrenaline.",
      "trailer": "https://cdn.shortsy.app/trailers/2.mp4",
      "videoUrl": null,
      "featured": true,
      "festivalWinner": false,
      "episodes": 12,
      "episodeList": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "totalPages": 1
  }
}
```

---

### 3.2 Get Content Detail

```
GET /content/:id
Authorization: Bearer <accessToken>
```

**Path Parameters**
| Param | Type | Description |
|-------|------|-------------|
| `id` | `string` | Content ID |

**Response `200 OK` — Short Film**
```json
{
  "id": "1",
  "title": "The Last Train",
  "type": "short-film",
  "thumbnail": "https://cdn.shortsy.app/thumbnails/1.jpg",
  "duration": "18 min",
  "price": 49,
  "director": "Arjun Mehta",
  "language": "Hindi",
  "genre": "Drama",
  "mood": "Emotional",
  "rating": 4.7,
  "views": 12500,
  "description": "A touching story about missed connections and second chances on Mumbai's last local train.",
  "trailer": "https://cdn.shortsy.app/trailers/1.mp4",
  "videoUrl": null,
  "featured": true,
  "festivalWinner": true,
  "episodes": null,
  "episodeList": null
}
```

**Response `200 OK` — Vertical Series** (includes full `episodeList`)
```json
{
  "id": "2",
  "title": "Midnight Caller",
  "type": "vertical-series",
  "thumbnail": "https://cdn.shortsy.app/thumbnails/2.jpg",
  "duration": "2 min/ep",
  "price": 79,
  "director": "Priya Sharma",
  "language": "English",
  "genre": "Thriller",
  "mood": "Suspense",
  "rating": 4.8,
  "views": 25000,
  "description": "A psychological thriller series shot entirely in vertical format. 12 episodes of pure adrenaline.",
  "trailer": "https://cdn.shortsy.app/trailers/2.mp4",
  "videoUrl": null,
  "featured": true,
  "festivalWinner": false,
  "episodes": 12,
  "episodeList": [
    {
      "id": "2-1",
      "title": "The First Call",
      "duration": "2:05",
      "thumbnail": "https://cdn.shortsy.app/thumbnails/2-1.jpg",
      "videoUrl": null
    },
    {
      "id": "2-2",
      "title": "Unknown Number",
      "duration": "1:58",
      "thumbnail": "https://cdn.shortsy.app/thumbnails/2-2.jpg",
      "videoUrl": null
    }
  ]
}
```

> `videoUrl` on episodes is `null` until a valid rental is confirmed. Use `GET /content/:id/stream` to get signed URLs.

**Errors**
| Status | Code | Description |
|--------|------|-------------|
| 404 | `CONTENT_NOT_FOUND` | Content ID does not exist |

---

### 3.3 Search Content

```
GET /content/search
Authorization: Bearer <accessToken>
```

**Query Parameters**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `q` | `string` | ✅ | Search query (title, director, genre) |
| `type` | `string` | — | Filter by content type |
| `limit` | `number` | — | Default 20 |

**Request Example**
```
GET /content/search?q=midnight&type=vertical-series
```

**Response `200 OK`**
```json
{
  "query": "midnight",
  "data": [
    {
      "id": "2",
      "title": "Midnight Caller",
      "type": "vertical-series",
      "thumbnail": "https://cdn.shortsy.app/thumbnails/2.jpg",
      "duration": "2 min/ep",
      "price": 79,
      "genre": "Thriller",
      "rating": 4.8,
      "views": 25000
    }
  ],
  "total": 1
}
```

---

### 3.4 Get Featured Content

```
GET /content/featured
Authorization: Bearer <accessToken>
```

**Response `200 OK`**
```json
{
  "hero": {
    "id": "1",
    "title": "The Last Train",
    "type": "short-film",
    "thumbnail": "https://cdn.shortsy.app/thumbnails/1.jpg",
    "videoUrl": "https://cdn.shortsy.app/hero/1_hero.mp4",
    "genre": "Drama",
    "rating": 4.7,
    "description": "A touching story about missed connections..."
  },
  "featured": [
    { "id": "1", "title": "The Last Train", "type": "short-film", "thumbnail": "...", "price": 49 },
    { "id": "2", "title": "Midnight Caller", "type": "vertical-series", "thumbnail": "...", "price": 79 },
    { "id": "7", "title": "First Love", "type": "vertical-series", "thumbnail": "...", "price": 69 }
  ]
}
```

---

### 3.5 Get Discovery Metadata

```
GET /content/metadata
Authorization: Bearer <accessToken>
```

**Response `200 OK`**
```json
{
  "moods": [
    { "id": "1", "name": "5-min Heartbreak", "emoji": "💔" },
    { "id": "2", "name": "Late Night",        "emoji": "🌙" },
    { "id": "3", "name": "Suspense",          "emoji": "😱" },
    { "id": "4", "name": "Heartwarming",      "emoji": "❤️" },
    { "id": "5", "name": "Emotional",         "emoji": "😢" },
    { "id": "6", "name": "Artistic",          "emoji": "🎨" },
    { "id": "7", "name": "Inspiring",         "emoji": "✨" }
  ],
  "genres": [
    "All", "Drama", "Thriller", "Romance",
    "Comedy", "Documentary", "Experimental", "Family"
  ],
  "languages": [
    "All", "Hindi", "English", "Tamil",
    "Telugu", "Bengali", "Malayalam", "Kannada", "No Dialogue"
  ]
}
```

---

## 4. Rental & Payment APIs

### 4.1 Initiate Rental / Create Payment Order

```
POST /rentals/initiate
Authorization: Bearer <accessToken>
```

**Request**
```json
{
  "contentId": "1"
}
```

**Response `200 OK`**
```json
{
  "orderId": "ord_xyz789",
  "contentId": "1",
  "contentTitle": "The Last Train",
  "amountINR": 49,
  "currency": "INR",
  "gatewayOrderId": "rzp_order_ABC123",
  "gatewayKey": "rzp_live_XXXXXXXXXX",
  "expiresAt": "2026-02-19T10:15:00Z"
}
```

> The client passes `gatewayOrderId` + `gatewayKey` directly to the Razorpay/Stripe SDK to complete payment.

**Errors**
| Status | Code | Description |
|--------|------|-------------|
| 409 | `ALREADY_RENTED` | User already has an active rental |
| 404 | `CONTENT_NOT_FOUND` | Content ID does not exist |

---

### 4.2 Confirm Payment

```
POST /rentals/confirm
Authorization: Bearer <accessToken>
```

**Request**
```json
{
  "orderId": "ord_xyz789",
  "gatewayPaymentId": "rzp_pay_DEF456",
  "gatewaySignature": "hmac_sha256_signature_from_gateway"
}
```

**Response `201 Created`**
```json
{
  "rental": {
    "contentId": "1",
    "userId": "usr_abc123",
    "rentedAt": "2026-02-19T10:05:00Z",
    "expiresAt": "2026-02-21T10:05:00Z",
    "amountPaid": 49,
    "transactionId": "txn_GHI789"
  },
  "message": "Rental confirmed. Enjoy watching!"
}
```

**Errors**
| Status | Code | Description |
|--------|------|-------------|
| 402 | `PAYMENT_FAILED` | Gateway verification failed |
| 400 | `INVALID_SIGNATURE` | HMAC signature mismatch |

---

### 4.3 Get User Rentals (Continue Watching)

```
GET /rentals
Authorization: Bearer <accessToken>
```

**Query Parameters**
| Param | Type | Description |
|-------|------|-------------|
| `active` | `boolean` | Only return non-expired rentals |

**Response `200 OK`**
```json
{
  "rentals": [
    {
      "contentId": "1",
      "userId": "usr_abc123",
      "rentedAt": "2026-02-19T10:05:00Z",
      "expiresAt": "2026-02-21T10:05:00Z",
      "amountPaid": 49,
      "transactionId": "txn_GHI789",
      "content": {
        "id": "1",
        "title": "The Last Train",
        "type": "short-film",
        "thumbnail": "https://cdn.shortsy.app/thumbnails/1.jpg",
        "duration": "18 min",
        "genre": "Drama"
      }
    }
  ]
}
```

---

### 4.4 Check Rental Status

```
GET /rentals/:contentId
Authorization: Bearer <accessToken>
```

**Response `200 OK` — Active Rental**
```json
{
  "isRented": true,
  "rental": {
    "contentId": "1",
    "rentedAt": "2026-02-19T10:05:00Z",
    "expiresAt": "2026-02-21T10:05:00Z",
    "transactionId": "txn_GHI789"
  }
}
```

**Response `200 OK` — Not Rented / Expired**
```json
{
  "isRented": false,
  "rental": null
}
```

---

## 5. Playback APIs

### 5.1 Get Streaming URL — Short Film

```
GET /content/:id/stream
Authorization: Bearer <accessToken>
```

> Requires an active rental for the requesting user.

**Response `200 OK`**
```json
{
  "contentId": "1",
  "type": "short-film",
  "streamUrl": "https://cdn.shortsy.app/signed/1/film.mp4?token=ABC&expires=1740000000",
  "trailerUrl": "https://cdn.shortsy.app/trailers/1.mp4",
  "expiresAt": "2026-02-19T11:05:00Z"
}
```

**Errors**
| Status | Code | Description |
|--------|------|-------------|
| 403 | `NOT_RENTED` | No active rental found |
| 403 | `RENTAL_EXPIRED` | Rental window has passed |

---

### 5.2 Get Streaming URL — Vertical Series Episode

```
GET /content/:id/episodes/:episodeId/stream
Authorization: Bearer <accessToken>
```

> Requires an active rental for the series.

**Response `200 OK`**
```json
{
  "contentId": "2",
  "episodeId": "2-1",
  "episodeNumber": 1,
  "episodeTitle": "The First Call",
  "streamUrl": "https://cdn.shortsy.app/signed/2/ep1.mp4?token=XYZ&expires=1740000000",
  "nextEpisode": {
    "episodeId": "2-2",
    "episodeNumber": 2,
    "title": "Unknown Number"
  },
  "expiresAt": "2026-02-19T11:05:00Z"
}
```

**Errors**
| Status | Code | Description |
|--------|------|-------------|
| 403 | `NOT_RENTED` | No active rental found |
| 404 | `EPISODE_NOT_FOUND` | Episode ID does not belong to content ID |

---

### 5.3 Save Watch Progress

```
POST /content/:id/progress
Authorization: Bearer <accessToken>
```

**Request — Short Film**
```json
{
  "currentTime": 645,
  "duration": 1080,
  "completed": false
}
```

**Request — Vertical Series Episode**
```json
{
  "episodeId": "2-3",
  "episodeNumber": 3,
  "currentTime": 87,
  "duration": 132,
  "completed": true
}
```

**Response `200 OK`**
```json
{
  "saved": true,
  "progressPercent": 65.9
}
```

---

### 5.4 Get Watch Progress

```
GET /content/:id/progress
Authorization: Bearer <accessToken>
```

**Response `200 OK` — Short Film**
```json
{
  "contentId": "1",
  "type": "short-film",
  "currentTime": 645,
  "duration": 1080,
  "progressPercent": 59.7,
  "completed": false,
  "lastWatchedAt": "2026-02-19T10:15:00Z"
}
```

**Response `200 OK` — Vertical Series**
```json
{
  "contentId": "2",
  "type": "vertical-series",
  "lastEpisodeId": "2-3",
  "lastEpisodeNumber": 3,
  "currentTime": 87,
  "duration": 132,
  "progressPercent": 65.9,
  "completedEpisodes": ["2-1", "2-2"],
  "lastWatchedAt": "2026-02-19T10:20:00Z"
}
```

---

## 6. Discovery APIs

### 6.1 Browse by Mood

```
GET /content?mood=Suspense
Authorization: Bearer <accessToken>
```

**Response `200 OK`**
```json
{
  "mood": "Suspense",
  "data": [
    {
      "id": "2",
      "title": "Midnight Caller",
      "type": "vertical-series",
      "thumbnail": "https://cdn.shortsy.app/thumbnails/2.jpg",
      "duration": "2 min/ep",
      "price": 79,
      "rating": 4.8
    }
  ],
  "total": 1
}
```

---

### 6.2 Browse by Genre

```
GET /content?genre=Drama
Authorization: Bearer <accessToken>
```

**Response `200 OK`**
```json
{
  "genre": "Drama",
  "data": [
    {
      "id": "1",
      "title": "The Last Train",
      "type": "short-film",
      "thumbnail": "https://cdn.shortsy.app/thumbnails/1.jpg",
      "duration": "18 min",
      "price": 49,
      "rating": 4.7,
      "festivalWinner": true
    },
    {
      "id": "5",
      "title": "The Confession",
      "type": "short-film",
      "thumbnail": "https://cdn.shortsy.app/thumbnails/5.jpg",
      "duration": "12 min",
      "price": 29,
      "rating": 4.6,
      "festivalWinner": false
    }
  ],
  "total": 2
}
```

---

### 6.3 Browse by Language

```
GET /content?language=Hindi
Authorization: Bearer <accessToken>
```

**Response `200 OK`**
```json
{
  "language": "Hindi",
  "data": [
    { "id": "1", "title": "The Last Train",  "type": "short-film",     "price": 49, "rating": 4.7 },
    { "id": "5", "title": "The Confession",  "type": "short-film",     "price": 29, "rating": 4.6 },
    { "id": "7", "title": "First Love",      "type": "vertical-series", "price": 69, "rating": 4.9 }
  ],
  "total": 3
}
```

---

## 7. User Profile APIs

### 7.1 Get Current User

```
GET /users/me
Authorization: Bearer <accessToken>
```

**Response `200 OK`**
```json
{
  "id": "usr_abc123",
  "email": "user@example.com",
  "displayName": "Adarsh Chaudhary",
  "avatarUrl": "https://cdn.shortsy.app/avatars/usr_abc123.jpg",
  "createdAt": "2026-01-15T08:30:00Z",
  "stats": {
    "totalRentals": 3,
    "totalWatchTimeMinutes": 74,
    "favouriteGenre": "Drama"
  }
}
```

---

### 7.2 Update Profile

```
PATCH /users/me
Authorization: Bearer <accessToken>
```

**Request**
```json
{
  "displayName": "Adarsh C.",
  "avatarUrl": "https://cdn.shortsy.app/avatars/new.jpg"
}
```

**Response `200 OK`**
```json
{
  "id": "usr_abc123",
  "email": "user@example.com",
  "displayName": "Adarsh C.",
  "avatarUrl": "https://cdn.shortsy.app/avatars/new.jpg",
  "createdAt": "2026-01-15T08:30:00Z"
}
```

---

### 7.3 Delete Account

```
DELETE /users/me
Authorization: Bearer <accessToken>
```

**Request**
```json
{
  "password": "SecurePass123!"
}
```

**Response `204 No Content`**

---

## 8. Navigation State Contract

The client manages screen routing purely client-side via the `AppScreen` discriminated union. Below are the resolution rules implemented in `navigationService.ts`:

### 8.1 Post-Splash Resolution

```
resolvePostSplashScreen(isAuthenticated, hasSeenOnboarding) → AppScreen
```

| `isAuthenticated` | `hasSeenOnboarding` | Result |
|---|---|---|
| `true` | any | `{ type: 'home' }` |
| `false` | `false` | `{ type: 'onboarding' }` |
| `false` | `true` | `{ type: 'login' }` |

---

### 8.2 Content Tap Resolution

```
resolveContentScreen(content, isRented) → AppScreen
```

| `content.type` | `isRented` | Result |
|---|---|---|
| `vertical-series` | any | `{ type: 'detail', content }` |
| `short-film` | `true` | `{ type: 'player', content, videoUrl: content.videoUrl }` |
| `short-film` | `false` | `{ type: 'detail', content }` |

---

### 8.3 Continue Watching Tap Resolution

```
resolveRentedContentScreen(content) → AppScreen
```

| `content.type` | Result |
|---|---|
| `vertical-series` | `{ type: 'detail', content }` (user picks episode) |
| `short-film` | `{ type: 'player', content, videoUrl: content.videoUrl }` |

---

### 8.4 Episode Play

```
buildEpisodePlayerScreen(ep, content, episodeNumber) → AppScreen
```

Always returns:
```json
{
  "type": "player",
  "content": { "...": "Content object" },
  "videoUrl": "https://cdn.shortsy.app/signed/ep.mp4",
  "episodeNumber": 3
}
```

---

### 8.5 Screen Auth & Nav Rules

| Screen | Requires Auth | Shows Bottom Nav |
|--------|--------------|-----------------|
| `splash` | ❌ | ❌ |
| `onboarding` | ❌ | ❌ |
| `welcome` | ❌ | ❌ |
| `login` | ❌ | ❌ |
| `signup` | ❌ | ❌ |
| `forgotPassword` | ❌ | ❌ |
| `home` | ✅ | ✅ |
| `browse` | ✅ | ✅ |
| `profile` | ✅ | ✅ |
| `search` | ✅ | ❌ |
| `detail` | ✅ | ❌ |
| `payment` | ✅ | ❌ |
| `paymentSuccess` | ✅ | ❌ |
| `player` | ✅ | ❌ |

---

## 9. Error Schema

All errors follow a consistent envelope:

```json
{
  "error": {
    "code": "CONTENT_NOT_FOUND",
    "message": "No content found with id '99'",
    "status": 404,
    "timestamp": "2026-02-19T10:05:00Z",
    "requestId": "req_JKL012"
  }
}
```

### Standard Error Codes

| HTTP Status | Code | Meaning |
|-------------|------|---------|
| 400 | `VALIDATION_ERROR` | Request body / params failed validation |
| 400 | `INVALID_SIGNATURE` | Payment signature mismatch |
| 401 | `UNAUTHORIZED` | Missing or invalid access token |
| 401 | `INVALID_CREDENTIALS` | Wrong email/password |
| 401 | `TOKEN_EXPIRED` | Token has expired |
| 401 | `TOKEN_INVALID` | Token is malformed or tampered |
| 402 | `PAYMENT_FAILED` | Payment gateway returned failure |
| 403 | `FORBIDDEN` | Token valid but action not permitted |
| 403 | `NOT_RENTED` | No active rental for this content |
| 403 | `RENTAL_EXPIRED` | Rental window has passed |
| 404 | `CONTENT_NOT_FOUND` | Content ID does not exist |
| 404 | `EPISODE_NOT_FOUND` | Episode ID not found |
| 409 | `EMAIL_ALREADY_EXISTS` | Email already registered |
| 409 | `ALREADY_RENTED` | Duplicate rental attempt |
| 422 | `UNPROCESSABLE` | Business rule violation |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

*Generated: February 19, 2026 — Shortsy v1.0.0*
