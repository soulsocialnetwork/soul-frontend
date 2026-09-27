import { SecureAudio, SecureImage } from '../../components/ui/SecureMedia';
import { getHttpErrorMessage } from '../../services/api';
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { Search, Send, ArrowLeft, MoreHorizontal, Plus, X, Loader2, CheckCheck, Check, Flag, ShieldBan, Trash2, Eraser, LockKeyhole, Reply, Pencil, Smile, Image, Camera, Mic, Square, Play, Pause } from 'lucide-react';
import { cn } from '../../utils/cn';
import { messageService, type Conversation, type Message } from '../../services/messageService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { notifyNotificationsUpdated } from '../../services/notificationService';
import type { ProfileSummary } from '../../services/api/types';
import { moderationService } from '../../services/moderationService';
import { StickerPicker, findSticker } from '../../components/messages/StickerPicker';
import { CameraCapture } from '../../components/ui/CameraCapture';
import { postService } from '../../services/postService';
import { AvatarContent } from '../../components/ui/AvatarContent';
import { modalBackdropClass, modalPanelClass, modalCloseClass } from '../../components/ui/modalStyles';
import { profileListRowClass } from '../../components/profile/listStyles';

function MessageStatus({ readAt, light = false }: { readAt: string | null; light?: boolean }) {
  if (!readAt) return <Check className={cn('h-3 w-3', light ? 'text-white/40' : 'text-black/40')} />;
  return <CheckCheck className={cn('h-3 w-3', light ? 'text-white/70' : 'text-black/70')} />;
}

function ConvAvatar({ conv, size = 'md' }: { conv: Conversation; size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'w-9 h-9 text-xs', md: 'w-11 h-11 text-sm', lg: 'w-14 h-14 text-base' }[size];
  return (
    <div className={cn('rounded-lg flex items-center justify-center font-bold text-white bg-neutral-800 overflow-hidden shrink-0', s)}>
      <AvatarContent src={conv.otherAvatar} name={conv.otherName || conv.otherUsername} />
    </div>
  );
}

function ChatAudio({ src, sent = false }: { src: string; sent?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const timeLabel = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  const progress = duration > 0 ? Math.min(100, currentTime / duration * 100) : 0;
  const activeColor = sent ? '#171717' : '#f5f5f5';
  const trackColor = sent ? 'rgba(23,23,23,0.2)' : 'rgba(245,245,245,0.25)';

  return <div className={cn('flex min-w-[200px] max-w-[270px] items-center gap-3 rounded-xl px-3 py-2.5', sent ? 'bg-white text-neutral-900' : 'border border-white/[0.06] bg-[#292929] text-white')}>
    <SecureAudio ref={audioRef} src={src} preload="metadata" className="hidden"
      onLoadedMetadata={event => setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0)}
      onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)}
      onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
    <button type="button" onClick={() => { const audio = audioRef.current; if (!audio) return; if (audio.paused) void audio.play().catch(() => setPlaying(false)); else audio.pause(); }}
      aria-label={playing ? 'Pausar áudio' : 'Reproduzir áudio'}
      className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors', sent ? 'bg-black/[0.09] hover:bg-black/[0.16]' : 'bg-white/[0.1] hover:bg-white/[0.18]')}>
      {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
    </button>
    <div className="relative h-9 min-w-0 flex-1">
      <input type="range" min={0} max={duration || 1} step={0.1} value={Math.min(currentTime, duration || 1)}
        onChange={event => { if (audioRef.current) audioRef.current.currentTime = Number(event.target.value); }}
        aria-label="Posição do áudio" className="soul-chat-audio-range absolute inset-x-0 top-1/2 w-full -translate-y-1/2 cursor-pointer"
        style={{ color: activeColor, background: `linear-gradient(to right, ${activeColor} ${progress}%, ${trackColor} ${progress}%)` }} />
      <div className={cn('absolute inset-x-0 bottom-0 flex justify-between text-[10px] leading-none tabular-nums', sent ? 'text-black/55' : 'text-white/55')}><span>{timeLabel(currentTime)}</span><span>{timeLabel(duration)}</span></div>
    </div>
  </div>;
}

