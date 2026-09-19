import { useState, useRef, useEffect } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import type { Soult } from '../../services/soultService';
import { soultService } from '../../services/soultService';
import { userService } from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

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
}

interface Comment {
  id: string;
  author: string;
  text: string;
  time: string;
}

export function SoultCard({ soult }: SoultCardProps) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const isOwn = !!(currentUser && soult.userId && currentUser.id === soult.userId);

  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(soult.hasLiked || false);
  const [saved, setSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
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
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        if (videoRef.current.ended) videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
      setPlaying(!playing);
    } else {
      setPlaying(!playing);
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

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!soult.username) return;
    if (!isFollowing) {
      setShowConnectModal(true);
    } else {
      setIsFollowing(false);
      try {
        await userService.unfollow(soult.username);
      } catch {
        setIsFollowing(true);
      }
    }
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
    <article className="relative w-full h-full bg-black select-none overflow-hidden flex">

      <div
        className="relative flex-1 h-full cursor-pointer overflow-hidden"
        onClick={handleVideoClick}
      >
        <div className="absolute inset-0 bg-neutral-950 -z-10" />

        <video
          ref={videoRef}
          src={`${soult.videoUrl}#t=0.001`}
          poster={soult.thumbnailUrl || undefined}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          loop
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />

        {showHeartAnim && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <Heart className="w-20 h-20 text-white/90 fill-white/90 animate-ping" />
          </div>
        )}

        <div className="absolute top-4 right-4 z-20 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
            <span className="text-white/90 text-[11px] font-semibold tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration || soult.duration || 0)}
            </span>
          </div>
        </div>

        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-20',
            playing ? 'opacity-0 pointer-events-none' : 'opacity-100 bg-black/10'
          )}
        >
          <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <Play className="w-5 h-5 text-white ml-0.5 fill-white stroke-none" />
          </div>
        </div>

        {/* Barra de progresso branca e interativa */}
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

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent px-4 pb-20 lg:pb-6 pt-24 flex flex-col gap-2 z-10 pointer-events-none">
          <div
            className="flex items-center gap-2.5 pointer-events-auto cursor-pointer"
            onClick={(e) => { e.stopPropagation(); navigate(`/profile/${soult.username || soult.author.id}`); }}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 shrink-0">
              {soult.author.avatarUrl ? (
                <img src={soult.author.avatarUrl} alt={soult.author.name} className="w-full h-full object-cover object-top" />
              ) : (
                <div className="w-full h-full bg-white/15 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{soult.author.name.charAt(0)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm">{soult.author.name}</span>
              {soult.author.verified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-white/70 shrink-0" strokeWidth={2.5} />
              )}
            </div>

            {/* Só mostra o botão Seguir se não for o próprio usuário */}
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

          <p className="text-white font-semibold text-sm line-clamp-1 pointer-events-auto cursor-pointer"
            onClick={(e) => { e.stopPropagation(); navigate(`/profile/${soult.username || soult.author.id}`); }}>
            {soult.title}
          </p>

          {soult.description && (
            <p className="text-white/60 text-xs leading-relaxed line-clamp-2 pointer-events-auto cursor-pointer"
              onClick={(e) => { e.stopPropagation(); navigate(`/profile/${soult.username || soult.author.id}`); }}>
              {soult.description}
            </p>
          )}

          <span className="text-white/30 text-[10px]">{timeAgo(soult.createdAt)}</span>
        </div>

        <div className="absolute bottom-32 lg:bottom-20 right-3 flex flex-col gap-4 items-center z-20">
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
            onClick={(e) => { e.stopPropagation(); setSaved((s) => !s); }}
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
      </div>

      {/* Modal / Drawer de Comentários */}
      {commentsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end lg:items-center justify-center lg:justify-center p-0 lg:p-4 animate-fade-in"
          onClick={() => setCommentsOpen(false)}
        >
          <div
            className="w-full lg:max-w-md h-[70vh] lg:h-[550px] bg-background border-t lg:border border-white/10 rounded-t-3xl lg:rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-white" />
                <h3 className="text-base font-bold text-white">
                  Comentários {commentsList.length > 0 && `(${commentsList.length})`}
                </h3>
              </div>
              <button
                onClick={() => setCommentsOpen(false)}
                className="p-1.5 rounded-full text-textSecondary hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 no-scrollbar">
              {commentsList.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-textSecondary mb-3 border border-white/10">
                    <MessageCircle className="w-6 h-6 opacity-40" />
                  </div>
                  <p className="text-sm font-medium text-white/80">Nenhum comentário ainda</p>
                  <p className="text-xs text-textSecondary mt-1">Seja o primeiro a deixar uma mensagem!</p>
                </div>
              ) : (
                commentsList.map((item) => (
                  <div key={item.id} className="flex gap-3 items-start group">
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-xs">{item.author.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0 bg-white/[0.03] border border-white/5 p-3 rounded-2xl">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-semibold text-white truncate">{item.author}</span>
                        <span className="text-[10px] text-textSecondary">{item.time}</span>
                      </div>
                      <p className="text-xs text-textPrimary/90 leading-relaxed break-words">{item.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="p-3 sm:p-4 border-t border-white/[0.08] bg-white/[0.02] flex items-center gap-2">
              <input
                type="text"
                placeholder="Escreva um comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-textSecondary focus:outline-none focus:border-white/30 transition-all"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center disabled:opacity-30 hover:bg-white/90 active:scale-95 transition-all shrink-0 font-semibold"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Compartilhamento */}
      {shareOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShareOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-background border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-white" />
                <h3 className="text-base font-bold text-white">Compartilhar Soult</h3>
              </div>
              <button
                onClick={() => setShareOpen(false)}
                className="p-1.5 rounded-full text-textSecondary hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] active:scale-95 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-colors">
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </div>
                <span className="text-xs font-semibold text-white/90">{copied ? 'Copiado!' : 'Copiar link'}</span>
              </button>

              <button
                onClick={handleNativeShare}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] active:scale-95 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-colors">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-white/90">Outros apps</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Conexão com Propósito */}
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
    </article>
  );
}
