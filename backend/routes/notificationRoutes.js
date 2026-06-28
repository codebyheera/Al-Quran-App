import express from 'express';
import webpush  from 'web-push';
import { supabase } from '../lib/supabase.js';

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
  if (!subscription?.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription object' });
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      { endpoint: subscription.endpoint, subscription: JSON.stringify(subscription) },
      { onConflict: 'endpoint' }
    );

  if (error) {
    console.error('Subscribe DB error:', error.message);
    return res.status(500).json({ error: 'Failed to save subscription' });
  }

  res.json({ success: true });
});

// GET /api/notifications/cron  — called by Vercel Cron at 03:00 UTC (08:00 PKT)
router.get('/cron', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, subscription');

  if (error) {
    console.error('Cron fetch error:', error.message);
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

  await Promise.all(
    (subs || []).map(async (row) => {
      try {
        const sub = typeof row.subscription === 'string'
          ? JSON.parse(row.subscription)
          : row.subscription;
        await webpush.sendNotification(sub, payload);
        sent++;
      } catch (err) {
        failed++;
        // 410 Gone = user unsubscribed from browser; clean up stale record
        if (err.statusCode === 410) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', row.endpoint);
          deleted++;
        }
      }
    })
  );

  console.log(`Cron push: sent=${sent} failed=${failed} deleted=${deleted}`);
  res.json({ sent, failed, deleted });
});

export default router;
