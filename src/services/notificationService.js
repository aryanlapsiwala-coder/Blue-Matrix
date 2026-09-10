import { ROUTES } from '../constants/routes';

export const pushCampusNotification = (userEmail, { title, desc, type = 'points', link = ROUTES.PROFILE }) => {
  if (!userEmail) return;
  const storageKey = `knowpass_notifs_${userEmail}`;
  const newNotif = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title,
    desc,
    time: 'Just now',
    unread: true,
    type,
    link,
    createdAt: new Date().toISOString(),
  };

  try {
    const saved = localStorage.getItem(storageKey);
    const existing = saved ? JSON.parse(saved) : [];
    const updated = [newNotif, ...existing].slice(0, 30);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    // Dispatch global custom event for live Navbar notification bell reactive updates
    window.dispatchEvent(
      new CustomEvent('knowpass-new-notification', {
        detail: { email: userEmail, notification: newNotif, allNotifications: updated },
      })
    );
  } catch (err) {
    console.warn('Error pushing notification:', err);
  }
};
