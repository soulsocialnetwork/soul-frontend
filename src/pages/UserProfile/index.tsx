import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
ArrowLeft,
CheckCircle2,
UserPlus,
UserCheck,
Grid,
X,
Loader2
} from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';
import { Sidebar } from '../../components/layout/Sidebar';
import { PostCard } from '../../components/feed/PostCard';
import { cn } from '../../utils/cn';
import {
userService,
type UserProfile,
type UserPost
} from '../../services/userService';
import type { Post } from '../../services/postService';
import type { ProfileSummary } from '../../services/api/types';
import { ConnectionsModal } from '../../components/profile/ConnectionsModal';
import { useAuth } from '../../context/AuthContext';

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
const [followLoading, setFollowLoading] = useState(false);
const [isFollowing, setIsFollowing] = useState(false);
const [showAvatarModal, setShowAvatarModal] = useState(false);
const [feedModal, setFeedModal] = useState<{
list: Post[];
startIndex: number;
} | null>(null);

const [connectionsModal, setConnectionsModal] = useState<{ type: 'followers' | 'following', title: string } | null>(null);
const [connectionsList, setConnectionsList] = useState<ProfileSummary[]>([]);
const [connectionsLoading, setConnectionsLoading] = useState(false);

useEffect(() => {
if (!username) {
setLoadingProfile(false);
return;
}

let cancelled = false;

const loadProfile = async () => {
  setLoadingProfile(true);

  try {
    const data = await userService.getByUsername(username);

    if (!cancelled) {
      setUser(data);
    }
  } catch {
    if (!cancelled) {
      setUser(null);
    }
  } finally {
    if (!cancelled) {
      setLoadingProfile(false);
    }
  }
};

loadProfile();

return () => {
  cancelled = true;
};


}, [username]);

useEffect(() => {
if (!username) return;
let cancelled = false;

const loadFollowStatus = async () => {
  try {
    const statusRes = await userService.getFollowStatus(username);
    if (!cancelled) {
      setIsFollowing(statusRes.status === 'FOLLOWING' || statusRes.status === 'PENDING');
    }
  } catch (error) {
    // Ignore se falhar
  }
};

loadFollowStatus();

return () => {
  cancelled = true;
};
}, [username]);

useEffect(() => {
if (!username) {
return;
}

let cancelled = false;

const loadPosts = async () => {
  setLoadingPosts(true);

  try {
    const posts = await userService.getPostsByUsername(username);

    if (!cancelled) {
      setUser((currentUser) => {
        if (!currentUser) {
          return currentUser;
        }

        return {
          ...currentUser,
          posts
        };
      });
    }
  } catch {
    if (!cancelled) {
      setUser((currentUser) => {
        if (!currentUser) {
          return currentUser;
        }

        return {
          ...currentUser,
          posts: []
        };
      });
    }
  } finally {
    if (!cancelled) {
      setLoadingPosts(false);
    }
  }
};

loadPosts();

return () => {
  cancelled = true;
};


}, [username]);

useEffect(() => {
const handleEsc = (event: KeyboardEvent) => {
if (event.key === 'Escape') {
setFeedModal(null);
setShowAvatarModal(false);
}
};

window.addEventListener('keydown', handleEsc);

const anyModalOpen = Boolean(feedModal || showAvatarModal);

document.body.style.overflow = anyModalOpen ? 'hidden' : 'unset';

return () => {
  window.removeEventListener('keydown', handleEsc);
  document.body.style.overflow = 'unset';
};


}, [feedModal, showAvatarModal]);

const handleFollowClick = async () => {
if (!username || followLoading) {
return;
}

const previousFollowing = isFollowing;

setFollowLoading(true);
setIsFollowing(!previousFollowing);

// Atualiza otimisticamente o número de seguidores
setUser(prev => prev ? {
  ...prev,
  connectionsCount: previousFollowing 
    ? Math.max(0, prev.connectionsCount - 1) 
    : prev.connectionsCount + 1
} : null);

try {
  if (previousFollowing) {
    await userService.unfollow(username);
  } else {
    await userService.follow(username);
  }
} catch {
  setIsFollowing(previousFollowing);
  // Reverte o contador em caso de erro
  setUser(prev => prev ? {
    ...prev,
    connectionsCount: previousFollowing 
      ? prev.connectionsCount + 1 
      : Math.max(0, prev.connectionsCount - 1)
  } : null);
} finally {
  setFollowLoading(false);
}


};

const handleOpenConnections = async (type: 'followers' | 'following') => {
if (!username) return;

setConnectionsModal({
  type,
  title: type === 'followers' ? 'Seguidores' : 'Seguindo'
});
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
return ( <div className="min-h-[100dvh] bg-background flex items-center justify-center"> <Loader2 className="w-6 h-6 text-textSecondary animate-spin" /> </div>
);
}

if (!user) {
return ( <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center text-textPrimary gap-4"> <p className="text-textSecondary">Perfil não encontrado</p>


    <button
      onClick={() => navigate(-1)}
      className="text-sm underline text-textSecondary"
    >
      Voltar
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
verified: user.verified
},
content: post.content || '',
imageUrl: post.imageUrl || undefined,
likesCount: 0,
commentsCount: 0,
createdAt: post.createdAt || new Date().toISOString()
}));

