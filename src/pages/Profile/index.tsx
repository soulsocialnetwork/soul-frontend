import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { Button } from '../../components/ui/Button';
import { PostCard } from '../../components/feed/PostCard';
import type { Post } from '../../services/postService';
import { Grid, Bookmark, Plus, X, ChevronLeft, ChevronRight, Camera, Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import { ScreenLoader } from '../../components/ui/ScreenLoader';

// Fotos para o grid do perfil
const PROFILE_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800', 
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800', 
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800', 
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=800', 
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800', 
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=800', 
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800', 
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800', 
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800', 
];

const INITIAL_PROFILE_POSTS: Post[] = PROFILE_IMAGES.map((img, i) => ({
  id: `profile-post-${i}`,
  author: {
    id: 'user-1',
    name: 'Helena Martins',
    username: 'helenamartins',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300',
    verified: true,
  },
  content: [
    'Conectando com a imensidão da natureza. Cada paisagem traz uma nova perspectiva. 🌿✨',
    'A beleza sutil de um amanhecer tranquilo no horizonte.',
    'Explorando recantos onde o silêncio é a nossa melhor companhia.',
    'Pensamento solto: a simplicidade das pequenas coisas é o que realmente sustenta os nossos dias. ☕️📖',
    'Pausa para contemplar a harmonia perfeita entre o céu e la terra.',
    'Refletindo sobre a grandiosidade do mundo ao nosso redor.',
    'Reflexão do dia: às vezes, parar para respirar é o movimento mais produtivo que podemos fazer. 💭✨',
    'Gratidão por cada amanhecer que nos convida a recomeçar.',
    'Aproveitando a companhia mais aconchegante da casa. 🐾💛',
  ][i],
  imageUrl: img,
  likesCount: 150 + i * 55,
  commentsCount: 14 + i * 4,
  createdAt: new Date(Date.now() - (i + 1) * 3600000 * 4).toISOString(),
}));

// Mocks de Posts Salvos
const SAVED_IMAGES = [
  'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&q=80&w=800',
];

const SAVED_POSTS: Post[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `saved-post-${i}`,
  author: {
    id: `author-saved-${i}`,
    name: ['Marina Costa', 'Ana Clara', 'Camila Souza'][i % 3],
    username: ['marinacosta', 'anaclara', 'camilasouza'][i % 3],
    avatarUrl: `https://images.unsplash.com/photo-${i % 2 === 0 ? '1494790108377-be9c29b29330' : '1535713875002-d1d0cf377fde'}?auto=format&fit=crop&q=80&w=150&h=150`,
    verified: i % 2 === 0,
  },
  content: [
    'esse ângulo eu não esqueço não 😭 salvo pra quando eu precisar',
    'as cores aqui são de outro mundo, não tem edição que supera',
    'essa foto me lembra que tem tanta coisa linda ainda lá fora esperando',
  ][i % 3],
  imageUrl: SAVED_IMAGES[i],
  likesCount: 340 + i * 75,
  commentsCount: 28 + i * 6,
  createdAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
}));

export interface HighlightItem {
  id: string;
  name: string;
  cover: string;
  image: string;
  type?: 'image' | 'video';
  isNew?: boolean;
}

