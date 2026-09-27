import { useState, useEffect, useRef } from 'react';
import { BottomNav } from '../../components/layout/BottomNav';
import { Sidebar } from '../../components/layout/Sidebar';
import { SoultList } from '../../components/soults/SoultList';
import { soultService, type Soult } from '../../services/soultService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getHttpErrorMessage } from '../../services/api';
import { Bell, X } from 'lucide-react';
import { NotificationsPanel } from '../../components/layout/NotificationsPanel';
import { useNotificationCount } from '../../hooks/useNotificationCount';

export default function SoulsPage() {
  const navigate = useNavigate();
  const [soults, setSoults] = useState<Soult[]>([]);
  const [loading, setLoading] = useState(true);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const requestKeyRef = useRef('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = useNotificationCount();
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const targetVideo = searchParams.get('video');
  const category = searchParams.get('category')?.trim().toLowerCase() || null;

  useEffect(() => {
    let cancelled = false;
    requestKeyRef.current = `${category || ''}:${targetVideo || ''}`;
    loadingMoreRef.current = false;
    hasMoreRef.current = false;
    pageRef.current = 1;
    setLoading(true);
    setError('');
    const load = async () => {
      try {
        const result = await soultService.getSoultsPage(0, 15, category);
        const list = result.items;
        if (!category && targetVideo && !list.some(soult => soult.id === targetVideo)) {
          try {
            const selected = await soultService.getSoult(targetVideo);
            list.unshift(selected);
          } catch { }
        }
        if (!cancelled) { setSoults(list); hasMoreRef.current = !result.last; }
      } catch (cause) {
        if (!cancelled) setError(getHttpErrorMessage(cause));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [targetVideo, category]);

  const loadMore = async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;
    loadingMoreRef.current = true;
    const requestKey = requestKeyRef.current;
    try {
      const result = await soultService.getSoultsPage(pageRef.current, 15, category);
      if (requestKey !== requestKeyRef.current) return;
      pageRef.current += 1;
      hasMoreRef.current = !result.last;
      setSoults(previous => {
        const seen = new Set(previous.map(soult => soult.id));
        return [...previous, ...result.items.filter(soult => !seen.has(soult.id))];
      });
    } catch { hasMoreRef.current = false; }
    finally { loadingMoreRef.current = false; }
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col lg:flex-row relative overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col items-center justify-center min-w-0 relative">
        <div className="absolute top-6 left-4 right-4 z-50 lg:hidden flex items-center justify-between pointer-events-none">
          {category ? <button type="button" onClick={() => navigate('/soults')} aria-label="Mostrar todos os Soults" className="pointer-events-auto flex items-center gap-2 text-lg font-semibold text-white"><span>#{category}</span><X size={16} className="text-white/60" /></button>
            : <h1 className="text-2xl font-bold text-white tracking-tight">soults<span className="text-white/50">.</span></h1>}
          <button type="button" onClick={() => setNotificationsOpen(true)} aria-label={`Notificações${unreadCount ? `, ${unreadCount} pendentes` : ''}`} className="pointer-events-auto relative flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white">
            <Bell size={20} />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-white text-black text-[9px] font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
        </div>

        <main className="soults-stage w-full h-full relative bg-black lg:bg-transparent">
          {category && <button type="button" onClick={() => navigate('/soults')} aria-label="Mostrar todos os Soults" className="absolute left-4 top-4 z-50 hidden items-center gap-2 rounded-xl border border-white/10 bg-black/45 px-3 py-2 text-sm text-white/85 backdrop-blur-sm hover:bg-black/65 lg:flex">#{category}<X size={14} /></button>}
          {error ? <div role="alert" className="h-full flex flex-col items-center justify-center gap-4 p-6 text-center text-white/70"><p>{error}</p><button onClick={() => window.location.reload()} className="rounded-xl bg-white px-5 py-3 text-black">Tentar novamente</button></div>
            : <SoultList key={category || 'all'} soults={soults} loading={loading} initialId={category ? null : targetVideo} onNearEnd={() => void loadMore()} emptyLabel={category ? `Nenhum Soult com #${category} por enquanto.` : undefined} />}
        </main>
      </div>

      <BottomNav />
      <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}
