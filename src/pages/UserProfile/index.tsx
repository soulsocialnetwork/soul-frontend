import { SecureImage, SecureVideo } from '../../components/ui/SecureMedia';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  UserPlus,
  UserCheck,
  Grid,
  Film,
  X,
  Loader2,
  MessageSquare,
  Trash2,
  Play,
  ChevronLeft,
  ChevronRight,
  Flag,
  LockKeyhole,
} from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';
import { Sidebar } from '../../components/layout/Sidebar';
import { PostCard } from '../../components/feed/PostCard';
import { ReportModal } from '../../components/modals/ReportModal';
import { HighlightCover } from '../../components/profile/HighlightCover';
import { ProfileBadge, profileNameColor } from '../../components/profile/ProfileBadge';
import { ProfileMetric } from '../../components/profile/ProfileMetric';
import { ConfirmUnfollowModal } from '../../components/profile/ConfirmUnfollowModal';
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
import { moderationService } from '../../services/moderationService';
import { api, getHttpErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type ProfileTab = 'posts' | 'soults';

// apresenta perfis públicos e privados com relações, posts, soults e ações sociais
export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [banning, setBanning] = useState(false);
  const [banError, setBanError] = useState('');
  const [showBanForm, setShowBanForm] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (username && currentUser?.username === username) {
      navigate('/profile', { replace: true });
    }
  }, [username, currentUser?.username, navigate]);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [postsError, setPostsError] = useState('');
  const [soultsError, setSoultsError] = useState('');
  const [reloadContent, setReloadContent] = useState(0);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingSoults, setLoadingSoults] = useState(false);
  const [soults, setSoults] = useState<Soult[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [followLoading, setFollowLoading] = useState(false);
  const [confirmUnfollow, setConfirmUnfollow] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [invitingFriend, setInvitingFriend] = useState(false);
  const [realFriendStatus, setRealFriendStatus] = useState<'NONE' | 'SENT' | 'RECEIVED' | 'FRIENDS'>('NONE');
  const [showCutTies, setShowCutTies] = useState(false);
  const [cuttingTies, setCuttingTies] = useState(false);
  const [followStatus, setFollowStatus] = useState<'NOT_FOLLOWING' | 'PENDING' | 'FOLLOWING'>('NOT_FOLLOWING');
  const isFollowing = followStatus === 'FOLLOWING';
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
  const [highlights, setHighlights] = useState<Array<{ id: string; title: string; coverUrl: string; mediaUrls: string[] }>>([]);
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);
  const [activeHighlightMedia, setActiveHighlightMedia] = useState(0);

  useEffect(() => {
    if (!username) { setLoadingProfile(false); return; }
    let cancelled = false;
    setLoadingProfile(true);
    setBanError('');
    userService.getByUsername(username)
      .then(data => { if (!cancelled) setUser(data); })
      .catch(() => { if (!cancelled) setUser(null); })
      .finally(() => { if (!cancelled) setLoadingProfile(false); });
    return () => { cancelled = true; };
  }, [username]);

  useEffect(() => { if (username) void userService.getRealFriendStatus(username).then(setRealFriendStatus).catch(() => setRealFriendStatus('NONE')); }, [username]);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    userService.getFollowStatus(username)
      .then(res => {
        if (!cancelled) setFollowStatus(res.status);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [username]);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    setLoadingPosts(true);
    setPostsError('');
    userService.getPostsByUsername(username)
      .then(posts => {
        if (!cancelled) setUser(prev => prev ? { ...prev, posts } : prev);
      })
      .catch(error => { if (!cancelled) setPostsError(getHttpErrorMessage(error)); })
      .finally(() => { if (!cancelled) setLoadingPosts(false); });
    return () => { cancelled = true; };
  }, [username, reloadContent]);

  useEffect(() => {
    if (activeTab !== 'soults' || !username) return;
    let cancelled = false;
    setLoadingSoults(true);
    setSoultsError('');
    soultService.getSoultsByUsername(username)
      .then(data => { if (!cancelled) setSoults(data); })
      .catch(error => { if (!cancelled) setSoultsError(getHttpErrorMessage(error)); })
      .finally(() => { if (!cancelled) setLoadingSoults(false); });
    return () => { cancelled = true; };
  }, [username, activeTab, reloadContent]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setFeedModal(null); setShowAvatarModal(false); }
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = (feedModal || showAvatarModal) ? 'hidden' : 'unset';
    return () => { window.removeEventListener('keydown', handleEsc); document.body.style.overflow = 'unset'; };
  }, [feedModal, showAvatarModal]);

  const isOwnProfile = currentUser?.username === username;
  const canViewProfileContent = !user?.privateProfile || isOwnProfile || isFollowing || currentUser?.role === 'ADMIN';

  useEffect(() => {
    if (!username || !canViewProfileContent) { setHighlights([]); return; }
    let cancelled = false;
    api.get<Array<{ id: string; title: string; coverUrl: string; mediaUrls?: string[] }>>(`/highlights/user/${encodeURIComponent(username)}`)
      .then(({ data }) => { if (!cancelled) setHighlights(data.map(item => ({ ...item, mediaUrls: item.mediaUrls?.length ? item.mediaUrls : [item.coverUrl] }))); })
      .catch(() => { if (!cancelled) setHighlights([]); });
    return () => { cancelled = true; };
  }, [username, canViewProfileContent]);

  const moveHighlight = (direction: number) => {
    if (activeHighlight === null) return;
    const nextMedia = activeHighlightMedia + direction;
    if (nextMedia >= 0 && nextMedia < highlights[activeHighlight].mediaUrls.length) { setActiveHighlightMedia(nextMedia); return; }
    const nextHighlight = activeHighlight + direction;
    if (nextHighlight < 0 || nextHighlight >= highlights.length) { setActiveHighlight(null); return; }
    setActiveHighlight(nextHighlight);
    setActiveHighlightMedia(direction < 0 ? highlights[nextHighlight].mediaUrls.length - 1 : 0);
  };

  const handleBan = async () => {
    if (!user || banning || user.banned) return;
    if (!banReason.trim()) return;
    setBanning(true);
    setBanError('');
    try {
      await moderationService.banAccount(user.id, banReason, banDuration ? Number(banDuration) : null);
      setUser(previous => previous ? { ...previous, banned: true } : previous);
      setShowBanForm(false);
    } catch (error) {
      setBanError(getHttpErrorMessage(error));
    } finally {
      setBanning(false);
    }
  };

  const handleUnban = async () => {
    if (!user || banning || !window.confirm(`Desbanir @${user.username}?`)) return;
    setBanning(true);
    setBanError('');
    try {
      await moderationService.unbanAccount(user.id);
      setUser(previous => previous ? { ...previous, banned: false } : previous);
    } catch (error) { setBanError(getHttpErrorMessage(error)); }
    finally { setBanning(false); }
  };

  const handleFollowClick = async (confirmed = false) => {
    if (!username || followLoading || isOwnProfile) return;
    if (followStatus === 'FOLLOWING' && !confirmed) { setConfirmUnfollow(true); return; }
    const prev = followStatus;
    setFollowLoading(true);
    try {
      if (prev === 'NOT_FOLLOWING') await userService.follow(username);
      else await userService.unfollow(username);
      const next = prev === 'NOT_FOLLOWING' ? (user?.privateProfile ? 'PENDING' : 'FOLLOWING') : 'NOT_FOLLOWING';
      setFollowStatus(next);
      if (prev === 'FOLLOWING' || next === 'FOLLOWING') {
        setUser(u => u ? { ...u, followerCount: Math.max(0, u.followerCount + (next === 'FOLLOWING' ? 1 : -1)) } : null);
      }
      if (prev === 'FOLLOWING' && realFriendStatus === 'FRIENDS') {
        setRealFriendStatus('NONE');
        setUser(u => u ? { ...u, friendsCount: Math.max(0, u.friendsCount - 1) } : null);
      }
      if (next === 'FOLLOWING') setReloadContent(value => value + 1);
    } catch (error) {
      setBanError(getHttpErrorMessage(error));
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!username || sendingMsg) return;
    setSendingMsg(true);
    try {
      const conversation = await messageService.getOrCreateConversation(username);
      navigate(`/messages?conversation=${encodeURIComponent(conversation.id)}`);
    } catch (error) {
      setBanError(getHttpErrorMessage(error));
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
        <div className="soul-glass w-20 h-20 rounded-full flex items-center justify-center shadow-lg">
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
      profileBadge: user.profileBadge,
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

        <main className="flex-1 overflow-y-auto pb-24 lg:pb-12">
          <div className="w-full max-w-4xl mx-auto pt-4 lg:pt-8 px-4 sm:px-6 space-y-8">
            {banError && <p role="alert" className="p-4 rounded-xl bg-red-500/10 text-red-400">{banError}</p>}
            {user.banned && <p role="status" className="p-4 rounded-xl bg-red-500/10 text-red-400">Esta conta foi banida.</p>}
            <div className="soul-glass rounded-2xl p-5 sm:p-6 md:p-10">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start w-full">
                <div
                  onClick={() => setShowAvatarModal(true)}
                  className="rounded-lg w-24 h-24 sm:w-28 sm:h-28 md:w-40 md:h-40 overflow-hidden bg-neutral-800 shrink-0 cursor-pointer active:scale-95 transition-transform"
                >
                  {user.avatarUrl ? (
                    <SecureImage src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-2xl object-cover object-top" />
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-white/5 flex items-center justify-center text-2xl font-bold text-textSecondary">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full min-w-0">
                  <div className="flex flex-col items-center md:items-start gap-4 mb-5 w-full min-w-0">
                    <div className="flex items-center justify-center md:justify-start gap-2 w-full min-w-0">
                      <h1 className={cn('min-w-0 break-all text-xl sm:text-2xl font-bold tracking-tight', profileNameColor(user.profileBadge))}>@{user.username}</h1>
                      <ProfileBadge badge={user.profileBadge} />
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 w-full">
                      {currentUser?.role === 'ADMIN' && !isOwnProfile && (
                        <button onClick={user.banned ? handleUnban : () => setShowBanForm(true)} disabled={banning} className="px-4 h-9 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-semibold disabled:opacity-50">
                          {banning ? 'Processando...' : user.banned ? 'Desbanir conta' : 'Banir conta'}
                        </button>
                      )}
                      {!isOwnProfile && (
                        <button
                          onClick={async () => {
                            if (!username || invitingFriend) return;
                            if (realFriendStatus === 'FRIENDS') { setShowCutTies(true); return; }
                            setInvitingFriend(true);
                            try { await userService.inviteRealFriend(username); setRealFriendStatus('SENT'); }
                            catch (error) { setPostsError(getHttpErrorMessage(error)); }
                            finally { setInvitingFriend(false); }
                          }}
                          disabled={(!isFollowing && realFriendStatus !== 'FRIENDS') || invitingFriend || (realFriendStatus !== 'NONE' && realFriendStatus !== 'FRIENDS')}
                          title="Ambos precisam se seguir para enviar o convite"
                          className={cn('flex items-center justify-center gap-2 px-4 h-9 rounded-xl text-[13px] font-semibold soul-glass text-white transition-all shrink-0', (!isFollowing && realFriendStatus !== 'FRIENDS') || invitingFriend ? 'opacity-50 cursor-not-allowed' : 'active:scale-95')}
                        >
                          {invitingFriend ? <Loader2 className="w-4 h-4 animate-spin" /> : realFriendStatus === 'FRIENDS' ? <><UserCheck className="w-4 h-4" /><span className="hidden sm:inline">Amigos reais</span></> : realFriendStatus === 'SENT' ? <><UserCheck className="w-4 h-4" /><span className="hidden sm:inline">Convite enviado</span></> : realFriendStatus === 'RECEIVED' ? <><UserCheck className="w-4 h-4" /><span className="hidden sm:inline">Convite recebido</span></> : <><UserPlus className="w-4 h-4" /><span className="hidden sm:inline">Tornar amigos reais</span></>}
                        </button>
                      )}

                      {!isOwnProfile && (
                        <button
                          onClick={() => void handleFollowClick()}
                          disabled={followLoading}
                          className={cn(
                            'flex items-center justify-center gap-2 px-5 h-9 rounded-xl text-[13px] font-semibold transition-all active:scale-95 flex-1 md:flex-none disabled:opacity-60',
                            followStatus !== 'NOT_FOLLOWING'
                              ? 'soul-glass text-textPrimary'
                              : 'bg-white text-black hover:bg-white/90'
                          )}
                        >
                          {followLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : followStatus === 'PENDING' ? (
                            <><UserCheck className="w-4 h-4" /><span>Solicitação enviada</span></>
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
                            'flex items-center justify-center gap-2 px-4 h-9 rounded-xl text-[13px] font-semibold soul-glass text-white transition-all shrink-0',
                            !isFollowing || sendingMsg
                              ? 'opacity-50 cursor-not-allowed'
                              : 'active:scale-95'
                          )}
                        >
                          {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <><MessageSquare className="w-4 h-4" /><span className="hidden sm:inline">Mensagem</span></>}
                        </button>
                      )}

                      {!isOwnProfile && (
                        <button
                          onClick={() => setReportTarget({ id: user.id, type: 'ACCOUNT' })}
                          className="soul-glass flex items-center justify-center p-2.5 rounded-xl text-textSecondary hover:text-white transition-all shrink-0 active:scale-95"
                          title="Denunciar Conta"
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start w-full mb-5 text-sm">
                    <div className="flex flex-col items-center md:items-start">
                      <span className="font-bold text-base sm:text-lg leading-none">{user.postsCount}</span>
                      <span className="text-textSecondary text-xs mt-1">publicações</span>
                    </div>
                    <ProfileMetric value={user.followerCount || 0} label="seguidores" onClick={() => handleOpenConnections('followers')} />
                    <ProfileMetric value={user.followingCount} label="seguindo" onClick={() => handleOpenConnections('following')} />
                    <ProfileMetric value={user.friendsCount || 0} label="amigos reais" />
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

            {!canViewProfileContent ? (
              <div className="soul-glass rounded-2xl px-6 py-12 text-center">
                <LockKeyhole className="mx-auto h-7 w-7 text-white/60" aria-hidden="true" />
                <h2 className="mt-4 text-lg font-semibold text-white">Este perfil é privado</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-textSecondary">
                  {followStatus === 'PENDING' ? 'Sua solicitação foi enviada. Você poderá ver as publicações quando ela for aceita.' : 'Envie uma solicitação para seguir e ver os posts e Soults deste perfil.'}
                </p>
              </div>
            ) : <>
            {highlights.length > 0 && <div className="flex gap-4 overflow-x-auto pb-4" aria-label="Destaques do perfil">
              {highlights.map((highlight, index) => <button key={highlight.id} type="button" onClick={() => { setActiveHighlight(index); setActiveHighlightMedia(0); }} className="flex shrink-0 flex-col items-center gap-2 text-xs text-white/70">
                <HighlightCover src={highlight.coverUrl} label={highlight.title} /><span className="max-w-20 truncate">{highlight.title}</span>
              </button>)}
            </div>}
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

            {activeTab === 'posts' && (
              loadingPosts ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 text-textSecondary animate-spin" />
                </div>
              ) : postsError ? (
                <div role="alert" className="py-8 text-center space-y-4"><p className="text-sm text-textSecondary">{postsError}</p><button className="glass-pill px-5 py-3 rounded-xl" onClick={() => setReloadContent(value => value + 1)}>Tentar novamente</button></div>
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
                        <SecureImage src={post.imageUrl} alt={`Post ${index + 1}`} className="w-full h-full object-cover" />
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

            {activeTab === 'soults' && (
              loadingSoults ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 text-textSecondary animate-spin" />
                </div>
              ) : soultsError ? (
                <div role="alert" className="py-8 text-center space-y-4"><p className="text-sm text-textSecondary">{soultsError}</p><button className="glass-pill px-5 py-3 rounded-xl" onClick={() => setReloadContent(value => value + 1)}>Tentar novamente</button></div>
              ) : soults.length === 0 ? (
                <div className="flex justify-center py-12">
                  <p className="text-sm text-textSecondary">Nenhum Soult publicado ainda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 md:gap-4">
                  {soults.map((soult) => (
                    <div
                      key={soult.id}
                      role="link"
                      tabIndex={0}
                      aria-label={`Abrir Soult de ${soult.author.name || soult.username || 'usuário'}`}
                      onClick={() => navigate(`/soults?video=${encodeURIComponent(soult.id)}`)}
                      onKeyDown={event => {
                        if (event.target !== event.currentTarget) return;
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          navigate(`/soults?video=${encodeURIComponent(soult.id)}`);
                        }
                      }}
                      className="aspect-[9/16] bg-black md:rounded-2xl overflow-hidden relative group cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60"
                    >
                      {soult.thumbnailUrl ? (
                        <SecureImage src={soult.thumbnailUrl} alt="Soult" className="w-full h-full object-cover" />
                      ) : soult.videoUrl ? (
                        <SecureVideo
                          src={`${soult.videoUrl}#t=0.001`}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          preload="auto"
                          onLoadedData={event => {
                            const video = event.currentTarget;
                            if (video.currentTime === 0 && Number.isFinite(video.duration) && video.duration > 0) {
                              video.currentTime = Math.min(0.001, video.duration / 2);
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-8 h-8 text-white/30" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                        {soult.title && (
                          <p className="text-white text-[10px] font-semibold line-clamp-2 mb-1">{soult.title}</p>
                        )}
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

                      <div className="absolute top-2 left-2 pointer-events-none">
                        <Play className="w-4 h-4 text-white drop-shadow-md fill-white" />
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
            </>}
          </div>
        </main>
      </div>

      <BottomNav />

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
            <SecureImage
              src={user.avatarUrl}
              alt="Foto de perfil"
              onClick={e => e.stopPropagation()}
              className="rounded-lg w-full max-w-[320px] md:max-w-[400px] aspect-square object-cover shadow-2xl animate-scale-up"
            />
          ) : (
            <div className="rounded-lg w-full max-w-[320px] md:max-w-[400px] aspect-square bg-white/5 flex items-center justify-center text-7xl font-bold text-textSecondary">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      {feedModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col animate-fade-in">
          <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-lg border-b border-white/10 px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-bold text-white tracking-wide">Publicações</span>
            <button onClick={() => setFeedModal(null)} className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-6 pb-24">
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
          onRelationshipChange={() => { if (username) void userService.getByUsername(username).then(profile => {
            if (profile) setUser(previous => previous ? { ...previous, followerCount: profile.followerCount, followingCount: profile.followingCount, friendsCount: profile.friendsCount } : previous);
          }); }}
        />
      )}

      {confirmUnfollow && username && <ConfirmUnfollowModal username={username} onCancel={() => setConfirmUnfollow(false)} onConfirm={() => { setConfirmUnfollow(false); void handleFollowClick(true); }} />}

      {showCutTies && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setShowCutTies(false); }}>
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-[#1c1c1c] p-5" role="dialog" aria-modal="true" aria-label="Cortar laços de Amigo Real">
            <div><h2 className="text-lg font-semibold text-white">Antes de cortar laços</h2><p className="mt-2 text-sm leading-relaxed text-white/55">Você pode conversar com @{user.username} primeiro. Enviar mensagem é opcional, e a outra pessoa decide se quer responder.</p></div>
            <div className="flex gap-2">
              <button type="button" disabled={cuttingTies || sendingMsg} onClick={() => { setShowCutTies(false); void handleSendMessage(); }} className="flex-1 rounded-lg bg-white px-3 py-2.5 text-xs font-semibold text-black disabled:opacity-50">Abrir conversa</button>
              <button type="button" disabled={cuttingTies} onClick={async () => {
                if (!username) return;
                setCuttingTies(true); setBanError('');
                try {
                  await userService.removeRealFriend(username);
                  setRealFriendStatus('NONE');
                  setUser(previous => previous ? { ...previous, friendsCount: Math.max(0, previous.friendsCount - 1) } : previous);
                  setShowCutTies(false);
                } catch (error) { setBanError(getHttpErrorMessage(error)); }
                finally { setCuttingTies(false); }
              }} className="flex-1 rounded-lg border border-red-400/20 px-3 py-2.5 text-xs font-semibold text-red-300 hover:bg-red-400/10 disabled:opacity-50">Cortar laços</button>
            </div>
            {banError && <p role="alert" className="text-xs text-red-300">{banError}</p>}
            <button type="button" onClick={() => setShowCutTies(false)} className="text-xs text-white/45 hover:text-white">Voltar ao perfil</button>
          </div>
        </div>
      )}

      {reportTarget && (
        <ReportModal
          isOpen={true}
          onClose={() => setReportTarget(null)}
          targetId={reportTarget.id}
          targetType={reportTarget.type}
        />
      )}
      {showBanForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4" onMouseDown={event => { if (event.target === event.currentTarget) setShowBanForm(false); }}>
          <form onSubmit={event => { event.preventDefault(); void handleBan(); }} className="soul-glass w-full max-w-md space-y-4 rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-white">Banir @{user.username}</h2>
            <label className="block text-sm text-white/80">Motivo
              <textarea required maxLength={500} value={banReason} onChange={event => setBanReason(event.target.value)} className="mt-2 min-h-24 w-full rounded-lg border border-white/15 bg-black/30 p-3 text-white" />
            </label>
            <label className="block text-sm text-white/80">Duração
              <select value={banDuration} onChange={event => setBanDuration(event.target.value)} className="mt-2 w-full rounded-lg border border-white/15 bg-black/30 p-3 text-white">
                <option value="">Permanente</option><option value="24">24 horas</option><option value="72">3 dias</option><option value="168">7 dias</option><option value="720">30 dias</option>
              </select>
            </label>
            {banError && <p role="alert" className="text-sm text-red-400">{banError}</p>}
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowBanForm(false)} className="rounded-lg bg-white/10 px-4 py-2 text-white">Cancelar</button><button type="submit" disabled={banning || !banReason.trim()} className="rounded-lg bg-red-500/20 px-4 py-2 text-red-300 disabled:opacity-50">Confirmar banimento</button></div>
          </form>
        </div>
      )}
      {activeHighlight !== null && highlights[activeHighlight] && <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 p-0 sm:p-4" onMouseDown={event => { if (event.target === event.currentTarget) setActiveHighlight(null); }}>
        <div className="relative h-[100dvh] w-full overflow-hidden bg-black sm:h-[80dvh] sm:max-h-[650px] sm:max-w-sm sm:rounded-2xl sm:border sm:border-white/15">
          {/[.](mp4|webm)(?:[?#]|$)/i.test(highlights[activeHighlight].mediaUrls[activeHighlightMedia])
            ? <SecureVideo key={highlights[activeHighlight].mediaUrls[activeHighlightMedia]} src={`${highlights[activeHighlight].mediaUrls[activeHighlightMedia]}#t=0.001`} controls autoPlay className="h-full w-full object-contain" />
            : <SecureImage src={highlights[activeHighlight].mediaUrls[activeHighlightMedia]} className="h-full w-full object-contain" alt={highlights[activeHighlight].title} />}
          <div className="absolute left-3 right-3 top-[max(0.75rem,env(safe-area-inset-top))] flex items-center justify-between gap-2"><div className="min-w-0 flex-1"><div className="flex gap-1">{highlights[activeHighlight].mediaUrls.map((_, index) => <span key={index} className={`h-1 flex-1 rounded-full ${index <= activeHighlightMedia ? 'bg-white' : 'bg-white/30'}`} />)}</div><p className="mt-2 truncate text-sm font-semibold text-white">{highlights[activeHighlight].title}</p></div><button type="button" onClick={() => setActiveHighlight(null)} aria-label="Fechar destaque" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-black/50 text-white"><X size={18} /></button></div>
          <button type="button" onClick={() => moveHighlight(-1)} aria-label="Mídia anterior" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-lg bg-black/50 p-2 text-white"><ChevronLeft size={20} /></button>
          <button type="button" onClick={() => moveHighlight(1)} aria-label="Próxima mídia" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-black/50 p-2 text-white"><ChevronRight size={20} /></button>
        </div>
      </div>}
    </div>
  );
}