const INITIAL_HIGHLIGHTS: HighlightItem[] = [
  {
    id: '1',
    name: 'Viagens',
    cover: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=200&h=200',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800&h=1200',
    type: 'image',
  },
  {
    id: '2',
    name: 'Natureza',
    cover: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=200&h=200',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800&h=1200',
    type: 'image',
  },
  {
    id: '3',
    name: 'Refúgio',
    cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=200&h=200',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800&h=1200',
    type: 'image',
  },
  {
    id: '4',
    name: 'Café',
    cover: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=200&h=200',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800&h=1200',
    type: 'image',
  },
  {
    id: '5',
    name: 'Leituras',
    cover: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&q=80&w=200&h=200',
    image: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&q=80&w=800&h=1200',
    type: 'image',
  },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const highlightsRef = useRef<HTMLDivElement>(null);

  const [highlightsList, setHighlightsList] = useState<HighlightItem[]>([]);

  const [profileData, setProfileData] = useState({
    username: 'helenamartins',
    fullName: 'Helena Martins',
    bio: 'Colecionadora de horizontes e momentos de paz.\nExplorando a beleza do mundo através de lentes e passos. 🌿✨',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600&h=600',
  });

  const [editForm, setEditForm] = useState(profileData);
  const [showEditModal, setShowEditModal] = useState(false);
  const [feedModal, setFeedModal] = useState<{ list: Post[]; startIndex: number } | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [activeHighlightIndex, setActiveHighlightIndex] = useState<number | null>(null);

  const displayPosts = activeTab === 'posts' ? INITIAL_PROFILE_POSTS : SAVED_POSTS;

  useEffect(() => {
    // Carrega destaques criados pelo usuário armazenados no localStorage
    const saved = localStorage.getItem('@app:highlights');
    if (saved) {
      try {
        const parsed: HighlightItem[] = JSON.parse(saved);
        setHighlightsList([...parsed, ...INITIAL_HIGHLIGHTS]);
      } catch (e) {
        setHighlightsList(INITIAL_HIGHLIGHTS);
      }
    } else {
      setHighlightsList(INITIAL_HIGHLIGHTS);
    }

    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenEditModal = () => {
    setEditForm(profileData);
    setShowEditModal(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileData(editForm);
    setShowEditModal(false);
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
      highlightsRef.current.scrollBy({ left: -250, behavior: 'smooth' });
    }
  };

  const scrollHighlightsRight = () => {
    if (highlightsRef.current) {
      highlightsRef.current.scrollBy({ left: 250, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col lg:flex-row text-textPrimary select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 flex overflow-hidden flex-col">
          {loading ? (
            <ScreenLoader />
          ) : (
            <div className="flex-1 overflow-y-auto no-scrollbar pb-24 lg:pb-12">
              <div className="w-full max-w-4xl mx-auto pt-4 lg:pt-8 px-4 sm:px-6 space-y-8">

                {/* ── Perfil Principal ── */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-10">
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">

                    {/* Avatar */}
                    <div
                      onClick={() => setShowAvatarModal(true)}
                      className="w-28 h-28 md:w-40 md:h-40 rounded-2xl overflow-hidden border border-white/10 p-1 bg-white/5 shrink-0 cursor-pointer active:scale-95 transition-transform"
                    >
                      <img
                        src={profileData.avatarUrl}
                        alt="Avatar"
                        className="w-full h-full rounded-2xl object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full">
                      <div className="flex flex-col md:flex-row items-center gap-4 mb-5 w-full md:w-auto">
                        <h1 className="text-2xl font-bold tracking-tight">{profileData.username}</h1>
                        <div className="flex gap-2 w-full md:w-auto">
                          <Button
                            onClick={handleOpenEditModal}
                            variant="secondary"
                            className="flex-1 md:flex-none px-5 h-9 text-[13px] rounded-xl font-semibold active:scale-95 transition-transform"
                          >
                            Editar perfil
                          </Button>
                          <Button variant="secondary" className="flex-1 md:flex-none px-5 h-9 text-[13px] rounded-xl font-semibold active:scale-95 transition-transform">
                            Itens Arquivados
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-6 mb-5 text-sm">
                        <div className="flex flex-col items-center md:items-start">
                          <span className="font-bold text-lg leading-none">{INITIAL_PROFILE_POSTS.length}</span>
                          <span className="text-textSecondary text-xs">posts</span>
                        </div>
                        <div className="flex flex-col items-center md:items-start">
                          <span className="font-bold text-lg leading-none">1.420</span>
                          <span className="text-textSecondary text-xs">seguidores</span>
                        </div>
                        <div className="flex flex-col items-center md:items-start">
                          <span className="font-bold text-lg leading-none">385</span>
                          <span className="text-textSecondary text-xs">seguindo</span>
                        </div>
                      </div>

                      <div className="space-y-1 text-sm text-textSecondary max-w-md">
                        <p className="font-bold text-textPrimary text-[15px]">{profileData.fullName}</p>
                        {profileData.bio.split('\n').map((line, idx) => (
                          <p key={idx}>{line}</p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── Carrossel de Destaques ── */}
                  <div className="relative mt-10 group/highlights">
                    <button
                      onClick={scrollHighlightsLeft}
                      className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/80 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/highlights:opacity-100 transition-opacity hidden md:flex hover:bg-white hover:text-black shadow-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div
                      ref={highlightsRef}
                      className="flex flex-nowrap gap-4 md:gap-6 overflow-x-auto overflow-y-hidden pb-2 -mx-2 px-2 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-x"
                    >
                      {/* Botão Novo Destaque (Redireciona para /highlights/create) */}
                      <button
                        type="button"
                        onClick={() => navigate('/highlights/create')}
                        className="flex flex-col items-center gap-2 cursor-pointer shrink-0 group active:scale-95 transition-transform"
                      >
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-dashed border-white/30 flex items-center justify-center bg-white/5 group-hover:bg-white/10 group-hover:border-white transition-all">
                          <Plus className="w-6 h-6 md:w-8 md:h-8 text-white/70 group-hover:text-white" />
                        </div>
                        <span className="text-xs font-semibold text-textSecondary group-hover:text-white">Novo</span>
                      </button>

                      {/* Lista de Destaques Salvos */}
                      {highlightsList.map((h, i) => (
                        <div
                          key={h.id}
                          onClick={() => handleOpenHighlight(i)}
                          className="flex flex-col items-center gap-2 cursor-pointer shrink-0 active:scale-95 transition-transform"
                        >
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border border-white/10 p-1 flex items-center justify-center bg-white/5 overflow-hidden">
                            {h.type === 'video' ? (
                              <video src={h.cover} className="w-full h-full rounded-2xl object-cover pointer-events-none" />
                            ) : (
                              <img src={h.cover} alt={h.name} className="w-full h-full rounded-2xl object-cover" />
                            )}
                          </div>
                          <span className="text-xs font-semibold text-textSecondary">{h.name}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={scrollHighlightsRight}
                      className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/80 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/highlights:opacity-100 transition-opacity hidden md:flex hover:bg-white hover:text-black shadow-lg"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* ── Tabs (Posts / Salvos) ── */}
                <div className="flex justify-center border-b border-white/10 mb-6 gap-8 px-4">
                  <button
                    onClick={() => setActiveTab('posts')}
                    className={cn(
                      'pb-4 flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-widest border-b-2 transition-colors relative top-[1px]',
                      activeTab === 'posts' ? 'border-white text-white' : 'border-transparent text-textSecondary'
                    )}
                  >
                    <Grid className="w-4 h-4" />
                    <span>Posts</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('saved')}
                    className={cn(
                      'pb-4 flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-widest border-b-2 transition-colors relative top-[1px]',
                      activeTab === 'saved' ? 'border-white text-white' : 'border-transparent text-textSecondary'
                    )}
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>Salvos</span>
                  </button>
                </div>

                {/* ── Grade de Fotos (Posts ou Salvos) ── */}
                <div className="grid grid-cols-3 gap-1 md:gap-4">
                  {displayPosts.map((post, index) => (
                    <div
                      key={post.id}
                      onClick={() => setFeedModal({ list: displayPosts, startIndex: index })}
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
            </div>
          )}
        </main>
      </div>

      {/* ── MODAL EDITAR PERFIL ── */}
      {showEditModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-neutral-900 border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-bold text-white">Editar Perfil</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-full text-textSecondary hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10 group">
                  <img src={editForm.avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-6 h-6 text-white" />
                    <span className="text-[10px] text-white/80 font-medium mt-1">Alterar</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newUrl = prompt('Insira a URL da nova foto de perfil:', editForm.avatarUrl);
                    if (newUrl) setEditForm({ ...editForm, avatarUrl: newUrl });
                  }}
                  className="text-xs text-white/70 hover:text-white underline font-medium"
                >
                  Alterar foto de perfil
                </button>
              </div>

              <div>
                <label className="text-xs text-textSecondary mb-1.5 block">Nome de usuário</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-textPrimary focus:outline-none focus:border-white/30"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-textSecondary mb-1.5 block">Nome completo</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-textPrimary focus:outline-none focus:border-white/30"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-textSecondary mb-1.5 block">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-textPrimary focus:outline-none focus:border-white/30 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 bg-white/5 text-textPrimary font-semibold rounded-2xl hover:bg-white/10 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-white text-black font-semibold rounded-2xl hover:bg-white/90 transition-colors text-sm flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL VISUALIZAR DESTAQUE ── */}
      {activeHighlightIndex !== null && highlightsList[activeHighlightIndex] && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-sm h-[80vh] max-h-[650px] bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col justify-between p-4 shadow-2xl">
            <div className="relative z-10 flex flex-col gap-2">
              <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                <div className="bg-white h-full w-full animate-pulse" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white tracking-wide">
                  {highlightsList[activeHighlightIndex].name}
                </span>
                <button
                  onClick={() => setActiveHighlightIndex(null)}
                  className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {highlightsList[activeHighlightIndex].type === 'video' ? (
              <video
                src={highlightsList[activeHighlightIndex].image}
                controls
                autoPlay
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
            ) : (
              <img
                src={highlightsList[activeHighlightIndex].image}
                alt="Conteúdo do destaque"
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
            )}

            <button
              onClick={handlePrevHighlight}
              disabled={activeHighlightIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 disabled:opacity-0 z-10 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextHighlight}
              disabled={activeHighlightIndex === highlightsList.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 disabled:opacity-0 z-10 transition-opacity"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ── FEED MODAL ── */}
      {feedModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col animate-fade-in">
          <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-lg border-b border-white/10 px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-bold text-white tracking-wide">
              {activeTab === 'posts' ? 'Publicações' : 'Publicações Salvas'}
            </span>
            <button
              onClick={() => setFeedModal(null)}
              className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar py-6">
            <div className="max-w-lg mx-auto space-y-6">
              {feedModal.list.slice(feedModal.startIndex).concat(feedModal.list.slice(0, feedModal.startIndex)).map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}

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
            src={profileData.avatarUrl}
            alt="Foto de perfil expandida"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[320px] md:max-w-[400px] aspect-square rounded-[2rem] md:rounded-[3rem] object-cover shadow-2xl border border-white/10 animate-scale-up"
          />
        </div>
      )}

      <BottomNav />
    </div>
  );
}