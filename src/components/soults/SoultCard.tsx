import { SecureVideo } from '../ui/SecureMedia';
import { AvatarContent } from '../ui/AvatarContent';
import { useState, useRef, useEffect, useId } from 'react';
import {
  Play,
  Heart,
  Bookmark,
  MessageCircle,
  Share2,
  X,
  Send,
  Copy,
  Check,
  UserPlus,
  UserCheck,
  Pencil,
} from 'lucide-react';
import type { Soult } from '../../services/soultService';
import { soultService } from '../../services/soultService';
import { userService } from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { recordSoultPlayed } from '../../hooks/useScreenUsage';
import { getHttpErrorMessage } from '../../services/api';
import { ProfileBadge, profileNameColor } from '../profile/ProfileBadge';
import { modalBackdropClass, modalPanelClass, modalCloseClass } from '../ui/modalStyles';
import { ConfirmUnfollowModal } from '../profile/ConfirmUnfollowModal';

function timeAgo(isoDate: string): string {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d`;
  return `${Math.floor(diff / 2592000)}m`;
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

interface SoultCardProps {
  soult: Soult;
  index?: number;
  isActive?: boolean;
}

interface Comment {
  id: string;
  author: string;
  text: string;
  time: string;
}

// controla reprodução, interações, comentários e compartilhamento de um soult
export function SoultCard({ soult, isActive = true }: SoultCardProps) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const captionId = useId();
  const titleRef = useRef<HTMLParagraphElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [captionOverflows, setCaptionOverflows] = useState(false);
  const activeRef = useRef(isActive);
  activeRef.current = isActive;
  const isOwn = !!(currentUser && soult.userId && currentUser.id === soult.userId);

  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(soult.hasLiked || false);
  const [saved, setSaved] = useState(soult.saved || false);
  const [displayCaption, setDisplayCaption] = useState(soult.title === 'Sem legenda' ? '' : soult.title);
  const [displayAudience, setDisplayAudience] = useState<'PUBLIC' | 'REAL_FRIENDS' | 'PRIVATE'>(soult.audience || 'PUBLIC');
  const [editing, setEditing] = useState(false);
  const [editCaption, setEditCaption] = useState(displayCaption);
  const [editAudience, setEditAudience] = useState(displayAudience);
  const [editError, setEditError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [confirmUnfollow, setConfirmUnfollow] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const lastTapRef = useRef<number>(0);

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentsList, setCommentsList] = useState<Comment[]>(
    soult.initialComments || []
  );

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectIntent, setConnectIntent] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPauseSuggestion, setShowPauseSuggestion] = useState(false);

  useEffect(() => {
    if (!isActive) {
      videoRef.current?.pause();
      setCaptionExpanded(false);
    }
  }, [isActive]);

  useEffect(() => {
    if (captionExpanded) return;
    const elements = [titleRef.current, descriptionRef.current].filter((element): element is HTMLParagraphElement => element !== null);
    const measure = () => setCaptionOverflows(elements.some(element => element.scrollHeight > element.clientHeight + 1));
    measure();
    const observer = new ResizeObserver(measure);
    elements.forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [captionExpanded, displayCaption, soult.description]);

  useEffect(() => {
    const video = videoRef.current;
    const pauseWhenHidden = () => {
      if (document.hidden) video?.pause();
    };
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => {
      video?.pause();
      document.removeEventListener('visibilitychange', pauseWhenHidden);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    if (soult.username) {
      userService.getFollowStatus(soult.username)
        .then(r => { if (mounted) setIsFollowing(r.status === 'FOLLOWING' || r.status === 'PENDING'); })
        .catch(() => {});
    }
    return () => { mounted = false; };
  }, [soult.username]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      if (total > 0) {
        setDuration(total);
        setProgress((current / total) * 100);
      }
    }
  };

  const handleEnded = () => setPlaying(false);

  const togglePlay = () => {
    if (videoRef.current && isActive) {
      if (!videoRef.current.paused) {
        videoRef.current.pause();
      } else {
        if (videoRef.current.ended) videoRef.current.currentTime = 0;
        videoRef.current.play().then(() => {
          if (!activeRef.current) videoRef.current?.pause();
        }).catch(() => setPlaying(false));
      }
    }
  };

  const handleVideoClick = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!liked) handleLike();
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 700);
    } else {
      togglePlay();
    }
    lastTapRef.current = now;
  };

  const handleLike = async () => {
    const next = !liked;
    setLiked(next);
    try {
      if (next) await soultService.likeSoult(soult.id);
    } catch {
      setLiked(!next);
    }
  };

  const handleSaveToggle = async () => {
    const nextSaved = !saved;
    setSaved(nextSaved);
    try {
      if (nextSaved) await soultService.saveSoult(soult.id);
      else await soultService.unsaveSoult(soult.id);
      window.dispatchEvent(new Event('savedSoultsUpdated'));
    } catch {
      setSaved(!nextSaved);
    }
  };

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!soult.username) return;
    if (!isFollowing) {
      setShowConnectModal(true);
    } else {
      setConfirmUnfollow(true);
    }
  };

  const confirmFollowRemoval = async () => {
    if (!soult.username) return;
    setConfirmUnfollow(false);
    setIsFollowing(false);
    try { await userService.unfollow(soult.username); }
    catch { setIsFollowing(true); }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (videoRef.current.duration) {
      videoRef.current.currentTime = percent * videoRef.current.duration;
    }
  };

  const handleConfirmConnect = async () => {
    setShowConnectModal(false);
    setConnectIntent('');
    if (!soult.username) return;
    setIsFollowing(true);
    try {
      await userService.follow(soult.username);
    } catch {
      setIsFollowing(false);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommentsList((prev) => [
      { id: Date.now().toString(), author: 'Você', text: newComment.trim(), time: 'Agora' },
      ...prev,
    ]);
    setNewComment('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: soult.title, text: soult.description, url: window.location.href });
        setShareOpen(false);
      } catch { return; }
    } else {
      handleCopyLink();
    }
  };

  return (
    <article className="relative w-full h-full bg-black lg:bg-transparent select-none overflow-hidden flex lg:gap-4">

      <div
        className="lg:rounded-lg relative flex-1 min-w-0 h-full cursor-pointer overflow-hidden bg-black lg:border lg:border-white/10"
        onClick={handleVideoClick}
      >
        <div className="absolute inset-0 bg-neutral-950 -z-10" />

        <SecureVideo
          ref={videoRef}
          src={soult.videoUrl ? `${soult.videoUrl}#t=0.001` : undefined}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          loop
          preload="auto"
          onLoadedData={(event) => {
            const video = event.currentTarget;
            if (video.paused && video.currentTime === 0 && Number.isFinite(video.duration) && video.duration > 0) {
              video.currentTime = Math.min(0.001, video.duration / 2);
            }
            setDuration(Number.isFinite(video.duration) ? video.duration : 0);
          }}
          onPlay={() => {
            if (!activeRef.current || document.hidden) { videoRef.current?.pause(); return; }
            setPlaying(true);
            if (currentUser?.id) {
              const count = recordSoultPlayed(currentUser.id, soult.id);
              try {
                const limit = Number(localStorage.getItem(`soul:soult-limit:${currentUser.id}`));
                if (limit > 0 && count === limit) setShowPauseSuggestion(true);
              } catch { }
            }
          }}
          onPause={() => setPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />

        {showHeartAnim && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <Heart className="w-20 h-20 text-white/90 fill-white/90 animate-ping" />
          </div>
        )}
        {showPauseSuggestion && <div role="status" className="absolute left-4 right-4 top-6 z-40 rounded-xl border border-white/20 bg-black/75 p-3 text-xs text-white/90 backdrop-blur-sm" onClick={event => event.stopPropagation()}>
          <div className="flex items-start justify-between gap-2"><p>Você chegou à quantidade de Soults que escolheu para hoje. Que tal uma pausa?</p><button type="button" onClick={() => setShowPauseSuggestion(false)} aria-label="Dispensar sugestão"><X size={16} /></button></div>
        </div>}

        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-20',
            playing ? 'opacity-0 pointer-events-none' : 'opacity-100 bg-black/25'
          )}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/20 text-white shadow-sm">
            <Play className="ml-0.5 h-4 w-4 fill-white stroke-none" aria-hidden="true" />
          </span>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-3 group z-30 cursor-pointer flex items-end"
          onClick={handleProgressClick}
        >
          <div className="w-full h-1.5 group-hover:h-2.5 bg-white/20 backdrop-blur-sm transition-all relative overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-75 ease-linear rounded-r-full shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pl-4 pr-20 lg:px-4 pb-20 lg:pb-6 pt-24 flex flex-col gap-2 z-10 pointer-events-none">
          <div
            className="flex items-center gap-2.5 pointer-events-auto cursor-pointer"
            onClick={(e) => { e.stopPropagation(); navigate(`/profile/${soult.username || soult.author.id}`); }}
          >
            <div className="rounded-lg w-8 h-8 overflow-hidden bg-neutral-800 shrink-0">
              <AvatarContent src={soult.author.avatarUrl} name={soult.author.name || soult.username} imageClassName="object-top" fallbackClassName="text-xs" />
            </div>

            <div className="flex items-center gap-2">
              <span className={cn('font-semibold text-sm', profileNameColor(soult.author.profileBadge))}>{soult.author.name}</span>
              <ProfileBadge badge={soult.author.profileBadge} className="h-3.5 w-3.5" />
            </div>

            {!isOwn && (
              <button
                onClick={handleFollowToggle}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 active:scale-95 pointer-events-auto',
                  isFollowing
                    ? 'bg-white/10 text-white/70 border border-white/10'
                    : 'bg-white text-black hover:bg-white/90'
                )}
              >
                {isFollowing ? (
                  <><UserCheck className="w-3 h-3" /><span>Seguindo</span></>
                ) : (
                  <><UserPlus className="w-3 h-3" /><span>Seguir</span></>
                )}
              </button>
            )}
          </div>

          <div
            id={captionId}
            className={cn('pointer-events-auto space-y-2', captionExpanded && 'max-h-[35dvh] overflow-y-auto overscroll-contain pr-2')}
            onClick={event => event.stopPropagation()}
          >
            <p ref={titleRef} className={cn('text-white font-semibold text-sm break-words whitespace-pre-wrap', !captionExpanded && 'line-clamp-1')}>
              {displayCaption || 'Sem legenda'}
            </p>
            {soult.description && (
              <p ref={descriptionRef} className={cn('text-white/60 text-xs leading-relaxed break-words whitespace-pre-wrap', !captionExpanded && 'line-clamp-2')}>
                {soult.description}
              </p>
            )}
            {soult.category && <button type="button" onClick={() => navigate(`/soults?category=${encodeURIComponent(soult.category!)}`)} className="block text-xs font-medium text-white/50 hover:text-white/80">#{soult.category}</button>}
          </div>
          {(captionOverflows || captionExpanded) && (
            <button
              type="button"
              aria-expanded={captionExpanded}
              aria-controls={captionId}
              onClick={event => { event.stopPropagation(); setCaptionExpanded(value => !value); }}
              className="pointer-events-auto self-start text-xs font-semibold text-white/80 hover:text-white py-2"
            >
              {captionExpanded ? 'Ver menos' : 'Ver mais'}
            </button>
          )}

          <div className="flex items-end justify-between gap-3">
            <span className="text-white/30 text-[10px]">{timeAgo(soult.createdAt)}</span>
            <span className="shrink-0 text-[11px] font-semibold tabular-nums text-white/90 drop-shadow-sm">
              {formatTime(currentTime)} / {formatTime(duration || soult.duration || 0)}
            </span>
          </div>
        </div>

      </div>

        <div className="absolute bottom-40 right-3 flex flex-col gap-2.5 items-center z-20 lg:static lg:w-16 lg:shrink-0 lg:self-end lg:pb-6 lg:gap-4">
          {isOwn && <button type="button" onClick={event => { event.stopPropagation(); setEditCaption(displayCaption); setEditAudience(displayAudience); setEditError(''); setEditing(true); }} className="flex flex-col items-center gap-1" aria-label="Editar Soult"><span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/40"><Pencil size={18} /></span><span className="text-[10px] text-white/70">Editar</span></button>}
          <button
            onClick={(e) => { e.stopPropagation(); handleLike(); }}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/10 active:scale-90 transition-transform">
              <Heart
                className={cn('w-[18px] h-[18px] transition-colors', liked ? 'text-red-400 fill-red-400' : 'text-white/80')}
                strokeWidth={1.75}
              />
            </div>
            <span className="text-white/70 text-[10px] font-medium">{liked ? 'Curtido' : 'Curtir'}</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setCommentsOpen(true); }}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/10 active:scale-90 transition-transform">
              <MessageCircle className="w-[18px] h-[18px] text-white/80" strokeWidth={1.75} />
            </div>
            <span className="text-white/70 text-[10px] font-medium">Comentar</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); void handleSaveToggle(); }}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/10 active:scale-90 transition-transform">
              <Bookmark
                className="w-[18px] h-[18px] text-white/80 transition-colors"
                fill={saved ? 'currentColor' : 'none'}
                strokeWidth={1.75}
              />
            </div>
            <span className="text-white/70 text-[10px] font-medium">Salvar</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setShareOpen(true); }}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/10 active:scale-90 transition-transform">
              <Share2 className="w-[18px] h-[18px] text-white/80" strokeWidth={1.75} />
            </div>
            <span className="text-white/70 text-[10px] font-medium">Enviar</span>
          </button>
        </div>
      {editing && <div className={modalBackdropClass} onMouseDown={event => { if (event.target === event.currentTarget) setEditing(false); }}>
        <form className={modalPanelClass} role="dialog" aria-modal="true" aria-labelledby="edit-soult-title" onSubmit={async event => {
          event.preventDefault(); if (savingEdit) return; setSavingEdit(true); setEditError('');
          try { const updated = await soultService.updateSoult(soult.id, { caption: editCaption.trim(), audience: editAudience }); setDisplayCaption(updated.title === 'Sem legenda' ? '' : updated.title); setDisplayAudience(updated.audience || 'PUBLIC'); setEditing(false); }
          catch (error) { setEditError(getHttpErrorMessage(error)); }
          finally { setSavingEdit(false); }
        }}>
          <div className="relative text-center"><h2 id="edit-soult-title" className="text-xl font-bold">Editar Soult</h2><button type="button" onClick={() => setEditing(false)} aria-label="Fechar" className={modalCloseClass}><X size={20} /></button></div>
          <div className="space-y-2"><label htmlFor="edit-soult-caption" className="block text-xs text-zinc-400">Legenda</label><textarea id="edit-soult-caption" value={editCaption} onChange={event => setEditCaption(event.target.value)} maxLength={150} className="min-h-28 w-full resize-y rounded-lg border border-white/15 bg-white/[0.04] p-3 text-sm text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/40" /><p className="text-xs text-zinc-500">O vídeo permanece como foi publicado.</p></div>
          <label className="block space-y-2 text-xs text-zinc-400">Quem pode ver<select value={editAudience} onChange={event => setEditAudience(event.target.value as typeof editAudience)} className="block h-11 w-full rounded-lg border border-white/15 bg-[#1c1c1c] px-3 text-sm text-white focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/40"><option value="PUBLIC">Público</option><option value="REAL_FRIENDS">Amigos Reais</option><option value="PRIVATE">Só eu</option></select></label>
          {editError && <p role="alert" className="text-sm text-red-300">{editError}</p>}
          <div className="flex gap-3"><button type="button" onClick={() => setEditing(false)} className="soul-glass h-11 flex-1 rounded-lg text-sm font-semibold">Cancelar</button><button type="submit" disabled={savingEdit} className="h-11 flex-1 rounded-lg bg-white text-sm font-semibold text-black disabled:opacity-50">{savingEdit ? 'Salvando...' : 'Salvar'}</button></div>
        </form>
      </div>}
      {commentsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end lg:items-center justify-center lg:justify-center p-0 lg:p-4 animate-fade-in"
          onClick={() => setCommentsOpen(false)}
        >
          <div
            className="w-full max-w-lg mx-auto h-[60vh] bg-neutral-900/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl p-4 flex flex-col justify-between shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-sm font-semibold text-textPrimary tracking-wide">
                Comentários ({commentsList.length})
              </span>
              <button
                onClick={() => setCommentsOpen(false)}
                className="p-1 rounded-full text-textSecondary hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-4">
              {commentsList.length === 0 ? (
                <div className="flex justify-center py-4"><span className="text-xs text-textSecondary">Nenhum comentário.</span></div>
              ) : (
                commentsList.map((item) => (
                  <div key={item.id} className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-lg border border-white/15 bg-neutral-800 flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-xs">{item.author.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-textPrimary font-semibold text-xs truncate">{item.author}</span>
                        <span className="text-textSecondary text-[10px]">{item.time}</span>
                      </div>
                      <p className="text-textPrimary/80 text-xs mt-0.5 leading-relaxed break-words">{item.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="pt-2 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                placeholder="Escreva um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 soul-glass rounded-2xl px-4 py-2.5 text-xs text-textPrimary placeholder-textSecondary focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="w-9 h-9 rounded-2xl bg-white text-black flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/90 transition-colors shrink-0 font-bold"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {shareOpen && (
        <div
          className={modalBackdropClass}
          onClick={() => setShareOpen(false)}
        >
          <div
            className={modalPanelClass}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-soult-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative text-center">
              <h3 id="share-soult-title" className="text-xl font-bold text-white">Compartilhar Soult</h3>
              <button
                onClick={() => setShareOpen(false)}
                aria-label="Fechar"
                className={modalCloseClass}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCopyLink}
                className="soul-glass flex flex-col items-center gap-3 rounded-lg px-3 py-5 transition-colors hover:bg-white/[0.07]"
              >
                {copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
                <span className="text-xs font-semibold text-white/90">{copied ? 'Copiado!' : 'Copiar link'}</span>
              </button>

              <button
                onClick={handleNativeShare}
                className="soul-glass flex flex-col items-center gap-3 rounded-lg px-3 py-5 transition-colors hover:bg-white/[0.07]"
              >
                <Share2 className="h-5 w-5" />
                <span className="text-xs font-semibold text-white/90">Outros apps</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showConnectModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => { e.stopPropagation(); setShowConnectModal(false); }}
        >
          <div
            className="w-full max-w-sm bg-background border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white">Conexão com Propósito</h3>
              <button
                onClick={() => setShowConnectModal(false)}
                className="p-1.5 rounded-full text-textSecondary hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-textSecondary leading-relaxed">
              Por que você quer seguir <strong className="text-white">{soult.author.name}</strong>?
            </p>

            <div className="space-y-2">
              {['Me inspira', 'Amigo(a) real', 'Conteúdo útil', 'Compartilha meus valores'].map((label) => (
                <button
                  key={label}
                  onClick={() => setConnectIntent(label)}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all border',
                    connectIntent === label
                      ? 'bg-white text-black border-white'
                      : 'bg-white/[0.03] text-textSecondary border-white/08 hover:bg-white/[0.06] hover:text-white'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              disabled={!connectIntent}
              onClick={handleConfirmConnect}
              className="w-full py-3.5 bg-white text-black font-bold rounded-2xl transition-all disabled:opacity-30 hover:bg-white/90 active:scale-[0.98] text-sm shadow-lg"
            >
              Confirmar Conexão
            </button>
          </div>
        </div>
      )}
      {confirmUnfollow && soult.username && <ConfirmUnfollowModal username={soult.username} onCancel={() => setConfirmUnfollow(false)} onConfirm={() => void confirmFollowRemoval()} />}
    </article>
  );
}
