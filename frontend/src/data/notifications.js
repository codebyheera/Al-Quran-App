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
    id: '2',
    title: 'New: Daily Reading Streak',
    message: 'Set a daily reading goal and build your streak read any Surah or Juz to reach it. Track your progress right on the homepage.',
    date: '2026-08-14',
  },
  {
    id: '1',
    title: 'New Reciters Added',
    message: '3 new reciters have been added to Al-Quran Hub: Abdul Samad, Abdul Rahman Al-Sudais, and Saad Al-Ghamdi.',
    date: '2026-08-14',
  },
];
