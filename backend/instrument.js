/**
 * instrument.js — Sentry error monitoring for the API.
 * Imported by server.js right after 'dotenv/config' (so SENTRY_DSN is loaded)
 * and before express/routes. Without SENTRY_DSN, Sentry stays disabled, so
 * local dev and any environment that doesn't set it are unaffected.
 */

import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  // Errors only — no performance tracing (keeps usage within the free quota).
  tracesSampleRate: 0,
  sendDefaultPii: false,
});
