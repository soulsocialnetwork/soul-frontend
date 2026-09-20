import { useState, useEffect } from 'react';
import { BottomNav } from '../../components/layout/BottomNav';
import { Sidebar } from '../../components/layout/Sidebar';
import { SoultList } from '../../components/soults/SoultList';
import { soultService, type Soult } from '../../services/soultService';
import { useSearchParams } from 'react-router-dom';
import { getHttpErrorMessage } from '../../services/api';
import { Bell } from 'lucide-react';
import { NotificationsPanel } from '../../components/layout/NotificationsPanel';
import { useNotificationCount } from '../../hooks/useNotificationCount';

export default function SoulsPage() {
  const [soults, setSoults] = useState<Soult[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = useNotificationCount();
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const targetVideo = searchParams.get('video');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const load = async () => {
      try {
        const list = await soultService.getSoults();
        if (targetVideo && !list.some(soult => soult.id === targetVideo)) {
          try {
            const selected = await soultService.getSoult(targetVideo);
            list.unshift(selected);
          } catch { /* A removed or unavailable Soult should not hide the feed. */ }
        }
        if (!cancelled) setSoults(list);
      } catch (cause) {
        if (!cancelled) setError(getHttpErrorMessage(cause));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [targetVideo]);

  return (
    <div className="h-[100dvh] bg-background flex flex-col lg:flex-row relative overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col items-center justify-center min-w-0 relative">
        <div className="absolute top-6 left-4 right-4 z-50 lg:hidden flex items-center justify-between pointer-events-none">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            soults<span className="text-white/50">.</span>
          </h1>
          <button type="button" onClick={() => setNotificationsOpen(true)} aria-label={`Notificações${unreadCount ? `, ${unreadCount} pendentes` : ''}`} className="pointer-events-auto relative flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white">
            <Bell size={20} />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-white text-black text-[9px] font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
        </div>

        <main className="soults-stage w-full h-full relative bg-black lg:bg-transparent">
          {error ? <div role="alert" className="h-full flex flex-col items-center justify-center gap-4 p-6 text-center text-white/70"><p>{error}</p><button onClick={() => window.location.reload()} className="rounded-xl bg-white px-5 py-3 text-black">Tentar novamente</button></div>
            : <SoultList soults={soults} loading={loading} initialId={targetVideo} />}
        </main>
      </div>

      <BottomNav />
      <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}
