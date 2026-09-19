import { SecureImage } from '../ui/SecureMedia';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { ArrowLeft, Bell, Check, X, Loader2, Heart, MessageCircle, UserPlus, CheckCircle2 } from 'lucide-react';
import { userService } from '../../services/userService';
import { notificationService, type NotificationResponse } from '../../services/notificationService';
import type { FollowRequestResponse } from '../../services/api/types';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'all' | 'requests';

export function NotificationsPanel({
  isOpen,
  onClose,
}: NotificationsPanelProps) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [requests, setRequests] = useState<FollowRequestResponse[]>([]);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isOpen) {
      loadData();
      interval = setInterval(loadData, 10_000);
      
      // Mark as read after 3 seconds of being open
      if (activeTab === 'all') {
        setTimeout(() => {
          notificationService.markAllAsRead().catch(() => {});
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }, 3000);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, activeTab]);

  const loadData = async () => {
    try {
      if (requests.length === 0 && notifications.length === 0) setIsLoading(true); // Evita flash de loading no polling
      
      const [reqData, notifData] = await Promise.all([
        userService.getFollowRequests(0, 50),
        notificationService.getNotifications(0, 50)
      ]);
      
      setRequests(reqData.content);
      setNotifications(notifData.content);
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
  
  const handleOpenPost = (postId: string) => {
    onClose();
    navigate(`/post/${postId}`);
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

  const getNotificationIcon = (type: NotificationResponse['type']) => {
    switch (type) {
      case 'LIKE': return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
      case 'COMMENT': return <MessageCircle className="w-4 h-4 text-blue-500 fill-blue-500" />;
      case 'FOLLOW': return <UserPlus className="w-4 h-4 text-white" />;
      case 'FOLLOW_ACCEPTED': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
  };

  const getNotificationText = (type: NotificationResponse['type']) => {
    switch (type) {
      case 'LIKE': return 'curtiu seu post';
      case 'COMMENT': return 'comentou no seu post';
      case 'FOLLOW': return 'começou a seguir você';
      case 'FOLLOW_ACCEPTED': return 'aceitou sua solicitação';
    }
  };

  const formatTime = (dateString: string) => {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
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
          <div className="flex items-center gap-3 mb-6">
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
          
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                "flex-1 py-2 text-sm font-semibold rounded-lg transition-colors",
                activeTab === 'all' 
                  ? "bg-white/10 text-white" 
                  : "text-textSecondary hover:text-white hover:bg-white/5"
              )}
            >
              Todas
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={cn(
                "flex-1 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2",
                activeTab === 'requests' 
                  ? "bg-white/10 text-white" 
                  : "text-textSecondary hover:text-white hover:bg-white/5"
              )}
            >
              Solicitações
              {requests.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {requests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-textSecondary">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : activeTab === 'requests' ? (
            // TAB DE SOLICITAÇÕES
            requests.length === 0 ? (
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
                        <SecureImage
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
            )
          ) : (
            // TAB TODAS NOTIFICAÇÕES
            notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-textSecondary">
                <Bell className="w-8 h-8 opacity-40 mb-2" />
                <p className="text-xs sm:text-sm">Nenhuma notificação por aqui.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      "flex items-center gap-3 sm:gap-4 group p-3 -mx-2 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer",
                      !notif.read && "bg-white/[0.03]"
                    )}
                    onClick={() => {
                      if (notif.type === 'LIKE' || notif.type === 'COMMENT') {
                        if (notif.referenceId) handleOpenPost(notif.referenceId);
                      } else {
                        handleOpenProfile(notif.triggerUsername);
                      }
                    }}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 bg-white/10 flex items-center justify-center">
                        {notif.triggerAvatarUrl ? (
                          <SecureImage
                            src={notif.triggerAvatarUrl}
                            alt={notif.triggerUsername}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-sm font-bold">
                            {notif.triggerUsername.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-background rounded-full flex items-center justify-center">
                        {getNotificationIcon(notif.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-textPrimary leading-snug break-words">
                        <span className="font-bold mr-1 hover:underline">
                          {notif.triggerUsername}
                        </span>
                        <span className="text-textSecondary">
                          {getNotificationText(notif.type)}
                        </span>
                      </p>
                      <p className="text-xs text-textSecondary mt-1">
                        {formatTime(notif.createdAt)}
                      </p>
                    </div>
                    
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
