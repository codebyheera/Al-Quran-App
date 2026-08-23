/**
 * lib/groqClient.js — Reusable Groq chat-completion client (ESM)
 *
 * Thin wrapper around Groq's OpenAI-compatible REST API
 * (https://api.groq.com/openai/v1/chat/completions). Any feature that needs
 * an LLM call (chatbot, blog summaries, etc.) should go through this module
 * instead of hitting the API directly, so the key handling, timeout, and
 * error shape stay consistent across the app.
 *
 * Requires GROQ_API_KEY in the environment (see backend/.env.example).
 * GROQ_API_KEY_BACKUP is optional — if the primary key's request fails
 * (rate limit, quota, auth, transient 5xx), it's retried once on the
 * backup key before giving up.
 * Model defaults to GROQ_MODEL if set — check console.groq.com/docs/models
 * for the current list of supported models, since it changes over time.
 */

import axios from 'axios';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Avoid the `groq/compound*` models here — they can call tools like live web
// search, which would undermine "answer only from the provided context".
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

async function callGroq(apiKey, payload) {
  const { data } = await axios.post(GROQ_API_URL, payload, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    timeout: 20000,
  });
  return data?.choices?.[0]?.message?.content?.trim() || '';
}

/**
 * @param {Array<{role: 'system'|'user'|'assistant', content: string}>} messages
 * @param {{ model?: string, temperature?: number, maxTokens?: number }} [options]
 * @returns {Promise<string>} the assistant's reply text (empty string if none)
 */
export async function getChatCompletion(messages, options = {}) {
  const primaryKey = process.env.GROQ_API_KEY;
  const backupKey = process.env.GROQ_API_KEY_BACKUP;

  if (!primaryKey && !backupKey) {
    throw new Error('GROQ_API_KEY is missing from environment variables.');
  }

  const { model = DEFAULT_MODEL, temperature = 0.4, maxTokens = 500 } = options;
  const payload = { model, messages, temperature, max_tokens: maxTokens };

  if (!primaryKey) {
    return callGroq(backupKey, payload);
  }

  try {
    return await callGroq(primaryKey, payload);
  } catch (err) {
    if (!backupKey || backupKey === primaryKey) throw err;
    console.warn('[groqClient] Primary key failed, retrying on backup key:', err.message);
    return callGroq(backupKey, payload);
  }
}
