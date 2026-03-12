#!/usr/bin/env node

const axios = require('axios');

const API_BASE_URL = 'https://2tngsao13b.execute-api.ap-south-1.amazonaws.com/v1';
const EMAIL = 'adarsh@gmail.com';
const PASSWORD = 'Ad@rsh15101996';

// Sample data pools for realistic content generation
const verticalSeriesTitles = [
  'Love Unscripted',
  'City Tales',
  'Office Chronicles',
  'The Roommates',
  'Finding Self',
  'Coffee Talks',
  'Urban Legends',
  'The Squad',
  'Late Night Stories',
  'Connections',
  'The Waitlist',
  'Digital Love',
  'Small Moments',
  'The Chase',
  'Friendship Goals',
  'The Secret',
  'Unfiltered',
  'The Twist',
  'Real Talk',
  'Life Lessons',
  'Summer Vibes',
  'Beyond Walls',
  'Midnight Tales',
  'The Junction',
  'Echoes Unseen',
];

const directorNames = [
  'Aman Sharma',
  'Priya Verma',
  'Rajesh Kumar',
  'Neha Patel',
  'Vikram Singh',
  'Ananya Mishra',
  'Arjun Kapoor',
  'Divya Nair',
  'Sanjay Gupta',
  'Riya Desai',
];

const languages = ['Hindi', 'English', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi'];
const genres = ['Drama', 'Romance', 'Comedy', 'Thriller', 'Action', 'Crime', 'Fantasy', 'Documentary'];
const moods = ['Emotional', 'Thrilling', 'Romantic', 'Funny', 'Dark', 'Inspiring', 'Mysterious', 'Surreal'];

const descriptions = [
  'Follow the lives of four friends navigating through career and relationships.',
  'A web series about finding love in the digital age.',
  'Office politics, friendship, and unexpected romance.',
  'Two people, different worlds, one shared apartment.',
  'Discovering who you really are, one day at a time.',
  'Coffee, conversations, and life-changing moments.',
  'Urban legends come to life in this thrilling series.',
  'The bond of friendship tested through trials and triumphs.',
  'Late-night confessions reveal hidden truths.',
  'Connections that transcend time and space.',
  'A journey through careers, dreams, and ambitions.',
  'Mystery unfolds with every twist and turn.',
  'Celebrating the beauty of everyday moments.',
  'A story of transformation and self-discovery.',
  'When worlds collide and hearts entangle.',
];

// Sample video URLs (can be reused for trailer and episodes)
const sampleVideoUrls = [
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
  'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
];
const sampleThumbnailBaseUrl = 'https://picsum.photos/400/800?random=';

async function getAuthToken() {
  try {
    console.log('🔐 Authenticating...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD,
    });
    const token = response.data.tokens?.accessToken || response.data.token || response.data.authToken;
    console.log('✓ Authentication successful\n');
    return token;
  } catch (error) {
    console.error('✗ Authentication failed:', error.response?.data?.error?.message || error.message);
    throw error;
  }
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateVerticalSeries(index, totalCount) {
  const titleIndex = index % verticalSeriesTitles.length;
  const uniqueId = Math.floor(index / verticalSeriesTitles.length) + 1;
  const title = uniqueId > 1 
    ? `${verticalSeriesTitles[titleIndex]} (${uniqueId})`
    : verticalSeriesTitles[titleIndex];

  const episodeCount = 6 + (index % 8);
  const episodes = [];

  for (let i = 1; i <= episodeCount; i++) {
    episodes.push({
      id: `ep${i}`,
      title: `Episode ${i}`,
      duration: `${25 + (i % 20)} min`,
      thumbnail: `${sampleThumbnailBaseUrl}vs-${index}-ep${i}`,
      videoUrl: getRandomItem(sampleVideoUrls),
    });
  }

  return {
    title,
    type: 'vertical-series',
    thumbnail: `${sampleThumbnailBaseUrl}vs-${index}`,
    duration: `${episodeCount} episodes`,
    episodes: episodeCount,
    episodeList: episodes,
    price: 29 + (index % 121),
    director: getRandomItem(directorNames),
    language: getRandomItem(languages),
    genre: getRandomItem(genres),
    mood: getRandomItem(moods),
    description: getRandomItem(descriptions),
    trailer: getRandomItem(sampleVideoUrls),
    featured: index < Math.ceil(totalCount * 0.15),
    festivalWinner: index % 5 === 0,
  };
}

async function uploadContent(token, contentData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/content`, contentData, {
      headers: {
        'Content-Type': 'application/json',
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
    const count = parseInt(process.argv[2]) || 20;
    
    if (isNaN(count) || count < 1) {
      console.error('❌ Invalid count. Usage: node seed-vertical-series.js <count>');
      console.error('Example: node seed-vertical-series.js 20');
      process.exit(1);
    }

    const token = await getAuthToken();

    console.log('=' .repeat(70));
    console.log(`📺 CREATING ${count} VERTICAL SERIES`);
    console.log('=' .repeat(70) + '\n');

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < count; i++) {
      try {
        const content = generateVerticalSeries(i, count);
        await uploadContent(token, content);
        console.log(`✓ ${String(i + 1).padStart(4)} / ${count} - "${content.title}" (${content.episodes} episodes)`);
        successCount++;
        await new Promise(resolve => setTimeout(resolve, 150));
      } catch (error) {
        console.error(`✗ ${String(i + 1).padStart(4)} / ${count} - Failed: ${error.response?.data?.error?.message || error.message}`);
        failureCount++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`✓ Successfully created: ${successCount} vertical series`);
    if (failureCount > 0) {
      console.log(`✗ Failed: ${failureCount} vertical series`);
    }
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
