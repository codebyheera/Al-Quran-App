/**
 * scripts/download-surahs.js
 * Downloads all 114 Surah JSON data payloads from the live Quran API
 * and saves them locally in frontend/src/data/surahs/<englishName>.json.
 * This runs as part of development or once to populate/cache data for the build process.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cacheDir = path.resolve(__dirname, '../src/data/surahs');

const API_BASE = process.env.VITE_API_URL || 'https://api.alquranhub.org';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client
      .get(url, { timeout: 15000 }, (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          res.resume();
          reject(new Error(`Request to ${url} failed with status ${res.statusCode}`));
          return;
        }
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (err) {
            reject(err);
          }
        });
      })
      .on('error', reject)
      .on('timeout', function () {
        this.destroy(new Error(`Request to ${url} timed out`));
      });
  });
}

async function fetchJsonWithRetry(url, retries = 5, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetchJson(url);
    } catch (err) {
      if (i === retries - 1) throw err;
      const backoff = delay * Math.pow(2, i);
      console.warn(`[Retry] Fetch failed for ${url}. Retrying in ${backoff}ms... (${err.message})`);
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
}

async function main() {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  console.log(`Fetching Surah list from ${API_BASE}/api/surah ...`);
  let surahs = [];
  try {
    surahs = await fetchJsonWithRetry(`${API_BASE}/api/surah`);
    console.log(`Found ${surahs.length} Surahs to process.`);
  } catch (err) {
    console.error(`Failed to fetch Surah list: ${err.message}`);
    process.exit(1);
  }

  for (let i = 0; i < surahs.length; i++) {
    const s = surahs[i];
    const filePath = path.join(cacheDir, `${s.englishName}.json`);

    // Only download if file is missing
    if (fs.existsSync(filePath)) {
      console.log(`[${i + 1}/114] Cache exists for Surah ${s.number} (${s.englishName}), skipping.`);
      continue;
    }

    console.log(`[${i + 1}/114] Downloading Surah ${s.number} (${s.englishName})...`);
    try {
      const fullSurah = await fetchJsonWithRetry(`${API_BASE}/api/surah/${s.number}?reciter=alafasy`);
      fs.writeFileSync(filePath, JSON.stringify(fullSurah, null, 2), 'utf-8');
      // Gentle spacing between requests to be polite to the server
      await new Promise((resolve) => setTimeout(resolve, 200));
    } catch (err) {
      console.error(`❌ Failed to download Surah ${s.number} (${s.englishName}): ${err.message}`);
      process.exit(1);
    }
  }

  console.log('✅ All 114 Surah JSON data payloads successfully cached!');
}

main().catch((err) => {
  console.error('Download failed:', err);
  process.exit(1);
});
