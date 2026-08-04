import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { ArrowLeft, Bell, UserPlus, UserCheck, Settings } from 'lucide-react';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mocks com comentários naturais de rede social, sem emojis e sem papo de dev
const NOTIFICATIONS = [
  {
    id: 1,
    type: 'follow',
    user: 'matheus.dev',
    text: 'começou a seguir você.',
    time: 'Há 5 min',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    following: false,
  },
  {
    id: 2,
    type: 'comment',
    user: 'carolina_lima',
    text: 'comentou: "Nossa, que lugar sensacional! Onde fica isso?"',
    time: 'Há 42 min',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
    following: false,
  },
  {
    id: 3,
    type: 'like',
    user: 'lucas_moura',
    text: 'curtiu sua publicação.',
    time: 'Há 2 horas',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    following: true,
  },
  {
    id: 4,
    type: 'follow',
    user: 'beatriz.design',
    text: 'começou a seguir você.',
    time: 'Ontem às 18:30',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    following: false,
  },
  {
    id: 5,
    type: 'comment',
    user: 'gabs_ferreira',
    text: 'comentou: "Six seven! 67"',
    time: '2 de mai.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    following: false,
  },
  {
    id: 6,
    type: 'comment',
    user: 'juliana.costa',
    text: 'comentou: "Ainda fico impressionada com uma coisa dessas."',
    time: '3 de mai.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    following: true,
  },
];

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<typeof NOTIFICATIONS>(NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'follows' | 'comments'>('all');

  const handleOpenSettings = () => {
    onClose();
    navigate('/settings');
  };


  const handleToggleFollow = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, following: !notif.following } : notif
      )
    );
  };

  const handleOpenProfile = (username: string) => {
    onClose();
    navigate(`/profile/${username}`);
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'follows') return notif.type === 'follow';
    if (filter === 'comments') return notif.type === 'comment';
    return true;
  });

  return (
    <>
      {}
      <div 
        className={cn(
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )} 
        onClick={onClose} 
      />

      {}
      <div
        className={cn(
          'fixed top-0 left-0 h-[100dvh] bg-background z-[60] w-full sm:w-[400px] md:w-[440px] border-r border-white/[0.06] flex flex-col transition-transform duration-300 ease-out shadow-2xl',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {}
        <div className="p-4 sm:p-6 pb-2 shrink-0">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <button 
                onClick={onClose}
                className="p-2 -ml-2 text-textSecondary hover:text-white hover:bg-white/5 rounded-xl transition-colors focus:outline-none"
                aria-label="Fechar painel"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <h2 className="text-lg sm:text-xl font-bold text-textPrimary">Notificações</h2>
            </div>
          </div>
          
          {/* Filtros em Carrossel Horizontal */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <Button
              size="sm"
              variant={filter === 'all' ? 'primary' : 'ghost'}
              onClick={() => setFilter('all')}
              className={cn(
                'rounded-2xl shrink-0 text-xs sm:text-sm font-medium transition-all',
                filter === 'all' ? 'px-4 sm:px-5' : 'bg-white/5 hover:bg-white/10'
              )}
            >
              Tudo
            </Button>
            <Button
              size="sm"
              variant={filter === 'follows' ? 'primary' : 'ghost'}
              onClick={() => setFilter('follows')}
              className={cn(
                'rounded-2xl shrink-0 text-xs sm:text-sm font-medium transition-all',
                filter === 'follows' ? 'px-4 sm:px-5' : 'bg-white/5 hover:bg-white/10'
              )}
            >
              Conexões
            </Button>
            <Button
              size="sm"
              variant={filter === 'comments' ? 'primary' : 'ghost'}
              onClick={() => setFilter('comments')}
              className={cn(
                'rounded-2xl shrink-0 text-xs sm:text-sm font-medium transition-all',
                filter === 'comments' ? 'px-4 sm:px-5' : 'bg-white/5 hover:bg-white/10'
              )}
            >
              Comentários
            </Button>
          </div>
        </div>

        {/* Lista de Notificações */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 pt-2">
          <h3 className="text-xs sm:text-sm font-semibold text-textSecondary uppercase tracking-wider mb-4">Anteriores</h3>
          
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-textSecondary">
              <Bell className="w-8 h-8 opacity-40 mb-2" />
              <p className="text-xs sm:text-sm">Nenhuma notificação por aqui.</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {filteredNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className="flex items-center gap-3 sm:gap-4 group p-1.5 -mx-1.5 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => handleOpenProfile(notif.user)}
                >
                  {/* Foto de Perfil */}
                  <img 
                    src={notif.avatar} 
                    alt={notif.user} 
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover shrink-0 group-hover:opacity-80 transition-opacity" 
                  />
                  
                  {/* Conteúdo da Notificação */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-textPrimary leading-snug break-words">
                      <span className="font-bold mr-1 hover:underline">{notif.user}</span>
                      <span className="text-textSecondary">{notif.text}</span>
                    </p>
                    <p className="text-[11px] sm:text-xs text-textSecondary/70 mt-0.5">{notif.time}</p>
                  </div>

                  {/* Botão de Conectar */}
                  {notif.type === 'follow' && (
                    <button
                      onClick={(e) => handleToggleFollow(notif.id, e)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 focus:outline-none',
                        notif.following
                          ? 'bg-white/10 text-white hover:bg-white/20'
                          : 'bg-white text-black hover:bg-white/90 active:scale-95'
                      )}
                    >
                      {notif.following ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Conectado</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Conectar</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}