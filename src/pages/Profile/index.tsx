import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { Button } from '../../components/ui/Button';
import { PostCard } from '../../components/feed/PostCard';
import type { Post } from '../../services/postService';
import { Grid, Bookmark, Plus, X, ChevronLeft, ChevronRight, Camera, Check, QrCode, Heart } from 'lucide-react';
import { cn } from '../../utils/cn';
import { ScreenLoader } from '../../components/ui/ScreenLoader';

export interface HighlightItem {
  id: string;
  name: string;
  cover: string;
  image: string;
  type?: 'image' | 'video';
  isNew?: boolean;
}

// QR code: token único do usuário logado (virá da API futuramente)
const MY_QR_TOKEN = 'soul-user-1-qr-token';

const INITIAL_PROFILE = {
  username: 'luiza.campos',
  fullName: 'Luiza Campos',
  bio: 'Redescobrindo o valor do tempo livre e das pausas intencionais. Aspirante a jardineira.',
  avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250',
};

const PROFILE_POSTS: Post[] = [
  {
    id: 'my-1',
    author: {
      id: 'me',
      name: 'Luiza Campos',
      username: 'luiza.campos',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250',
    },
    content: 'Tentando aplicar o conceito de slow living no fim de semana. Nada de celular nas primeiras horas do dia.',
    imageUrl: 'https://picsum.photos/seed/slow/800/600',
    likesCount: 128,
    commentsCount: 14,
    createdAt: new Date().toISOString(),
    initialComments: [
      { id: 'c1', author: 'renatoval', text: 'Eu preciso muito fazer isso, sério.', time: 'há 2h' }
    ]
  },
  {
    id: 'my-2',
    author: {
      id: 'me',
      name: 'Luiza Campos',
      username: 'luiza.campos',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250',
    },
    content: 'O simples de hoje.',
    imageUrl: 'https://picsum.photos/seed/plants2/800/600',
    likesCount: 89,
    commentsCount: 2,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    initialComments: []
  },
  {
    id: 'my-3',
    author: {
      id: 'me',
      name: 'Luiza Campos',
      username: 'luiza.campos',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250',
    },
    content: 'Descobri que fazer pão em casa é mais sobre o processo do que sobre o resultado.',
    imageUrl: 'https://picsum.photos/seed/bread3/800/600',
    likesCount: 201,
    commentsCount: 9,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    initialComments: []
  },
  {
    id: 'my-4',
    author: {
      id: 'me',
      name: 'Luiza Campos',
      username: 'luiza.campos',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=250',
    },
    content: 'Jardim de inverno em andamento.',
    imageUrl: 'https://picsum.photos/seed/garden4/800/600',
    likesCount: 74,
    commentsCount: 3,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    initialComments: []
  },
];

const SAVED_POSTS: Post[] = [
  {
    id: 'saved-1',
    author: { id: 'u1', name: 'Renato Valença', username: 'renatoval', avatarUrl: 'https://i.pravatar.cc/150?u=renatoval' },
    content: 'Terminei O Nome do Vento pela segunda vez. Ainda impressionante.',
    imageUrl: 'https://picsum.photos/seed/renato1/800/600',
    likesCount: 312,
    commentsCount: 18,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    initialComments: [{ id: 'sc1', author: 'Você', text: 'Preciso ler ainda.', time: 'há 1 dia' }],
  },
  {
    id: 'saved-2',
    author: { id: 'u2', name: 'Mariana Silveira', username: 'ma.silveira', avatarUrl: 'https://i.pravatar.cc/150?u=ma.silveira' },
    content: 'Nova paleta aprovada pelo cliente. Gratidão por projetos que respiram.',
    imageUrl: 'https://picsum.photos/seed/mari1/800/600',
    likesCount: 445,
    commentsCount: 22,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    initialComments: [],
  },
  {
    id: 'saved-3',
    author: { id: 'u3', name: 'Felipe Nogueira', username: 'felipe.nog', avatarUrl: 'https://i.pravatar.cc/150?u=felipe.nog' },
    content: 'Pôr do sol na ponte. Essa cidade tem seus momentos.',
    imageUrl: 'https://picsum.photos/seed/felipe1/800/600',
    likesCount: 189,
    commentsCount: 7,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    initialComments: [],
  },
  {
    id: 'saved-4',
    author: { id: 'u4', name: 'Julia Borges', username: 'julia.borges', avatarUrl: 'https://i.pravatar.cc/150?u=julia.borges' },
    content: 'Risoto de domingo. O processo é metade do prazer.',
    imageUrl: 'https://picsum.photos/seed/julia2/800/600',
    likesCount: 276,
    commentsCount: 11,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    initialComments: [],
  },
];

