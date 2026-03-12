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

async function fetchContent(token, limit = 100) {
  try {
    const response = await axios.get(`${API_BASE_URL}/content?limit=${limit}`, {
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
    const response = await fetchContent(token, 100);
    const content = response.data || response;

    // Calculate statistics
    const shortFilms = content.filter(item => item.type === 'short-film');
    const verticalSeries = content.filter(item => item.type === 'vertical-series');
    
    let totalEpisodes = 0;
    for (const series of verticalSeries) {
      totalEpisodes += series.episodes || 0;
    }

    // Create summary
    console.log('\n' + '╔' + '═'.repeat(78) + '╗');
    console.log('║' + ' '.repeat(25) + '🎬 TEST CONTENT SUMMARY 🎬' + ' '.repeat(26) + '║');
    console.log('╠' + '═'.repeat(78) + '╣');
    console.log(`║  📊 Total Content Items: ${String(content.length).padEnd(50)} │`);
    console.log('║' + '─'.repeat(78) + '║');
    console.log(`║  🎞️  Short Films: ${String(shortFilms.length).padEnd(59)} │`);
    console.log(`║  📺 Vertical Series: ${String(verticalSeries.length).padEnd(54)} │`);
    console.log(`║  🎬 Total Episodes: ${String(totalEpisodes).padEnd(56)} │`);
    console.log('╠' + '═'.repeat(78) + '╣');
    
    // Sample vertical series
    if (verticalSeries.length > 0) {
      console.log('║  SAMPLE VERTICAL SERIES:' + ' '.repeat(53) + '║');
      for (let i = 0; i < Math.min(5, verticalSeries.length); i++) {
        const series = verticalSeries[i];
        console.log(`║    ${i + 1}. ${series.title.padEnd(59)} │`);
        console.log(`║       Episodes: ${String(series.episodes).padEnd(61)} │`);
      }
      if (verticalSeries.length > 5) {
        console.log(`║    ... and ${String(verticalSeries.length - 5).padEnd(65)} more │`);
      }
    }
    
    console.log('╠' + '═'.repeat(78) + '╣');
    
    // Sample short films
    if (shortFilms.length > 0) {
      console.log('║  SAMPLE SHORT FILMS:' + ' '.repeat(57) + '║');
      for (let i = 0; i < Math.min(5, shortFilms.length); i++) {
        const film = shortFilms[i];
        console.log(`║    ${i + 1}. ${film.title.padEnd(62)} │`);
        console.log(`║       Duration: ${film.duration.padEnd(60)} │`);
      }
      if (shortFilms.length > 5) {
        console.log(`║    ... and ${String(shortFilms.length - 5).padEnd(65)} more │`);
      }
    }
    
    console.log('╚' + '═'.repeat(78) + '╝\n');

  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

main();
