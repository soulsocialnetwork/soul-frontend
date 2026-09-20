import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationService, NOTIFICATIONS_UPDATED_EVENT } from '../services/notificationService';

export function useNotificationCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!user) { setCount(0); return; }
    let active = true;
    const refresh = async () => {
      try {
        const value = await notificationService.getUnreadCount();
        if (active) setCount(value);
      } catch { /* Keep the last known count until the next refresh. */ }
    };
    void refresh();
    const interval = window.setInterval(refresh, 15000);
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, refresh);
    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, refresh);
    };
  }, [user?.id]);
  return count;
}
