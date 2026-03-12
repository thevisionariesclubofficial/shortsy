# Shortsy Test Content Seeding Guide

## Overview

This guide explains how to use the two separate test content seeding scripts to populate your Shortsy backend with test data. These scripts are designed to be independent, reusable, and easy to maintain.

## Scripts

### 📽️ `seed-short-films.js`
Creates short film content with realistic metadata and variations.

**Location:** `shortsy/scripts/seed-short-films.js`

**Command:**
```bash
node scripts/seed-short-films.js <count>
```

**Parameters:**
- `<count>` (required): Number of short films to create (1-500)

**Example:**
```bash
node scripts/seed-short-films.js 30
```

### 📺 `seed-vertical-series.js`
Creates vertical series content with episodes and realistic metadata.

**Location:** `shortsy/scripts/seed-vertical-series.js`

**Command:**
```bash
node scripts/seed-vertical-series.js <count>
```

**Parameters:**
- `<count>` (required): Number of vertical series to create (1-200)

**Example:**
```bash
node scripts/seed-vertical-series.js 20
```

## What Each Script Creates

### Short Films
Each short film includes:
- **Title**: From a pool of 25 titles (auto-numbered if exceeding pool)
- **Type**: `short-film`
- **Duration**: 12-59 minutes (randomized)
- **Price**: $19-99 (randomized)
- **Director**: Randomly selected from 10 directors
- **Language**: Randomly selected from 8 languages
- **Genre**: Randomly selected from 8 genres
- **Mood**: Randomly selected from 8 moods
- **Description**: From a pool of 14+ descriptions
- **Thumbnail**: Unique image from Picsum.photos API
- **Trailer Video**: Shared sample video (Big Buck Bunny)
- **Main Video**: Shared sample video (Big Buck Bunny)
- **Featured**: ~15% of items marked as featured
- **Festival Winner**: ~14% of items marked as festival winners

### Vertical Series
Each vertical series includes:
- **Title**: From a pool of 25 titles (auto-numbered if exceeding pool)
- **Type**: `vertical-series`
- **Episodes**: 6-13 episodes per series (randomized)
- **Price**: $29-149 (randomized)
- **Director**: Randomly selected from 10 directors
- **Language**: Randomly selected from 8 languages
- **Genre**: Randomly selected from 8 genres
- **Mood**: Randomly selected from 8 moods
- **Description**: From a pool of 15+ descriptions
- **Thumbnail**: Unique image from Picsum.photos API
- **Trailer Video**: Shared sample video (Big Buck Bunny)
- **Episode List**: Full array of episodes with:
  - Episode title (Episode 1, 2, etc.)
  - Duration: 25-44 minutes per episode (randomized)
  - Unique thumbnail per episode
  - Shared video URL (Big Buck Bunny)
- **Featured**: ~15% of items marked as featured
- **Festival Winner**: ~20% of items marked as festival winners

## Usage Examples

### Basic Usage

**Create 10 short films:**
```bash
node scripts/seed-short-films.js 10
```

**Create 15 vertical series:**
```bash
node scripts/seed-vertical-series.js 15
```

### Complete Test Dataset

To create a realistic test database:

```bash
# Step 1: Create short films
node scripts/seed-short-films.js 40

# Step 2: Create vertical series
node scripts/seed-vertical-series.js 20

# Total: 60 items (40 short films + 20 series with ~140 episodes)
```

### Comprehensive Testing

For thorough testing across the app:

```bash
# Light load test
node scripts/seed-short-films.js 50
node scripts/seed-vertical-series.js 25

# Medium load test
node scripts/seed-short-films.js 100
node scripts/seed-vertical-series.js 50

# Heavy load test
node scripts/seed-short-films.js 200
node scripts/seed-vertical-series.js 100
```

## Key Features

✅ **Unique Content**
- Each item has unique title, description, and thumbnails
- No duplicate content generated

✅ **Reusable Videos**
- Sample videos are shared across all content
- Optimizes storage while testing functionality

✅ **Dynamic Titles**
- Titles automatically numbered if pool is exceeded
- Ensures uniqueness even with high counts

✅ **Realistic Pricing**
- Short Films: $19-99
- Vertical Series: $29-149
- Randomly distributed

✅ **Distributed Metadata**
- ~15% featured content
- ~14-20% festival winners
- Random genres, moods, languages, directors

✅ **Error Handling**
- Failed uploads logged and reported
- Process continues on individual failures
- Clear success/failure summary at end

✅ **Rate Limiting**
- 150ms delay between requests
- Prevents API throttling
- Optimal for reliable uploads

## Sample Video Source

Both scripts use Google's Big Buck Bunny as the sample video:

```
https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4
```

**Why Big Buck Bunny?**
- Publicly available test video
- Reliable and stable
- Appropriate duration (9 minutes 56 seconds)
- Free to use and distribute
- Commonly used in testing scenarios

