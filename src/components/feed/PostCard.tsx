import { SecureImage } from '../ui/SecureMedia';
import { useState, useEffect } from 'react';
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  CheckCircle2,
  X,
  Send,
  Copy,
  Check,
  MessageCircle,
  UserPlus,
  UserCheck,
  Loader2,
  Trash2,
  Flag,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Post } from '../../services/postService';
import { postService } from '../../services/postService';
import { userService } from '../../services/userService';
import { useTranslation } from '../../i18n';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { ReportModal } from '../modals/ReportModal';

// Converte timestamp ISO em texto relativo
function timeAgo(
  isoDate: string,
  t: ReturnType<typeof useTranslation>['t']
): string {
  const diff = Math.floor(
    (Date.now() - new Date(isoDate).getTime()) / 1000
  );

  if (diff < 60) {
    return t('post.ago.seconds', {
      ns: 'feed',
      count: diff,
    });
  }

  if (diff < 3600) {
    return t('post.ago.minutes', {
      ns: 'feed',
      count: Math.floor(diff / 60),
    });
  }

  if (diff < 86400) {
    return t('post.ago.hours', {
      ns: 'feed',
      count: Math.floor(diff / 3600),
    });
  }

  return t('post.ago.days', {
    ns: 'feed',
    count: Math.floor(diff / 86400),
  });
}

interface PostCardProps {
  post: Post;
  index?: number;
  onDelete?: (id: string) => void;
}

