#!/usr/bin/env node

const axios = require('axios');

const API_BASE_URL = 'https://2tngsao13b.execute-api.ap-south-1.amazonaws.com/v1';
const EMAIL = 'adarsh@gmail.com';
const PASSWORD = 'Ad@rsh15101996';

// Sample data pools for realistic content generation
const shortFilmTitles = [
  'The Last Letter',
  'Midnight Confession',
  'Lost in Translation',
  'The Forgotten Memory',
  'A Second Chance',
  'Unspoken Words',
  'The Bridge',
  'Shattered Dreams',
  'The Choice',
  'Redemption',
  'The Wait',
  'Echoes of Love',
  'The Promise',
  'Breaking Point',
  'New Beginnings',
  'The Photograph',
  'Silence Speaks',
  'The Return',
  'Stolen Moments',
  'The Truth',
  'Colors of Home',
  'Whispers in the Night',
  'The Last Train',
  'Abstract Minds',
  'Sintel',
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
  'A touching story about love and loss that will stay with you long after the credits roll.',
  'An unexpected encounter changes everything in just 18 minutes.',
  'A journey of self-discovery and redemption in a small town.',
  'Two strangers, one night, infinite possibilities.',
  'When the truth finally comes out, nothing will be the same.',
  'A tale of forgiveness and second chances.',
  'Love in the most unexpected places.',
  'The choice that changed a life forever.',
  'Breaking free from the chains of the past.',
  'A moment that defines everything.',
  'A story of passion and perseverance against all odds.',
  'In the silence, a powerful message emerges.',
  'A tale of sacrifice and unconditional love.',
  'When hope meets despair at the crossroads.',
];

// Sample video URLs (can be reused for trailer and main content)
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

function generateShortFilm(index, totalCount) {
  const titleIndex = index % shortFilmTitles.length;
  const uniqueId = Math.floor(index / shortFilmTitles.length) + 1;
  const title = uniqueId > 1 
    ? `${shortFilmTitles[titleIndex]} (${uniqueId})`
    : shortFilmTitles[titleIndex];

  return {
    title,
    type: 'short-film',
    thumbnail: `${sampleThumbnailBaseUrl}sf-${index}`,
    duration: `${12 + (index % 48)} min`,
    price: 19 + (index % 81),
    director: getRandomItem(directorNames),
    language: getRandomItem(languages),
    genre: getRandomItem(genres),
    mood: getRandomItem(moods),
    description: getRandomItem(descriptions),
    trailer: getRandomItem(sampleVideoUrls),
    videoUrl: getRandomItem(sampleVideoUrls),
    featured: index < Math.ceil(totalCount * 0.15),
    festivalWinner: index % 7 === 0,
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
      console.error('❌ Invalid count. Usage: node seed-short-films.js <count>');
      console.error('Example: node seed-short-films.js 30');
      process.exit(1);
    }

    const token = await getAuthToken();

    console.log('=' .repeat(70));
    console.log(`🎬 CREATING ${count} SHORT FILMS`);
    console.log('=' .repeat(70) + '\n');

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < count; i++) {
      try {
        const content = generateShortFilm(i, count);
        await uploadContent(token, content);
        console.log(`✓ ${String(i + 1).padStart(4)} / ${count} - "${content.title}"`);
        successCount++;
        await new Promise(resolve => setTimeout(resolve, 150));
      } catch (error) {
        console.error(`✗ ${String(i + 1).padStart(4)} / ${count} - Failed: ${error.response?.data?.error?.message || error.message}`);
        failureCount++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`✓ Successfully created: ${successCount} short films`);
    if (failureCount > 0) {
      console.log(`✗ Failed: ${failureCount} short films`);
    }
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
