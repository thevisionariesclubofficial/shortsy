# Sample Video URLs

All seeding scripts now use 13 different sample video URLs that are randomly selected for trailers and main content/episodes. This provides variety while keeping the database efficient.

## Video Sources

The following video URLs are sourced from Google's sample videos library:

```
http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4
http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4
http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4
http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4
http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4
http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4
http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4
http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4
http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4
http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4
http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4
http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4
```

## Video Details

| # | Title | URL | Source |
|---|-------|-----|--------|
| 1 | Big Buck Bunny | http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4 | Blender Foundation |
| 2 | Elephant Dream | http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4 | Blender Foundation |
| 3 | For Bigger Blazes | http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4 | Google |
| 4 | For Bigger Escapes | http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4 | Google |
| 5 | For Bigger Fun | http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4 | Google |
| 6 | For Bigger Joyrides | http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4 | Google |
| 7 | For Bigger Meltdowns | http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4 | Google |
| 8 | Sintel | http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4 | Blender Foundation |
| 9 | Subaru Outback | http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4 | Garage419 |
| 10 | Tears of Steel | http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4 | Blender Foundation |
| 11 | Volkswagen GTI Review | http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4 | Garage419 |
| 12 | We Are Going On Bullrun | http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4 | Garage419 |
| 13 | What Car Can You Get For A Grand | http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4 | Garage419 |

## How Scripts Use These URLs

### seed-short-films.js
- **Trailer**: Randomly selected from the 13 video URLs
- **Main Content (videoUrl)**: Randomly selected from the 13 video URLs
- Each short film may have different trailer and videoUrl

### seed-vertical-series.js
- **Trailer**: Randomly selected from the 13 video URLs
- **Episodes**: Each episode gets a randomly selected video URL from the 13 videos
- Each episode within a series may have different video URLs

## Benefits

✓ **Variety**: 13 different sample videos provide visual variety
✓ **Efficiency**: Shared URLs keep database size manageable
✓ **Randomization**: Each content item may use different videos
✓ **Reliability**: Google's sample videos are stable and widely available
✓ **Quality**: Mix of professional and experimental content

## Adding More Videos

To add more video URLs to the seeding scripts:

1. Update the `sampleVideoUrls` array in both scripts
2. Add the new URL to the array
3. Scripts will automatically include new URLs in randomization

Example:
```javascript
const sampleVideoUrls = [
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/NewVideo.mp4', // New
  // ... rest of URLs
];
```

## Verification

To verify a content item has the correct video URLs:

```bash
node scripts/fetch-content-by-id.js <contentId>
```

Look for:
- `trailer`: Should be one of the 13 URLs
- `videoUrl` (short films): Should be one of the 13 URLs
- `episodeList[].videoUrl` (series): Should be one of the 13 URLs

## Accessing Videos

All videos are publicly accessible and can be:
- Streamed directly via HTTP
- Downloaded for testing
- Used in multiple browser tabs simultaneously
- Cached by CDN

---

**Last Updated**: March 11, 2026  
**Status**: Active
