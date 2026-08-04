import { useState } from 'react';
import { Heart, MessageSquare, Share2, Bookmark, CheckCircle2, X, Send, Copy, Check, MessageCircle, UserPlus, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Post } from '../../services/postService';
import { postService } from '../../services/postService';
import { useTranslation } from '../../i18n';
import { cn } from '../../utils/cn';

// converte timestamp iso em texto relativo (:\n
function timeAgo(isoDate: string, t: ReturnType<typeof useTranslation>['t']): string {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (diff < 60) return t('post.ago.seconds', { ns: 'feed', count: diff });
  if (diff < 3600) return t('post.ago.minutes', { ns: 'feed', count: Math.floor(diff / 60) });
  if (diff < 86400) return t('post.ago.hours', { ns: 'feed', count: Math.floor(diff / 3600) });
  return t('post.ago.days', { ns: 'feed', count: Math.floor(diff / 86400) });
}

interface Comment {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  time: string;
}

interface PostCardProps {
  post: Post;
  index?: number;
}

export function PostCard({ post, index = 0 }: PostCardProps) {
  const { t } = useTranslation('feed');
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likesCount || 0);
  const [saved, setSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);

  // estados dos modais de comentario e share (:\n
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentsList, setCommentsList] = useState<Comment[]>(post.initialComments || []);

  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectIntent, setConnectIntent] = useState('');

  const handleLike = async () => {
    const next = !liked;
    setLiked(next);
    setLikes((n: number) => n + (next ? 1 : -1));
    if (next) { setLikeAnim(true); setTimeout(() => setLikeAnim(false), 400); }
    try { await postService.interactWithPost(post.id, 'LIKE'); } catch { /* silêncio (: */ }
  };

  const handleSave = async () => {
    const next = !saved;
    setSaved(next);
    try { await postService.interactWithPost(post.id, 'SAVE'); } catch { /* silêncio (: */ }
  };

  const handleFollowToggle = async () => {
    if (!isFollowing) {
      setShowConnectModal(true);
    } else {
      setIsFollowing(false);
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
          title: `publicação de ${post.author.name} no soul`,
          text: post.content,
          url: window.location.href,
        });
        setShareOpen(false);
      } catch {
        // user cancelou (:\n
      }
    } else {
      handleCopyLink();
    }
  };

  
  const likesLabel = liked ? 'Curtido' : 'Curtir';

  return (
    <>
      <article
        className="glass-card rounded-3xl overflow-hidden mx-4 mb-4 animate-fade-up relative"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div
            className="flex items-center gap-3 min-w-0 cursor-pointer"
            onClick={() => navigate(`/profile/${post.author.username}`)}
          >
            <div className="w-10 h-10 rounded-full glass-pill flex items-center justify-center shrink-0 overflow-hidden">
              {post.author.avatarUrl ? (
                <img src={post.author.avatarUrl} alt={post.author.name} className="w-full h-full object-cover object-top" />
              ) : (
                <span className="text-textSecondary text-xs font-bold">{post.author.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-textPrimary font-semibold text-sm truncate">{post.author.name}</span>
                {post.author.verified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" strokeWidth={2.5} />
                )}
              </div>
              <p className="text-textSecondary text-xs">{timeAgo(post.createdAt, t)}</p>
            </div>
          </div>

          <button
            onClick={handleFollowToggle}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 active:scale-95',
              isFollowing
                ? 'bg-white/10 text-textSecondary hover:bg-white/15 border border-white/10'
                : 'bg-white text-black hover:bg-white/90 shadow-sm'
            )}
          >
            {isFollowing ? (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span>Conectado</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Conectar</span>
              </>
            )}
          </button>
        </div>

        {}
        <div onClick={() => navigate(`/post/${post.id}`)} className="cursor-pointer active:opacity-70 transition-opacity">
          <p className="px-4 pb-3 text-textPrimary/90 text-sm leading-relaxed">{post.content}</p>
        </div>

        {}
        <div onClick={() => navigate(`/post/${post.id}`)} className="mx-3 mb-3 rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform">
          {post.imageUrl ? (
            <img src={post.imageUrl} alt="Post media" className="w-full aspect-[3/4] lg:aspect-video object-cover object-top" />
          ) : (
            <div className="w-full aspect-[3/4] lg:aspect-video bg-gradient-to-br from-surfaceHighlight to-background" />
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium transition-all duration-200',
                liked ? 'text-red-400' : 'text-textSecondary hover:text-red-400/80'
              )}
            >
              <Heart
                className={cn('w-[18px] h-[18px] transition-all', likeAnim && 'animate-like-pop')}
                fill={liked ? 'currentColor' : 'none'}
                strokeWidth={1.75}
              />
              <span>{likesLabel}</span>
            </button>

            <button
              onClick={() => setCommentsOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-textSecondary hover:text-textPrimary transition-colors"
            >
              <MessageSquare className="w-[18px] h-[18px]" strokeWidth={1.75} />
              <span>Comentar</span>
            </button>

            <button
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-textSecondary hover:text-textPrimary transition-colors"
            >
              <Share2 className="w-[18px] h-[18px]" strokeWidth={1.75} />
              <span>{t('post.share')}</span>
            </button>
          </div>

          <button
            onClick={handleSave}
            className={cn(
              'flex items-center gap-1.5 text-xs font-medium transition-colors p-1 rounded-lg active:scale-95',
              saved ? 'text-white' : 'text-textSecondary hover:text-textPrimary'
            )}
            title={saved ? 'Remover dos salvos' : 'Salvar publicação'}
          >
            <Bookmark
              className="w-[18px] h-[18px] transition-all"
              fill={saved ? 'currentColor' : 'none'}
              strokeWidth={1.75}
            />
          </button>
        </div>
      </article>

      {}
      {commentsOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-fade-in"
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
              {commentsList.map((item) => (
                <div key={item.id} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-xs">{item.author.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-textPrimary font-semibold text-xs">{item.author}</span>
                      <span className="text-textSecondary text-[10px]">{item.time}</span>
                    </div>
                    <p className="text-textPrimary/80 text-xs mt-0.5 leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddComment} className="pt-2 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                placeholder="escreva algo..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-textPrimary placeholder-textSecondary focus:outline-none focus:border-white/40 transition-colors"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="w-9 h-9 rounded-2xl bg-white text-black flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/90 transition-colors shrink-0 font-bold"
              >
                <Send className="w-4 h-4 text-black" />
              </button>
            </form>
          </div>
        </div>
      )}

      {shareOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShareOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl animate-scale-up space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-sm font-semibold text-textPrimary">Compartilhar publicação</span>
              <button
                onClick={() => setShareOpen(false)}
                className="p-1 rounded-full text-textSecondary hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 py-2">
              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center">
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </div>
                <span className="text-[11px] text-textSecondary font-medium">
                  {copied ? 'Copiado!' : 'Copiar Link'}
                </span>
              </button>

              <button
                onClick={() => {
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(post.content)}`, '_blank');
                  setShareOpen(false);
                }}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-[11px] text-textSecondary font-medium">WhatsApp</span>
              </button>

              <button
                onClick={handleNativeShare}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] text-textSecondary font-medium">Mais</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {showConnectModal && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={(e) => { e.stopPropagation(); setShowConnectModal(false); }}
        >
          <div 
            className="w-full max-w-sm bg-background border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Conexão com Propósito</h3>
              <button 
                onClick={() => setShowConnectModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              No Soul, nós cultivamos conexões reais. Por que você deseja acompanhar as publicações de <strong className="text-white">{post.author.name}</strong>?
            </p>

            <div className="space-y-3 mb-8">
              {['Me inspira', 'Amigo(a) real', 'Conteúdo útil', 'Compartilha mesmos valores'].map((label) => (
                <button
                  key={label}
                  onClick={() => setConnectIntent(label)}
                  className={cn(
                    "w-full text-left px-4 py-3.5 rounded-xl text-[15px] font-medium transition-all active:scale-[0.98] border",
                    connectIntent === label 
                      ? "bg-white text-black border-white" 
                      : "bg-white/[0.03] text-zinc-300 border-white/5 hover:bg-white/[0.06] hover:border-white/10"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              disabled={!connectIntent}
              onClick={handleConfirmConnect}
              className="w-full py-4 bg-white text-black font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 active:scale-[0.98]"
            >
              Estabelecer Conexão
            </button>
          </div>
        </div>
      )}


    </>
  );
}