return ( <div className="min-h-[100dvh] bg-background flex flex-col lg:flex-row text-textPrimary select-none"> <Sidebar />

  <div className="flex-1 flex flex-col min-w-0">
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-white/5 px-4 py-3 flex items-center gap-3">
      <button
        onClick={() => navigate(-1)}
        className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors active:scale-95 shrink-0"
      >
        <ArrowLeft className="w-5 h-5 text-textPrimary" />
      </button>

      <span className="font-semibold text-sm truncate">
        {user.username}
      </span>
    </div>

    <main className="flex-1 overflow-y-auto no-scrollbar pb-24 lg:pb-12">
      <div className="w-full max-w-4xl mx-auto pt-4 lg:pt-8 px-4 sm:px-6 space-y-8">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl sm:rounded-2xl p-5 sm:p-6 md:p-10">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start w-full">
            <div
              onClick={() => setShowAvatarModal(true)}
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-40 md:h-40 rounded-2xl overflow-hidden border border-white/10 p-1 bg-white/5 shrink-0 cursor-pointer active:scale-95 transition-transform"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full rounded-2xl object-cover object-top"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-white/5 flex items-center justify-center text-2xl font-bold text-textSecondary">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full min-w-0">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-5 w-full md:w-auto">
                <div className="flex items-center justify-center md:justify-start gap-2 w-full md:w-auto overflow-hidden">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                    {user.username}
                  </h1>

                  {user.verified && (
                    <CheckCircle2
                      className="w-5 h-5 text-accent shrink-0"
                      strokeWidth={2.5}
                    />
                  )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
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
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Seguindo</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Seguir</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-4 sm:gap-6 justify-center md:justify-start w-full mb-5 text-sm">
                <div className="flex flex-col items-center md:items-start">
                  <span className="font-bold text-base sm:text-lg leading-none">
                    {user.postsCount}
                  </span>
                  <span className="text-textSecondary text-xs mt-1">
                    publicações
                  </span>
                </div>

                <div
                  onClick={() => handleOpenConnections('followers')}
                  className="flex flex-col items-center md:items-start cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                >
                  <span className="font-bold text-base sm:text-lg leading-none">
                    {user.connectionsCount}
                  </span>
                  <span className="text-textSecondary text-xs mt-1">
                    seguidores
                  </span>
                </div>

                <div
                  onClick={() => handleOpenConnections('following')}
                  className="flex flex-col items-center md:items-start cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                >
                  <span className="font-bold text-base sm:text-lg leading-none">
                    {user.followingCount}
                  </span>
                  <span className="text-textSecondary text-xs mt-1">
                    seguindo
                  </span>
                </div>

                <div className="flex flex-col items-center md:items-start">
                  <span className="font-bold text-base sm:text-lg leading-none">
                    0
                  </span>
                  <span className="text-textSecondary text-xs mt-1">
                    amigos reais
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-sm text-textSecondary max-w-md w-full px-2 md:px-0">
                <p className="font-bold text-textPrimary text-[14px] sm:text-[15px]">
                  {user.name}
                </p>

                {user.bio.split('\n').map((line, index) => (
                  <p key={index} className="leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center border-b border-white/10 mb-6 gap-8 px-4">
          <button className="pb-4 flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-widest border-b-2 transition-colors relative top-[1px] border-white text-white">
            <Grid className="w-4 h-4" />
            <span>Posts</span>
          </button>
        </div>

        {loadingPosts ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-textSecondary animate-spin" />
          </div>
        ) : fullPosts.length === 0 ? (
          <div className="flex justify-center py-12">
            <p className="text-sm text-textSecondary">
              Nenhuma publicação encontrada.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 md:gap-4">
            {fullPosts.map((post, index) => (
              <div
                key={post.id}
                onClick={() =>
                  setFeedModal({
                    list: fullPosts,
                    startIndex: index
                  })
                }
                className="aspect-square bg-white/5 md:rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform flex items-center justify-center relative group"
              >
                {post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt={`Post ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full p-4 flex items-center justify-center text-center">
                    <p className="text-xs text-textSecondary line-clamp-5">
                      {post.content || 'Publicação'}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
        <img
          src={user.avatarUrl}
          alt="Foto de perfil"
          onClick={(event) => event.stopPropagation()}
          className="w-full max-w-[320px] md:max-w-[400px] aspect-square rounded-2xl object-cover shadow-2xl border border-white/10 animate-scale-up"
        />
      ) : (
        <div className="w-full max-w-[320px] md:max-w-[400px] aspect-square rounded-2xl bg-white/5 flex items-center justify-center text-7xl font-bold text-textSecondary">
          {user.name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  )}

  {feedModal && (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col animate-fade-in">
      <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-lg border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-bold text-white tracking-wide">
          Publicações
        </span>

        <button
          onClick={() => setFeedModal(null)}
          className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar py-6 pb-24">
        <div className="max-w-lg mx-auto space-y-6 sm:px-4">
          {feedModal.list
            .slice(feedModal.startIndex)
            .concat(feedModal.list.slice(0, feedModal.startIndex))
            .map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                index={index}
              />
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
</div>

);
}
