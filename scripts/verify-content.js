#!/usr/bin/env node

const axios = require('axios');

const API_BASE_URL = 'https://2tngsao13b.execute-api.ap-south-1.amazonaws.com/v1';
const EMAIL = 'adarsh@gmail.com';
const PASSWORD = 'Ad@rsh15101996';

async function getAuthToken() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD,
    });
    const token = response.data.tokens?.accessToken || response.data.token || response.data.authToken;
    return token;
  } catch (error) {
    console.error('Authentication failed:', error.response?.data || error.message);
    throw error;
  }
}

async function fetchContent(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/content?limit=100`, {
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

async function fetchContentById(token, id) {
  try {
    const response = await axios.get(`${API_BASE_URL}/content/${id}`, {
      headers: {
        'Authorization': token,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function main() {
  try {
    const token = await getAuthToken();
    const response = await fetchContent(token);
    const content = response.data || response;

    console.log('\n' + '='.repeat(80));
    console.log('📊 DATABASE CONTENT SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Content Items: ${Array.isArray(content) ? content.length : 0}\n`);

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
    Object.entries(byType).forEach(([type, items]) => {
      console.log(`📌 ${type.toUpperCase()}: ${items.length} items`);
      items.forEach((item, idx) => {
        console.log(`   ${idx + 1}. ${item.title}`);
      });
      console.log();
    });

    // Show vertical series details with episodes
    if (byType['vertical-series'] && byType['vertical-series'].length > 0) {
      console.log('='.repeat(80));
      console.log('📺 VERTICAL SERIES WITH EPISODES');
      console.log('='.repeat(80) + '\n');
      
      for (const series of byType['vertical-series']) {
        const fullSeries = await fetchContentById(token, series.id);
        console.log(`🎬 ${fullSeries.title}`);
        console.log(`   ID: ${fullSeries.id}`);
        console.log(`   Episodes: ${fullSeries.episodes}`);
        if (fullSeries.episodeList && fullSeries.episodeList.length > 0) {
          console.log(`   Episode List (${fullSeries.episodeList.length} episodes):`);
          fullSeries.episodeList.slice(0, 3).forEach((ep, idx) => {
            console.log(`      ${idx + 1}. ${ep.title} (${ep.duration})`);
          });
          if (fullSeries.episodeList.length > 3) {
            console.log(`      ... and ${fullSeries.episodeList.length - 3} more episodes`);
          }
        }
        console.log();
      }
    }

    console.log('='.repeat(80) + '\n');
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

main();
