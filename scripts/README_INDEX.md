# Test Content Seeding - File Index

## Main Scripts (Ready to Use)

### 1. **seed-short-films.js**
- **Purpose**: Create short film content with realistic metadata
- **Usage**: `node scripts/seed-short-films.js <count>`
- **Parameters**: count (1-500)
- **Features**:
  - 25 unique titles (auto-numbered if exceeded)
  - Pricing: $19-99
  - Duration: 12-59 minutes
  - Random: director, language, genre, mood
  - Unique thumbnails, shared video
  - ~15% featured, ~14% festival winners

### 2. **seed-vertical-series.js**
- **Purpose**: Create vertical series with episodes
- **Usage**: `node scripts/seed-vertical-series.js <count>`
- **Parameters**: count (1-200)
- **Features**:
  - 25 unique titles (auto-numbered if exceeded)
  - Pricing: $29-149
  - Episodes: 6-13 per series
  - Random: director, language, genre, mood
  - Unique thumbnails per series & episode
  - Shared video for all episodes
  - ~15% featured, ~20% festival winners

---

## Documentation Files

### 1. **SEEDING_GUIDE.md** (Primary Documentation)
- **Length**: ~12 KB
- **Contains**:
  - Complete overview of both scripts
  - Detailed usage examples
  - Data pools reference
  - Troubleshooting guide
  - Advanced usage patterns
  - Performance notes
  - Video source information

### 2. **TEST_CONTENT_SEEDS_README.md** (Quick Reference)
- **Length**: ~8 KB
- **Contains**:
  - Script descriptions
  - Usage examples
  - Features list
  - Troubleshooting tips
  - Data pool information

### 3. **seed-content-quick-start.sh** (Quick Reference Bash Script)
- **Length**: ~2 KB
- **Contains**:
  - Recommended test scenarios
  - Quick command examples
  - Feature highlights
  - Tips and notes

### 4. **SCRIPTS_SUMMARY.txt** (Overview)
- **Length**: ~6 KB
- **Contains**:
  - Executive summary
  - Quick start guide
  - Features overview
  - Technical details
  - File listing
  - Status information

---

## Utility Scripts (Optional)

These were created during development for verification:

### 1. **fetch-content.js**
- Fetches all content from the database
- Shows content summary by type
- Lists short films and vertical series

### 2. **fetch-content-by-id.js**
- Fetches a specific content by ID
- Useful for verifying content with episodes
- Usage: `node scripts/fetch-content-by-id.js <contentId>`

### 3. **verify-content.js**
- Complete verification script
- Shows all content with detailed episode information
- Useful for validation after seeding

### 4. **test-content-summary.js**
- Quick summary of database content
- Shows statistics and sample items

### 5. **seed-test-content.js**
- Original combined script (both types in one)
- Kept for reference

---

## How to Use

### Step 1: Review Documentation
Start with **SEEDING_GUIDE.md** for comprehensive information.

### Step 2: Quick Reference
Use **seed-content-quick-start.sh** for quick examples:
```bash
bash scripts/seed-content-quick-start.sh
```

### Step 3: Run Scripts
Create your test data:
```bash
# Create 20 short films
node scripts/seed-short-films.js 20

# Create 10 vertical series
node scripts/seed-vertical-series.js 10
```

### Step 4: Verify (Optional)
Check the created content:
```bash
node scripts/test-content-summary.js
```

---

## Recommended Reading Order

1. **SCRIPTS_SUMMARY.txt** - Start here for overview
2. **SEEDING_GUIDE.md** - Read for complete understanding
3. **seed-content-quick-start.sh** - Reference while running scripts
4. **TEST_CONTENT_SEEDS_README.md** - Additional details if needed

---

## Common Commands

```bash
# Create 10 short films
node scripts/seed-short-films.js 10

# Create 15 vertical series
node scripts/seed-vertical-series.js 15

# Light test (15 total items)
node scripts/seed-short-films.js 10
node scripts/seed-vertical-series.js 5

# Medium test (50 total items)
node scripts/seed-short-films.js 30
node scripts/seed-vertical-series.js 20

# Heavy test (100 total items)
node scripts/seed-short-films.js 70
node scripts/seed-vertical-series.js 30

# Show quick reference
bash scripts/seed-content-quick-start.sh

# Verify content
node scripts/test-content-summary.js
```

---

## Key Features

✓ **Two separate, independent scripts**
- seed-short-films.js
- seed-vertical-series.js

✓ **Dynamic content creation**
- Specify any number of items
- Unique metadata for each item
- Reusable videos for efficiency

✓ **Production-ready**
- Error handling
- Rate limiting
- Progress tracking
- Clear output

✓ **Comprehensive documentation**
- Multiple reference guides
- Usage examples
- Troubleshooting
- Data pools

✓ **No setup required**
- Ready to use immediately
- No additional dependencies
- No configuration needed

---

## File Structure

```
scripts/
├── MAIN SCRIPTS
│   ├── seed-short-films.js
│   └── seed-vertical-series.js
├── DOCUMENTATION
│   ├── SEEDING_GUIDE.md
│   ├── TEST_CONTENT_SEEDS_README.md
│   ├── SCRIPTS_SUMMARY.txt
│   ├── README_INDEX.md (this file)
│   └── seed-content-quick-start.sh
├── UTILITIES (optional)
│   ├── fetch-content.js
│   ├── fetch-content-by-id.js
│   ├── verify-content.js
│   ├── test-content-summary.js
│   └── seed-test-content.js (original)
```

---

## Quick Summary

| Script | Purpose | Count | Time |
|--------|---------|-------|------|
| seed-short-films.js | Create short films | 1-500 | 150ms per item |
| seed-vertical-series.js | Create series | 1-200 | 150ms per item |

---

## Support

- **Questions?** See SEEDING_GUIDE.md
- **Quick reference?** See TEST_CONTENT_SEEDS_README.md
- **Quick start?** Run seed-content-quick-start.sh
- **Overview?** Read SCRIPTS_SUMMARY.txt

---

**Last Updated**: March 11, 2026  
**Status**: ✓ Production Ready  
**Tested**: ✓ Yes  
**Ready**: ✓ Immediate Use
