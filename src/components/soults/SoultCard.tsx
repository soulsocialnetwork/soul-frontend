import { useState, useRef } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

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
  const [liked, setLiked] = useState(false);
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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      if (total > 0) setProgress((current / total) * 100);
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

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFollowing) {
      setShowConnectModal(true);
    } else {
      setIsFollowing(false);
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

  const handleConfirmConnect = () => {
    setIsFollowing(true);
    setShowConnectModal(false);
    setConnectIntent('');
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
      {commentsOpen && (
        <div className="hidden lg:flex w-[300px] bg-neutral-950 border-r border-white/[0.07] flex-col h-full shrink-0 z-30">
          <div className="flex items-center justify-between p-4 border-b border-white/[0.07]">
            <span className="text-sm font-semibold text-white">
              Comentários {commentsList.length > 0 && `(${commentsList.length})`}
            </span>
            <button
              onClick={() => setCommentsOpen(false)}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-4 no-scrollbar px-4">
            {commentsList.length === 0 && (
              <p className="text-xs text-white/30 text-center pt-8">Nenhum comentário ainda</p>
            )}
            {commentsList.map((item) => (
              <div key={item.id} className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-[10px]">{item.author.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-xs">{item.author}</span>
                    <span className="text-white/30 text-[10px]">{item.time}</span>
                  </div>
                  <p className="text-white/70 text-xs mt-0.5 leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="p-4 border-t border-white/[0.07] flex items-center gap-2">
            <input
              type="text"
              placeholder="Comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-white/5 border border-white/08 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center disabled:opacity-30 transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      <div
        className="relative flex-1 h-full cursor-pointer overflow-hidden"
        onClick={handleVideoClick}
      >
        <div className="absolute inset-0 bg-neutral-950 -z-10" />

        <video
          ref={videoRef}
          src={soult.videoUrl}
          poster={soult.thumbnailUrl}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          loop
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />

        {showHeartAnim && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <Heart className="w-20 h-20 text-white/90 fill-white/90 animate-ping" />
          </div>
        )}

        <div className="absolute top-4 right-4 z-20 pointer-events-none">
          <div className="bg-black/50 px-2.5 py-1 rounded-lg">
            <span className="text-white/80 text-[11px] font-medium tabular-nums">
              {soultService.formatDuration(soult.duration)}
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

        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/15 z-30 cursor-pointer"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-white/70 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent px-4 pb-20 lg:pb-6 pt-24 flex flex-col gap-2 z-10 pointer-events-none">
          <div
            className="flex items-center gap-2.5 pointer-events-auto cursor-pointer"
            onClick={(e) => { e.stopPropagation(); navigate(`/profile/${soult.author.id}`); }}
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
            onClick={(e) => { e.stopPropagation(); navigate(`/profile/${soult.author.id}`); }}>
            {soult.title}
          </p>

          {soult.description && (
            <p className="text-white/60 text-xs leading-relaxed line-clamp-2 pointer-events-auto cursor-pointer"
              onClick={(e) => { e.stopPropagation(); navigate(`/profile/${soult.author.id}`); }}>
              {soult.description}
            </p>
          )}
        </div>

        <div className="absolute bottom-20 lg:bottom-6 right-3 flex flex-col gap-5 items-center z-20">
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

      {commentsOpen && (
        <div
          className="absolute inset-0 z-30 lg:hidden bg-black/60 backdrop-blur-sm flex flex-col justify-end"
          onClick={() => setCommentsOpen(false)}
        >
          <div
            className="w-full h-[62%] bg-neutral-950 border-t border-white/08 rounded-t-2xl flex flex-col animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/[0.07]">
              <span className="text-sm font-semibold text-white">
                Comentários {commentsList.length > 0 && `(${commentsList.length})`}
              </span>
              <button
                onClick={() => setCommentsOpen(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-4 no-scrollbar px-4">
              {commentsList.length === 0 && (
                <p className="text-xs text-white/30 text-center pt-6">Nenhum comentário ainda</p>
              )}
              {commentsList.map((item) => (
                <div key={item.id} className="flex gap-2.5 items-start">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-[10px]">{item.author.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-xs">{item.author}</span>
                      <span className="text-white/30 text-[10px]">{item.time}</span>
                    </div>
                    <p className="text-white/70 text-xs mt-0.5 leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="p-4 border-t border-white/[0.07] flex items-center gap-2">
              <input
                type="text"
                placeholder="Escreva algo..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-white/5 border border-white/08 rounded-lg px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="w-9 h-9 rounded-lg bg-white text-black flex items-center justify-center disabled:opacity-30 transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {shareOpen && (
        <div
          className="absolute inset-0 z-40 bg-black/70 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShareOpen(false)}
        >
          <div
            className="w-full max-w-xs bg-neutral-950 border border-white/08 rounded-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/07">
              <span className="text-sm font-semibold text-white">Compartilhar</span>
              <button onClick={() => setShareOpen(false)} className="p-1.5 rounded-lg text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/07 hover:bg-white/8 active:scale-95 transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-white/10 text-white/70 flex items-center justify-center">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </div>
                <span className="text-[11px] text-white/50 font-medium">{copied ? 'Copiado!' : 'Copiar link'}</span>
              </button>

              <button
                onClick={handleNativeShare}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/07 hover:bg-white/8 active:scale-95 transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-white/10 text-white/70 flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <span className="text-[11px] text-white/50 font-medium">Outros apps</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showConnectModal && (
        <div
          className="absolute inset-0 z-[100] bg-black/80 flex items-center justify-center p-5 animate-fade-in"
          onClick={(e) => { e.stopPropagation(); setShowConnectModal(false); }}
        >
          <div
            className="w-full max-w-sm bg-neutral-950 border border-white/08 rounded-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Conexão com Propósito</h3>
              <button
                onClick={() => setShowConnectModal(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-white/50 leading-relaxed">
              Por que você quer seguir <strong className="text-white">{soult.author.name}</strong>?
            </p>

            <div className="space-y-2">
              {['Me inspira', 'Amigo(a) real', 'Conteúdo útil', 'Compartilha meus valores'].map((label) => (
                <button
                  key={label}
                  onClick={() => setConnectIntent(label)}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border',
                    connectIntent === label
                      ? 'bg-white text-black border-white'
                      : 'bg-white/[0.03] text-white/60 border-white/08 hover:bg-white/06 hover:text-white'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              disabled={!connectIntent}
              onClick={handleConfirmConnect}
              className="w-full py-3 bg-white text-black font-semibold rounded-xl transition-all disabled:opacity-30 hover:bg-white/90 active:scale-[0.98] text-sm"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
