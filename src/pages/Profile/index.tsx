import { SecureImage, SecureVideo } from '../../components/ui/SecureMedia';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';

import { PostCard } from '../../components/feed/PostCard';
import type { Post } from '../../services/postService';
import { authService } from '../../services/authService';
import { api, endpoints, getHttpErrorMessage } from '../../services/api';
import type {
  CurrentUserResponse,
  PagePostResponse,
  ProfileSummary,
} from '../../services/api/types';
import { userService } from '../../services/userService';
import { ConnectionsModal } from '../../components/profile/ConnectionsModal';
import { RealFriendsModal } from '../../components/profile/RealFriendsModal';
import { postService } from '../../services/postService';
import { soultService, type Soult } from '../../services/soultService';
import {
  Grid,
  Film,
  Bookmark,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
  Check,
  Trash2,
  QrCode,
  Loader2,
  BadgeCheck,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { ScreenLoader } from '../../components/ui/ScreenLoader';
import { useAuth } from '../../context/AuthContext';

export interface HighlightItem {
  id: string;
  name: string;
  cover: string;
  image: string;
  type?: 'image' | 'video';
  isNew?: boolean;
}

interface PublicProfileResponse {
  id: string;
  name: string;
  username: string;
  profilePicture: string | null;
  bio: string | null;
  privateProfile: boolean;
  postCount: number;
  followerCount: number;
  followingCount: number;
  realFriendsCount: number;
}

interface ProfileData {
  username: string;
  fullName: string;
  bio: string;
  avatarUrl: string;
}

const EMPTY_PROFILE: ProfileData = {
  username: '',
  fullName: '',
  bio: '',
  avatarUrl: '',
};

function convertPostResponseToPost(
  postResponse: PagePostResponse['content'][number]
): Post {
  return {
    id: postResponse.id,
    author: {
      id: postResponse.userId,
      name: postResponse.name,
      username: postResponse.username,
      avatarUrl: postResponse.profilePicture || undefined,
      verified: postResponse.verified,
    },
    content: postResponse.content,
    imageUrl: postResponse.imageUrl || undefined,
    likesCount: 0,
    commentsCount: 0,
    createdAt: postResponse.createdAt,
  };
}

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [reload, setReload] = useState(0);
  const [activeTab, setActiveTab] = useState<'posts' | 'soults' | 'saved'>('posts');
  const highlightsRef = useRef<HTMLDivElement>(null);

  const [highlightError, setHighlightError] = useState('');
  const [deletingHighlight, setDeletingHighlight] = useState(false);
  const [highlightsList, setHighlightsList] = useState<HighlightItem[]>([]);
  const [profileData, setProfileData] =
    useState<ProfileData>(EMPTY_PROFILE);
  const [editForm, setEditForm] =
    useState<ProfileData>(EMPTY_PROFILE);

  const [showEditModal, setShowEditModal] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState('');

  const [feedModal, setFeedModal] = useState<{
    list: Post[];
    startIndex: number;
  } | null>(null);

  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const [activeHighlightIndex, setActiveHighlightIndex] =
    useState<number | null>(null);

  const [avatarFilePreview, setAvatarFilePreview] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [showAvatarPickerModal, setShowAvatarPickerModal] =
    useState(false);

  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [realFriendsCount, setRealFriendsCount] = useState(0);
  const [postCount, setPostCount] = useState(0);

  const [showRealFriendsModal, setShowRealFriendsModal] =
    useState(false);

  const [connectionsModal, setConnectionsModal] = useState<{
    type: 'followers' | 'following';
    title: string;
  } | null>(null);

  const [connectionsList, setConnectionsList] = useState<
    ProfileSummary[]
  >([]);

  const [connectionsLoading, setConnectionsLoading] =
    useState(false);

  const [displayPosts, setDisplayPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [savedSoults, setSavedSoults] = useState<Soult[]>([]);
  const [profileSoults, setProfileSoults] = useState<Soult[]>([]);

  useEffect(() => {
    if (!profileData.username) return;
    let cancelled = false;
    void soultService.getSoultsByUsername(profileData.username)
      .then((items) => { if (!cancelled) setProfileSoults(items); })
      .catch(() => { if (!cancelled) setProfileSoults([]); });
    return () => { cancelled = true; };
  }, [profileData.username]);

  useEffect(() => {
    let cancelled = false;
    const loadSavedSoults = () => {
      void soultService.getSavedSoults()
        .then((items) => { if (!cancelled) setSavedSoults(items); })
        .catch(() => { if (!cancelled) setSavedSoults([]); });
    };
    loadSavedSoults();
    window.addEventListener('savedSoultsUpdated', loadSavedSoults);
    return () => {
      cancelled = true;
      window.removeEventListener('savedSoultsUpdated', loadSavedSoults);
    };
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;

    const loadSaved = async () => {
      try {
        const stored = JSON.parse(
          localStorage.getItem(`soul_saved_posts:${user?.id}`) || '[]'
        );

        const ids: string[] = Array.isArray(stored)
          ? stored
              .map((item) =>
                typeof item === 'string' ? item : item.id
              )
              .filter((id) => typeof id === 'string')
          : [];

        localStorage.setItem(
          `soul_saved_posts:${user?.id}`,
          JSON.stringify(ids)
        );

        const results = await Promise.allSettled(
          ids.map((id) => postService.getPostById(id))
        );

        if (!cancelled) {
          setSavedPosts(
            results.flatMap((result) =>
              result.status === 'fulfilled' ? [result.value] : []
            )
          );
        }
      } catch {
        if (!cancelled) {
          setSavedPosts([]);
        }
      }
    };

    loadSaved();

    window.addEventListener('savedPostsUpdated', loadSaved);

    return () => {
      cancelled = true;
      window.removeEventListener('savedPostsUpdated', loadSaved);
    };
  }, [user?.id]);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setLoadError('');

      try {
        const currentUser: CurrentUserResponse =
          await authService.getMe();

        const profileResponse = await api.get<PublicProfileResponse>(
          endpoints.profiles.byUsername(currentUser.username)
        );

        const profile = profileResponse.data;

        setProfileData({
          username: profile.username,
          fullName: profile.name,
          bio: profile.bio || '',
          avatarUrl: profile.profilePicture || '',
        });

        setEditForm({
          username: profile.username,
          fullName: profile.name,
          bio: profile.bio || '',
          avatarUrl: profile.profilePicture || '',
        });

        setFollowersCount(profile.followerCount);
        setFollowingCount(profile.followingCount);
        setRealFriendsCount(profile.realFriendsCount);
        setPostCount(profile.postCount);

        const postsResponse = await api.get<PagePostResponse>(
          endpoints.profiles.posts(profile.username),
          {
            params: {
              page: 0,
              size: 100,
            },
          }
        );

        setDisplayPosts(
          postsResponse.data.content.map(convertPostResponseToPost)
        );
      } catch (error) {
        setLoadError(getHttpErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [reload]);

  useEffect(() => {
    let cancelled = false;
    let legacy: HighlightItem[] = [];

    try {
      const saved = JSON.parse(
        localStorage.getItem(
          `@app:highlights_${user?.username || 'guest'}`
        ) || '[]'
      );

      if (Array.isArray(saved)) {
        legacy = saved.filter(
          (item) =>
            typeof item?.id === 'string' &&
            item.id.startsWith('hl-') &&
            typeof item.cover === 'string'
        );
      }
    } catch {
      /* Keep server highlights available if local history is invalid. */
    }

    setHighlightsList(legacy);

    api
      .get<{ id: string; title: string; coverUrl: string }[]>(
        '/highlights/me'
      )
      .then(({ data }) => {
        if (!cancelled) {
          setHighlightsList([
            ...data.map((item) => ({
              id: item.id,
              name: item.title,
              cover: item.coverUrl,
              image: item.coverUrl,
              type: /[.](mp4|webm|mov)(?:[?#]|$)/i.test(
                item.coverUrl
              )
                ? ('video' as const)
                : ('image' as const),
            })),
            ...legacy,
          ]);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setHighlightError(getHttpErrorMessage(error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.username]);

  const handleOpenEditModal = () => {
    setEditForm(profileData);
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaveError('');

    if (
      !editForm.fullName.trim() ||
      editForm.fullName.trim().length < 2
    ) {
      setProfileSaveError(
        'O nome precisa ter pelo menos 2 caracteres.'
      );
      return;
    }

    if (editForm.bio.length > 160) {
      setProfileSaveError(
        'A bio pode ter no máximo 160 caracteres.'
      );
      return;
    }

    setIsSavingProfile(true);

    try {
      let finalAvatarUrl = editForm.avatarUrl;

      if (avatarFile) {
        finalAvatarUrl = await postService.uploadMedia(avatarFile);
      }

      const payload = {
        name: editForm.fullName.trim(),
        bio: editForm.bio.trim(),
        profilePicture: finalAvatarUrl || '',
      };

      await api.put(endpoints.user.me, payload);

      setProfileData({
        ...editForm,
        fullName: editForm.fullName.trim(),
        bio: editForm.bio.trim(),
        avatarUrl: finalAvatarUrl || '',
      });

      setAvatarFile(null);
      setShowEditModal(false);
      setProfileSaveError('');
    } catch {
      setProfileSaveError(
        'Não foi possível salvar. Tente novamente.'
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleOpenHighlight = (index: number) => {
    setActiveHighlightIndex(index);
  };

  const handleNextHighlight = () => {
    if (activeHighlightIndex === null) return;

    const nextIndex = activeHighlightIndex + 1;

    if (nextIndex < highlightsList.length) {
      setActiveHighlightIndex(nextIndex);
    } else {
      setActiveHighlightIndex(null);
    }
  };

  const handlePrevHighlight = () => {
    if (activeHighlightIndex === null) return;

    if (activeHighlightIndex > 0) {
      setActiveHighlightIndex(activeHighlightIndex - 1);
    }
  };

  const scrollHighlightsLeft = () => {
    if (highlightsRef.current) {
      highlightsRef.current.scrollBy({
        left: -250,
        behavior: 'smooth',
      });
    }
  };

  const scrollHighlightsRight = () => {
    if (highlightsRef.current) {
      highlightsRef.current.scrollBy({
        left: 250,
        behavior: 'smooth',
      });
    }
  };

  const handleOpenConnections = async (
    type: 'followers' | 'following'
  ) => {
    if (!profileData.username) return;

    setConnectionsModal({
      type,
      title: type === 'followers' ? 'Seguidores' : 'Seguindo',
    });

    setConnectionsLoading(true);
    setConnectionsList([]);

    try {
      const res =
        type === 'followers'
          ? await userService.getFollowers(profileData.username)
          : await userService.getFollowing(profileData.username);

      setConnectionsList(res.content || []);
    } catch {
      setConnectionsList([]);
    } finally {
      setConnectionsLoading(false);
    }
  };

  function handleAvatarFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    setAvatarFile(file);

    const reader = new FileReader();

    reader.onload = (ev) => {
      setAvatarFilePreview(ev.target?.result as string);
      setShowAvatarPickerModal(true);
    };

    reader.readAsDataURL(file);

    e.target.value = '';
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col lg:flex-row text-textPrimary select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 flex overflow-hidden flex-col">
          {loading ? (
            <ScreenLoader />
          ) : loadError ? (
            <div
              role="alert"
              className="p-8 flex flex-col items-center gap-4 text-center"
            >
              <h1 className="text-xl font-semibold">
                Não foi possível carregar seu perfil
              </h1>

              <p className="text-sm text-textSecondary">
                {loadError}
              </p>

              <button
                onClick={() =>
                  setReload((value) => value + 1)
                }
                className="rounded-lg btn-primary-glass border border-white/10 px-5 py-3"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto no-scrollbar pb-24 lg:pb-12">
              <div className="w-full max-w-4xl mx-auto pt-4 lg:pt-8 px-4 sm:px-6 space-y-8">
                <div className="w-full max-w-3xl mx-auto pt-2 md:pt-4">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-9 items-center md:items-start">
                    <div
                      onClick={() => setShowAvatarModal(true)}
                      className="rounded-lg border border-white/15 w-28 h-28 md:w-40 md:h-40 overflow-hidden bg-neutral-800 shrink-0 cursor-pointer active:scale-95 transition-transform"
                    >
                      {profileData.avatarUrl ? (
                        <SecureImage
                          src={profileData.avatarUrl}
                          alt="Avatar"
                          className="w-full h-full rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-lg flex items-center justify-center text-textSecondary">
                          <Camera className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full">
                      <div className="mb-4 w-full">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                          <h1 className="text-2xl font-bold tracking-tight">
                            {profileData.username || 'Perfil'}
                          </h1>
                          {user?.role === 'ADMIN' && <BadgeCheck aria-label="Perfil verificado" className="w-5 h-5 text-accent shrink-0" strokeWidth={2.5} />}
                        </div>
                      </div>

                      <div className="flex gap-6 mb-4 text-sm">
                        <div className="flex flex-col items-center md:items-start">
                          <span className="font-bold text-lg leading-none">
                            {postCount}
                          </span>

                          <span className="text-textSecondary text-xs">
                            posts
                          </span>
                        </div>

                        <div
                          onClick={() =>
                            handleOpenConnections('followers')
                          }
                          className="flex flex-col items-center md:items-start cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                        >
                          <span className="font-bold text-lg leading-none">
                            {followersCount}
                          </span>

                          <span className="text-textSecondary text-xs">
                            seguidores
                          </span>
                        </div>

                        <div
                          onClick={() =>
                            handleOpenConnections('following')
                          }
                          className="flex flex-col items-center md:items-start cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                        >
                          <span className="font-bold text-lg leading-none">
                            {followingCount}
                          </span>

                          <span className="text-textSecondary text-xs">
                            seguindo
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowRealFriendsModal(true)}
                          className="flex flex-col items-center text-left transition-opacity hover:opacity-80 active:scale-95 md:items-start"
                        >
                          <span className="text-lg font-bold leading-none">
                            {realFriendsCount}
                          </span>
                          <span className="text-xs text-textSecondary">
                            Amigos Reais
                          </span>
                        </button>
                      </div>

                      <div className="space-y-1 text-sm text-textSecondary max-w-md">
                        <p className="font-bold text-textPrimary text-[15px]">
                          {profileData.fullName}
                        </p>

                        {profileData.bio
                          .split('\n')
                          .filter(Boolean)
                          .map((line, idx) => (
                            <p key={idx}>{line}</p>
                          ))}
                      </div>

                      <div className="mt-5 flex w-full max-w-sm items-center gap-2">
                        <button
                          onClick={handleOpenEditModal}
                          className="soul-glass rounded-lg inline-flex h-10 flex-1 items-center justify-center px-4 text-[13px] font-semibold text-white active:scale-95 transition-all"
                        >
                          Editar perfil
                        </button>

                        <button
                          onClick={() =>
                            setShowRealFriendsModal(true)
                          }
                          className="soul-glass rounded-lg inline-flex h-10 w-10 shrink-0 items-center justify-center text-white active:scale-95 transition-all"
                          title="Amigos Reais e QR Code"
                          aria-label="Abrir Amigos Reais e QR Code"
                        >
                          <QrCode className="w-[18px] h-[18px]" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {highlightError && (
                    <p
                      role="alert"
                      className="mt-4 text-sm text-red-300"
                    >
                      {highlightError}
                    </p>
                  )}

                  <div className="relative mt-9 group/highlights">
                    <button
                      type="button"
                      aria-label="Destaques anteriores"
                      onClick={scrollHighlightsLeft}
                      className="rounded-lg absolute -left-11 top-5 z-20 hidden h-9 w-9 items-center justify-center border border-white/10 bg-[#242424] text-white/75 shadow-sm opacity-0 pointer-events-none transition-all group-hover/highlights:opacity-100 group-hover/highlights:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto hover:bg-white/15 hover:text-white active:scale-95 md:flex"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div
                      ref={highlightsRef}
                      className="flex flex-nowrap gap-4 md:gap-6 overflow-x-auto overflow-y-hidden pb-2 -mx-2 px-2 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          navigate('/highlights/create')
                        }
                        className="flex flex-col items-center gap-2 cursor-pointer shrink-0 group active:scale-95 transition-transform"
                      >
                        <div className="rounded-lg border border-white/15 h-16 w-16 overflow-hidden bg-neutral-800 transition-colors group-hover:bg-neutral-700 md:h-20 md:w-20">
                          <div className="flex h-full w-full items-center justify-center">
                            <Plus className="h-6 w-6 text-white/70 group-hover:text-white md:h-8 md:w-8" />
                          </div>
                        </div>

                        <span className="text-xs font-semibold text-textSecondary group-hover:text-white">
                          Novo
                        </span>
                      </button>

                      {highlightsList.map(
                        (highlight, index) => (
                          <div
                            key={highlight.id}
                            onClick={() =>
                              handleOpenHighlight(index)
                            }
                            className="flex flex-col items-center gap-2 cursor-pointer shrink-0 active:scale-95 transition-transform"
                          >
                            <div className="rounded-lg border border-white/15 h-16 w-16 overflow-hidden bg-neutral-800 md:h-20 md:w-20">
                              {highlight.type === 'video' ? (
                                <SecureVideo
                                  src={`${highlight.cover}#t=0.001`}
                                  className="rounded-lg w-full h-full object-cover pointer-events-none"
                                />
                              ) : (
                                <SecureImage
                                  src={highlight.cover}
                                  alt={highlight.name}
                                  className="rounded-lg w-full h-full object-cover"
                                />
                              )}
                            </div>

                            <span className="text-xs font-semibold text-textSecondary">
                              {highlight.name}
                            </span>
                          </div>
                        )
                      )}
                    </div>

                    <button
                      type="button"
                      aria-label="Próximos destaques"
                      onClick={scrollHighlightsRight}
                      className="rounded-lg absolute -right-11 top-5 z-20 hidden h-9 w-9 items-center justify-center border border-white/10 bg-[#242424] text-white/75 shadow-sm opacity-0 pointer-events-none transition-all group-hover/highlights:opacity-100 group-hover/highlights:pointer-events-auto focus-visible:opacity-100 focus-visible:pointer-events-auto hover:bg-white/15 hover:text-white active:scale-95 md:flex"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-center border-b border-white/10 mb-6 gap-8 px-4">
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={cn(
                      'pb-4 flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-widest border-b-2 transition-colors relative top-[1px]',
                      activeTab === 'posts'
                        ? 'border-white text-white'
                        : 'border-transparent text-textSecondary'
                    )}
                  >
                    <Grid className="w-4 h-4" />
                    <span>Posts</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('soults')}
                    className={cn(
                      'pb-4 flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-widest border-b-2 transition-colors relative top-[1px]',
                      activeTab === 'soults'
                        ? 'border-white text-white'
                        : 'border-transparent text-textSecondary'
                    )}
                  >
                    <Film className="w-4 h-4" />
                    <span>Soults</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('saved')}
                    className={cn(
                      'pb-4 flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-widest border-b-2 transition-colors relative top-[1px]',
                      activeTab === 'saved'
                        ? 'border-white text-white'
                        : 'border-transparent text-textSecondary'
                    )}
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>Salvos</span>
                  </button>
                </div>

                {(() => {
                  const list = activeTab === 'saved'
                    ? savedPosts
                    : activeTab === 'posts'
                      ? displayPosts
                      : [];
                  const soults = activeTab === 'saved'
                    ? savedSoults
                    : activeTab === 'soults'
                      ? profileSoults
                      : [];

                  return (
                    <div className="grid grid-cols-3 gap-1 md:gap-4">
                      {list.map((post, index) => (
                        <div
                          key={post.id}
                          onClick={() => navigate(`/post/${post.id}`)}
                          className="aspect-square bg-white/5 md:rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform flex items-center justify-center relative group"
                        >
                          {post.imageUrl ? (
                            <SecureImage
                              src={post.imageUrl}
                              alt={`Post ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center p-4">
                              <p className="text-xs text-textSecondary line-clamp-4 text-center">
                                {post.content}
                              </p>
                            </div>
                          )}

                          {activeTab === 'saved' && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                              <Bookmark
                                className="w-3 h-3 text-white"
                                fill="white"
                              />
                            </div>
                          )}
                        </div>
                      ))}

                      {soults.map((soult) => (
                        <button
                          key={`soult-${soult.id}`}
                          type="button"
                          onClick={() => navigate(`/soults?video=${soult.id}`)}
                          className="aspect-square bg-white/5 md:rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform relative group"
                          aria-label={`Abrir Soult salvo: ${soult.title}`}
                        >
                          {soult.thumbnailUrl ? (
                            <SecureImage src={soult.thumbnailUrl} alt={soult.title} className="h-full w-full object-cover" />
                          ) : (
                            <SecureVideo src={soult.videoUrl} className="h-full w-full object-cover" muted />
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pb-2 pt-8 text-left">
                            <span className="line-clamp-1 text-xs font-semibold text-white">{soult.title}</span>
                          </div>
                          <div className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                            <Bookmark className="w-3 h-3 text-white" fill="white" />
                          </div>
                        </button>
                      ))}

                      {list.length === 0 && soults.length === 0 && (
                        <div className="col-span-3 py-20 text-center text-textSecondary text-sm">
                          {activeTab === 'saved'
                            ? 'Nenhum item salvo ainda.'
                            : activeTab === 'soults'
                              ? 'Nenhum Soult ainda.'
                              : 'Nenhum post ainda.'}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* EDITAR PERFIL */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="w-full max-w-sm flex flex-col gap-8 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative text-center space-y-3">
              <h2 className="text-xl font-bold text-white">
                Editar Perfil
              </h2>

              <button
                onClick={() => setShowEditModal(false)}
                className="soul-glass rounded-lg absolute -top-1 -right-2 p-1.5 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveProfile}
              className="space-y-6"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-lg relative w-24 h-24 overflow-hidden group bg-neutral-800">
                  {editForm.avatarUrl ? (
                    <SecureImage
                      src={editForm.avatarUrl}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Camera className="w-6 h-6 text-zinc-500" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    avatarFileInputRef.current?.click()
                  }
                  className="rounded-lg text-xs text-white/70 hover:text-white font-medium soul-glass px-3 py-1.5"
                >
                  Alterar foto
                </button>
              </div>

              <div>
                <label className="text-xs text-textSecondary mb-1.5 block">
                  Nome de usuário
                </label>

                <input
                  type="text"
                  value={editForm.username}
                  disabled
                  className="w-full soul-glass rounded-2xl px-4 py-2.5 text-sm text-textSecondary focus:outline-none cursor-not-allowed"
                />

                <p className="text-[10px] text-textSecondary mt-1.5">
                  O nome de usuário não é alterado por esta API.
                </p>
              </div>

              <div>
                <label className="text-xs text-textSecondary mb-1.5 block">
                  Nome completo
                </label>

                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      fullName: e.target.value,
                    })
                  }
                  className="w-full soul-glass rounded-2xl px-4 py-2.5 text-sm text-textPrimary focus:outline-none focus:border-white/30"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-textSecondary mb-1.5 block">
                  Bio
                </label>

                <textarea
                  value={editForm.bio}
                  onChange={(e) => {
                    if (e.target.value.length <= 160) {
                      setEditForm({
                        ...editForm,
                        bio: e.target.value,
                      });
                    }
                  }}
                  rows={3}
                  className="w-full soul-glass rounded-2xl p-4 text-sm text-textPrimary focus:outline-none focus:border-white/30 resize-none"
                />

                <div className="flex justify-end mt-1">
                  <span
                    className={cn(
                      'text-[10px] tabular-nums',
                      editForm.bio.length >= 150
                        ? 'text-amber-400'
                        : 'text-white/20'
                    )}
                  >
                    {editForm.bio.length}/160
                  </span>
                </div>
              </div>

              {profileSaveError && (
                <p className="text-xs text-red-400 text-center -mt-2">
                  {profileSaveError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setProfileSaveError('');
                  }}
                  className="rounded-lg flex-1 py-3 soul-glass text-textPrimary font-semibold transition-colors text-sm"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="rounded-lg flex-1 py-3 bg-white border border-white/10 text-black font-semibold hover:bg-white/90 transition-colors text-sm flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Salvar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VISUALIZADOR DE DESTAQUES */}
      {activeHighlightIndex !== null &&
        highlightsList[activeHighlightIndex] && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="relative w-full max-w-sm h-[80vh] max-h-[650px] bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between p-4 shadow-2xl">
              <div className="relative z-10 flex flex-col gap-2">
                <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                  <div className="bg-white h-full w-full animate-pulse" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white tracking-wide">
                    {highlightsList[activeHighlightIndex].name}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={deletingHighlight}
                      onClick={async () => {
                        const id =
                          highlightsList[
                            activeHighlightIndex
                          ].id;

                        setDeletingHighlight(true);
                        setHighlightError('');

                        try {
                          if (id.startsWith('hl-')) {
                            localStorage.setItem(
                              `@app:highlights_${
                                user?.username || 'guest'
                              }`,
                              JSON.stringify(
                                highlightsList.filter(
                                  (item) =>
                                    item.id.startsWith(
                                      'hl-'
                                    ) && item.id !== id
                                )
                              )
                            );
                          } else {
                            await api.delete(
                              '/highlights/' + id
                            );
                          }

                          setHighlightsList((items) =>
                            items.filter(
                              (item) => item.id !== id
                            )
                          );

                          setActiveHighlightIndex(null);
                        } catch (error) {
                          setHighlightError(
                            getHttpErrorMessage(error)
                          );

                          setActiveHighlightIndex(null);
                        } finally {
                          setDeletingHighlight(false);
                        }
                      }}
                      className="rounded-lg p-1.5 border border-white/10 bg-black/40 text-white/60 hover:bg-red-500/80 hover:text-white transition-colors"
                      title="Remover destaque"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() =>
                        setActiveHighlightIndex(null)
                      }
                      className="rounded-lg p-1.5 border border-white/10 bg-black/40 text-white hover:bg-black/60 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {highlightsList[activeHighlightIndex].type ===
              'video' ? (
                <SecureVideo
                  src={`${
                    highlightsList[activeHighlightIndex].image
                  }#t=0.001`}
                  controls
                  autoPlay
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
              ) : (
                <SecureImage
                  src={
                    highlightsList[activeHighlightIndex].image
                  }
                  alt={
                    highlightsList[activeHighlightIndex].name
                  }
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
              )}

              <button
                onClick={handlePrevHighlight}
                disabled={activeHighlightIndex === 0}
                className="rounded-lg absolute left-2 top-1/2 -translate-y-1/2 p-2 border border-white/10 bg-black/40 text-white hover:bg-black/60 disabled:opacity-0 z-10 transition-opacity"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNextHighlight}
                disabled={
                  activeHighlightIndex ===
                  highlightsList.length - 1
                }
                className="rounded-lg absolute right-2 top-1/2 -translate-y-1/2 p-2 border border-white/10 bg-black/40 text-white hover:bg-black/60 disabled:opacity-0 z-10 transition-opacity"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

      {/* FEED MODAL */}
      {feedModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col animate-fade-in">
          <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-lg border-b border-white/10 px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-bold text-white tracking-wide">
              {activeTab === 'posts'
                ? 'Publicações'
                : 'Publicações Salvas'}
            </span>

            <button
              onClick={() => setFeedModal(null)}
              className="soul-glass rounded-lg p-1.5 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar py-6">
            <div className="max-w-lg mx-auto space-y-6">
              {feedModal.list
                .slice(feedModal.startIndex)
                .concat(
                  feedModal.list.slice(
                    0,
                    feedModal.startIndex
                  )
                )
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

      {/* AVATAR EXPANDIDO */}
      {showAvatarModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowAvatarModal(false)}
        >
          <button
            onClick={() => setShowAvatarModal(false)}
            className="soul-glass rounded-lg absolute top-6 right-6 md:top-8 md:right-8 p-2.5 text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {profileData.avatarUrl ? (
            <SecureImage
              src={profileData.avatarUrl}
              alt="Foto de perfil expandida"
              onClick={(e) => e.stopPropagation()}
              className="rounded-lg w-full max-w-[320px] md:max-w-[400px] aspect-square object-cover shadow-2xl animate-scale-up"
            />
          ) : (
            <div className="rounded-lg w-full max-w-[320px] md:max-w-[400px] aspect-square bg-neutral-900 flex items-center justify-center">
              <Camera className="w-12 h-12 text-textSecondary" />
            </div>
          )}
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

      {showRealFriendsModal && (
        <RealFriendsModal
          username={profileData.username}
          onClose={() => setShowRealFriendsModal(false)}
        />
      )}

      <input
        ref={avatarFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarFileChange}
      />

      {/* SELETOR DE AVATAR */}
      {showAvatarPickerModal && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() =>
            setShowAvatarPickerModal(false)
          }
        >
          <div
            className="w-full max-w-sm flex flex-col gap-8 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative text-center space-y-3">
              <h3 className="text-xl font-bold text-white">
                Foto de perfil
              </h3>

              <button
                onClick={() =>
                  setShowAvatarPickerModal(false)
                }
                className="soul-glass rounded-lg absolute -top-1 -right-2 p-1.5 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-4">
              {avatarFilePreview ? (
                <SecureImage
                  src={avatarFilePreview}
                  alt="Preview"
                  className="rounded-lg w-28 h-28 object-cover"
                />
              ) : (
                <div className="rounded-lg w-28 h-28 bg-neutral-800 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-zinc-500" />
                </div>
              )}

              <p className="text-xs text-zinc-400 text-center">
                Esta foto será usada como sua foto de
                perfil.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  if (avatarFilePreview) {
                    setEditForm((prev) => ({
                      ...prev,
                      avatarUrl: avatarFilePreview,
                    }));
                  }

                  setShowAvatarPickerModal(false);
                }}
                className="rounded-lg w-full py-3.5 bg-white border border-white/10 text-black font-bold transition-all hover:bg-zinc-100 active:scale-[0.98]"
              >
                Confirmar
              </button>

              <button
                onClick={() =>
                  setShowAvatarPickerModal(false)
                }
                className="rounded-lg w-full py-3.5 bg-transparent border border-white/10 text-zinc-400 font-semibold hover:border-white/20 hover:text-white transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
