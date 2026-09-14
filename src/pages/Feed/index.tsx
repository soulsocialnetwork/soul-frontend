import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { Sidebar } from '../../components/layout/Sidebar';
import FeedTabs, { type FeedTab, type CategoryId } from '../../components/feed/FeedTabs';
import { PostList } from '../../components/feed/PostList';
import { postService, type Post } from '../../services/postService';
import { userService } from '../../services/userService';
import type { ProfileSummary } from '../../services/api/types';
import { getHttpErrorMessage } from '../../services/api';
import { Search, MessageCircle, BookOpen, Compass, Newspaper, Loader2 } from 'lucide-react';
import { useTranslation } from '../../i18n';

const SESSION_KEY = '@soul:intention_shown';

const FEED_INTENTIONS = [
  {
    id: 'friend',
    icon: MessageCircle,
    label: 'Falar com um amigo real',
    desc: 'Ir para mensagens',
    route: '/messages',
  },
  {
    id: 'moment',
    icon: BookOpen,
    label: 'Registrar um momento',
    desc: 'Criar uma publicação',
    route: '/create',
  },
  {
    id: 'updates',
    icon: Newspaper,
    label: 'Ver atualizações importantes',
    desc: 'Abrir o feed',
    route: null,
  },
  {
    id: 'explore',
    icon: Compass,
    label: 'Explorar conscientemente',
    desc: 'Navegar por Soults',
    route: '/soults',
  },
];

const CATEGORY_KEYWORDS: Record<CategoryId, string[]> = {
  natureza: ['plant', 'jardim', 'natureza', 'trilha', 'floresta', 'flores', 'substrato'],
  arte: ['arte', 'pintura', 'desenho', 'design', 'paleta', 'criatividade', 'macramê'],
  leitura: ['livro', 'leitura', 'ler', 'página', 'capítulo', 'literatura'],
  culinaria: ['pão', 'receita', 'cozinhar', 'risoto', 'cozinha', 'comida', 'ingrediente'],
  movimento: ['correr', 'pedalar', 'caminhada', 'bicicleta', 'exercício', 'treino', 'trilha'],
  musica: ['música', 'canção', 'tocar', 'playlist', 'instrumento', 'ritmo'],
  reflexao: ['silêncio', 'presença', 'consciência', 'slow', 'pausa', 'desacelerar', 'meditar', 'respirar'],
  viagem: ['viagem', 'cidade', 'país', 'voo', 'destino', 'passagem'],
  tecnologia: ['tech', 'código', 'app', 'programar', 'software', 'digital', 'computador'],
};

const BEM_KEYWORDS = ['bem', 'ajud', 'doa', 'voluntári', 'solidari', 'caridade'];

