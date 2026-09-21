import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const dayKey = (date = new Date()) =>
  [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
const storageKey = (id: string) => 'soul:usage:' + id;
const eventName = 'soul:usage-updated';

function readUsage(id: string): Record<string, number> {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey(id)) || '{}');
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
    return Object.fromEntries(Object.entries(data).filter((entry): entry is [string, number] =>
      /^\d{4}-\d{2}-\d{2}$/.test(entry[0]) && typeof entry[1] === 'number' && Number.isFinite(entry[1]) && entry[1] >= 0));
  } catch { return {}; }
}

// registra no navegador o tempo diário em primeiro plano para o usuário autenticado
export function ScreenUsageTracker() {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    let last = Date.now();
    let active = document.visibilityState === 'visible' && document.hasFocus();
    const sample = () => {
      const now = Date.now();
      const elapsed = Math.min(Math.max(now - last, 0), 5000);
      if (active && elapsed > 0) {
        const usage = readUsage(user.id);
        const start = now - elapsed;
        const midnight = new Date(start);
        midnight.setHours(24, 0, 0, 0);
        if (midnight.getTime() < now) {
          const previousDay = dayKey(new Date(start));
          const currentDay = dayKey(new Date(now));
          usage[previousDay] = (usage[previousDay] || 0) + midnight.getTime() - start;
          usage[currentDay] = (usage[currentDay] || 0) + now - midnight.getTime();
        } else {
          const day = dayKey(new Date(now));
          usage[day] = (usage[day] || 0) + elapsed;
        }
        const recent = Object.fromEntries(Object.entries(usage).sort(([a], [b]) => b.localeCompare(a)).slice(0, 365));
        try {
          localStorage.setItem(storageKey(user.id), JSON.stringify(recent));
          window.dispatchEvent(new Event(eventName));
        } catch { }
      }
      last = now;
      active = document.visibilityState === 'visible' && document.hasFocus();
    };
    const interval = window.setInterval(sample, 5000);
    window.addEventListener('focus', sample);
    window.addEventListener('blur', sample);
    window.addEventListener('pagehide', sample);
    document.addEventListener('visibilitychange', sample);
    return () => {
      sample();
      clearInterval(interval);
      window.removeEventListener('focus', sample);
      window.removeEventListener('blur', sample);
      window.removeEventListener('pagehide', sample);
      document.removeEventListener('visibilitychange', sample);
    };
  }, [user?.id]);
  return null;
}

export function useScreenUsage(id?: string) {
  const [usage, setUsage] = useState<Record<string, number>>({});
  useEffect(() => {
    const update = () => setUsage(id ? readUsage(id) : {});
    update();
    window.addEventListener(eventName, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(eventName, update);
      window.removeEventListener('storage', update);
    };
  }, [id]);
  return usage;
}
