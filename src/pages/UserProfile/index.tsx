import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  UserPlus,
  UserCheck,
  Grid,
  Film,
  X,
  Loader2,
  MessageSquare,
  Trash2,
  Play,
  Flag,
} from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';
import { Sidebar } from '../../components/layout/Sidebar';
import { PostCard } from '../../components/feed/PostCard';
import { ReportModal } from '../../components/modals/ReportModal';
import { cn } from '../../utils/cn';
import {
  userService,
  type UserProfile,
  type UserPost,
} from '../../services/userService';
import { soultService, type Soult } from '../../services/soultService';
import type { Post } from '../../services/postService';
import type { ProfileSummary } from '../../services/api/types';
import { messageService } from '../../services/messageService';
import { ConnectionsModal } from '../../components/profile/ConnectionsModal';
import { useAuth } from '../../context/AuthContext';

type ProfileTab = 'posts' | 'soults';

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (username && currentUser?.username === username) {
      navigate('/profile', { replace: true });
    }
  }, [username, currentUser?.username, navigate]);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingSoults, setLoadingSoults] = useState(false);
  const [soults, setSoults] = useState<Soult[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [followLoading, setFollowLoading] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [deletingSoultId, setDeletingSoultId] = useState<string | null>(null);
  const [feedModal, setFeedModal] = useState<{
    list: Post[];
    startIndex: number;
  } | null>(null);
  const [connectionsModal, setConnectionsModal] = useState<{ type: 'followers' | 'following'; title: string } | null>(null);
  const [connectionsList, setConnectionsList] = useState<ProfileSummary[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: string; type: 'ACCOUNT' | 'SOULT' } | null>(null);

  // Load profile
  useEffect(() => {
    if (!username) { setLoadingProfile(false); return; }
    let cancelled = false;
    setLoadingProfile(true);
    userService.getByUsername(username)
      .then(data => { if (!cancelled) setUser(data); })
      .catch(() => { if (!cancelled) setUser(null); })
      .finally(() => { if (!cancelled) setLoadingProfile(false); });
    return () => { cancelled = true; };
  }, [username]);

  // Load follow status
  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    userService.getFollowStatus(username)
      .then(res => {
        if (!cancelled) setIsFollowing(res.status === 'FOLLOWING' || res.status === 'PENDING');
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [username]);

  // Load posts
  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    setLoadingPosts(true);
    userService.getPostsByUsername(username)
      .then(posts => {
        if (!cancelled) setUser(prev => prev ? { ...prev, posts } : prev);
      })
      .catch(() => {
        if (!cancelled) setUser(prev => prev ? { ...prev, posts: [] } : prev);
      })
      .finally(() => { if (!cancelled) setLoadingPosts(false); });
    return () => { cancelled = true; };
  }, [username]);

  // Load soults when tab switches to soults
  useEffect(() => {
    if (activeTab !== 'soults' || !username) return;
    let cancelled = false;
    setLoadingSoults(true);
    soultService.getSoultsByUsername(username)
      .then(data => { if (!cancelled) setSoults(data); })
      .catch(() => { if (!cancelled) setSoults([]); })
      .finally(() => { if (!cancelled) setLoadingSoults(false); });
    return () => { cancelled = true; };
  }, [username, activeTab]);

  // Keyboard/scroll lock for modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setFeedModal(null); setShowAvatarModal(false); }
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = (feedModal || showAvatarModal) ? 'hidden' : 'unset';
    return () => { window.removeEventListener('keydown', handleEsc); document.body.style.overflow = 'unset'; };
  }, [feedModal, showAvatarModal]);

  const isOwnProfile = currentUser?.username === username;

  const handleFollowClick = async () => {
    // Never allow self-follow
    if (!username || followLoading || isOwnProfile) return;
    const prev = isFollowing;
    setFollowLoading(true);
    setIsFollowing(!prev);
    setUser(u => u ? {
      ...u,
      followerCount: prev ? Math.max(0, (u.followerCount || 0) - 1) : (u.followerCount || 0) + 1,
    } : null);
    try {
      if (prev) await userService.unfollow(username);
      else await userService.follow(username);
    } catch {
      setIsFollowing(prev);
      setUser(u => u ? {
        ...u,
        followerCount: prev ? (u.followerCount || 0) + 1 : Math.max(0, (u.followerCount || 0) - 1),
      } : null);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!username || sendingMsg) return;
    setSendingMsg(true);
    try {
      await messageService.getOrCreateConversation(username);
      navigate('/messages');
    } catch {
      navigate('/messages');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleDeleteSoult = async (soultId: string) => {
    if (deletingSoultId) return;
    setDeletingSoultId(soultId);
    try {
      await soultService.deleteSoult(soultId);
      setSoults(prev => prev.filter(s => s.id !== soultId));
    } catch {
      // ignore
    } finally {
      setDeletingSoultId(null);
    }
  };

  const handleOpenConnections = async (type: 'followers' | 'following') => {
    if (!username) return;
    setConnectionsModal({ type, title: type === 'followers' ? 'Seguidores' : 'Seguindo' });
    setConnectionsLoading(true);
    setConnectionsList([]);
    try {
      const res = type === 'followers'
        ? await userService.getFollowers(username)
        : await userService.getFollowing(username);
      setConnectionsList(res.content || []);
    } catch {
      setConnectionsList([]);
    } finally {
      setConnectionsLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-textSecondary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center text-textPrimary gap-6 p-6 text-center">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-lg">
          <X className="w-10 h-10 text-white/50" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Perfil não encontrado</h2>
          <p className="text-sm text-textSecondary max-w-[280px]">
            Este usuário pode ter mudado de nome, excluído a conta ou o link está incorreto.
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-white text-black font-semibold rounded-2xl hover:bg-white/90 transition-colors shadow-lg active:scale-95"
        >
          Voltar para anterior
        </button>
      </div>
    );
  }

  const fullPosts: Post[] = user.posts.map((post: UserPost) => ({
    id: post.id,
    author: {
      id: user.id,
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
      verified: user.verified,
    },
    content: post.content || '',
    imageUrl: post.imageUrl || undefined,
    likesCount: 0,
    commentsCount: 0,
    createdAt: post.createdAt || new Date().toISOString(),
  }));

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col lg:flex-row text-textPrimary select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-white/5 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-textPrimary" />
          </button>
          <span className="font-semibold text-sm truncate">{user.username}</span>
        </div>

        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 lg:pb-12">
          <div className="w-full max-w-4xl mx-auto pt-4 lg:pt-8 px-4 sm:px-6 space-y-8">
            {/* Profile Card */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 sm:p-6 md:p-10">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start w-full">
                <div
                  onClick={() => setShowAvatarModal(true)}
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-40 md:h-40 rounded-2xl overflow-hidden border border-white/10 p-1 bg-white/5 shrink-0 cursor-pointer active:scale-95 transition-transform"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-2xl object-cover object-top" />
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-white/5 flex items-center justify-center text-2xl font-bold text-textSecondary">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full min-w-0">
                  <div className="flex flex-col md:flex-row items-center gap-4 mb-5 w-full md:w-auto">
                    <div className="flex items-center justify-center md:justify-start gap-2 w-full md:w-auto overflow-hidden">
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{user.username}</h1>
                      {user.verified && <CheckCircle2 className="w-5 h-5 text-accent shrink-0" strokeWidth={2.5} />}
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                      {/* Só exibe o botão Seguir se não for o próprio perfil */}
                      {!isOwnProfile && (
                        <button
                          onClick={handleFollowClick}
                          disabled={followLoading}
                          className={cn(
                            'flex items-center justify-center gap-2 px-5 h-9 rounded-xl text-[13px] font-semibold transition-all active:scale-95 flex-1 md:flex-none disabled:opacity-60',
                            isFollowing
                              ? 'bg-white/10 text-textPrimary border border-white/10 hover:bg-white/20'
                              : 'bg-white text-black hover:bg-white/90'
                          )}
                        >
                          {followLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isFollowing ? (
                            <><UserCheck className="w-4 h-4" /><span>Seguindo</span></>
                          ) : (
                            <><UserPlus className="w-4 h-4" /><span>Seguir</span></>
                          )}
                        </button>
                      )}

                      {!isOwnProfile && (
                        <button
                          onClick={handleSendMessage}
                          disabled={sendingMsg || !isFollowing}
                          title={!isFollowing ? 'Você precisa seguir o usuário para enviar mensagem' : 'Enviar mensagem'}
                          className={cn(
                            'flex items-center justify-center gap-2 px-4 h-9 rounded-xl text-[13px] font-semibold bg-white/[0.06] border border-white/10 text-white transition-all shrink-0',
                            !isFollowing || sendingMsg
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-white/10 active:scale-95'
                          )}
                        >
                          {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <><MessageSquare className="w-4 h-4" /><span className="hidden sm:inline">Mensagem</span></>}
                        </button>
                      )}

                      {!isOwnProfile && (
                        <button
                          onClick={() => setReportTarget({ id: user.id, type: 'ACCOUNT' })}
                          className="flex items-center justify-center p-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-textSecondary hover:text-white hover:bg-white/10 transition-all shrink-0 active:scale-95"
                          title="Denunciar Conta"
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 sm:gap-6 justify-center md:justify-start w-full mb-5 text-sm">
                    <div className="flex flex-col items-center md:items-start">
                      <span className="font-bold text-base sm:text-lg leading-none">{user.postsCount}</span>
                      <span className="text-textSecondary text-xs mt-1">publicações</span>
                    </div>
                    <div
                      onClick={() => handleOpenConnections('followers')}
                      className="flex flex-col items-center md:items-start cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                    >
                      <span className="font-bold text-base sm:text-lg leading-none">{user.followerCount || 0}</span>
                      <span className="text-textSecondary text-xs mt-1">seguidores</span>
                    </div>
                    <div
                      onClick={() => handleOpenConnections('following')}
                      className="flex flex-col items-center md:items-start cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                    >
                      <span className="font-bold text-base sm:text-lg leading-none">{user.followingCount}</span>
                      <span className="text-textSecondary text-xs mt-1">seguindo</span>
                    </div>
                    <div className="flex flex-col items-center md:items-start">
                      <span className="text-[10px] font-semibold text-textSecondary/60 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 leading-none mb-0.5">em breve</span>
                      <span className="text-textSecondary text-xs mt-1">amigos reais</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-textSecondary max-w-md w-full px-2 md:px-0">
                    <p className="font-bold text-textPrimary text-[14px] sm:text-[15px]">{user.name}</p>
                    {user.bio.split('\n').map((line, i) => (
                      <p key={i} className="leading-relaxed">{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex justify-center border-b border-white/10 gap-8 px-4">
              <button
                onClick={() => setActiveTab('posts')}
                className={cn(
                  'pb-4 flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-widest border-b-2 transition-colors relative top-[1px]',
                  activeTab === 'posts' ? 'border-white text-white' : 'border-transparent text-white/40 hover:text-white/70'
                )}
              >
                <Grid className="w-4 h-4" />
                <span>Posts</span>
              </button>
              <button
                onClick={() => setActiveTab('soults')}
                className={cn(
                  'pb-4 flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-widest border-b-2 transition-colors relative top-[1px]',
                  activeTab === 'soults' ? 'border-white text-white' : 'border-transparent text-white/40 hover:text-white/70'
                )}
              >
                <Film className="w-4 h-4" />
                <span>Soults</span>
              </button>
            </div>

            {/* Posts Tab */}
            {activeTab === 'posts' && (
              loadingPosts ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 text-textSecondary animate-spin" />
                </div>
              ) : fullPosts.length === 0 ? (
                <div className="flex justify-center py-12">
                  <p className="text-sm text-textSecondary">Nenhuma publicação encontrada.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 md:gap-4">
                  {fullPosts.map((post, index) => (
                    <div
                      key={post.id}
                      onClick={() => setFeedModal({ list: fullPosts, startIndex: index })}
                      className="aspect-square bg-white/5 md:rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform flex items-center justify-center relative group"
                    >
                      {post.imageUrl ? (
                        <img src={post.imageUrl} alt={`Post ${index + 1}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full p-4 flex items-center justify-center text-center">
                          <p className="text-xs text-textSecondary line-clamp-5">{post.content || 'Publicação'}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Soults Tab */}
            {activeTab === 'soults' && (
              loadingSoults ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 text-textSecondary animate-spin" />
                </div>
              ) : soults.length === 0 ? (
                <div className="flex justify-center py-12">
                  <p className="text-sm text-textSecondary">Nenhum Soult publicado ainda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 md:gap-4">
                  {soults.map((soult) => (
                    <div
                      key={soult.id}
                      className="aspect-[9/16] bg-black md:rounded-2xl overflow-hidden relative group"
                    >
                      {soult.thumbnailUrl ? (
                        <img src={soult.thumbnailUrl} alt="Soult" className="w-full h-full object-cover" />
                      ) : soult.videoUrl ? (
                        <video src={`${soult.videoUrl}#t=0.001`} className="w-full h-full object-cover" muted />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-8 h-8 text-white/30" />
                        </div>
                      )}

                      {/* Overlay info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                        {soult.title && (
                          <p className="text-white text-[10px] font-semibold line-clamp-2 mb-1">{soult.title}</p>
                        )}
                        {/* Delete button — only for own profile */}
                        {isOwnProfile && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteSoult(soult.id); }}
                            disabled={deletingSoultId === soult.id}
                            className="self-end p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                            title="Apagar Soult"
                          >
                            {deletingSoultId === soult.id
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <Trash2 className="w-3 h-3" />
                            }
                          </button>
                        )}
                        
                        {!isOwnProfile && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setReportTarget({ id: soult.id, type: 'SOULT' }); }}
                            className="self-end p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white/70 hover:text-white transition-colors border border-white/10"
                            title="Denunciar Soult"
                          >
                            <Flag className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Play icon sempre visível */}
                      <div className="absolute top-2 left-2 pointer-events-none">
                        <Play className="w-4 h-4 text-white drop-shadow-md fill-white" />
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </main>
      </div>

      <BottomNav />

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowAvatarModal(false)}
        >
          <button
            onClick={() => setShowAvatarModal(false)}
            className="absolute top-6 right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt="Foto de perfil"
              onClick={e => e.stopPropagation()}
              className="w-full max-w-[320px] md:max-w-[400px] aspect-square rounded-2xl object-cover shadow-2xl border border-white/10 animate-scale-up"
            />
          ) : (
            <div className="w-full max-w-[320px] md:max-w-[400px] aspect-square rounded-2xl bg-white/5 flex items-center justify-center text-7xl font-bold text-textSecondary">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Feed Modal */}
      {feedModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col animate-fade-in">
          <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-lg border-b border-white/10 px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-bold text-white tracking-wide">Publicações</span>
            <button onClick={() => setFeedModal(null)} className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar py-6 pb-24">
            <div className="max-w-lg mx-auto space-y-6 sm:px-4">
              {feedModal.list
                .slice(feedModal.startIndex)
                .concat(feedModal.list.slice(0, feedModal.startIndex))
                .map((post, index) => (
                  <PostCard key={post.id} post={post} index={index} />
                ))}
            </div>
          </div>
        </div>
      )}

      {connectionsModal && (
        <ConnectionsModal
          title={connectionsModal.title}
          users={connectionsList}
          loading={connectionsLoading}
          onClose={() => setConnectionsModal(null)}
        />
      )}

      {reportTarget && (
        <ReportModal
          isOpen={true}
          onClose={() => setReportTarget(null)}
          targetId={reportTarget.id}
          targetType={reportTarget.type}
        />
      )}
    </div>
  );
}
