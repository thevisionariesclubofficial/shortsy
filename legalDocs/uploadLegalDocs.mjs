#!/usr/bin/env node
/**
 * uploadLegalDocs.js
 * ------------------
 * Uploads all HTML files from the legalDocs/ folder to Firebase Storage
 * under the path: legal/<filename>
 *
 * Usage:
 *   node uploadLegalDocs.js
 *
 * Prerequisites:
 *   npm install firebase dotenv   (run from this directory)
 *
 * Environment variables (create a .env file here or export them):
 *   FIREBASE_API_KEY
 *   FIREBASE_AUTH_DOMAIN
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_STORAGE_BUCKET
 *   FIREBASE_MESSAGING_SENDER_ID
 *   FIREBASE_APP_ID
 */

import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { readFileSync, readdirSync } from 'fs';
import { resolve, join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Firebase config ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            process.env.FIREBASE_API_KEY            || 'YOUR_API_KEY',
  authDomain:        process.env.FIREBASE_AUTH_DOMAIN        || 'shortsy-7c19f.firebaseapp.com',
  projectId:         process.env.FIREBASE_PROJECT_ID         || 'shortsy-7c19f',
  storageBucket:     process.env.FIREBASE_STORAGE_BUCKET     || 'shortsy-7c19f.firebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId:             process.env.FIREBASE_APP_ID             || '',
};

const app     = initializeApp(firebaseConfig);
const storage = getStorage(app);

// ─── Upload logic ─────────────────────────────────────────────────────────────
const LEGAL_DOCS_DIR = resolve(__dirname, 'legalDocs');

async function uploadFile(filePath, storagePath) {
  const fileBuffer = readFileSync(filePath);
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, fileBuffer, {
    contentType: 'text/html; charset=utf-8',
    cacheControl: 'public, max-age=86400',
  });

  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

async function main() {
  console.log('\n📁 Scanning legalDocs/ folder...\n');

  const files = readdirSync(LEGAL_DOCS_DIR).filter(f => extname(f) === '.html');

  if (files.length === 0) {
    console.error('❌ No HTML files found in legalDocs/');
    process.exit(1);
  }

  const results = {};

  for (const file of files) {
    const filePath    = join(LEGAL_DOCS_DIR, file);
    const storagePath = `legal/${file}`;
    process.stdout.write(`  ⬆️  Uploading ${file}...`);

    try {
      const url = await uploadFile(filePath, storagePath);
      results[file] = url;
      console.log(' ✅');
      console.log(`     → ${url}\n`);
    } catch (err) {
      console.log(' ❌');
      console.error(`     Error: ${err.message}\n`);
    }
  }

  // ─── Print legalLinks.ts snippet ────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────────────────────────');
  console.log('📋 Copy the URLs below into src/constants/legalLinks.ts:\n');
  console.log('export const LEGAL_LINKS = {');
  for (const [file, url] of Object.entries(results)) {
    const key = basename(file, '.html')
      .replace(/-([a-z])/g, (_, c) => c.toUpperCase()); // kebab → camelCase
    console.log(`  ${key}: '${url}',`);
  }
  console.log('};\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
