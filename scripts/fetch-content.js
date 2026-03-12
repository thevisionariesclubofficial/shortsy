#!/usr/bin/env node

const axios = require('axios');

const API_BASE_URL = 'https://2tngsao13b.execute-api.ap-south-1.amazonaws.com/v1';
const EMAIL = 'adarsh@gmail.com';
const PASSWORD = 'Ad@rsh15101996';

async function getAuthToken() {
  try {
    console.log('Authenticating...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD,
    });
    console.log('✓ Authentication successful\n');
    const token = response.data.tokens?.accessToken || response.data.token || response.data.authToken;
    return token;
  } catch (error) {
    console.error('✗ Authentication failed:', error.response?.data || error.message);
    throw error;
  }
}

async function fetchContent(token) {
  try {
    console.log('Fetching all content...');
    const response = await axios.get(`${API_BASE_URL}/content`, {
      headers: {
        'Authorization': token,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching content:', error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  try {
    const token = await getAuthToken();
    const response = await fetchContent(token);
    const content = response.data || response;

    console.log('='.repeat(70));
    console.log(`Total Content Items: ${Array.isArray(content) ? content.length : 0}`);
    console.log('='.repeat(70));

    if (!content || !Array.isArray(content) || content.length === 0) {
      console.log('No content found in database');
      return;
    }

    // Categorize content
    const byType = {};
    content.forEach(item => {
      const type = item.type || 'unknown';
      if (!byType[type]) {
        byType[type] = [];
      }
      byType[type].push(item);
    });

    // Show summary
    console.log('\nContent by Type:');
    console.log('-'.repeat(70));
    Object.entries(byType).forEach(([type, items]) => {
      console.log(`\n${type.toUpperCase()}: ${items.length} items`);
      items.slice(0, 3).forEach((item, idx) => {
        console.log(`  ${idx + 1}. "${item.title}"`);
        if (item.type === 'vertical-series') {
          console.log(`     Episodes: ${item.episodes}, Episodes List: ${item.episodeList ? item.episodeList.length : 0}`);
        } else if (item.type === 'short-film') {
          console.log(`     Duration: ${item.duration}, Has Video: ${!!item.videoUrl}`);
        }
      });
      if (items.length > 3) {
        console.log(`  ... and ${items.length - 3} more`);
      }
    });

    // Detailed vertical series info
    if (byType['vertical-series'] && byType['vertical-series'].length > 0) {
      console.log('\n' + '='.repeat(70));
      console.log('VERTICAL SERIES DETAILS');
      console.log('='.repeat(70));
      byType['vertical-series'].forEach((series, idx) => {
        console.log(`\n${idx + 1}. ${series.title}`);
        console.log(`   ID: ${series.id}`);
        console.log(`   Episodes: ${series.episodes}`);
        console.log(`   Episode List Count: ${series.episodeList ? series.episodeList.length : 0}`);
        if (series.episodeList && series.episodeList.length > 0) {
          console.log(`   First Episode: ${series.episodeList[0].title}`);
        }
      });
    }

    console.log('\n' + '='.repeat(70));
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

main();
