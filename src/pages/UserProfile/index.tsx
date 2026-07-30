import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, UserPlus, UserCheck, Grid, X } from 'lucide-react';
import { BottomNav } from '../../components/layout/BottomNav';
import { Sidebar } from '../../components/layout/Sidebar';
import { PostCard } from '../../components/feed/PostCard';
import { cn } from '../../utils/cn';

// Dados mockados
const MOCK_USERS: Record<string, {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
  verified: boolean;
  followers: number;
  following: number;
  posts: { id: string; imageUrl: string; content?: string }[];
}> = {
  luizamontenegro: {
    id: 'u1',
    name: 'Luiza Montenegro',
    username: 'luizamontenegro',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=600&h=600',
    bio: 'fotografando silêncios e momentos que a gente quase não percebe ☕️',
    verified: true,
    followers: 14200,
    following: 312,
    posts: [
      { id: '1', imageUrl: 'https://images.unsplash.com/photo-1473280025148-643f9b0cbac2?auto=format&fit=crop&q=80&w=800', content: 'Luz da tarde.' },
      { id: '2', imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800' },
      { id: '3', imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800' },
      { id: '4', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800' },
      { id: '5', imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800' },
      { id: '6', imageUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=800' },
    ],
  },
  'arthur.cordeiro': {
    id: 'u2',
    name: 'Arthur Cordeiro',
    username: 'arthur.cordeiro',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600&h=600',
    bio: 'trilhas, montanhas e aquele silêncio que a cidade nunca vai ter 🌲',
    verified: false,
    followers: 8950,
    following: 201,
    posts: [
      { id: '1', imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800' },
      { id: '2', imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800' },
      { id: '3', imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800' },
    ],
  },
};

export default function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [feedModal, setFeedModal] = useState<{ list: any[]; startIndex: number } | null>(null);

  const user = username ? MOCK_USERS[username] : null;

  // Fechar modais com a tecla ESC e travar scroll da página
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFeedModal(null);
        setShowAvatarModal(false);
      }
    };
    window.addEventListener('keydown', handleEsc);

    if (feedModal || showAvatarModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [feedModal, showAvatarModal]);

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center text-textPrimary gap-4">
        <p className="text-textSecondary">perfil não encontrado</p>
        <button onClick={() => navigate(-1)} className="text-sm underline text-textSecondary">voltar</button>
      </div>
    );
  }

  // Prepara os posts no formato completo esperado pelo <PostCard />
  const fullPosts = user.posts.map((post, index) => ({
    id: post.id,
    author: {
      id: user.id,
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
      verified: user.verified,
    },
    content: post.content || 'Sem legenda...',
    imageUrl: post.imageUrl,
    likesCount: 100 + index * 10,
    commentsCount: 5 + index,
    createdAt: new Date().toISOString(),
  }));

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col lg:flex-row text-textPrimary select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Header com botão voltar ── */}
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
            
            {/* ── Perfil Principal ── */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-10">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start w-full">
                
                {/* Avatar */}
                <div 
                  onClick={() => setShowAvatarModal(true)}
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-40 md:h-40 rounded-2xl overflow-hidden border border-white/10 p-1 bg-white/5 shrink-0 cursor-pointer active:scale-95 transition-transform"
                >
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    className="w-full h-full rounded-2xl object-cover object-top" 
                  />
                </div>
                
                {/* Info */}
                <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full min-w-0">
                  <div className="flex flex-col md:flex-row items-center gap-4 mb-5 w-full md:w-auto">
                    <div className="flex items-center justify-center md:justify-start gap-2 w-full md:w-auto overflow-hidden">
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{user.username}</h1>
                      {user.verified && <CheckCircle2 className="w-5 h-5 text-accent shrink-0" strokeWidth={2.5} />}
                    </div>
                    
                    <button
                      onClick={() => setIsFollowing(p => !p)}
                      className={cn(
                        'flex items-center justify-center gap-2 px-6 h-9 rounded-xl text-[13px] font-semibold transition-all active:scale-95 w-full md:w-auto shrink-0',
                        isFollowing
                          ? 'bg-white/10 text-textPrimary border border-white/10 hover:bg-white/20'
                          : 'bg-white text-black hover:bg-white/90'
                      )}
                    >
                      {isFollowing ? (
                        <><UserCheck className="w-4 h-4" /><span>Seguindo</span></>
                      ) : (
                        <><UserPlus className="w-4 h-4" /><span>Seguir</span></>
                      )}
                    </button>
                  </div>

                  <div className="flex gap-4 sm:gap-6 justify-center md:justify-start w-full mb-5 text-sm">
                    <div className="flex flex-col items-center md:items-start">
                      <span className="font-bold text-base sm:text-lg leading-none">{user.posts.length}</span>
                      <span className="text-textSecondary text-xs mt-1">posts</span>
                    </div>
                    <div className="flex flex-col items-center md:items-start">
                      <span className="font-bold text-base sm:text-lg leading-none">
                        {user.followers >= 1000 ? (user.followers / 1000).toFixed(1) + 'k' : user.followers}
                      </span>
                      <span className="text-textSecondary text-xs mt-1">seguidores</span>
                    </div>
                    <div className="flex flex-col items-center md:items-start">
                      <span className="font-bold text-base sm:text-lg leading-none">{user.following}</span>
                      <span className="text-textSecondary text-xs mt-1">seguindo</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-textSecondary max-w-md w-full px-2 md:px-0">
                    <p className="font-bold text-textPrimary text-[14px] sm:text-[15px]">{user.name}</p>
                    {user.bio.split('\n').map((line, idx) => (
                      <p key={idx} className="leading-relaxed">{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Tabs (Posts) ── */}
            <div className="flex justify-center border-b border-white/10 mb-6 gap-8 px-4">
              <button className="pb-4 flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-widest border-b-2 transition-colors relative top-[1px] border-white text-white">
                <Grid className="w-4 h-4" />
                <span>Posts</span>
              </button>
            </div>

            {/* ── Grade de Fotos ── */}
            <div className="grid grid-cols-3 gap-1 md:gap-4">
              {fullPosts.map((post, index) => (
                <div 
                  key={post.id} 
                  onClick={() => setFeedModal({ list: fullPosts, startIndex: index })}
                  className="aspect-square bg-white/5 md:rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform flex items-center justify-center relative group"
                >
                  <img 
                    src={post.imageUrl} 
                    alt={`Post ${index}`} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>

      <BottomNav />

      {/* ── MODAL: VISUALIZAR FOTO DO PERFIL ── */}
      {showAvatarModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowAvatarModal(false)}
        >
          <button
            onClick={() => setShowAvatarModal(false)}
            className="absolute top-6 right-6 md:top-8 md:right-8 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          
          <img
            src={user.avatarUrl}
            alt="Foto de perfil expandida"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[320px] md:max-w-[400px] aspect-square rounded-[2rem] md:rounded-[3rem] object-cover shadow-2xl border border-white/10 animate-scale-up"
          />
        </div>
      )}

      {/* ── MODAL DE FEED (ABRIR POSTS) ── */}
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
              {/* Reordena a lista para começar do post clicado */}
              {feedModal.list
                .slice(feedModal.startIndex)
                .concat(feedModal.list.slice(0, feedModal.startIndex))
                .map((post, i) => (
                  <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}