/**
 * lib/sentry.js — Sentry error monitoring for the browser app.
 * Imported first in main.jsx. Only active in production builds with
 * VITE_SENTRY_DSN set, so `npm run dev` and local previews without the DSN
 * don't report anything.
 */

import * as Sentry from '@sentry/react';

const dsn = import.meta.env.VITE_SENTRY_DSN;

// Tag events by where the build is running, so a local `npm run preview` or a
// Vercel preview deploy doesn't mix with real visitors' errors in Sentry.
function getEnvironment() {
  if (typeof window === 'undefined') return 'build';
  const host = window.location.hostname;
  if (host === 'alquranhub.org' || host === 'www.alquranhub.org') return 'production';
  if (host.endsWith('.vercel.app')) return 'preview';
  return 'local';
}

Sentry.init({
  dsn,
  enabled: import.meta.env.PROD && Boolean(dsn),
  environment: getEnvironment(),
  // Errors only — no performance tracing or session replay (smaller bundle,
  // stays within the free quota).
  tracesSampleRate: 0,
  sendDefaultPii: false,

  // Noise that isn't a bug in this app — keeps the Issues list actionable.
  ignoreErrors: [
    // Harmless browser layout warning, fires on many sites.
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    // Visitor's connection dropped mid-request (offline, flaky mobile data).
    'Failed to fetch',
    'NetworkError when attempting to fetch resource',
    'Load failed',
    'Network Error',
    // A lazy page chunk from an older deploy no longer exists after a new
    // deploy; the visitor just needs a refresh.
    /Failed to fetch dynamically imported module/,
    /Importing a module script failed/,
    // Autoplay blocked / audio interrupted by the browser or the visitor.
    /play\(\) request was interrupted/,
    /The play\(\) request was interrupted/,
    'NotAllowedError',
    'AbortError',
  ],
  // Errors thrown by browser extensions injected into the page.
  denyUrls: [
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
    /^safari-(web-)?extension:\/\//,
  ],
});
