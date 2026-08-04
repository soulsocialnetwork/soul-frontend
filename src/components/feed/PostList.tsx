import { useState } from 'react';
import { PostCard } from './PostCard';
import type { Post } from '../../services/postService';
import { useTranslation } from '../../i18n';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface PostListProps {
  posts: Post[];
  loading?: boolean;
}

function PostCardSkeleton({ index }: { index: number }) {
  return (
    <div
      className="glass-card rounded-3xl overflow-hidden mx-4 mb-4 animate-pulse"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="w-10 h-10 rounded-2xl bg-surfaceHighlight" />
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-3 bg-surfaceHighlight rounded-2xl w-1/3" />
          <div className="h-2 bg-surfaceHighlight rounded-2xl w-1/5" />
        </div>
      </div>
      <div className="h-3 bg-surfaceHighlight rounded-2xl mx-4 mb-2 w-4/5" />
      <div className="h-3 bg-surfaceHighlight rounded-2xl mx-4 mb-4 w-2/3" />
      <div className="mx-3 mb-3 w-full aspect-video rounded-2xl bg-surfaceHighlight" />
      <div className="flex gap-6 px-4 py-3 border-t border-white/[0.04]">
        <div className="h-3 bg-surfaceHighlight rounded-2xl w-16" />
        <div className="h-3 bg-surfaceHighlight rounded-2xl w-20" />
        <div className="h-3 bg-surfaceHighlight rounded-2xl w-12" />
      </div>
    </div>
  );
}

export function PostList({ posts, loading = false }: PostListProps) {
  const { t } = useTranslation('feed');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(posts.length / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="pt-3 grid grid-cols-2 gap-4 px-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-square bg-surfaceHighlight rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-textSecondary animate-fade-in">
        <p className="text-sm">{t('empty')}</p>
        <p className="text-xs mt-1 opacity-50">{t('emptyHint')}</p>
      </div>
    );
  }

  const currentPosts = posts.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  return (
    <div className="pt-2 pb-8 flex flex-col min-h-[70vh]">
      <div className="px-4 mb-4">
        <h2 className="text-sm font-semibold text-textSecondary uppercase tracking-wider mb-1">
          Consumo Intencional
        </h2>
        <p className="text-xs text-textSecondary/60">
          Escolha ativamente o que deseja ver.
        </p>
      </div>

      {/* Grid de Seleção Consciente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 flex-1 content-start">
        {currentPosts.map((post) => (
          <button
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="group relative aspect-square rounded-3xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all text-left flex flex-col active:scale-95"
          >
            {post.imageUrl ? (
              <img src={post.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 opacity-80" />
            )}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
            
            <div className="relative z-10 p-4 flex flex-col h-full justify-between">
              <div className="flex items-center gap-2">
                <img src={post.author.avatarUrl} alt="" className="w-6 h-6 rounded-full border border-white/20" />
                <span className="text-xs font-medium truncate drop-shadow-md">{post.author.username}</span>
              </div>
              <p className="text-xs font-medium text-white/90 line-clamp-3 drop-shadow-md leading-relaxed">
                {post.content}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Paginação Horizontal (Estilo Livro) */}
      <div className="flex items-center justify-between px-6 mt-8">
        <button
          onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
          disabled={currentPage === 0}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-30 disabled:hover:bg-white/5"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <span className="text-xs font-semibold text-textSecondary tracking-widest uppercase">
          Página {currentPage + 1} de {totalPages}
        </span>

        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={currentPage >= totalPages - 1}
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-30 disabled:hover:bg-white/5"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {currentPage >= totalPages - 1 && posts.length > ITEMS_PER_PAGE && (
        <div className="mt-8 mx-4 p-5 rounded-3xl bg-surface/30 border border-white/5 flex flex-col items-center justify-center text-center backdrop-blur-sm animate-fade-in">
          <h3 className="text-[14px] font-semibold text-textPrimary mb-1">Você viu tudo</h3>
          <p className="text-xs text-textSecondary max-w-[250px]">
            Chegou à última página. Que tal uma pausa?
          </p>
        </div>
      )}

      {/* Modal de Leitura com Foco */}
      {selectedPost && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-fade-in overflow-y-auto"
          onClick={() => setSelectedPost(null)}
        >
          <div className="sticky top-0 z-10 flex justify-end p-4 bg-gradient-to-b from-black/80 to-transparent">
            <button 
              onClick={() => setSelectedPost(null)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur-md transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="flex-1 flex items-center py-10" onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-w-lg mx-auto">
              <PostCard post={selectedPost} index={0} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
