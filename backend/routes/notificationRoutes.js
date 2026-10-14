import express from 'express';
import webpush  from 'web-push';
import * as Sentry from '@sentry/node';
import { supabase } from '../lib/supabase.js';
import { reportError } from '../lib/reportError.js';

const router = express.Router();

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL || 'admin@alquranhub.org'}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const MESSAGES = [
  { title: '📖 Daily Quran Reminder',      body: 'Read Quran today — your daily dose of peace awaits.' },
  { title: '🌙 Have you read Quran today?', body: 'Open Al-Quran Hub — free, ad-free, always.' },
  { title: '✨ A moment with the Quran',    body: "A few minutes with Allah's words can change your whole day." },
  { title: '📿 Your Daily Reminder',        body: 'Read Quran on Al-Quran Hub — built for the Ummah.' },
];

// POST /api/notifications/subscribe
router.post('/subscribe', async (req, res) => {
  const { subscription } = req.body;
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return res.status(400).json({ error: 'Invalid subscription object' });
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        endpoint: subscription.endpoint,
        p256dh:   subscription.keys.p256dh,
        auth:     subscription.keys.auth,
      },
      { onConflict: 'endpoint' }
    );

  if (error) {
    await reportError(error, { route: 'POST /api/notifications/subscribe' });
    return res.status(500).json({ error: 'Failed to save subscription' });
  }

  res.json({ success: true });
});

// Sentry Cron Monitor for the daily push — Sentry alerts if a run is missed
// (Vercel didn't call it) or fails. Keep the schedule in sync with vercel.json.
const CRON_MONITOR_SLUG = 'daily-push-notifications';
const CRON_MONITOR_CONFIG = {
  schedule: { type: 'crontab', value: '0 3 * * *' },
  timezone: 'UTC',
  checkinMargin: 10, // minutes late before it counts as missed
  maxRuntime: 5,     // minutes before an in-progress run counts as failed
};

function cronCheckIn(status, checkInId) {
  return Sentry.captureCheckIn(
    { monitorSlug: CRON_MONITOR_SLUG, status, ...(checkInId && { checkInId }) },
    CRON_MONITOR_CONFIG,
  );
}

// GET /api/notifications/cron  — called by Vercel Cron at 03:00 UTC (08:00 PKT)
router.get('/cron', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const checkInId = cronCheckIn('in_progress');

  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth');

  if (error) {
    cronCheckIn('error', checkInId);
    await reportError(error, { route: 'GET /api/notifications/cron' });
    return res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }

  const msg     = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  const payload = JSON.stringify({
    title: msg.title,
    body:  msg.body,
    icon:  '/android-chrome-192x192.png',
    url:   '/',
  });

  let sent = 0, failed = 0, deleted = 0;
  const failureReasons = {}; // non-410 push failures, "<status>: <message>" → count

  await Promise.all(
    (subscriptions || []).map(async (sub) => {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth:   sub.auth,
          },
        };
        await webpush.sendNotification(pushSubscription, payload);
        sent++;
      } catch (err) {
        failed++;
        // 410 Gone = user unsubscribed from browser; clean up stale record
        if (err.statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint);
          deleted++;
        } else {
          const reason = `${err.statusCode ?? 'no status'}: ${err.body || err.message}`.slice(0, 200);
          failureReasons[reason] = (failureReasons[reason] || 0) + 1;
        }
      }
    })
  );

  console.log(`Cron push: sent=${sent} failed=${failed} deleted=${deleted}`);

  // One summary event per run rather than one per failed subscription.
  // 410 Gone (user unsubscribed) is routine and not reported.
  const unexpectedFailures = failed - deleted;
  if (unexpectedFailures > 0) {
    await reportError(new Error(`Daily push: ${unexpectedFailures} notification(s) failed`), {
      route: 'GET /api/notifications/cron',
      level: 'warning',
      extra: { sent, failed, deleted, failureReasons },
    });
  }

  cronCheckIn('ok', checkInId);
  await Sentry.flush(2000);
  res.json({ sent, failed, deleted });
});

export default router;
