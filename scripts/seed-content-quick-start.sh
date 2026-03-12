#!/bin/bash

# Quick reference guide for running test content seed scripts
# Usage: bash seed-content-quick-start.sh

echo "════════════════════════════════════════════════════════════════"
echo "                TEST CONTENT SEEDING - QUICK START"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if scripts exist
if [ ! -f "scripts/seed-short-films.js" ]; then
    echo "❌ Error: scripts/seed-short-films.js not found"
    exit 1
fi

if [ ! -f "scripts/seed-vertical-series.js" ]; then
    echo "❌ Error: scripts/seed-vertical-series.js not found"
    exit 1
fi

echo "📋 AVAILABLE SCRIPTS:"
echo "   1. seed-short-films.js       - Create short film content"
echo "   2. seed-vertical-series.js   - Create vertical series content"
echo ""

echo "🎬 SEED SHORT FILMS"
echo "   Usage: node scripts/seed-short-films.js <count>"
echo "   Examples:"
echo "      node scripts/seed-short-films.js 10"
echo "      node scripts/seed-short-films.js 20"
echo "      node scripts/seed-short-films.js 50"
echo ""

echo "📺 SEED VERTICAL SERIES"
echo "   Usage: node scripts/seed-vertical-series.js <count>"
echo "   Examples:"
echo "      node scripts/seed-vertical-series.js 10"
echo "      node scripts/seed-vertical-series.js 20"
echo "      node scripts/seed-vertical-series.js 30"
echo ""

echo "📊 RECOMMENDED TEST SCENARIOS:"
echo ""
echo "   Scenario 1: Light Testing (15 items total)"
echo "      $ node scripts/seed-short-films.js 10"
echo "      $ node scripts/seed-vertical-series.js 5"
echo ""

echo "   Scenario 2: Medium Testing (50 items total)"
echo "      $ node scripts/seed-short-films.js 30"
echo "      $ node scripts/seed-vertical-series.js 20"
echo ""

echo "   Scenario 3: Heavy Testing (100 items total)"
echo "      $ node scripts/seed-short-films.js 70"
echo "      $ node scripts/seed-vertical-series.js 30"
echo ""

echo "   Scenario 4: Full Production Simulation (200 items total)"
echo "      $ node scripts/seed-short-films.js 140"
echo "      $ node scripts/seed-vertical-series.js 60"
echo ""

echo "🎥 VIDEO SOURCES:"
echo "   All scripts use reusable sample video URLs:"
echo "   - Sample Video: BigBuckBunny (Google)"
echo "   - Thumbnails: Unique images (Picsum.photos)"
echo ""

echo "💡 TIPS:"
echo "   • Scripts include 150ms delay between requests (rate limiting)"
echo "   • Provide count as command-line argument"
echo "   • Each run is independent - you can run multiple times"
echo "   • Featured content: ~15% of items"
echo "   • Festival winners: ~14-20% of items"
echo ""

echo "📌 NOTES:"
echo "   • Short Films: $19-99, durations 12-59 minutes"
echo "   • Vertical Series: $29-149, episodes 6-13 per series"
echo "   • All metadata (genres, moods, directors) randomized"
echo "   • Titles auto-numbered if pool is exceeded"
echo ""

echo "════════════════════════════════════════════════════════════════"
echo ""
