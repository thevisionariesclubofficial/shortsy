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

async function fetchContentById(token, id) {
  try {
    const response = await axios.get(`${API_BASE_URL}/content/${id}`, {
      headers: {
        'Authorization': token,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching content ${id}:`, error.response?.status, error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  const contentId = process.argv[2];
  if (!contentId) {
    console.log('Usage: node fetch-content-by-id.js <contentId>');
    process.exit(1);
  }

  try {
    const token = await getAuthToken();
    console.log(`Fetching content with ID: ${contentId}...\n`);
    const content = await fetchContentById(token, contentId);
    
    console.log(JSON.stringify(content, null, 2));
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

main();
