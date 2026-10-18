import { useState, useEffect } from 'react';
import api from '../lib/api';

const VAPID_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

// Whether a subscription's applicationServerKey (an ArrayBuffer) is `key`.
function isSameKey(buffer, key) {
  const bytes = new Uint8Array(buffer);
  return bytes.length === key.length && bytes.every((b, i) => b === key[i]);
}

async function subscribeAndSave(reg) {
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly:      true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
  });
  await api.post('/api/notifications/subscribe', { subscription: sub.toJSON() });
}

export default function usePushNotification() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    navigator.serviceWorker.ready.then(async (reg) => {
      const existing = await reg.pushManager.getSubscription();
      if (!existing) return;

      // Subscribed with an older VAPID key: push services reject every send to it
      // (403), and the backend drops it — so swap it for one on the current key.
      const existingKey = existing.options?.applicationServerKey;
      if (existingKey && VAPID_KEY && Notification.permission === 'granted'
          && !isSameKey(existingKey, urlBase64ToUint8Array(VAPID_KEY))) {
        try {
          await existing.unsubscribe();
          await subscribeAndSave(reg);
        } catch (err) {
          console.error('Push re-subscribe error:', err);
          return; // left unsubscribed, so the banner can offer to subscribe again
        }
      }
      setSubscribed(true);
    });
  }, []);

  // Called AFTER permission is already granted — does SW subscribe + Supabase save
  async function subscribeUser() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      await subscribeAndSave(reg);
      setSubscribed(true);
    } catch (err) {
      console.error('Push subscribe error:', err);
    } finally {
      setLoading(false);
    }
  }

  return { permission, setPermission, subscribed, loading, subscribeUser };
}
