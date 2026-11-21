/**
 * data/notifications.js — Hardcoded in-app announcements for the header bell
 *
 * Add new announcements to the TOP of this array (newest first). The bell's
 * unread badge compares notifications[0].id against the visitor's
 * `lastReadNotificationId` in localStorage, so adding a new entry here
 * automatically brings the red dot back for everyone.
 *
 * `link` is optional — an internal route (e.g. "/surah/Al-Faatiha"). When
 * present, clicking the notification navigates there and closes the dropdown.
 */
export const notifications = [
  {
    id: '4',
    title: 'New: Sync Across Your Devices',
    message: 'Log in with Google or GitHub to keep your bookmarks, reading streak, tasbih counts and settings the same on all your devices. It\'s optional, and your profile stays private.',
    date: '2026-11-21',
    link: '/profile',
  },
  {
    id: '3',
    title: 'New: Continue Reading',
    message: 'You can now pick up right where you stopped. Just open the homepage and tap the Continue Reading card to jump back to your last ayah.',
    date: '2026-09-25',
    link: '/',
  },
];
