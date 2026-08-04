import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { Button } from '../../components/ui/Button';
import { PostCard } from '../../components/feed/PostCard';
import type { Post } from '../../services/postService';
import { Plus, X } from 'lucide-react';
import { ScreenLoader } from '../../components/ui/ScreenLoader';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [highlightsList, setHighlightsList] = useState<{id: string; name: string; cover: string; image: string; type?: string}[]>([]);

  const [profileData] = useState({
    username: '',
    fullName: '',
    bio: '',
    avatarUrl: '',
  });

  const [feedModal, setFeedModal] = useState<{ list: Post[]; startIndex: number } | null>(null);
  const [activeHighlightIndex, setActiveHighlightIndex] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('@app:highlights');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHighlightsList(parsed);
      } catch { /* ignora */ }
    }
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

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

                {/* Perfil Header */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-10">
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="w-28 h-28 md:w-40 md:h-40 rounded-2xl overflow-hidden border border-white/10 p-1 bg-white/5 shrink-0">
                      <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
                    </div>

                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full">
                      <div className="flex flex-col md:flex-row items-center gap-4 mb-5 w-full md:w-auto">
                        <h1 className="text-2xl font-bold tracking-tight">{profileData.username}</h1>
                        <Button variant="secondary" className="px-5 h-9 text-[13px] rounded-xl font-semibold">
                          Editar perfil
                        </Button>
                      </div>

                      <div className="space-y-1 text-sm text-textSecondary max-w-md">
                        <p className="font-bold text-textPrimary text-[15px]">{profileData.fullName}</p>
                        <p>{profileData.bio}</p>
                      </div>
                    </div>
                  </div>

                  {/* CARROSSEL DE DESTAQUES */}
                  <div className="mt-10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">Destaques</span>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                      
                      {/* BOTAO NAVEGAR PARA A PAGINA DE NOVO DESTAQUE */}
                      <button
                        type="button"
                        onClick={() => navigate('/highlights/create')}
                        className="flex flex-col items-center gap-2 cursor-pointer shrink-0 group"
                      >
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-dashed border-white/30 flex items-center justify-center bg-white/5 group-hover:bg-white/10 group-hover:border-white transition-all">
                          <Plus className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-textSecondary group-hover:text-white">Novo</span>
                      </button>

                      {/* LISTA DE DESTAQUES SALVOS */}
                      {highlightsList.map((h, index) => (
                        <div
                          key={h.id}
                          onClick={() => setActiveHighlightIndex(index)}
                          className="flex flex-col items-center gap-2 cursor-pointer shrink-0"
                        >
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border border-white/10 p-1 bg-white/5">
                            {h.type === 'video' ? (
                              <video src={h.cover} className="w-full h-full rounded-2xl object-cover" />
                            ) : (
                              <img src={h.cover} alt={h.name} className="w-full h-full rounded-2xl object-cover" />
                            )}
                          </div>
                          <span className="text-xs font-semibold text-textSecondary">{h.name}</span>
                        </div>
                      ))}

                    </div>
                  </div>

                </div>

                {/* Grade de Posts */}
                <div className="grid grid-cols-3 gap-1 md:gap-4">
                  {([] as Post[]).map((post, index) => (
                    <div
                      key={post.id}
                      onClick={() => setFeedModal({ list: [], startIndex: index })}
                      className="aspect-square bg-white/5 md:rounded-2xl overflow-hidden cursor-pointer relative"
                    >
                      <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL VISUALIZAR DESTAQUE */}
      {activeHighlightIndex !== null && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm h-[75vh] bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden flex flex-col justify-between p-4">
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-bold text-white tracking-wide">
                {highlightsList[activeHighlightIndex]?.name}
              </span>
              <button
                type="button"
                onClick={() => setActiveHighlightIndex(null)}
                className="p-1 rounded-full bg-black/40 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {highlightsList[activeHighlightIndex]?.type === 'video' ? (
              <video
                src={highlightsList[activeHighlightIndex]?.image}
                controls
                autoPlay
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
            ) : (
              <img
                src={highlightsList[activeHighlightIndex]?.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
            )}
          </div>
        </div>
      )}

      {/* Feed Modal */}
      {feedModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col">
          <div className="sticky top-0 z-20 bg-black/60 border-b border-white/10 px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-bold text-white">Publicações</span>
            <button type="button" onClick={() => setFeedModal(null)} className="p-1.5 rounded-full bg-white/10 text-white"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto py-6">
            <div className="max-w-lg mx-auto space-y-6">
              {feedModal.list.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}