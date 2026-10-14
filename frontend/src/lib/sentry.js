/**
 * lib/sentry.js — Sentry error monitoring for the browser app.
 * Imported first in main.jsx. Only active in production builds with
 * VITE_SENTRY_DSN set, so `npm run dev` and local previews without the DSN
 * don't report anything.
 */

import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: import.meta.env.PROD && Boolean(dsn),
  environment: import.meta.env.MODE,
  // Errors only — no performance tracing or session replay (smaller bundle,
  // stays within the free quota).
  tracesSampleRate: 0,
  sendDefaultPii: false,
});
