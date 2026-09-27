import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Home, Ghost, Plus, MessageSquare, MoreHorizontal, Settings, Clock, LogOut, X, Shield, BadgeCheck } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

const MORE_ITEMS = [
  { icon: Clock,    label: 'Tempo de Tela',  path: '/screentime', danger: false },
  { icon: Settings, label: 'Configurações',  path: '/settings',   danger: false },
  { icon: LogOut,   label: 'Sair',           path: null,          danger: true  },
];

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout, user } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      {}
      {moreOpen && (
        <>
          <div
            className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />
          <div className="fixed bottom-[68px] inset-x-0 z-[60] px-4 pb-3 animate-slide-up">
            <div className="glass-card rounded-2xl p-3 max-w-lg mx-auto space-y-1 border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between px-3 pt-2 pb-3 border-b border-white/10">
                <span className="text-sm font-semibold text-textSecondary uppercase tracking-widest">Mais opções</span>
                <button onClick={() => setMoreOpen(false)} className="text-textSecondary hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {(user?.role === 'ADMIN' || user?.role === 'MODERATOR') && (
                <button
                  onClick={() => { setMoreOpen(false); navigate('/moderation'); }}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-medium text-textPrimary hover:bg-white/[0.07]"
                >
                  <Shield className="w-5 h-5 shrink-0" strokeWidth={1.75} />
                  Central de Moderação
                </button>
              )}
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => { setMoreOpen(false); navigate('/promote'); }}
                  className="w-full flex items-center gap-4 rounded-2xl px-4 py-3.5 text-[15px] font-medium text-textPrimary hover:bg-white/[0.07]"
                >
                  <BadgeCheck className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                  Promover perfis
                </button>
              )}
              {MORE_ITEMS.map(({ icon: Icon, label, path, danger }) => (
                <button
                  key={label}
                  onClick={async () => {
                    setMoreOpen(false);
                    if (path) {
                      navigate(path);
                      return;
                    }
                    await logout();
                    navigate('/auth');
                  }}
                  className={cn(
                    'w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[15px] font-medium transition-all active:scale-[0.98]',
                    danger
                      ? 'text-red-400 hover:bg-red-500/10'
                      : 'text-textPrimary hover:bg-white/[0.07]'
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" strokeWidth={1.75} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <nav className="fixed bottom-0 inset-x-0 z-50 glass-nav lg:hidden">
        <div className="grid grid-cols-5 items-center h-[68px] px-2 max-w-lg mx-auto">
          <button
            onClick={() => navigate('/feed')}
            aria-label="Feed"
            className={cn(
              'flex items-center justify-center justify-self-center w-10 h-10 rounded-full transition-all duration-200',
              pathname === '/feed' ? 'text-textPrimary' : 'text-textSecondary hover:text-textPrimary/70'
            )}
          >
            <Home
              className={cn('w-[22px] h-[22px] transition-all', pathname === '/feed' && 'drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]')}
              strokeWidth={pathname === '/feed' ? 2 : 1.75}
            />
          </button>

          <button
            onClick={() => navigate('/soults')}
            aria-label="Soults"
            className={cn(
              'flex items-center justify-center justify-self-center w-10 h-10 rounded-full transition-all duration-200',
              pathname === '/soults' ? 'text-textPrimary' : 'text-textSecondary hover:text-textPrimary/70'
            )}
          >
            <Ghost
              className="w-[22px] h-[22px] transition-all"
              strokeWidth={pathname === '/soults' ? 2 : 1.75}
            />
          </button>

          <button
            onClick={() => navigate('/create')}
            aria-label="Criar"
            className="flex items-center justify-center justify-self-center w-12 h-12 rounded-full btn-primary-glass -mt-5 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/10"
          >
            <Plus className="w-5 h-5 text-background" strokeWidth={2.5} />
          </button>

          <button
            onClick={() => navigate('/messages')}
            aria-label="Mensagens"
            className={cn(
              'flex items-center justify-center justify-self-center w-10 h-10 rounded-full transition-all duration-200',
              pathname === '/messages' ? 'text-textPrimary' : 'text-textSecondary hover:text-textPrimary/70'
            )}
          >
            <MessageSquare
              className={cn('w-[22px] h-[22px] transition-all', pathname === '/messages' && 'drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]')}
              strokeWidth={pathname === '/messages' ? 2 : 1.75}
            />
          </button>

          <button
            onClick={() => setMoreOpen((v) => !v)}
            aria-label="Mais"
            className={cn(
              'flex items-center justify-center justify-self-center w-10 h-10 rounded-full transition-all duration-200',
              moreOpen ? 'text-textPrimary' : 'text-textSecondary hover:text-textPrimary/70'
            )}
          >
            <MoreHorizontal
              className={cn('w-[22px] h-[22px] transition-all', moreOpen && 'drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]')}
              strokeWidth={moreOpen ? 2 : 1.75}
            />
          </button>
        </div>
        <div className="h-safe-bottom" />
      </nav>
    </>
  );
}
