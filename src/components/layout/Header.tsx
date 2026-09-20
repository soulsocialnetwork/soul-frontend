import { SecureImage } from '../ui/SecureMedia';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logoSvg from '../../assets/logo-tipografica-soul-branca-sem-fundo.svg';
import { NotificationsPanel } from './NotificationsPanel';
import { useAuth } from '../../context/AuthContext';
import { useNotificationCount } from '../../hooks/useNotificationCount';

export function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = useNotificationCount();

  const avatarUrl = user?.profilePicture;
  const initial = user?.name?.charAt(0).toUpperCase() ?? user?.username?.charAt(0).toUpperCase() ?? '?';

  return (
    <>
      <header className="sticky top-0 z-40 glass-header lg:hidden">
        <div className="flex items-center justify-between px-5 h-16 max-w-lg mx-auto">
          <SecureImage
            src={logoSvg}
            alt="Soul"
            className="h-8 object-contain cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
            onClick={() => navigate('/feed')}
          />

          <div className="flex items-center gap-3">
            {/* Sino com badge */}
            <button
              onClick={() => setIsNotifOpen(true)}
              aria-label="Notificações"
              className="relative w-9 h-9 flex items-center justify-center rounded-full glass-pill transition-all hover:scale-105 active:scale-95"
            >
              <Bell className="w-4 h-4 text-textSecondary" strokeWidth={1.75} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-white text-black text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Avatar do usuário logado */}
            <button
              onClick={() => navigate('/profile')}
              aria-label="Perfil"
              className="soul-squircle w-9 h-9 glass-pill flex items-center justify-center transition-all hover:scale-105 active:scale-95 overflow-hidden"
            >
              {avatarUrl ? (
                <SecureImage
                  src={avatarUrl}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-textSecondary text-xs font-semibold">{initial}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <NotificationsPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
}
