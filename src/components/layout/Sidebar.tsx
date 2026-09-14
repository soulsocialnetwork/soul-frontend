import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Ghost, Plus, MessageSquare, Clock,
  Bell, Settings, LogOut
} from 'lucide-react';
import soulzinhoWebm from '../../assets/soulzinho-animacao-ofical-tela-inicial.webm';
import { cn } from '../../utils/cn';
import { useTranslation } from '../../i18n';
import { NotificationsPanel } from './NotificationsPanel';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';

export function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation('common');
  const { user, logout } = useAuth();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Busca contagem de solicitações pendentes
  useEffect(() => {
    let cancelled = false;

    const fetchPending = async () => {
      try {
        const data = await userService.getFollowRequests(0, 50);
        if (!cancelled) setUnreadCount(data.content.length);
      } catch {
        // silencia
      }
    };

    fetchPending();
    const id = setInterval(fetchPending, 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const handleCloseNotif = async () => {
    setIsNotifOpen(false);
    try {
      const data = await userService.getFollowRequests(0, 50);
      setUnreadCount(data.content.length);
    } catch { /* silencia */ }
  };

  const mainNavItems = [
    { icon: Home,          label: t('nav.feed'),       path: '/feed' },
    { icon: Ghost,         label: t('nav.soults'),     path: '/soults' },
    { icon: MessageSquare, label: t('nav.messages'),   path: '/messages' },
    { icon: Clock,         label: t('nav.screentime'), path: '/screentime' },
  ];

  const avatarUrl = user?.profilePicture;
  const initial = user?.name?.charAt(0).toUpperCase() ?? user?.username?.charAt(0).toUpperCase() ?? '?';

  return (
    <aside className="hidden lg:flex flex-col h-screen w-20 sticky top-0 bg-background border-r border-white/[0.06] z-30 select-none py-7 items-center justify-between relative">
      <div className="flex flex-col items-center gap-1 w-full px-2">
        {/* Logo animado */}
        <div
          onClick={() => navigate('/feed')}
          className="cursor-pointer hover:scale-110 transition-transform mb-6 flex items-center justify-center"
          title="Soul"
        >
          <video
            src={soulzinhoWebm}
            className="w-10 h-10 object-contain drop-shadow-md"
            autoPlay loop muted playsInline
          />
        </div>

        <nav className="flex flex-col items-center gap-1 w-full">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={item.label}
                className={cn(
                  'w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-200 group relative',
                  active
                    ? 'bg-white text-background shadow-lg'
                    : 'text-textSecondary hover:text-white hover:bg-white/[0.08]'
                )}
              >
                <Icon
                  className="w-5 h-5 transition-transform group-hover:scale-110"
                  strokeWidth={active ? 2.5 : 1.75}
                />
              </button>
            );
          })}

          {/* Botão Notificações com badge */}
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            title="Notificações"
            className={cn(
              'w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-200 group relative',
              isNotifOpen
                ? 'bg-white text-background shadow-lg'
                : 'text-textSecondary hover:text-white hover:bg-white/[0.08]'
            )}
          >
            <Bell
              className="w-5 h-5 transition-transform group-hover:scale-110"
              strokeWidth={isNotifOpen ? 2.5 : 1.75}
            />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[14px] h-3.5 bg-white text-black text-[8px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </nav>

        {/* Botão Criar Post */}
        <button
          onClick={() => navigate('/create')}
          title="Criar Post"
          className="mt-4 w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white/15 transition-all border border-white/10 active:scale-95"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Rodapé — Avatar, Config, Sair */}
      <div className="flex flex-col items-center gap-2 w-full px-2 pt-4 border-t border-white/[0.06]">
        {/* Avatar do usuário logado */}
        <button
          onClick={() => navigate('/profile')}
          title={user?.username ?? 'Perfil'}
          className="w-12 h-12 rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 border border-white/10 bg-white/5 flex items-center justify-center"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-textSecondary text-sm font-bold">{initial}</span>
          )}
        </button>

        <button
          onClick={() => navigate('/settings')}
          title="Configurações"
          className={cn(
            'w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-200 group',
            pathname === '/settings'
              ? 'bg-white text-background shadow-lg'
              : 'text-textSecondary hover:text-white hover:bg-white/[0.08]'
          )}
        >
          <Settings className="w-5 h-5 transition-transform group-hover:rotate-45" strokeWidth={1.75} />
        </button>

        <button
          onClick={async () => { await logout(); navigate('/auth'); }}
          title="Sair"
          className="w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-200 group text-textSecondary hover:text-red-400 hover:bg-red-400/10"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.75} />
        </button>
      </div>

      <NotificationsPanel isOpen={isNotifOpen} onClose={handleCloseNotif} />
    </aside>
  );
}