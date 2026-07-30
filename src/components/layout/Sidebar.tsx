import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Ghost, Plus, MessageSquare, Clock,
  Bell, User, Settings
} from 'lucide-react';
import soulzinhoWebm from '../../assets/soulzinho-animacao-ofical-tela-inicial.webm';
import { cn } from '../../utils/cn';
import { useTranslation } from '../../i18n';
import { NotificationsPanel } from './NotificationsPanel';

export function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation('common');

  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const mainNavItems = [
    { icon: Home,          label: t('nav.feed'),       path: '/feed' },
    { icon: Ghost,         label: t('nav.soults'),     path: '/soults' },
    { icon: MessageSquare, label: t('nav.messages'),   path: '/messages' },
    { icon: Clock,         label: t('nav.screentime'), path: '/screentime' },
    { icon: Bell,          label: 'Notificações',      path: '/notifications' },
    { icon: User,          label: 'Perfil',            path: '/profile' },
  ];

  return (
    <aside className="hidden lg:flex flex-col h-screen w-20 sticky top-0 bg-background border-r border-white/[0.06] z-30 select-none py-7 items-center justify-between relative">
      <div className="flex flex-col items-center gap-1 w-full px-2">
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
            const isNotif = item.path === '/notifications';
            const highlighted = active || (isNotif && isNotifOpen);

            return (
              <button
                key={item.path}
                onClick={() => {
                  if (isNotif) {
                    setIsNotifOpen((prev) => !prev);
                  } else {
                    setIsNotifOpen(false);
                    navigate(item.path);
                  }
                }}
                title={item.label}
                className={cn(
                  'w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-200 group relative',
                  highlighted
                    ? 'bg-white text-background shadow-lg'
                    : 'text-textSecondary hover:text-white hover:bg-white/[0.08]'
                )}
              >
                <Icon
                  className="w-5 h-5 transition-transform group-hover:scale-110"
                  strokeWidth={highlighted ? 2.5 : 1.75}
                />
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => navigate('/create')}
          title="Criar Post"
          className="mt-4 w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 text-white hover:bg-white/15 transition-all border border-white/10 active:scale-95"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Rodapé - Apenas Configurações */}
      <div className="flex flex-col items-center gap-1 w-full px-2 pt-4 border-t border-white/[0.06]">
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
      </div>

      <NotificationsPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </aside>
  );
}