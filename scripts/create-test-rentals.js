#!/usr/bin/env node
/**
 * Create test rentals with future expiry dates for testing the expiry badge
 * Usage: node scripts/create-test-rentals.js [count] [user-id]
 * 
 * Example:
 *   node scripts/create-test-rentals.js 5        # Create 5 rentals for current user
 *   node scripts/create-test-rentals.js 3 abc123 # Create 3 rentals for user abc123
 */

const axios = require('axios');

// Configuration
const API_BASE = process.env.API_URL || 'https://2tngsao13b.execute-api.ap-south-1.amazonaws.com/v1';
const USER_ID = process.env.USER_ID || 'test-user-' + Date.now();
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'dummy-token-' + USER_ID;

// Parse command line arguments
const count = parseInt(process.argv[2] || '3');
const userId = process.argv[3] || USER_ID;

console.log(`\n📱 Creating ${count} test rentals for user: ${userId}`);
console.log(`🔗 API: ${API_BASE}\n`);

// Sample content IDs (from seeded content)
const contentIds = [
  'short-film-1', 'short-film-2', 'short-film-3', 'short-film-4', 'short-film-5',
  'vertical-series-1', 'vertical-series-2', 'vertical-series-3',
];

/**
 * Create a rental record with specific expiry times for testing different badge states
 */
async function createTestRental(index, contentId, expiryHours) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiryHours * 60 * 60 * 1000).toISOString();
  
  const rentalData = {
    userId,
    contentId,
    expiresAt,
    startedAt: new Date().toISOString(),
    progressPercent: Math.floor(Math.random() * 90), // 0-90% watched
  };

  try {
    const response = await axios.post(`${API_BASE}/rentals`, rentalData, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const expiryInfo = formatExpiryForDisplay(expiryHours);
    console.log(`✅ [${index + 1}/${count}] Created rental for ${contentId}`);
    console.log(`   Expires in: ${expiryInfo}`);
    console.log(`   Expiry time: ${expiresAt}\n`);

    return response.data;
  } catch (error) {
    console.error(`❌ [${index + 1}/${count}] Failed to create rental for ${contentId}`);
    if (error.response?.data) {
      console.error(`   Error: ${error.response.data.message || JSON.stringify(error.response.data)}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    return null;
  }
}

/**
 * Format hours into human-readable expiry info for display
 */
function formatExpiryForDisplay(hours) {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} minutes (Urgent - Red badge)`;
  } else if (hours < 24) {
    return `${Math.round(hours)} hours (Warning - Orange badge)`;
  } else if (hours < 48) {
    return `${Math.round(hours / 24)} day (Warning - Orange badge)`;
  } else {
    return `${Math.round(hours / 24)} days (Safe - Green badge)`;
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    // Create rentals with different expiry times to showcase badge states:
    const expiryTimes = [];
    
    // Mix of expiry times to test different badge states
    if (count >= 1) expiryTimes.push(0.5);  // 30 min - URGENT (red)
    if (count >= 2) expiryTimes.push(6);    // 6 hours - WARNING (orange)
    if (count >= 3) expiryTimes.push(24);   // 1 day - WARNING (orange, "Expires today")
    if (count >= 4) expiryTimes.push(48);   // 2 days - SAFE (green)
    if (count >= 5) expiryTimes.push(72);   // 3 days - SAFE (green)
    if (count >= 6) expiryTimes.push(168);  // 7 days - SAFE (green)
    
    // If more than 6, add random times
    while (expiryTimes.length < count) {
      expiryTimes.push(Math.random() * 200 + 24); // Random 24-224 hours
    }

    const results = [];
    for (let i = 0; i < count; i++) {
      const contentId = contentIds[i % contentIds.length];
      const expiryHours = expiryTimes[i];
      
      const result = await createTestRental(i, contentId, expiryHours);
      results.push(result);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const successCount = results.filter(r => r !== null).length;
    console.log(`\n✨ Summary: Created ${successCount}/${count} test rentals`);
    console.log(`\n💡 Tips:`);
    console.log(`   • Check the "Continue Watching" section to see the expiry badges`);
    console.log(`   • Red badge: <1 hour remaining`);
    console.log(`   • Orange badge: 1-24 hours remaining or "Expires today"`);
    console.log(`   • Green badge: >1 day remaining`);
    console.log(`   • Gray badge: Already expired\n`);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
