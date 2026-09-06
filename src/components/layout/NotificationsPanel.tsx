import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { ArrowLeft, Bell, Check, X, Loader2 } from 'lucide-react';
import { userService } from '../../services/userService';
import type { FollowRequestResponse } from '../../services/api/types';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({
  isOpen,
  onClose,
}: NotificationsPanelProps) {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<FollowRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadRequests();
    }
  }, [isOpen]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getFollowRequests(0, 50);
      setRequests(data.content);
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenProfile = (username: string) => {
    onClose();
    navigate(`/profile/${username}`);
  };

  const handleAccept = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      setProcessingId(id);
      await userService.acceptFollowRequest(id);
      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      setProcessingId(id);
      await userService.rejectFollowRequest(id);
      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          'fixed top-0 left-0 h-[100dvh] bg-background z-[60] w-full sm:w-[400px] md:w-[440px] border-r border-white/[0.06] flex flex-col transition-transform duration-300 ease-out shadow-2xl',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-4 sm:p-6 pb-2 shrink-0 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 -ml-2 text-textSecondary hover:text-white hover:bg-white/5 rounded-xl transition-colors focus:outline-none"
              aria-label="Fechar painel"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <h2 className="text-lg sm:text-xl font-bold text-textPrimary">
              Notificações
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6">
          <h3 className="text-xs sm:text-sm font-semibold text-textSecondary uppercase tracking-wider mb-4">
            Solicitações
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-textSecondary">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-textSecondary">
              <Bell className="w-8 h-8 opacity-40 mb-2" />
              <p className="text-xs sm:text-sm">Nenhuma solicitação por aqui.</p>
              <p className="text-[11px] sm:text-xs text-textSecondary/60 mt-1 max-w-[260px]">
                Quando alguém quiser seguir você, a solicitação aparecerá aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-3 sm:gap-4 group p-2 -mx-2 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => handleOpenProfile(req.follower.username)}
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 bg-white/10 flex items-center justify-center">
                    {req.follower.profilePicture ? (
                      <img
                        src={req.follower.profilePicture}
                        alt={req.follower.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-bold">
                        {req.follower.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-textPrimary leading-snug break-words">
                      <span className="font-bold mr-1 hover:underline">
                        {req.follower.username}
                      </span>
                      <span className="text-textSecondary">
                        quer seguir você
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleReject(e, req.id)}
                      disabled={processingId === req.id}
                      className="p-2 rounded-full bg-white/5 text-textSecondary hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleAccept(e, req.id)}
                      disabled={processingId === req.id}
                      className="p-2 rounded-full bg-white text-black hover:bg-white/90 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {processingId === req.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
