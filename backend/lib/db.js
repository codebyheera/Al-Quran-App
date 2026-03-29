/**
 * lib/db.js — PostgreSQL connection pool (ESM)
 * Connects directly to Supabase PostgreSQL using the DATABASE_URL connection string.
 */

import pkg from 'pg';
const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in environment variables!');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Supabase hosted PostgreSQL
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('⚠️ Unexpected error on idle client:', err.message);
});

// Test connection on startup
pool.query('SELECT 1').then(() => {
  console.log('✅ Connected to Supabase PostgreSQL');
}).catch((err) => {
  console.error('❌ Failed to connect to Supabase PostgreSQL:', err.message);
});

export default pool;