const MOCK_HIGHLIGHTS: HighlightItem[] = [
  {
    id: 'h1',
    name: 'Jardim',
    cover: 'https://picsum.photos/seed/garden4/300/300',
    image: 'https://picsum.photos/seed/garden4/600/800',
    type: 'image',
  },
  {
    id: 'h2',
    name: 'Leituras',
    cover: 'https://picsum.photos/seed/books2/300/300',
    image: 'https://picsum.photos/seed/books2/600/800',
    type: 'image',
  },
  {
    id: 'h3',
    name: 'Cozinha',
    cover: 'https://picsum.photos/seed/bread3/300/300',
    image: 'https://picsum.photos/seed/bread3/600/800',
    type: 'image',
  },
  {
    id: 'h4',
    name: 'Caminhadas',
    cover: 'https://picsum.photos/seed/trail7/300/300',
    image: 'https://picsum.photos/seed/trail7/600/800',
    type: 'image',
  },
  {
    id: 'h5',
    name: 'Sem tela',
    cover: 'https://picsum.photos/seed/slow/300/300',
    image: 'https://picsum.photos/seed/slow/600/800',
    type: 'image',
  },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const highlightsRef = useRef<HTMLDivElement>(null);

  const [highlightsList, setHighlightsList] = useState<HighlightItem[]>([]);

  const [profileData, setProfileData] = useState(INITIAL_PROFILE);

  const [editForm, setEditForm] = useState(profileData);
  const [showEditModal, setShowEditModal] = useState(false);
  const [feedModal, setFeedModal] = useState<{ list: Post[]; startIndex: number } | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [activeHighlightIndex, setActiveHighlightIndex] = useState<number | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  // Contadores vindos do serviço (por enquanto placeholders)
  const [connectionsCount] = useState(14);
  const [realFriendsCount] = useState(4);

  const [displayPosts, setDisplayPosts] = useState<Post[]>(PROFILE_POSTS);

  useEffect(() => {
    // Carrega destaques criados pelo usuário armazenados no localStorage
    const saved = localStorage.getItem('@app:highlights');
    if (saved) {
      try {
        const parsed: HighlightItem[] = JSON.parse(saved);
        setHighlightsList(parsed.length > 0 ? parsed : MOCK_HIGHLIGHTS);
      } catch (e) {
        setHighlightsList(MOCK_HIGHLIGHTS);
      }
    } else {
      setHighlightsList(MOCK_HIGHLIGHTS);
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
                          <Button 
                            onClick={() => setShowQrModal(true)}
                            variant="secondary" 
                            className="flex-none px-3 h-9 text-[13px] rounded-xl font-semibold active:scale-95 transition-transform"
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-6 mb-5 text-sm">
                        <div className="flex flex-col items-center md:items-start">
                          <span className="font-bold text-lg leading-none">{displayPosts.length}</span>
                          <span className="text-textSecondary text-xs">posts</span>
                        </div>
                        <div className="flex flex-col items-center md:items-start">
                          <span className="font-bold text-lg leading-none">{connectionsCount}</span>
                          <span className="text-textSecondary text-xs">Conexões</span>
                        </div>
                        <div className="flex flex-col items-center md:items-start">
                          <span className="font-bold text-lg leading-none">{realFriendsCount}</span>
                          <span className="text-textSecondary text-xs flex items-center gap-1">
                            Amigos Reais
                            <Heart className="w-3 h-3 text-red-500" fill="currentColor" />
                          </span>
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
                {(() => {
                  const list = activeTab === 'saved' ? SAVED_POSTS : displayPosts;
                  return (
                    <div className="grid grid-cols-3 gap-1 md:gap-4">
                      {list.map((post, index) => (
                        <div
                          key={post.id}
                          onClick={() => setFeedModal({ list, startIndex: index })}
                          className="aspect-square bg-white/5 md:rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform flex items-center justify-center relative group"
                        >
                          <img
                            src={post.imageUrl}
                            alt={`Post ${index}`}
                            className="w-full h-full object-cover"
                          />
                          {activeTab === 'saved' && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                              <Bookmark className="w-3 h-3 text-white fill-white" />
                            </div>
                          )}
                        </div>
                      ))}
                      {list.length === 0 && (
                        <div className="col-span-3 py-20 text-center text-textSecondary text-sm">
                          {activeTab === 'saved' ? 'Nenhum post salvo ainda.' : 'Nenhum post ainda.'}
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

      {/* ── MODAL: QR CODE AMIGO REAL ── */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-neutral-900 border border-white/10 rounded-3xl p-6 max-w-xs w-full shadow-2xl text-center space-y-5 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Amigo Real</h3>
              <p className="text-xs text-textSecondary leading-relaxed">
                Mostre este QR Code para outra pessoa.<br/>
                Ela também precisa escanear o seu para virar Amigo Real.
              </p>
            </div>

            {/* QR Code visual gerado via API pública */}
            <div className="flex items-center justify-center">
              <div className="w-44 h-44 bg-white rounded-2xl flex items-center justify-center p-3 shadow-inner">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=176x176&data=${MY_QR_TOKEN}&bgcolor=ffffff&color=000000&margin=0`}
                  alt="Seu QR Code de Amigo Real"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
              <p className="text-[11px] text-textSecondary mb-1">Amizade Real exige presença física</p>
              <p className="text-xs font-semibold text-white">
                Escaneie o QR Code um do outro para se tornarem Amigos Reais no Soul.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-2xl px-4 py-2.5">
              <Heart className="w-4 h-4 text-primary shrink-0" />
              <p className="text-[11px] text-primary font-medium text-left">
                Amigos Reais é o nível mais íntimo de conexão do Soul. Só quem esteve presente.
              </p>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}