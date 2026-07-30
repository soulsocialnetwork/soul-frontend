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
import { useTranslation } from '../../i18n';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface SoultCardProps {
  soult: Soult;
  index?: number;
}

interface Comment {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  time: string;
}

export function SoultCard({ soult, index = 0 }: SoultCardProps) {
  useTranslation('soults');
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  // estados principais do card (:
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(soult.likesCount);
  const [saved, setSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // animação do coraçãozinho ao dar dois toques (:
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const lastTapRef = useRef<number>(0);

  // controla se os modais estão abertos (:
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [commentsList, setCommentsList] = useState<Comment[]>([]);

  // dar play ou pausar no clique (:
  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setPlaying(!playing);
    } else {
      setPlaying(!playing);
    }
  };

  // verifica se deu um ou dois toques rápidos pra curtir (:
  const handleVideoClick = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // duplo toque curte o vídeo (:
      if (!liked) {
        handleLike();
      }
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 800);
    } else {
      // um toque só pausa/play (:
      togglePlay();
    }
    lastTapRef.current = now;
  };

  const handleLike = async () => {
    const next = !liked;
    setLiked(next);
    setLikes((n) => n + (next ? 1 : -1));
    try {
      await soultService.likeSoult(soult.id);
    } catch {
      // falha silenciosa (:
    }
  };

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFollowing((prev) => !prev);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Você',
      text: newComment.trim(),
      time: 'Agora mesmo',
    };

    setCommentsList((prev) => [comment, ...prev]);
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
        await navigator.share({
          title: soult.title,
          text: soult.description,
          url: window.location.href,
        });
        setShareOpen(false);
      } catch {
        // o user cancelou o share (:
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <article
      className="relative w-full h-full bg-black group animate-fade-up select-none overflow-hidden rounded-none md:rounded-lg lg:rounded-md"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        className="relative w-full h-full cursor-pointer overflow-hidden group/player"
        onClick={handleVideoClick}
      >
        <div className="absolute inset-0 bg-neutral-900 -z-10" />

        {soult.videoUrl ? (
          <video
            ref={videoRef}
            src={soult.videoUrl}
            poster={soult.thumbnailUrl}
            className="absolute inset-0 w-full h-full object-cover"
            loop
            playsInline
          />
        ) : soult.thumbnailUrl ? (
          <img
            src={soult.thumbnailUrl}
            alt={soult.title}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : null}

        {showHeartAnim && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none animate-ping">
            <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-2xl" />
          </div>
        )}

        <div className="absolute top-4 right-4 flex gap-2 z-20 pointer-events-none lg:top-6 lg:right-4">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1 rounded-xl lg:rounded-lg">
            <span className="text-white/90 text-[11px] font-semibold">
              {soultService.formatDuration(soult.duration)}
            </span>
          </div>
        </div>

        <div
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center transition-all duration-300 z-20',
            playing ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100 bg-black/10'
          )}
        >
          <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-xl border border-white/25 flex items-center justify-center shadow-2xl group-hover/player:scale-110 transition-transform duration-300">
            <Play className="w-6 h-6 text-white ml-1 fill-white stroke-none" />
          </div>
        </div>

        {/* --- AQUI ESTÁ A CORREÇÃO: Adicionado pr-20 para não sobrepor os botões laterais --- */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 pr-20 pb-24 lg:pb-8 pt-32 flex flex-col gap-2 z-10 pointer-events-none">
          
          <div className="flex items-center gap-3 pointer-events-auto cursor-pointer flex-wrap" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${soult.author.id}`); }}>
            <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 shrink-0">
              {soult.author.avatarUrl ? (
                <img
                  src={soult.author.avatarUrl}
                  alt={soult.author.name}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full bg-white/20 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{soult.author.name.charAt(0)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm drop-shadow-md">{soult.author.name}</span>
              {soult.author.verified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" strokeWidth={2.5} />
              )}
            </div>

            <button
              onClick={handleFollowToggle}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-xl lg:rounded-lg text-[11px] font-bold transition-all shrink-0 active:scale-95 ml-1',
                isFollowing
                  ? 'bg-white/15 text-white/80 backdrop-blur-md border border-white/10'
                  : 'bg-white text-black hover:bg-white/90 shadow-md'
              )}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-3 h-3" />
                  <span>Seguindo</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3 h-3" />
                  <span>Seguir</span>
                </>
              )}
            </button>
          </div>

          <p className="text-white font-bold text-base drop-shadow-md line-clamp-1 pointer-events-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${soult.author.id}`); }}>{soult.title}</p>
          <p className="text-white/80 text-xs leading-relaxed line-clamp-2 drop-shadow-md pointer-events-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${soult.author.id}`); }}>
            {soult.description}
          </p>
        </div>

        <div className="absolute bottom-24 lg:bottom-8 right-3 flex flex-col gap-5 items-center z-20">
          
          {/* Curtir */}
          <button
            onClick={(e) => { e.stopPropagation(); handleLike(); }}
            className="flex flex-col items-center gap-1 group/btn"
          >
            <div className="w-11 h-11 rounded-xl lg:rounded-lg bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 transition-transform active:scale-90 hover:bg-black/60">
              <Heart
                className={cn('w-5 h-5 transition-colors', liked ? 'text-red-500 fill-red-500' : 'text-white')}
                strokeWidth={2}
              />
            </div>
            <span className="text-white font-bold text-[11px] drop-shadow-md">
              {likes >= 1000 ? `${(likes / 1000).toFixed(1)}k` : likes}
            </span>
          </button>

          {/* Comentários */}
          <button
            onClick={(e) => { e.stopPropagation(); setCommentsOpen(true); }}
            className="flex flex-col items-center gap-1 group/btn"
          >
            <div className="w-11 h-11 rounded-xl lg:rounded-lg bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 transition-transform active:scale-90 hover:bg-black/60">
              <MessageCircle className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <span className="text-white font-bold text-[11px] drop-shadow-md">{commentsList.length}</span>
          </button>

          {/* Salvar */}
          <button
            onClick={(e) => { e.stopPropagation(); setSaved((s) => !s); }}
            className="flex flex-col items-center gap-1 group/btn"
          >
            <div className="w-11 h-11 rounded-xl lg:rounded-lg bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 transition-transform active:scale-90 hover:bg-black/60">
              <Bookmark
                className={cn('w-5 h-5 transition-colors', saved ? 'text-white fill-white' : 'text-white')}
                strokeWidth={2}
              />
            </div>
            <span className="text-white font-bold text-[11px] drop-shadow-md">Salvar</span>
          </button>

          {/* Compartilhar */}
          <button
            onClick={(e) => { e.stopPropagation(); setShareOpen(true); }}
            className="flex flex-col items-center gap-1 group/btn"
          >
            <div className="w-11 h-11 rounded-xl lg:rounded-lg bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 transition-transform active:scale-90 hover:bg-black/60">
              <Share2 className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <span className="text-white font-bold text-[11px] drop-shadow-md">Enviar</span>
          </button>
        </div>
      </div>

      {commentsOpen && (
        <div
          className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col justify-end lg:items-center lg:justify-center transition-opacity duration-300"
          onClick={() => setCommentsOpen(false)}
        >
          <div
            className="w-full lg:w-[400px] h-[65%] lg:h-[80%] bg-neutral-900/95 backdrop-blur-xl border-t lg:border border-white/10 rounded-t-2xl lg:rounded-xl p-4 flex flex-col justify-between shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-sm font-semibold text-white tracking-wide">
                Comentários ({commentsList.length})
              </span>
              <button
                onClick={() => setCommentsOpen(false)}
                className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-4 no-scrollbar">
              {commentsList.map((item) => (
                <div key={item.id} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-xs">{item.author.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-xs">{item.author}</span>
                      <span className="text-white/40 text-[10px]">{item.time}</span>
                    </div>
                    <p className="text-white/80 text-xs mt-0.5 leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="pt-2 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                placeholder="Escreva um comentário consciente..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl lg:rounded-lg px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="w-9 h-9 rounded-xl lg:rounded-lg bg-white text-black flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/90 transition-colors shrink-0 font-bold"
              >
                <Send className="w-4 h-4 text-black" />
              </button>
            </form>
          </div>
        </div>
      )}

      {shareOpen && (
        <div
          className="absolute inset-0 z-40 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShareOpen(false)}
        >
          <div
            className="w-full max-w-xs bg-neutral-900/95 border border-white/10 rounded-2xl lg:rounded-xl p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-sm font-semibold text-white">Compartilhar Soult</span>
              <button
                onClick={() => setShareOpen(false)}
                className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 py-2">
              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-2 p-3 rounded-xl lg:rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center">
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </div>
                <span className="text-[11px] text-white/80 font-medium">
                  {copied ? 'Copiado!' : 'Copiar Link'}
                </span>
              </button>

              <button
                onClick={handleNativeShare}
                className="flex flex-col items-center gap-2 p-3 rounded-xl lg:rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] text-white/80 font-medium">Outros Apps</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}