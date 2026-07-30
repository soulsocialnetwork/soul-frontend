import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logoSvg from '../../assets/logo-tipografica-soul-branca-sem-fundo.svg';
import { NotificationsPanel } from './NotificationsPanel';

export function Header() {
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <>
    <header className="sticky top-0 z-40 glass-header lg:hidden">
      <div className="flex items-center justify-between px-5 h-16 max-w-lg mx-auto">
        <img
          src={logoSvg}
          alt="Soul"
          className="h-8 object-contain cursor-pointer opacity-90 hover:opacity-100 transition-opacity"
          onClick={() => navigate('/feed')}
        />

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNotifOpen(true)}
            aria-label="Notificações"
            className="w-9 h-9 flex items-center justify-center rounded-full glass-pill transition-all hover:scale-105 active:scale-95"
          >
            <Bell className="w-4 h-4 text-textSecondary" strokeWidth={1.75} />
          </button>

          <button
            onClick={() => navigate('/profile')}
            aria-label="Perfil"
            className="w-9 h-9 rounded-2xl glass-pill flex items-center justify-center transition-all hover:scale-105 active:scale-95 overflow-hidden"
          >
            <span className="text-textSecondary text-xs font-semibold">U</span>
          </button>
        </div>
      </div>
    </header>
    
    <NotificationsPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
}
