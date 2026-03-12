# Test Content Seeding Scripts

Two separate Node.js scripts for seeding test content into the Shortsy backend database. These scripts are designed to create realistic test data with unique details while reusing sample videos and thumbnails.

## Scripts

### 1. `seed-short-films.js`
Creates short film content with unique titles, descriptions, and metadata.

**Usage:**
```bash
node scripts/seed-short-films.js <count>
```

**Examples:**
```bash
node scripts/seed-short-films.js 20    # Create 20 short films
node scripts/seed-short-films.js 50    # Create 50 short films
node scripts/seed-short-films.js 100   # Create 100 short films
```

**Generated Content includes:**
- Unique titles from a pool of 25 base titles (auto-numbered if reused)
- Duration: 12-59 minutes (randomized)
- Price: $19-99 (randomized)
- Random director, language, genre, mood
- Unique descriptions from a pool
- Shared sample video URL (for all films)
- Unique thumbnail URLs (using Picsum.photos)
- 15% marked as featured, ~14% as festival winners

### 2. `seed-vertical-series.js`
Creates vertical series content with unique titles, descriptions, and episode lists.

**Usage:**
```bash
node scripts/seed-vertical-series.js <count>
```

**Examples:**
```bash
node scripts/seed-vertical-series.js 20    # Create 20 vertical series
node scripts/seed-vertical-series.js 30    # Create 30 vertical series
node scripts/seed-vertical-series.js 50    # Create 50 vertical series
```

**Generated Content includes:**
- Unique titles from a pool of 25 base titles (auto-numbered if reused)
- Episode count: 6-13 episodes per series
- Price: $29-149 (randomized)
- Random director, language, genre, mood
- Unique descriptions from a pool
- Full episode list with:
  - Episode title (Episode 1, Episode 2, etc.)
  - Duration: 25-44 minutes per episode (randomized)
  - Unique thumbnail per episode
  - Shared sample video URL (for all episodes)
- Shared trailer URL
- 15% marked as featured, ~20% as festival winners

## Features

✅ **Dynamic Count**: Pass any number to create that many items
✅ **Unique Data**: Each item has unique title, description, thumbnails
✅ **Reusable Videos**: Sample videos are reused for performance
✅ **Realistic Distribution**: Featured and festival winner flags distributed realistically
✅ **Error Handling**: Failed uploads are reported without stopping the process
✅ **Rate Limiting**: 150ms delay between requests to avoid throttling
✅ **Clean Feedback**: Progress shown for each item with success/failure status

## Sample Video Source

Both scripts use Google's Big Buck Bunny as the sample video:
```
https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4
```

This URL is reused for all trailer and main content/episode videos to optimize database size while testing.

## Thumbnail Source

Thumbnails are dynamically generated using Picsum.photos:
```
https://picsum.photos/400/800?random=<unique-id>
```

This ensures each content item has a unique, randomized placeholder image while keeping the source scalable.

## Data Pools

### Titles
- Short Films: 25 unique titles
- Vertical Series: 25 unique titles

### Directors
10 unique names ensuring variety across content

### Languages
8 languages: Hindi, English, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi

### Genres
8 genres: Drama, Romance, Comedy, Thriller, Action, Crime, Fantasy, Documentary

### Moods
8 moods: Emotional, Thrilling, Romantic, Funny, Dark, Inspiring, Mysterious, Surreal

### Descriptions
14+ unique descriptions for each type ensuring realistic content

## Complete Test Data Example

### Creating a Full Test Database

To create a complete test database from scratch:

```bash
# First, delete existing content from your backend

# Then create test content:
node scripts/seed-short-films.js 40      # Create 40 short films
node scripts/seed-vertical-series.js 20  # Create 20 vertical series

# Total: 40 short films + 20 vertical series = 60 content items
```

### Expected Output

```
🔐 Authenticating...
✓ Authentication successful

======================================================================
🎬 CREATING 40 SHORT FILMS
======================================================================

✓    1 / 40 - "The Last Letter"
✓    2 / 40 - "Midnight Confession"
✓    3 / 40 - "Lost in Translation"
...
✓   40 / 40 - "Breaking Point"

======================================================================
✓ Successfully created: 40 short films
======================================================================
```

## Environment

Both scripts use hardcoded credentials:
- Email: `adarsh@gmail.com`
- Password: `Ad@rsh15101996`
- API Base URL: `https://2tngsao13b.execute-api.ap-south-1.amazonaws.com/v1`

## Dependencies

- Node.js 14+
- `axios` (already in package.json)

## Troubleshooting

### "Invalid count. Usage: node seed-short-films.js <count>"
Make sure to provide a numeric count greater than 0.

### "Authentication failed"
Check that your credentials are correct and the backend API is accessible.

### "Failed: videoUrl is not allowed for vertical-series"
This shouldn't happen with the provided scripts. Make sure you're using the latest version.

### Slow uploads
The scripts intentionally add a 150ms delay between requests to avoid rate limiting. This is normal.

## Notes

- Scripts can be run multiple times to add more content
- Titles will be auto-numbered if a count exceeds the base title pool
- All content is marked with realistic metadata (prices, ratings, genres, etc.)
- Featured and festival winner flags are distributed across content
- Episode lists are included for vertical series with full metadata per episode
