import { SecureImage } from '../ui/SecureMedia';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { ArrowLeft, Bell, Check, X, Loader2, Heart, MessageCircle, UserPlus, CheckCircle2, MessageSquare, Ghost } from 'lucide-react';
import { userService } from '../../services/userService';
import { notificationService, notifyNotificationsUpdated, type NotificationResponse } from '../../services/notificationService';
import { getHttpErrorMessage } from '../../services/api';
import type { FollowRequestResponse } from '../../services/api/types';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'all' | 'requests';

// agrega notificações e solicitações pendentes com atualização da contagem de leitura
export function NotificationsPanel({
  isOpen,
  onClose,
}: NotificationsPanelProps) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [requests, setRequests] = useState<FollowRequestResponse[]>([]);
  const [realFriendRequests, setRealFriendRequests] = useState<{ id: string; username: string; name: string }[]>([]);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);
  const [hasMoreNotifications, setHasMoreNotifications] = useState(false);
  const [hasMoreRequests, setHasMoreRequests] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const notificationPages = useRef(1);
  const requestPages = useRef(1);
  const loaded = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const loadData = async () => {
      if (!loaded.current) setIsLoading(true);
      const [requestsResult, notificationsResult] = await Promise.allSettled([
        userService.getFollowRequests(0, 50),
        notificationService.getNotifications(0, 50),
      ]);
      const realFriendResult = await userService.getRealFriendRequests().catch(() => []);
      if (cancelled) return;
      if (requestsResult.status === 'fulfilled') {
        setRequests(previous => requestPages.current === 1 ? requestsResult.value.content : [
          ...requestsResult.value.content,
          ...previous.filter(item => !requestsResult.value.content.some(fresh => fresh.id === item.id)),
        ]);
        if (requestPages.current === 1) setHasMoreRequests(!requestsResult.value.last);
      }
      if (notificationsResult.status === 'fulfilled') {
        setNotifications(previous => notificationPages.current === 1 ? notificationsResult.value.content : [
          ...notificationsResult.value.content,
          ...previous.filter(item => !notificationsResult.value.content.some(fresh => fresh.id === item.id)),
        ]);
        if (notificationPages.current === 1) setHasMoreNotifications(!notificationsResult.value.last);
      }
      setRealFriendRequests(realFriendResult);
      setError(requestsResult.status === 'rejected' && notificationsResult.status === 'rejected'
        ? 'Não foi possível carregar as notificações. Tente novamente.'
        : requestsResult.status === 'rejected'
          ? 'Não foi possível carregar as solicitações.'
          : notificationsResult.status === 'rejected'
            ? 'Não foi possível carregar as atividades.'
            : '');
      loaded.current = true;
      setIsLoading(false);
    };
    void loadData();
    const interval = setInterval(loadData, 15_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isOpen, refreshKey]);

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    setError('');
    try {
      if (activeTab === 'requests') {
        const response = await userService.getFollowRequests(requestPages.current, 50);
        setRequests(previous => [...previous, ...response.content.filter(item => !previous.some(existing => existing.id === item.id))]);
        requestPages.current += 1;
        setHasMoreRequests(!response.last);
      } else {
        const response = await notificationService.getNotifications(notificationPages.current, 50);
        setNotifications(previous => [...previous, ...response.content.filter(item => !previous.some(existing => existing.id === item.id))]);
        notificationPages.current += 1;
        setHasMoreNotifications(!response.last);
      }
    } catch (cause) { setError(getHttpErrorMessage(cause)); }
    finally { setLoadingMore(false); }
  };

  const markAllRead = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    setError('');
    try {
      await notificationService.markAllAsRead();
      setNotifications(previous => previous.map(notification => ({ ...notification, read: true })));
      notifyNotificationsUpdated();
    } catch (cause) { setError(getHttpErrorMessage(cause)); }
    finally { setMarkingAll(false); }
  };

  const openNotification = async (notification: NotificationResponse) => {
    if (notification.type === 'FOLLOW_REQUEST') { setActiveTab('requests'); return; }
    if (!notification.read) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications(previous => previous.map(item => item.id === notification.id ? { ...item, read: true } : item));
        notifyNotificationsUpdated();
      } catch (cause) { setError(getHttpErrorMessage(cause)); }
    }
    if (notification.type === 'MESSAGE') {
      onClose();
      navigate(`/messages?conversation=${notification.referenceId || ''}`);
    } else if (notification.type === 'SOULT_LIKE') {
      onClose();
      navigate(`/soults?video=${notification.referenceId || ''}`);
    } else if ((notification.type === 'LIKE' || notification.type === 'COMMENT') && notification.referenceId) {
      handleOpenPost(notification.referenceId);
    } else {
      handleOpenProfile(notification.triggerUsername);
    }
  };

  const handleOpenProfile = (username: string) => {
    onClose();
    navigate(`/profile/${encodeURIComponent(username)}`);
  };

  const openActorProfile = async (notification: NotificationResponse) => {
    if (!notification.read) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications(previous => previous.map(item => item.id === notification.id ? { ...item, read: true } : item));
        notifyNotificationsUpdated();
      } catch { }
    }
    handleOpenProfile(notification.triggerUsername);
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
      setRefreshKey(value => value + 1);
      notifyNotificationsUpdated();
    } catch (err) {
      setError(getHttpErrorMessage(err));
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
      setRefreshKey(value => value + 1);
      notifyNotificationsUpdated();
    } catch (err) {
      setError(getHttpErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  };

  const acceptRealFriend = async (id: string) => {
    setProcessingId(id);
    try {
      await userService.acceptRealFriendRequest(id);
      setRealFriendRequests(previous => previous.filter(request => request.id !== id));
      notifyNotificationsUpdated();
    } catch (cause) { setError(getHttpErrorMessage(cause)); }
    finally { setProcessingId(null); }
  };

  const getNotificationIcon = (type: NotificationResponse['type']) => {
    switch (type) {
      case 'LIKE': return <Heart className="w-4 h-4 text-red-500 fill-red-500" />;
      case 'COMMENT': return <MessageCircle className="w-4 h-4 text-blue-500 fill-blue-500" />;
      case 'FOLLOW': return <UserPlus className="w-4 h-4 text-white" />;
      case 'FOLLOW_ACCEPTED': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'FOLLOW_REQUEST': return <UserPlus className="w-4 h-4 text-white" />;
      case 'MESSAGE': return <MessageSquare className="w-4 h-4 text-white" />;
      case 'SOULT_LIKE': return <Ghost className="w-4 h-4 text-red-400" />;
    }
  };

  const getNotificationText = (type: NotificationResponse['type']) => {
    switch (type) {
      case 'LIKE': return 'curtiu seu post';
      case 'COMMENT': return 'comentou no seu post';
      case 'FOLLOW': return 'começou a seguir você';
      case 'FOLLOW_ACCEPTED': return 'aceitou sua solicitação';
      case 'FOLLOW_REQUEST': return 'pediu para seguir você';
      case 'MESSAGE': return 'enviou uma mensagem';
      case 'SOULT_LIKE': return 'curtiu seu Soult';
    }
  };

  const formatTime = (dateString: string) => {
    const diff = Math.max(0, Math.floor((Date.now() - new Date(dateString).getTime()) / 1000));
    if (!Number.isFinite(diff)) return '';
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
            {notifications.some(notification => !notification.read && notification.type !== 'FOLLOW_REQUEST') && (
              <button onClick={markAllRead} disabled={markingAll} className="ml-auto text-xs font-semibold text-textSecondary hover:text-white disabled:opacity-50">
                {markingAll ? 'Marcando...' : 'Marcar lidas'}
              </button>
            )}
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

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {error && <div role="alert" className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error} <button onClick={() => setRefreshKey(value => value + 1)} className="underline font-semibold">Tentar novamente</button></div>}
          {activeTab === 'all' && realFriendRequests.length > 0 && (
            <div className="mb-5 space-y-2">
              <p className="px-1 text-xs font-semibold uppercase tracking-wider text-textSecondary">Amigos Reais</p>
              {realFriendRequests.map(request => (
                <div key={request.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10"><UserPlus className="h-4 w-4" /></div>
                  <p className="min-w-0 flex-1 text-xs text-textPrimary"><strong>{request.name}</strong> quer ser seu Amigo Real.</p>
                  <button type="button" disabled={processingId === request.id} onClick={() => void acceptRealFriend(request.id)} className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black disabled:opacity-50">{processingId === request.id ? '...' : 'Aceitar'}</button>
                </div>
              ))}
            </div>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-textSecondary">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : activeTab === 'requests' ? (
            requests.length === 0 && error ? null : requests.length === 0 ? (
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
                    <div className="rounded-lg w-10 h-10 sm:w-11 sm:h-11 overflow-hidden shrink-0 bg-neutral-800 flex items-center justify-center">
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
                        aria-label={`Rejeitar solicitação de ${req.follower.username}`}
                        onClick={(e) => handleReject(e, req.id)}
                        disabled={processingId === req.id}
                        className="p-2 rounded-full bg-white/5 text-textSecondary hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        aria-label={`Aceitar solicitação de ${req.follower.username}`}
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
                {hasMoreRequests && <button onClick={loadMore} disabled={loadingMore} className="w-full rounded-xl border border-white/10 py-3 text-sm text-textSecondary hover:text-white disabled:opacity-50">{loadingMore ? 'Carregando...' : 'Ver mais solicitações'}</button>}
              </div>
            )
          ) : (
            notifications.length === 0 && error ? null : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-textSecondary">
                <Bell className="w-8 h-8 opacity-40 mb-2" />
                <p className="text-xs sm:text-sm">Nenhuma notificação por aqui.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div role="button" tabIndex={0}
                    key={notif.id}
                    className={cn(
                      "w-full text-left flex items-center gap-3 sm:gap-4 group p-3 -mx-2 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer",
                      !notif.read && "bg-white/[0.03]"
                    )}
                    onClick={() => { void openNotification(notif); }}
                    onKeyDown={event => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); void openNotification(notif); } }}
                  >
                    <button type="button" aria-label={`Abrir perfil de ${notif.triggerUsername}`} onClick={event => { event.stopPropagation(); void openActorProfile(notif); }} className="relative shrink-0">
                      <div className="rounded-lg w-10 h-10 sm:w-11 sm:h-11 overflow-hidden shrink-0 bg-neutral-800 flex items-center justify-center">
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
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-textPrimary leading-snug break-words">
                        <button type="button" onClick={event => { event.stopPropagation(); void openActorProfile(notif); }} className="font-bold mr-1 hover:underline">
                          {notif.triggerUsername}
                        </button>
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
                {hasMoreNotifications && <button onClick={loadMore} disabled={loadingMore} className="w-full rounded-xl border border-white/10 py-3 text-sm text-textSecondary hover:text-white disabled:opacity-50">{loadingMore ? 'Carregando...' : 'Ver notificações anteriores'}</button>}
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
