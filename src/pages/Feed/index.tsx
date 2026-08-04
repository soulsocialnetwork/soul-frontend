import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { Sidebar } from '../../components/layout/Sidebar';
import FeedTabs, { type FeedTab, type CategoryId } from '../../components/feed/FeedTabs';
import { PostList } from '../../components/feed/PostList';
import { postService, type Post } from '../../services/postService';
import { Search, MessageCircle, BookOpen, Compass, Newspaper } from 'lucide-react';
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
  natureza:   ['plant', 'jardim', 'natureza', 'trilha', 'floresta', 'flores', 'substrato'],
  arte:       ['arte', 'pintura', 'desenho', 'design', 'paleta', 'criatividade', 'macramê'],
  leitura:    ['livro', 'leitura', 'ler', 'página', 'capítulo', 'literatura'],
  culinaria:  ['pão', 'receita', 'cozinhar', 'risoto', 'cozinha', 'comida', 'ingrediente'],
  movimento:  ['correr', 'pedalar', 'caminhada', 'bicicleta', 'exercício', 'treino', 'trilha'],
  musica:     ['música', 'canção', 'tocar', 'playlist', 'instrumento', 'ritmo'],
  reflexao:   ['silêncio', 'presença', 'consciência', 'slow', 'pausa', 'desacelerar', 'meditar', 'respirar'],
  viagem:     ['viagem', 'cidade', 'país', 'voo', 'destino', 'passagem'],
  tecnologia: ['tech', 'código', 'app', 'programar', 'software', 'digital', 'computador'],
};

const BEM_KEYWORDS = ['bem', 'ajud', 'doa', 'voluntári', 'solidari', 'caridade'];

export default function FeedPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FeedTab>('house');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [intentionState, setIntentionState] = useState<'check' | 'show' | 'done'>('check');
  const [activeCategories, setActiveCategories] = useState<CategoryId[]>([]);
  const { t } = useTranslation('feed');

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(SESSION_KEY);
    setIntentionState(alreadyShown ? 'done' : 'show');
  }, []);

  useEffect(() => {
    setLoading(true);
    postService.getPosts()
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  const handleIntention = (route: string | null) => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setIntentionState('done');
    if (route) navigate(route);
  };

  const handleSkip = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setIntentionState('done');
  };

  const toggleCategory = (id: CategoryId) => {
    setActiveCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const filterPosts = (post: Post) => {
    const text = post.content.toLowerCase();
    const matchesSearch =
      text.includes(searchQuery.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Filtros por Aba Principal
    if (activeTab === 'friends' && post.author.verified) return false;
    if (activeTab === 'education' && !post.author.verified) return false;
    if (activeTab === 'bem') {
      const isBem = BEM_KEYWORDS.some(kw => text.includes(kw));
      if (!isBem) return false;
    }

    // Filtros secundários por Categorias
    if (activeCategories.length === 0) return true;
    return activeCategories.some(cat =>
      CATEGORY_KEYWORDS[cat]?.some(kw => text.includes(kw))
    );
  };

  if (intentionState === 'check') return null;

  if (intentionState === 'show') {
    return (
      <div className="min-h-screen bg-background flex flex-col lg:flex-row">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-sm space-y-8 animate-fade-up">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-white">O que você precisa agora?</h1>
                <p className="text-sm text-zinc-400">Escolha sua intenção antes de continuar</p>
              </div>

              <div className="space-y-3">
                {FEED_INTENTIONS.map(({ id, icon: Icon, label, desc, route }) => (
                  <button
                    key={id}
                    onClick={() => handleIntention(route)}
                    className="w-full flex items-center gap-4 p-4 bg-white/[0.03] border border-white/5 rounded-2xl text-left hover:bg-white/[0.06] hover:border-white/10 active:scale-[0.98] transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-zinc-300" strokeWidth={1.75} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{label}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>
                    </div>
                  </button>
                ))}
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

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 lg:pb-12 pt-2 lg:pt-8 px-4 sm:px-6">
          <div className="w-full max-w-xl lg:max-w-2xl mx-auto space-y-4 lg:space-y-5">

            {/* Barra de busca */}
            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] p-2 pl-5 rounded-2xl focus-within:bg-white/[0.05] focus-within:border-white/10 transition-all">
              <Search className="w-5 h-5 text-textSecondary shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder', 'Pesquisar posts, amigos ou artigos...')}
                className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-textPrimary placeholder:text-textSecondary/50 py-2.5"
              />
            </div>

            {/* FeedTabs contendo todas as abas e o menu de Categorias */}
            <FeedTabs 
              active={activeTab} 
              onChange={setActiveTab} 
              activeCategories={activeCategories}
              onToggleCategory={toggleCategory}
              onClearCategories={() => setActiveCategories([])}
            />

            <PostList posts={posts.filter(filterPosts)} loading={loading} />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}