export default function FeedPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<FeedTab>('house');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedError, setFeedError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<ProfileSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const [intentionState, setIntentionState] = useState<'check' | 'show' | 'done'>('check');
  const [activeCategories, setActiveCategories] = useState<CategoryId[]>([]);

  const { t } = useTranslation('feed');

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await userService.searchProfiles(searchQuery.trim(), 0, 5);
        setSearchResults(response.content);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(SESSION_KEY);
    setIntentionState(alreadyShown ? 'done' : 'show');
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadFeed = async () => {
      setLoading(true);
      setFeedError('');
      setPage(0);
      setHasMore(true);

      try {
        const response = await postService.getFeedPaged(0, 20);

        if (!cancelled) {
          setPosts(response.posts);
          setHasMore(!response.isLast);
          setPage(1);
        }
      } catch (error) {
        if (!cancelled) {
          setPosts([]);
          setFeedError(getHttpErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadFeed();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const response = await postService.getFeedPaged(page, 20);
      setPosts((prev) => {
        const existing = prev ?? [];
        const ids = new Set(existing.map((p: Post) => p.id));
        const newPosts = response.posts.filter((p: Post) => !ids.has(p.id));
        return [...existing, ...newPosts];
      });
      setHasMore(!response.isLast);
      setPage((p) => p + 1);
    } catch {
      // silencia erro de paginação
    } finally {
      setLoadingMore(false);
    }
  };

  const handleIntention = (route: string | null) => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setIntentionState('done');

    if (route) {
      navigate(route);
    }
  };

  const handleSkip = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setIntentionState('done');
  };

  const toggleCategory = (id: CategoryId) => {
    setActiveCategories((prev) =>
      prev.includes(id)
        ? prev.filter((category) => category !== id)
        : [...prev, id]
    );
  };

  const filterPosts = (post: Post) => {
    const text = post.content.toLowerCase();
    const normalizedSearch = searchQuery.toLowerCase();

    const matchesSearch =
      text.includes(normalizedSearch) ||
      post.author.name.toLowerCase().includes(normalizedSearch);

    if (!matchesSearch) {
      return false;
    }

    // Filtros por Aba Principal
    if (activeTab === 'friends' && post.author.verified) {
      return false;
    }

    if (activeTab === 'education' && !post.author.verified) {
      return false;
    }

    if (activeTab === 'bem') {
      const isBem = BEM_KEYWORDS.some((keyword) => text.includes(keyword));

      if (!isBem) {
        return false;
      }
    }

    // Filtros secundários por Categorias
    if (activeCategories.length === 0) {
      return true;
    }

    return activeCategories.some((category) =>
      CATEGORY_KEYWORDS[category]?.some((keyword) => text.includes(keyword))
    );
  };

  if (intentionState === 'check') {
    return null;
  }

  if (intentionState === 'show') {
    return (
      <div className="min-h-screen bg-background flex flex-col lg:flex-row">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <Header />

          <main className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-xs space-y-10 animate-fade-up">
              <div className="text-center space-y-3 mb-4">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  O que você precisa agora?
                </h1>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  Escolha com intenção. Isso muda tudo.
                </p>
              </div>

              <div className="space-y-2">
                {FEED_INTENTIONS.map(
                  ({ id, icon: Icon, label, desc, route }) => (
                    <button
                      key={id}
                      onClick={() => handleIntention(route)}
                      className="w-full flex items-center gap-4 px-5 py-4 bg-transparent border border-white/[0.07] rounded-2xl text-left hover:bg-white/[0.04] hover:border-white/[0.15] active:scale-[0.98] transition-all duration-200 group"
                    >
                      <Icon
                        className="w-4 h-4 text-zinc-400 shrink-0 group-hover:text-white transition-colors"
                        strokeWidth={1.75}
                      />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                          {label}
                        </p>

                        <p className="text-xs text-zinc-500 mt-0.5">
                          {desc}
                        </p>
                      </div>
                    </button>
                  )
                )}
              </div>

              <button
                onClick={handleSkip}
                className="w-full text-xs text-zinc-600 hover:text-zinc-400 transition-colors py-2"
              >
                Apenas navegar livremente
              </button>
            </div>
          </main>
        </div>

        <BottomNav />
      </div>
    );
  }

  const filteredPosts = posts.filter(filterPosts);

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 lg:pb-12 pt-2 lg:pt-8 px-4 sm:px-6">
          <div className="w-full max-w-xl lg:max-w-2xl mx-auto space-y-4 lg:space-y-5">

            {/* Barra de busca */}
            <div className="relative z-20">
              <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] p-2 pl-5 rounded-2xl focus-within:bg-white/[0.05] focus-within:border-white/10 transition-all relative z-20">
                <Search className="w-5 h-5 text-textSecondary shrink-0" />

                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t(
                    'searchPlaceholder',
                    'Pesquisar por amigos...'
                  )}
                  className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-textPrimary placeholder:text-textSecondary/50 py-2.5"
                />
              </div>

              {searchFocused && searchQuery.trim() && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-neutral-900 border border-white/10 rounded-2xl p-2 z-50 shadow-2xl">
                  {isSearching ? (
                     <div className="p-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-textSecondary" /></div>
                  ) : searchResults.length > 0 ? (
                     searchResults.map(user => (
                       <div key={user.id} onClick={() => navigate(`/profile/${user.username}`)} className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer rounded-xl transition-colors">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                            {user.profilePicture ? <img src={user.profilePicture} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center w-full h-full text-xs font-bold text-white">{user.name.charAt(0)}</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white leading-none truncate">{user.username}</p>
                            <p className="text-xs text-textSecondary mt-1 truncate">{user.name}</p>
                          </div>
                       </div>
                     ))
                  ) : (
                     <div className="p-4 text-center text-sm text-textSecondary">Nenhum usuário encontrado.</div>
                  )}
                </div>
              )}
            </div>

            {/* FeedTabs contendo todas as abas e o menu de Categorias */}
            <FeedTabs
              active={activeTab}
              onChange={setActiveTab}
              activeCategories={activeCategories}
              onToggleCategory={toggleCategory}
              onClearCategories={() => setActiveCategories([])}
            />

            {/* Erro ao carregar o feed */}
            {feedError && !loading && (
              <div className="mx-0 rounded-2xl border border-red-400/10 bg-red-400/[0.05] px-4 py-3">
                <p className="text-sm text-red-300">
                  Não foi possível carregar o feed.
                </p>

                <p className="text-xs text-red-300/60 mt-1">
                  {feedError}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-3 text-xs font-semibold text-white hover:opacity-80 transition-opacity"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            <PostList
              posts={filteredPosts}
              loading={loading}
            />

            {/* Botão carregar mais */}
            {!loading && hasMore && filteredPosts.length > 0 && (
              <div className="flex justify-center pb-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] text-sm text-zinc-400 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.15] active:scale-[0.97] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    'Carregar mais'
                  )}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}