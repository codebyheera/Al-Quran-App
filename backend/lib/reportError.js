/**
 * lib/reportError.js — Send an error a route caught (and answered itself) to Sentry.
 *
 * Errors that reach Express are reported by Sentry.setupExpressErrorHandler in
 * server.js, but most routes catch their own errors and reply with a 500/502,
 * so those never get there. Call this from such a catch block:
 *
 *   } catch (err) {
 *     await reportError(err, { route: 'GET /api/surah/:id', extra: { id } });
 *     res.status(500).json({ ... });
 *   }
 *
 * Tags each event with `route` so issues can be filtered per endpoint in
 * Sentry. `level: 'warning'` is for failures of third-party APIs the route
 * recovers from or can't fix (audio CDN, Aladhan, Groq web fallback).
 *
 * Awaiting it waits (up to 2s) for the event to be sent — Vercel can freeze the
 * function as soon as the response goes out. No-op when SENTRY_DSN is unset.
 */

import * as Sentry from '@sentry/node';

export async function reportError(err, { route, level = 'error', extra } = {}) {
  console.error(`[${route}]`, err?.message ?? err);
  Sentry.withScope((scope) => {
    if (route) scope.setTag('route', route);
    scope.setLevel(level);
    if (extra) scope.setContext('details', extra);
    if (err instanceof Error) {
      Sentry.captureException(err);
    } else {
      // Supabase returns plain { message, code, details, hint } objects, which
      // Sentry would show as "Object captured as exception" — wrap them.
      const { message, code, details, hint } = err ?? {};
      scope.setContext('supabase_error', { code, details, hint });
      if (code) scope.setTag('db_error_code', code);
      Sentry.captureException(new Error(message || String(err)));
    }
  });
  await Sentry.flush(2000);
}
