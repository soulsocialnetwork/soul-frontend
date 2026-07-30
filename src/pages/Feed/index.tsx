import { useState, useEffect } from 'react';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { Sidebar } from '../../components/layout/Sidebar';
import FeedTabs, { type FeedTab } from '../../components/feed/FeedTabs';
import { PostList } from '../../components/feed/PostList';
import { postService, type Post } from '../../services/postService';
import { Search } from 'lucide-react';
import { useTranslation } from '../../i18n';

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<FeedTab>('friends');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation('feed');

  // busca os posts da API ao carregar a página
  useEffect(() => {
    setLoading(true);
    postService.getPosts()
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 lg:pb-12 pt-2 lg:pt-8 px-4 sm:px-6">
          <div className="w-full max-w-xl lg:max-w-2xl mx-auto space-y-5 lg:space-y-6">
            
            {/* barra de pesquisa rápida no topo do feed */}
            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.05] p-2 pl-5 rounded-2xl mb-6 focus-within:bg-white/[0.05] focus-within:border-white/10 transition-all">
              <Search className="w-5 h-5 text-textSecondary shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder', 'Pesquisar posts, amigos ou artigos...')}
                className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-textPrimary placeholder:text-textSecondary/50 py-2.5"
              />
            </div>

            <FeedTabs active={activeTab} onChange={setActiveTab} />
            <PostList posts={posts} loading={loading} />
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}