## Thumbnail Source

Thumbnails are dynamically generated using Picsum.photos:

```
https://picsum.photos/400/800?random=<unique-id>
```

**Why Picsum.photos?**
- Free placeholder image API
- Returns unique random images each time
- Perfect dimensions for thumbnails (400x800)
- No authentication required
- Reliable and widely used

## Data Pools

### Titles (25 each type)

**Short Films:**
The Last Letter, Midnight Confession, Lost in Translation, The Forgotten Memory, A Second Chance, Unspoken Words, The Bridge, Shattered Dreams, The Choice, Redemption, The Wait, Echoes of Love, The Promise, Breaking Point, New Beginnings, The Photograph, Silence Speaks, The Return, Stolen Moments, The Truth, Colors of Home, Whispers in the Night, The Last Train, Abstract Minds, Sintel

**Vertical Series:**
Love Unscripted, City Tales, Office Chronicles, The Roommates, Finding Self, Coffee Talks, Urban Legends, The Squad, Late Night Stories, Connections, The Waitlist, Digital Love, Small Moments, The Chase, Friendship Goals, The Secret, Unfiltered, The Twist, Real Talk, Life Lessons, Summer Vibes, Beyond Walls, Midnight Tales, The Junction, Echoes Unseen

### Languages (8)
Hindi, English, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi

### Genres (8)
Drama, Romance, Comedy, Thriller, Action, Crime, Fantasy, Documentary

### Moods (8)
Emotional, Thrilling, Romantic, Funny, Dark, Inspiring, Mysterious, Surreal

### Directors (10)
Aman Sharma, Priya Verma, Rajesh Kumar, Neha Patel, Vikram Singh, Ananya Mishra, Arjun Kapoor, Divya Nair, Sanjay Gupta, Riya Desai

## Output Example

```
🔐 Authenticating...
✓ Authentication successful

======================================================================
🎬 CREATING 30 SHORT FILMS
======================================================================

✓    1 / 30 - "The Last Letter"
✓    2 / 30 - "Midnight Confession"
✓    3 / 30 - "Lost in Translation"
...
✓   30 / 30 - "Breaking Point"

======================================================================
✓ Successfully created: 30 short films
======================================================================
```

## Troubleshooting

### Issue: Script hangs or is slow
**Solution:** The scripts intentionally add 150ms delays to prevent rate limiting. This is expected behavior.

### Issue: Authentication fails
**Solution:** Verify credentials in the script are correct:
- Email: `adarsh@gmail.com`
- Password: `Ad@rsh15101996`
- API URL: `https://2tngsao13b.execute-api.ap-south-1.amazonaws.com/v1`

### Issue: Some items fail to create
**Solution:** This is normal. Check the error messages for validation issues. Most commonly:
- Duplicate title (re-run with different count)
- Network timeout (re-run the script)
- Validation error (report to development team)

### Issue: Videos not playing
**Solution:** Verify the Big Buck Bunny URL is accessible:
```bash
curl -I https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4
```

### Issue: Thumbnails not loading
**Solution:** Verify Picsum.photos is accessible:
```bash
curl -I https://picsum.photos/400/800?random=1
```

## Advanced Usage

### Creating Multiple Batches

You can run scripts multiple times to build up test data:

```bash
# Day 1: Initial test data
node scripts/seed-short-films.js 20
node scripts/seed-vertical-series.js 10

# Day 2: Add more variety
node scripts/seed-short-films.js 30
node scripts/seed-vertical-series.js 15

# Day 3: Load testing
node scripts/seed-short-films.js 50
node scripts/seed-vertical-series.js 25
```

### Parallel Execution

Run both scripts simultaneously in different terminals:

```bash
# Terminal 1
node scripts/seed-short-films.js 50

# Terminal 2
node scripts/seed-vertical-series.js 30
```

## Performance Notes

- **Creation Speed**: ~6-7 items per second (with rate limiting)
- **Storage**: ~1-2KB per short film, ~5-8KB per vertical series
- **Videos**: Shared across all items (efficient)
- **Thumbnails**: Generated dynamically (not stored)

## Cleanup

To delete test content from the database, you'll need to:
1. Access your backend AWS DynamoDB console
2. Scan the Content table
3. Batch delete items by type or date

Or contact your development team for a database cleanup utility.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the script code comments
3. Contact the development team
4. Check backend logs for detailed error messages

## Related Files

- [TEST_CONTENT_SEEDS_README.md](./TEST_CONTENT_SEEDS_README.md) - Additional details
- [seed-content-quick-start.sh](./seed-content-quick-start.sh) - Quick reference guide
- Backend API: `https://2tngsao13b.execute-api.ap-south-1.amazonaws.com/v1`

---

**Last Updated:** March 11, 2026
**Status:** Production Ready