// coordena conversas, mensagens em tempo real e ações locais sobre cada dm
export default function MessagesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const linkedConversation = searchParams.get('conversation');
  const openedFromNotification = useRef<string | null>(null);
  const { user } = useAuth();
  const [conversationError, setConversationError] = useState('');
  const [messageError, setMessageError] = useState('');
  const activeConversation = useRef<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editing, setEditing] = useState<Message | null>(null);
  const [messageMenu, setMessageMenu] = useState<{ id: string; top: number; left: number } | null>(null);
  const [deletePrompt, setDeletePrompt] = useState<{ message: Message; scope: 'me' | 'all' } | null>(null);
  const [deletingMessage, setDeletingMessage] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [favoriteStickers, setFavoriteStickers] = useState<string[]>([]);
  const [attachment, setAttachment] = useState<{ file: File; preview: string; kind: 'IMAGE' | 'AUDIO'; duration?: number } | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordStartedAtRef = useRef(0);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const discardRecordingRef = useRef(false);
  const [search, setSearch] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [olderPage, setOlderPage] = useState(1);
  const [hasOlder, setHasOlder] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const [showNewConv, setShowNewConv] = useState(false);
  const [newConvSearch, setNewConvSearch] = useState('');
  const [searchResults, setSearchResults] = useState<ProfileSummary[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [conversationMenuOpen, setConversationMenuOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'block' | 'report' | 'clear' | 'delete' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!messageMenu) return;
    const closeMenu = () => setMessageMenu(null);
    window.addEventListener('scroll', closeMenu, true);
    window.addEventListener('resize', closeMenu);
    window.addEventListener('keydown', closeOnEscape);
    function closeOnEscape(event: KeyboardEvent) { if (event.key === 'Escape') closeMenu(); }
    return () => {
      window.removeEventListener('scroll', closeMenu, true);
      window.removeEventListener('resize', closeMenu);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [messageMenu]);

  useEffect(() => {
    if (!expandedImage) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setExpandedImage(null); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [expandedImage]);

  useEffect(() => {
    try { setFavoriteStickers(JSON.parse(localStorage.getItem(`soul:favorite-stickers:${user?.id}`) || '[]')); }
    catch { setFavoriteStickers([]); }
  }, [user?.id]);

  const toggleFavoriteSticker = (id: string) => {
    setFavoriteStickers(previous => {
      const next = previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id];
      if (user?.id) localStorage.setItem(`soul:favorite-stickers:${user.id}`, JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    if (!recording) return;
    const timer = setInterval(() => setRecordingSeconds(seconds => seconds + 1), 1000);
    return () => clearInterval(timer);
  }, [recording]);

  useEffect(() => () => {
    discardRecordingRef.current = true;
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    recordingStreamRef.current?.getTracks().forEach(track => track.stop());
  }, []);

  const selectAttachment = (file: File, kind: 'IMAGE' | 'AUDIO', duration?: number) => {
    setAttachment(previous => { if (previous) URL.revokeObjectURL(previous.preview); return { file, kind, preview: URL.createObjectURL(file), duration }; });
    setEditing(null);
  };

  const removeAttachment = () => setAttachment(previous => { if (previous) URL.revokeObjectURL(previous.preview); return null; });

  const startRecording = async () => {
    if (recording || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setMessageError('A gravação de áudio não está disponível neste navegador.'); return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;
      const mimeType = ['audio/webm', 'audio/mp4'].find(type => MediaRecorder.isTypeSupported(type));
      if (!mimeType) { stream.getTracks().forEach(track => track.stop()); setMessageError('Formato de áudio não suportado.'); return; }
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      discardRecordingRef.current = false;
      setRecordingSeconds(0);
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop()); recordingStreamRef.current = null;
        setRecording(false);
        if (discardRecordingRef.current || !chunks.length) return;
        const file = new File(chunks, `audio.${mimeType.endsWith('mp4') ? 'mp4' : 'webm'}`, { type: mimeType });
        selectAttachment(file, 'AUDIO', Math.max(1, Math.round((Date.now() - recordStartedAtRef.current) / 1000)));
      };
      recordStartedAtRef.current = Date.now();
      recorder.start(); setRecording(true); setMessageError('');
    } catch { setMessageError('Não foi possível acessar o microfone.'); }
  };

  const stopRecording = (discard = false) => {
    discardRecordingRef.current = discard;
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  };

  const loadConversations = useCallback(async () => {
    setLoadingConvs(true);
    setConversationError('');
    try {
      const res = await messageService.getConversations();
      setConversations(previous => {
        const content = res.content || [];
        const open = previous.find(item => item.id === activeConversation.current);
        return open && !content.some(item => item.id === open.id) ? [open, ...content] : content;
      });
    } catch (error) {
      setConversationError(getHttpErrorMessage(error));
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await messageService.getConversations();
        setConversations(previous => {
          const content = res.content || [];
          const open = previous.find(item => item.id === activeConversation.current);
          return open && !content.some(item => item.id === open.id) ? [open, ...content] : content;
        });
        setConversationError('');
      } catch (error) { setConversationError(getHttpErrorMessage(error)); }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selected) return;
    const interval = setInterval(async () => {
      try {
        const res = await messageService.getMessages(selected.id);
        if (activeConversation.current !== selected.id) return;
        setMessages(prev => {
          const merged = new Map(prev.map(m => [m.id, m]));
          res.content.forEach(m => merged.set(m.id, m));
          return [...merged.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        });
      } catch { }
    }, 3000);
    return () => clearInterval(interval);
  }, [selected?.id]);

  useEffect(() => {
    if (!newConvSearch.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearchingUsers(true);
      try {
        const res = await userService.searchProfiles(newConvSearch.trim(), 0, 8);
        setSearchResults(res.content);
      } catch { setSearchResults([]); }
      finally { setSearchingUsers(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [newConvSearch]);

  const handleSelectConv = async (conv: Conversation) => {
    activeConversation.current = conv.id;
    setMessageMenu(null);
    setDeletePrompt(null);
    setConversationMenuOpen(false);
    setConfirmAction(null);
    setMessageError('');
    setReplyTo(null);
    setEditing(null);
    setShowEmojiPicker(false);
    stopRecording(true);
    removeAttachment();
    setSelected(conv);
    setShowMobileChat(true);
    setLoadingMsgs(true);
    setMessages([]);
    try {
      const res = await messageService.getMessages(conv.id);
      if (activeConversation.current !== conv.id) return;
      setMessages(res.content || []);
      notifyNotificationsUpdated();
      setOlderPage(1);
      setHasOlder(!res.last);
    } catch (error) {
      if (activeConversation.current === conv.id) setMessageError(getHttpErrorMessage(error));
    } finally { if (activeConversation.current === conv.id) setLoadingMsgs(false); }
    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
  };

  useEffect(() => {
    if (!linkedConversation || openedFromNotification.current === linkedConversation) return;
    openedFromNotification.current = linkedConversation;
    let cancelled = false;
    messageService.getConversation(linkedConversation)
      .then(conversation => {
        if (!cancelled) {
          setConversations(previous => previous.some(item => item.id === conversation.id) ? previous : [conversation, ...previous]);
          void handleSelectConv(conversation);
        }
      })
      .catch(cause => { if (!cancelled) setConversationError(getHttpErrorMessage(cause)); });
    return () => { cancelled = true; };
  }, [linkedConversation]);

  const loadOlder = async () => {
    if (!selected || loadingOlder || !hasOlder) return;
    const id = selected.id;
    setLoadingOlder(true);
    try {
      const res = await messageService.getMessages(id, olderPage);
      if (activeConversation.current !== id) return;
      setMessages(previous => {
        const merged = new Map(previous.map(m => [m.id, m]));
        res.content.forEach(m => merged.set(m.id, m));
        return [...merged.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      });
      setOlderPage(page => page + 1);
      setHasOlder(!res.last);
    } catch (error) { setMessageError(getHttpErrorMessage(error)); }
    finally { setLoadingOlder(false); }
  };

  const handleStartConv = async (username: string) => {
    try {
      const conv = await messageService.getOrCreateConversation(username);
      setShowNewConv(false);
      setNewConvSearch('');
      setConversations(prev => {
        const exists = prev.some(c => c.id === conv.id);
        if (exists) return prev;
        return [conv, ...prev];
      });
      handleSelectConv(conv);
    } catch (error) { setConversationError(getHttpErrorMessage(error)); }
  };

  const handleSend = async () => {
    if ((!newMsg.trim() && !attachment) || !selected || sending || recording) return;
    const content = newMsg.trim();
    const replyId = replyTo?.id;
    const editingId = editing?.id;
    setNewMsg('');
    setSending(true);
    setMessageError('');
    try {
      const msg = editingId
        ? await messageService.editMessage(selected.id, editingId, content)
        : attachment
          ? await messageService.sendAttachment(selected.id, attachment.kind, await postService.uploadMedia(attachment.file), content, replyId)
          : await messageService.sendMessage(selected.id, content, replyId);
      if (activeConversation.current === selected.id) {
        setMessages(prev => editingId ? prev.map(m => m.id === editingId ? msg : m) : prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
        setReplyTo(null);
        setEditing(null);
        removeAttachment();
      }
      if (!editingId) setConversations(prev => prev.map(c => c.id === selected.id ? { ...c, lastMessage: content || (attachment?.kind === 'AUDIO' ? 'Áudio' : 'Foto'), lastMessageAt: msg.createdAt } : c));
    } catch (error) {
      if (activeConversation.current === selected.id) {
        setMessageError(getHttpErrorMessage(error));
        setNewMsg(current => current || content);
      }
    } finally { setSending(false); }
  };

  const confirmDeleteMessage = async () => {
    if (!selected || !deletePrompt || deletingMessage) return;
    const { message: msg, scope } = deletePrompt;
    setDeletingMessage(true);
    setMessageError('');
    try {
      if (scope === 'all') {
        await messageService.deleteMessage(selected.id, msg.id);
        setMessages(prev => prev.map(item => item.id === msg.id ? { ...item, content: 'Mensagem apagada', mediaUrl: null, deletedAt: new Date().toISOString() } : item));
        setConversations(prev => prev.map(conv => conv.id === selected.id && conv.lastMessage === msg.content ? { ...conv, lastMessage: 'Mensagem apagada' } : conv));
      } else {
        await messageService.deleteMessageForMe(selected.id, msg.id);
        setMessages(previous => previous.filter(item => item.id !== msg.id));
        if (editing?.id === msg.id) setEditing(null);
      }
      if (replyTo?.id === msg.id) setReplyTo(null);
      setDeletePrompt(null);
    } catch (error) { setMessageError(getHttpErrorMessage(error)); }
    finally { setDeletingMessage(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const openMessageMenu = (msg: Message, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const canChangeForEveryone = msg.senderId === user?.id && !msg.deletedAt && Date.now() - new Date(msg.createdAt).getTime() <= 15 * 60 * 1000;
    const itemCount = 1 + Number(!msg.deletedAt) + Number(canChangeForEveryone) + Number(canChangeForEveryone && msg.kind === 'TEXT');
    const height = itemCount * 40 + 8;
    const top = rect.bottom + height + 8 <= window.innerHeight ? rect.bottom + 8 : Math.max(8, rect.top - height - 8);
    const left = Math.max(8, Math.min(window.innerWidth - 216, msg.senderId === user?.id ? rect.right - 208 : rect.left));
    setMessageMenu({ id: msg.id, top, left });
  };

  const runConversationAction = async () => {
    if (!selected || !confirmAction || actionLoading) return;
    const action = confirmAction;
    setActionLoading(true);
    setMessageError('');
    try {
      if (action === 'clear') {
        await messageService.clearMessages(selected.id);
        setMessages([]);
        setHasOlder(false);
      } else if (action === 'delete') {
        await messageService.hideConversation(selected.id);
        setConversations(previous => previous.filter(conversation => conversation.id !== selected.id));
        activeConversation.current = null;
        setSelected(null);
        setMessages([]);
        setShowMobileChat(false);
      } else if (action === 'block') {
        await messageService.blockConversationParticipant(selected.id);
        setConversations(previous => previous.filter(conversation => conversation.id !== selected.id));
        activeConversation.current = null;
        setSelected(null);
        setMessages([]);
        setShowMobileChat(false);
      } else {
        await moderationService.reportItem(selected.otherUserId, 'ACCOUNT', 'Denúncia enviada pela conversa direta.');
      }
      setConfirmAction(null);
    } catch (error) {
      setMessageError(getHttpErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (loadingOlder) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const filtered = conversations.filter(c =>
    c.otherName.toLowerCase().includes(search.toLowerCase()) ||
    c.otherUsername.toLowerCase().includes(search.toLowerCase())
  );
  const menuMessage = messages.find(message => message.id === messageMenu?.id);

  const formatTime = (iso: string | null) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col lg:flex-row overflow-hidden select-none">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Header />
        {messageError && <p role="alert" className="px-5 py-3 text-sm text-red-400">{messageError}</p>}
        <main className="flex-1 flex overflow-hidden">
          <div className={cn(
            'w-full lg:w-[340px] xl:w-[380px] flex-shrink-0 flex flex-col border-r border-white/[0.06] h-full',
            showMobileChat ? 'hidden lg:flex' : 'flex'
          )}>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Mensagens</h1>
              <button
                onClick={() => setShowNewConv(true)}
                className="w-9 h-9 rounded-xl soul-glass flex items-center justify-center text-white/50 hover:text-white transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 pb-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar conversa..."
                  className="w-full soul-glass rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pb-24 lg:pb-4">
              {conversationError && <div role="alert" className="px-5 py-3 text-sm text-red-400">
                <p>Não foi possível atualizar as conversas: {conversationError}</p>
                <button onClick={loadConversations} className="mt-2 underline">Tentar novamente</button>
              </div>}
              {loadingConvs ? (
                <div className="flex justify-center items-center h-32"><Loader2 className="w-5 h-5 animate-spin text-white/30" /></div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center px-6 gap-3">
                  <p className="text-sm text-white/30">{conversationError ? 'Conversas indisponíveis no momento' : 'Nenhuma conversa ainda'}</p>
                  <button onClick={() => setShowNewConv(true)} className="text-xs text-white/50 hover:text-white border border-white/10 px-3 py-1.5 rounded-full transition-colors">
                    Iniciar conversa
                  </button>
                </div>
              ) : (
                <div className="space-y-0.5 px-2">
                  {filtered.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConv(conv)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all duration-150',
                        selected?.id === conv.id ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04] active:bg-white/[0.06]'
                      )}
                    >
                      <ConvAvatar conv={conv} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-sm font-semibold text-white truncate">{conv.otherName}</p>
                          <span className="text-[11px] text-white/30 shrink-0 ml-2">{formatTime(conv.lastMessageAt)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-white/40 truncate">{conv.lastMessage || 'Nenhuma mensagem'}</p>
                          {conv.unreadCount > 0 && (
                            <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={cn(
            'flex-1 flex flex-col h-full relative',
            !showMobileChat && !selected ? 'hidden lg:flex' : '',
            showMobileChat ? 'flex' : 'hidden lg:flex'
          )}>
            {selected && hasOlder && <div className="flex justify-center border-b border-white/[0.06] px-4 py-2">
              <button disabled={loadingOlder} onClick={loadOlder} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/65 hover:bg-white/[0.08] hover:text-white disabled:opacity-50">
                {loadingOlder && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {loadingOlder ? 'Carregando mensagens...' : 'Carregar mensagens anteriores'}
              </button>
            </div>}
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl soul-glass flex items-center justify-center mb-5">
                  <Send className="w-6 h-6 text-white/25" strokeWidth={1.7} />
                </div>
                <h2 className="text-lg font-semibold text-white/70 mb-2">Suas mensagens</h2>
                <p className="text-white/30 max-w-[280px] text-sm leading-relaxed">
                  Selecione uma conversa ou inicie uma nova.
                </p>
                <button
                  onClick={() => setShowNewConv(true)}
                  className="mt-4 px-4 py-2 border border-white/10 rounded-xl text-sm text-white/50 hover:text-white hover:border-white/20 transition-all"
                >
                  Nova mensagem
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06] shrink-0">
                  <button
                    onClick={() => { setShowMobileChat(false); setConversationMenuOpen(false); setConfirmAction(null); }}
                    className="lg:hidden p-1.5 -ml-1.5 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-white/60" />
                  </button>
                  <button type="button" aria-label={`Abrir perfil de ${selected.otherName}`} onClick={() => navigate(`/profile/${encodeURIComponent(selected.otherUsername)}`)} className={cn('rounded-lg w-9 h-9 flex items-center justify-center font-bold overflow-hidden shrink-0', 'bg-neutral-800')}>
                    <AvatarContent src={selected.otherAvatar} name={selected.otherName || selected.otherUsername} />
                  </button>
                  <button type="button" onClick={() => navigate(`/profile/${encodeURIComponent(selected.otherUsername)}`)} className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-white leading-none">{selected.otherName}</p>
                    <p className="text-xs text-white/35 mt-0.5">@{selected.otherUsername}</p>
                  </button>
                  <button
                    type="button"
                    aria-label="Opções da conversa"
                    aria-expanded={conversationMenuOpen}
                    onClick={() => setConversationMenuOpen(open => !open)}
                    className="p-2 rounded-xl hover:bg-white/[0.05] text-white/40 hover:text-white/70 transition-all"
                  >
                    <MoreHorizontal className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                  {conversationMenuOpen && (
                    <div className="absolute right-4 top-[7.25rem] z-30 w-52 rounded-lg border border-white/10 bg-neutral-900 p-1 shadow-2xl">
                      {[
                        { id: 'block' as const, label: 'Bloquear', icon: ShieldBan, danger: true },
                        { id: 'report' as const, label: 'Denunciar', icon: Flag, danger: true },
                        { id: 'clear' as const, label: 'Limpar mensagens', icon: Eraser, danger: false },
                        { id: 'delete' as const, label: 'Apagar conversa', icon: Trash2, danger: true },
                      ].map(({ id, label, icon: Icon, danger }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => { setConversationMenuOpen(false); setConfirmAction(id); }}
                          className={cn('flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/10', danger ? 'text-red-300' : 'text-white/80')}
                        >
                          <Icon className="h-4 w-4" />{label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                  <div role="note" className="mx-auto mb-5 flex max-w-sm items-start gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs leading-relaxed text-white/50">
                    <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Esta é uma conversa privada. No acesso HTTPS, as mensagens são protegidas durante o envio. O Soul ainda não oferece criptografia de ponta a ponta.</span>
                  </div>
                  {loadingMsgs ? (
                    <div className="flex justify-center items-center h-32"><Loader2 className="w-5 h-5 animate-spin text-white/30" /></div>
                  ) : messages.length === 0 ? (
                    <div className="flex justify-center items-center h-32"><p className="text-sm text-white/20">Nenhuma mensagem ainda. Diga olá!</p></div>
                  ) : (
                    messages.map((msg, i) => {
                      const fromMe = msg.senderId === user?.id;
                      const prevSame = i > 0 && (messages[i-1].senderId === msg.senderId);
                      const sticker = !msg.deletedAt ? findSticker(msg.content) : undefined;
                      const bareMedia = !msg.deletedAt && (Boolean(sticker) || msg.kind === 'IMAGE' || msg.kind === 'AUDIO');
                      return (
                        <div key={msg.id} className={cn('group flex items-end gap-2', fromMe ? 'flex-row-reverse' : 'flex-row', !prevSame ? 'mt-2' : '')}>
                          {!fromMe && !prevSame && (
                            <div className="rounded-lg w-7 h-7 flex items-center justify-center bg-neutral-800 shrink-0 mt-auto overflow-hidden">
                              <AvatarContent src={selected.otherAvatar} name={selected.otherName || selected.otherUsername} />
                            </div>
                          )}
                          {!fromMe && prevSame && <div className="w-7 shrink-0" />}
                          <div role="button" tabIndex={0} aria-label="Abrir ações da mensagem" aria-haspopup="menu" aria-expanded={messageMenu?.id === msg.id}
                            onClick={event => {
                              if ((event.target as HTMLElement).closest('button, audio, video, a, input') || window.getSelection()?.toString()) return;
                              openMessageMenu(msg, event.currentTarget);
                            }}
                            onKeyDown={event => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); openMessageMenu(msg, event.currentTarget); } }}
                            className={cn(
                              'max-w-[72%] min-w-0 rounded-2xl text-sm leading-relaxed outline-none focus-visible:ring-1 focus-visible:ring-white/35',
                              bareMedia ? 'px-0 py-0 text-white/90' : 'px-3.5 py-2.5',
                              !bareMedia && (fromMe ? 'rounded-tr-sm bg-white text-black' : 'rounded-tl-sm bg-white/[0.06] text-white/90')
                            )}>
                            {msg.replyToMessageId && <div className={cn('mb-2 border-l-2 pl-2 text-xs line-clamp-2', fromMe && !bareMedia ? 'border-black/30 text-black/60' : 'border-white/30 text-white/50')}>{msg.replyToContent || 'Mensagem original'}</div>}
                            {sticker
                              ? <div className="flex items-start gap-1">{sticker.image ? <img src={sticker.image} alt={`Figurinha ${sticker.label}`} className="h-24 w-24 rounded-xl object-contain" /> : <span role="img" aria-label={`Figurinha ${sticker.label}`} className="text-6xl leading-none">{sticker.glyph}</span>}
                                <button type="button" onClick={() => toggleFavoriteSticker(sticker.id)} aria-label={favoriteStickers.includes(sticker.id) ? 'Remover dos favoritos' : 'Salvar figurinha nos favoritos'} className="text-lg opacity-60 hover:opacity-100">{favoriteStickers.includes(sticker.id) ? '★' : '☆'}</button></div>
                              : <>
                                {!msg.deletedAt && msg.kind === 'IMAGE' && msg.mediaUrl && <button type="button" onClick={() => setExpandedImage(msg.mediaUrl)} aria-label="Abrir foto em tela cheia" className="block cursor-zoom-in rounded-xl focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/60"><SecureImage src={msg.mediaUrl} alt="Foto enviada na conversa" className="block max-h-72 max-w-full rounded-xl object-contain" /></button>}
                                {!msg.deletedAt && msg.kind === 'AUDIO' && msg.mediaUrl && <ChatAudio src={msg.mediaUrl} sent={fromMe} />}
                                {(msg.content || msg.deletedAt) && <p className={cn(msg.deletedAt && 'italic opacity-60', bareMedia && 'mt-1.5')}>{msg.content}</p>}
                              </>}
                            <div className={cn('flex items-center gap-1 mt-1', fromMe ? 'justify-end' : 'justify-start')}>
                              {msg.editedAt && !msg.deletedAt && <span className={cn('text-[10px]', fromMe && !bareMedia ? 'text-black/40' : 'text-white/40')}>editada ·</span>}
                              <span className={cn('text-[10px]', fromMe && !bareMedia ? 'text-black/40' : 'text-white/40')}>{formatTime(msg.createdAt)}</span>
                              {fromMe && <MessageStatus readAt={msg.readAt} light={bareMedia} />}
                            </div>
                          </div>
                          {!msg.deletedAt && <button type="button" onClick={() => { setMessageMenu(null); setEditing(null); setReplyTo(msg); }} aria-label="Responder mensagem" title="Responder" className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:text-white sm:opacity-50 sm:group-hover:opacity-100"><Reply className="h-4 w-4" /></button>}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="shrink-0 px-4 py-3 pb-24 lg:pb-4 border-t border-white/[0.06]">
                  {attachment && <div className="mb-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-2.5">
                    {attachment.kind === 'IMAGE' ? <img src={attachment.preview} alt="Prévia antes do envio" className="h-16 w-16 rounded-lg object-cover" /> : <ChatAudio src={attachment.preview} sent />}
                    <span className="min-w-0 flex-1 truncate text-xs text-white/70">{attachment.kind === 'IMAGE' ? attachment.file.name : `Áudio${attachment.duration ? ` · ${attachment.duration}s` : ''}`}</span>
                    <button type="button" onClick={removeAttachment} aria-label="Remover anexo" className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white"><X size={16} /></button>
                  </div>}
                  {recording && <div className="mb-3 flex items-center justify-between rounded-xl border border-red-400/20 bg-red-400/[0.06] px-3 py-2 text-xs text-red-200"><span>Gravando áudio · {recordingSeconds}s</span><div className="flex gap-3"><button type="button" onClick={() => stopRecording(true)}>Cancelar</button><button type="button" onClick={() => stopRecording(false)} className="font-semibold">Concluir</button></div></div>}
                  {(replyTo || editing) && <div className="mb-2 flex items-center justify-between gap-2 border-l-2 border-white/40 pl-3 text-xs text-white/60">
                    <div className="min-w-0"><strong className="text-white/80">{editing ? 'Editando mensagem' : 'Respondendo mensagem'}</strong><p className="truncate">{(editing || replyTo)?.content}</p></div>
                    <button type="button" onClick={() => { setReplyTo(null); setEditing(null); setNewMsg(''); }} aria-label="Cancelar" className="p-1"><X size={16} /></button>
                  </div>}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <input ref={mediaInputRef} type="file" accept="image/png,image/jpeg,image/gif,image/webp" className="hidden" onChange={event => { const file = event.target.files?.[0]; if (file) selectAttachment(file, 'IMAGE'); event.target.value = ''; }} />
                    <button type="button" onClick={() => mediaInputRef.current?.click()} aria-label="Enviar foto da galeria" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-white/60 transition-colors hover:text-white sm:h-11 sm:w-11"><Image size={18} /></button>
                    <button type="button" onClick={() => setCameraOpen(true)} aria-label="Tirar foto" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-white/60 transition-colors hover:text-white sm:h-11 sm:w-11"><Camera size={18} /></button>
                    <button type="button" onClick={recording ? () => stopRecording(false) : () => void startRecording()} aria-label={recording ? 'Concluir áudio' : 'Gravar áudio'} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-white/60 transition-colors hover:text-white sm:h-11 sm:w-11">{recording ? <Square size={18} /> : <Mic size={18} />}</button>
                    <div className="relative shrink-0">
                      <button type="button" aria-label="Emojis e figurinhas" aria-expanded={showEmojiPicker} onClick={() => setShowEmojiPicker(value => !value)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white/60 transition-colors hover:text-white sm:h-11 sm:w-11"><Smile size={18} /></button>
                      {showEmojiPicker && <StickerPicker favorites={favoriteStickers} onToggleFavorite={toggleFavoriteSticker}
                        onEmoji={emoji => setNewMsg(value => value + emoji)}
                        onSticker={content => { setNewMsg(content); setReplyTo(null); setEditing(null); setShowEmojiPicker(false); }} />}
                    </div>
                    <div className="min-w-0 flex-1 relative">
                      <textarea
                        value={newMsg}
                        onChange={e => setNewMsg(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escreva uma mensagem..."
                        rows={1}
                        className="block h-9 min-h-9 w-full resize-none overflow-y-auto rounded-xl px-3 py-2 text-sm leading-5 text-white placeholder-white/25 soul-glass focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/30 sm:h-11 sm:min-h-11 sm:px-4 sm:py-3 max-h-32"
                      />
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={(!newMsg.trim() && !attachment) || sending || recording}
                      aria-label="Enviar mensagem"
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors sm:h-11 sm:w-11',
                        (newMsg.trim() || attachment) && !sending && !recording
                          ? 'bg-white hover:bg-white/90 text-black active:scale-95'
                          : 'bg-white/[0.04] text-white/20 cursor-not-allowed'
                      )}
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" strokeWidth={1.75} />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {messageMenu && menuMessage && createPortal(
        <div className="fixed inset-0 z-[300]" onClick={() => setMessageMenu(null)}>
          <div role="menu" aria-label="Ações da mensagem" style={{ top: messageMenu.top, left: messageMenu.left }}
            className="fixed w-52 rounded-lg border border-white/10 bg-[#242424] p-1 shadow-2xl"
            onClick={event => event.stopPropagation()}>
            {!menuMessage.deletedAt && <button type="button" role="menuitem" autoFocus onClick={() => { setMessageMenu(null); setEditing(null); setReplyTo(menuMessage); }} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm text-white/85 hover:bg-white/[0.08]"><Reply className="h-4 w-4" />Responder</button>}
            {menuMessage.senderId === user?.id && !menuMessage.deletedAt && Date.now() - new Date(menuMessage.createdAt).getTime() <= 15 * 60 * 1000 && <>
              {menuMessage.kind === 'TEXT' && <button type="button" role="menuitem" onClick={() => { setMessageMenu(null); setReplyTo(null); setEditing(menuMessage); setNewMsg(menuMessage.content); }} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm text-white/85 hover:bg-white/[0.08]"><Pencil className="h-4 w-4" />Editar</button>}
              <button type="button" role="menuitem" onClick={() => { setMessageMenu(null); setDeletePrompt({ message: menuMessage, scope: 'all' }); }} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm text-red-300 hover:bg-red-400/[0.08]"><Trash2 className="h-4 w-4" />Apagar para todos</button>
            </>}
            <button type="button" role="menuitem" autoFocus={Boolean(menuMessage.deletedAt)} onClick={() => { setMessageMenu(null); setDeletePrompt({ message: menuMessage, scope: 'me' }); }} className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm text-white/85 hover:bg-white/[0.08]"><Eraser className="h-4 w-4" />Apagar para mim</button>
          </div>
        </div>, document.body
      )}

      {deletePrompt && <div className={cn(modalBackdropClass, 'z-[310]')} onMouseDown={event => { if (event.target === event.currentTarget && !deletingMessage) setDeletePrompt(null); }}>
        <div className={modalPanelClass} role="alertdialog" aria-modal="true" aria-labelledby="delete-message-title" aria-describedby="delete-message-description">
          <div className="relative text-center"><h2 id="delete-message-title" className="text-xl font-bold">Apagar mensagem?</h2>
            <button type="button" onClick={() => setDeletePrompt(null)} disabled={deletingMessage} aria-label="Fechar" className={modalCloseClass}><X className="h-5 w-5" /></button></div>
          <p id="delete-message-description" className="text-center text-sm leading-relaxed text-zinc-400">{deletePrompt.scope === 'all' ? 'A mensagem será removida para todas as pessoas desta conversa.' : 'A mensagem será removida apenas para você.'}</p>
          {messageError && <p role="alert" className="text-center text-sm text-red-300">{messageError}</p>}
          <div className="flex gap-3"><button type="button" autoFocus disabled={deletingMessage} onClick={() => setDeletePrompt(null)} className="flex-1 rounded-lg border border-white/15 py-3 text-sm hover:bg-white/[0.06]">Cancelar</button>
            <button type="button" disabled={deletingMessage} onClick={() => void confirmDeleteMessage()} className="flex-1 rounded-lg bg-white py-3 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-50">{deletingMessage ? 'Apagando...' : 'Apagar'}</button></div>
        </div>
      </div>}

      {expandedImage && createPortal(<div className="fixed inset-0 z-[320] flex items-center justify-center bg-black/95 p-3 sm:p-8" role="dialog" aria-modal="true" aria-label="Foto da conversa em tela cheia" onClick={() => setExpandedImage(null)}>
        <button type="button" onClick={() => setExpandedImage(null)} aria-label="Fechar foto" className="absolute right-4 top-4 z-10 rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"><X className="h-5 w-5" /></button>
        <SecureImage src={expandedImage} alt="Foto da conversa em tela cheia" onClick={event => event.stopPropagation()} className="max-h-[calc(100dvh-1.5rem)] max-w-full object-contain sm:max-h-[calc(100dvh-4rem)]" />
      </div>, document.body)}

      {cameraOpen && <CameraCapture mode="photo" onClose={() => setCameraOpen(false)} onCapture={file => { selectAttachment(file, 'IMAGE'); setCameraOpen(false); }} />}

      {showNewConv && (
        <div className={cn(modalBackdropClass, 'z-[200]')} onClick={() => setShowNewConv(false)}>
          <div className={cn(modalPanelClass, 'max-h-[85dvh]')} role="dialog" aria-modal="true" aria-labelledby="new-message-title" onClick={e => e.stopPropagation()}>
            <div className="relative text-center">
              <h3 id="new-message-title" className="text-xl font-bold text-white">Nova mensagem</h3>
              <button type="button" onClick={() => setShowNewConv(false)} aria-label="Fechar" className={modalCloseClass}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              <label htmlFor="new-message-search" className="block text-xs text-zinc-400">Para quem?</label>
              <div className="relative">
                <Search aria-hidden="true" className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input id="new-message-search" autoFocus value={newConvSearch}
                  onChange={e => setNewConvSearch(e.target.value)} placeholder="Buscar usuário..."
                  className="h-11 w-full rounded-lg border border-white/15 bg-white/[0.04] pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/40" />
              </div>
            </div>
            <div className="min-h-24 space-y-2 overflow-y-auto">
                {searchingUsers ? (
                  <div className="flex justify-center py-6" role="status" aria-label="Buscando usuários"><Loader2 className="h-5 w-5 animate-spin text-zinc-400" /></div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleStartConv(u.username)}
                      className={cn(profileListRowClass, 'w-full text-left')}
                    >
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-neutral-800 text-sm">
                        <AvatarContent src={u.profilePicture} name={u.name || u.username} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{u.name}</p>
                        <p className="truncate text-xs text-zinc-400">@{u.username}</p>
                      </div>
                    </button>
                  ))
                ) : newConvSearch.trim() ? (
                  <p className="py-6 text-center text-sm text-zinc-500">Nenhum usuário encontrado</p>
                ) : <p className="py-6 text-center text-sm text-zinc-500">Busque alguém para iniciar uma conversa.</p>}
            </div>
          </div>
        </div>
      )}

      {confirmAction && selected && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Confirmar ação da conversa">
          <div className="w-full max-w-sm rounded-lg border border-white/10 bg-neutral-900 p-5 shadow-2xl">
            <h2 className="text-base font-semibold text-white">
              {confirmAction === 'clear' ? 'Limpar mensagens?' : confirmAction === 'delete' ? 'Apagar conversa?' : confirmAction === 'block' ? `Bloquear @${selected.otherUsername}?` : `Denunciar @${selected.otherUsername}?`}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              {confirmAction === 'clear'
                ? 'O histórico será ocultado somente para você. A conversa permanecerá vazia na sua lista.'
                : confirmAction === 'delete'
                  ? 'A conversa sairá apenas da sua lista. O histórico da outra pessoa não será apagado e ela poderá reaparecer com uma nova mensagem.'
                  : confirmAction === 'block'
                    ? 'Você não poderá mais trocar mensagens com esta pessoa. A conversa será removida apenas da sua lista.'
                    : 'A denúncia será enviada para a moderação. Você poderá revisar a conta antes de confirmar.'}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" disabled={actionLoading} onClick={() => setConfirmAction(null)} className="soul-glass rounded-lg px-4 py-2 text-sm text-white">Cancelar</button>
              <button type="button" disabled={actionLoading} onClick={runConversationAction} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {actionLoading ? 'Processando...' : confirmAction === 'report' ? 'Enviar denúncia' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