export function PostCard({ post, index = 0, onDelete }: PostCardProps) {
  const { t } = useTranslation('feed');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [liked, setLiked] = useState(post.hasLiked || false);
  const [likes, setLikes] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (post.author.username) {
      userService.getFollowStatus(post.author.username)
        .then(r => { if (mounted) setIsFollowing(r.status === 'FOLLOWING'); })
        .catch(() => {});
    }
    return () => { mounted = false; };
  }, [post.id, post.author.username]);
  const [saved, setSaved] = useState(() => {
    const savedPostsStr = localStorage.getItem(`soul_saved_posts:${user?.id}`);
    if (!savedPostsStr) return false;
    try {
      const parsed = JSON.parse(savedPostsStr);
      return Array.isArray(parsed) && parsed.some((p: string | { id: string }) => (typeof p === 'string' ? p : p.id) === post.id);
    } catch {
      return false;
    }
  });

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSaved = !saved;
    setSaved(nextSaved);
    
    let savedPosts: string[] = [];
    try {
      const stored = JSON.parse(localStorage.getItem(`soul_saved_posts:${user?.id}`) || '[]');
      savedPosts = Array.isArray(stored) ? stored.map(p => typeof p === 'string' ? p : p.id).filter(id => typeof id === 'string') : [];
    } catch {}

    if (nextSaved) {
      if (!savedPosts.includes(post.id)) {
        savedPosts.push(post.id);
      }
    } else {
      savedPosts = savedPosts.filter(id => id !== post.id);
    }
    localStorage.setItem(`soul_saved_posts:${user?.id}`, JSON.stringify(savedPosts));
    window.dispatchEvent(new Event('savedPostsUpdated'));
  };
  const [likeAnim, setLikeAnim] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentsList, setCommentsList] = useState<import('../../services/api/types').CommentResponse[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsFetched, setCommentsFetched] = useState(false);

  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectIntent, setConnectIntent] = useState('');

  const handleLike = async () => {
    if (likeLoading) {
      return;
    }

    const nextLiked = !liked;

    // Atualização otimista da interface.
    setLiked(nextLiked);
    setLikes((current) => current + (nextLiked ? 1 : -1));

    if (nextLiked) {
      setLikeAnim(true);

      setTimeout(() => {
        setLikeAnim(false);
      }, 400);
    }

    setLikeLoading(true);

    try {
      if (nextLiked) {
        await postService.likePost(post.id);
      } else {
        await postService.unlikePost(post.id);
      }
    } catch {
      // Se o backend falhar, desfazemos a alteração otimista.
      setLiked(!nextLiked);
      setLikes((current) => current + (nextLiked ? -1 : 1));
    } finally {
      setLikeLoading(false);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleSaveToggle(e);
  };

  const handleFollowToggle = async () => {
    if (!isFollowing) {
      setShowConnectModal(true);
    } else {
      // Deixar de seguir direto
      setIsFollowing(false);
      try {
        await userService.unfollow(post.author.username);
      } catch {
        setIsFollowing(true); // reverte em caso de erro
      }
    }
  };

  const handleRequestDelete = () => {
    setShowDeleteModal(true);
  };

  const handleReport = () => {
    setShowReportModal(true);
  };

  const confirmDeletePost = async () => {
    setIsDeleting(true);
    try {
      await postService.deletePost(post.id);
      setShowDeleteModal(false);
      onDelete?.(post.id);
    } catch (err) {
      console.error('Falha ao excluir o post', err);
      setIsDeleting(false);
    }
  };

  const handleConfirmConnect = async () => {
    setShowConnectModal(false);
    setConnectIntent('');
    try {
      await userService.follow(post.author.username);
      setIsFollowing(true);
    } catch {
      // Já segue ou outro erro — mantém estado atual
    }
  };

  const handleOpenComments = async () => {
    setCommentsOpen(true);
    if (!commentsFetched) {
      setCommentsLoading(true);
      try {
        const comments = await postService.getComments(post.id, 0, 50);
        setCommentsList(comments);
        setCommentsFetched(true);
      } catch (err) {
        console.error(err);
      } finally {
        setCommentsLoading(false);
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const added = await postService.createComment(post.id, newComment.trim());
      setCommentsList((prev) => [added, ...prev]);
      setCommentsCount((prev) => prev + 1);
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
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
        // Usuário cancelou o compartilhamento.
      }
    } else {
      handleCopyLink();
    }
  };

  const likesLabel = liked ? 'Curtido' : 'Curtir';

  return (
    <>
      <article
        className="glass-card rounded-2xl overflow-hidden mx-4 mb-4 animate-fade-up relative"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div
            className="flex items-center gap-3 min-w-0 cursor-pointer"
            onClick={() => navigate(`/profile/${post.author.username}`)}
          >
            <div className="w-10 h-10 rounded-full glass-pill flex items-center justify-center shrink-0 overflow-hidden">
              {post.author.avatarUrl ? (
                <SecureImage
                  src={post.author.avatarUrl}
                  alt={post.author.name}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <span className="text-textSecondary text-xs font-bold">
                  {post.author.name.charAt(0)}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-textPrimary font-semibold text-sm truncate">
                  {post.author.name}
                </span>

                {post.author.verified && (
                  <CheckCircle2
                    className="w-3.5 h-3.5 text-accent shrink-0"
                    strokeWidth={2.5}
                  />
                )}
              </div>

              <p className="text-textSecondary text-xs">
                {timeAgo(post.createdAt, t)}
              </p>
            </div>
          </div>

          {user?.username === post.author.username ? (
            <button
              onClick={handleRequestDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 active:scale-95 bg-white/5 hover:bg-red-500/20 text-red-400 border border-transparent hover:border-red-500/30 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? 'Excluindo...' : 'Excluir'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
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
                    <span>Seguindo</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Seguir</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleReport}
                className="p-1.5 rounded-full text-xs transition-colors shrink-0 active:scale-95 text-textSecondary hover:text-white hover:bg-white/10"
                title="Denunciar publicação"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div
          onClick={() => navigate(`/post/${post.id}`)}
          className="cursor-pointer active:opacity-70 transition-opacity"
        >
          <p className="px-4 pb-3 text-textPrimary/90 text-sm leading-relaxed">
            {post.content}
          </p>
        </div>

        <div
          onClick={() => navigate(`/post/${post.id}`)}
          className="mx-3 mb-3 rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
        >
          {post.imageUrl ? (
            <SecureImage
              src={post.imageUrl}
              alt="Post media"
              className="w-full aspect-[3/4] lg:aspect-video object-cover object-top"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxOpen(true);
              }}
            />
          ) : (
            <div className="w-full aspect-[3/4] lg:aspect-video bg-gradient-to-br from-surfaceHighlight to-background" />
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium transition-all duration-200',
                liked
                  ? 'text-red-400'
                  : 'text-textSecondary hover:text-red-400/80',
                likeLoading && 'opacity-60 cursor-wait'
              )}
            >
              <Heart
                className={cn(
                  'w-[18px] h-[18px] transition-all',
                  likeAnim && 'animate-like-pop'
                )}
                fill={liked ? 'currentColor' : 'none'}
                strokeWidth={1.75}
              />

              <span>
                {likesLabel}
                {likes > 0 && ` ${likes}`}
              </span>
            </button>

            <button
              onClick={handleOpenComments}
              className="flex items-center gap-1.5 text-xs font-medium text-textSecondary hover:text-textPrimary transition-colors"
            >
              <MessageSquare
                className="w-[18px] h-[18px]"
                strokeWidth={1.75}
              />

              <span>
                Comentar
                {commentsCount > 0 && ` ${commentsCount}`}
              </span>
            </button>

            <button
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-textSecondary hover:text-textPrimary transition-colors"
            >
              <Share2
                className="w-[18px] h-[18px]"
                strokeWidth={1.75}
              />

              <span>{t('post.share')}</span>
            </button>
          </div>

          <button
            onClick={handleSave}
            className={cn(
              'flex items-center gap-1.5 text-xs font-medium transition-colors p-1 rounded-lg active:scale-95',
              saved
                ? 'text-white'
                : 'text-textSecondary hover:text-textPrimary'
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
              {commentsLoading ? (
                 <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-textSecondary"/></div>
              ) : commentsList.length === 0 ? (
                 <div className="flex justify-center py-4"><span className="text-xs text-textSecondary">Nenhum comentário.</span></div>
              ) : (
                commentsList.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 items-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:opacity-80" onClick={() => { setCommentsOpen(false); navigate(`/profile/${item.username}`); }}>
                      {item.profilePicture ? (
                        <SecureImage src={item.profilePicture} alt={item.username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-xs">
                          {item.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-textPrimary font-semibold text-xs cursor-pointer hover:underline" onClick={() => { setCommentsOpen(false); navigate(`/profile/${item.username}`); }}>
                          {item.username}
                        </span>

                        <span className="text-textSecondary text-[10px]">
                          {timeAgo(item.createdAt, t)}
                        </span>
                      </div>

                      <p className="text-textPrimary/80 text-xs mt-0.5 leading-relaxed break-words">
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={handleAddComment}
              className="pt-2 border-t border-white/10 flex items-center gap-2"
            >
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
            className="w-full max-w-sm bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl animate-scale-up space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-sm font-semibold text-textPrimary">
                Compartilhar publicação
              </span>

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
                  {copied ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </div>

                <span className="text-[11px] text-textSecondary font-medium">
                  {copied ? 'Copiado!' : 'Copiar Link'}
                </span>
              </button>

              <button
                onClick={() => {
                  window.open(
                    `https://api.whatsapp.com/send?text=${encodeURIComponent(
                      post.content
                    )}`,
                    '_blank'
                  );

                  setShareOpen(false);
                }}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>

                <span className="text-[11px] text-textSecondary font-medium">
                  WhatsApp
                </span>
              </button>

              <button
                onClick={handleNativeShare}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>

                <span className="text-[11px] text-textSecondary font-medium">
                  Mais
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showConnectModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={(e) => {
            e.stopPropagation();
            setShowConnectModal(false);
          }}
        >
          <div
            className="w-full max-w-sm bg-background border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                Seguir com Propósito
              </h3>

              <button
                onClick={() => setShowConnectModal(false)}
                className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              No Soul, nós cultivamos conexões reais. Por que você deseja
              acompanhar as publicações de{' '}
              <strong className="text-white">
                {post.author.name}
              </strong>
              ?
            </p>

            <div className="space-y-3 mb-8">
              {[
                'Me inspira',
                'Amigo(a) real',
                'Conteúdo útil',
                'Compartilha mesmos valores',
              ].map((label) => (
                <button
                  key={label}
                  onClick={() => setConnectIntent(label)}
                  className={cn(
                    'w-full text-left px-4 py-3.5 rounded-xl text-[15px] font-medium transition-all active:scale-[0.98] border',
                    connectIntent === label
                      ? 'bg-white text-black border-white'
                      : 'bg-white/[0.03] text-zinc-300 border-white/5 hover:bg-white/[0.06] hover:border-white/10'
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
              Começar a Seguir
            </button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-5 animate-fade-in"
          onClick={(e) => { e.stopPropagation(); setShowDeleteModal(false); }}
        >
          <div
            className="w-full max-w-sm bg-neutral-950 border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Excluir publicação</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-white/70 leading-relaxed">
              Tem certeza que deseja excluir esta publicação? Esta ação não poderá ser desfeita.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeletePost}
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Excluindo...</>
                ) : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {lightboxOpen && post.imageUrl && (
        <div
          className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
          <SecureImage
            src={post.imageUrl}
            alt="Post completo"
            className="max-w-full max-h-full object-contain rounded-2xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={post.id}
        targetType="POST"
      />
    </>
  );
}