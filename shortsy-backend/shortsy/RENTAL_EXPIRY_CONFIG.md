# Rental Expiry Configuration

## Overview
Rental expiry durations are now dynamically calculated based on content type. This allows different rental periods for different types of content.

## Current Configuration

The expiry durations are configured in `src/services/rental.service.ts`:

```typescript
const RENTAL_EXPIRY_HOURS: Record<string, number> = {
  'short-film': 24,      // 1 day
  'vertical-series': 72, // 3 days
};
```

## Content Types

- **Short Films** (`short-film`): 24 hours (1 day) rental period
- **Vertical Series** (`vertical-series`): 72 hours (3 days) rental period

## How It Works

1. When a user completes payment via `confirmRental()`:
   - The function fetches the content details using `getContentById()`
   - It reads the `content.type` field ('short-film' or 'vertical-series')
   - It looks up the corresponding expiry duration from `RENTAL_EXPIRY_HOURS`
   - The expiry timestamp is calculated as: `currentTime + (expiryHours * 60 * 60 * 1000)`

2. If a content type is not found in the configuration:
   - A default expiry of 48 hours is applied as a fallback

## Modifying Expiry Durations

To change rental expiry durations:

1. Open `shortsy-backend/shortsy/src/services/rental.service.ts`
2. Locate the `RENTAL_EXPIRY_HOURS` constant (around line 9)
3. Update the hours for the desired content type
4. Deploy the backend: `npm run deploy`

### Example: Change short-film to 2 days

```typescript
const RENTAL_EXPIRY_HOURS: Record<string, number> = {
  'short-film': 48,      // 2 days (changed from 24)
  'vertical-series': 72, // 3 days
};
```

## Adding New Content Types

To add expiry configuration for a new content type:

1. Add the content type to the `RENTAL_EXPIRY_HOURS` object:

```typescript
const RENTAL_EXPIRY_HOURS: Record<string, number> = {
  'short-film': 24,
  'vertical-series': 72,
  'documentary': 120,    // 5 days
};
```

2. Ensure the content type matches the `type` field in the ContentTable

## Testing

To test rental expiry:

1. Rent a short film and verify the expiry is 24 hours from rental time
2. Rent a vertical series and verify the expiry is 72 hours from rental time
3. Check the `expiresAt` field in the RentalsTable DynamoDB

## Technical Details

- **Location**: `shortsy-backend/shortsy/src/services/rental.service.ts`
- **Function**: `confirmRental()`
- **Content Service**: Uses `getContentById()` from `content.service.ts`
- **Storage**: Expiry timestamp is stored in RentalsTable as ISO 8601 string
- **Validation**: Frontend validates stream expiry before playback in `useAppState.ts`
