#!/usr/bin/env node

const axios = require('axios');

const API_BASE_URL = 'https://2tngsao13b.execute-api.ap-south-1.amazonaws.com/v1';
const EMAIL = 'adarsh@gmail.com';
const PASSWORD = 'Ad@rsh15101996';

// Sample data pools
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
];

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

const languages = ['Hindi', 'English', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'];
const genres = ['Drama', 'Romance', 'Comedy', 'Thriller', 'Action', 'Crime', 'Fantasy'];
const moods = ['Emotional', 'Thrilling', 'Romantic', 'Funny', 'Dark', 'Inspiring', 'Mysterious'];

const descriptions = {
  short: [
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
  ],
  vertical: [
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
  ],
};

// Sample video URLs (using publicly available test videos)
const sampleVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4';
const sampleThumbnailUrl = 'https://picsum.photos/400/800?random=';

async function getAuthToken() {
  try {
    console.log('Authenticating...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD,
    });
    console.log('✓ Authentication successful');
    const token = response.data.tokens?.accessToken || response.data.token || response.data.authToken;
    console.log('Using token:', token.substring(0, 50) + '...');
    return token;
  } catch (error) {
    console.error('✗ Authentication failed:', error.response?.data || error.message);
    throw error;
  }
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateShortFilmContent(index) {
  return {
    title: shortFilmTitles[index % shortFilmTitles.length],
    type: 'short-film',
    thumbnail: `${sampleThumbnailUrl}${index}`,
    duration: `${12 + (index % 25)} min`,
    price: 29 + (index % 100),
    director: getRandomItem(directorNames),
    language: getRandomItem(languages),
    genre: getRandomItem(genres),
    mood: getRandomItem(moods),
    description: getRandomItem(descriptions.short),
    trailer: sampleVideoUrl,
    videoUrl: sampleVideoUrl,
    featured: index < 3,
    festivalWinner: index % 5 === 0,
  };
}

function generateVerticalSeriesContent(index) {
  const episodeCount = 6 + (index % 8);
  const episodes = [];
  for (let i = 1; i <= episodeCount; i++) {
    episodes.push({
      id: `ep${i}`,
      title: `Episode ${i}`,
      duration: `${30 + (i % 20)} min`,
      thumbnail: `${sampleThumbnailUrl}${100 + index}-ep${i}`,
      videoUrl: sampleVideoUrl,
    });
  }
  return {
    title: verticalSeriesTitles[index % verticalSeriesTitles.length],
    type: 'vertical-series',
    thumbnail: `${sampleThumbnailUrl}${100 + index}`,
    duration: `${episodeCount} episodes`,
    episodes: episodeCount,
    episodeList: episodes,
    price: 49 + (index % 150),
    director: getRandomItem(directorNames),
    language: getRandomItem(languages),
    genre: getRandomItem(genres),
    mood: getRandomItem(moods),
    description: getRandomItem(descriptions.vertical),
    trailer: sampleVideoUrl,
    featured: index < 3,
    festivalWinner: index % 4 === 0,
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
    // Get auth token
    const token = await getAuthToken();

    let successCount = 0;
    let failureCount = 0;

    console.log('\n📽️  Creating 20 short films...');
    for (let i = 0; i < 20; i++) {
      try {
        const content = generateShortFilmContent(i);
        if (i === 0) {
          console.log('Sample short film payload:', JSON.stringify(content, null, 2));
        }
        await uploadContent(token, content);
        console.log(`  ✓ Short film ${i + 1}/20: "${content.title}"`);
        successCount++;
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`  ✗ Short film ${i + 1}/20 failed:`, error.response?.data?.message || error.message);
        failureCount++;
      }
    }

    console.log('\n📺 Creating 20 vertical series...');
    for (let i = 0; i < 20; i++) {
      try {
        const content = generateVerticalSeriesContent(i);
        if (i === 0) {
          console.log('Sample vertical series payload:', JSON.stringify(content, null, 2));
        }
        await uploadContent(token, content);
        console.log(`  ✓ Vertical series ${i + 1}/20: "${content.title}"`);
        successCount++;
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`  ✗ Vertical series ${i + 1}/20 failed:`, error.response?.data?.message || error.response?.data || error.message);
        failureCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✓ Successfully uploaded: ${successCount} content items`);
    if (failureCount > 0) {
      console.log(`✗ Failed: ${failureCount} content items`);
    }
    console.log('='.repeat(50));

  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

main();
