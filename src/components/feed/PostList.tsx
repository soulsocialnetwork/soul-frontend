import { PostCard } from './PostCard';
import type { Post } from '../../services/postService';
import { useTranslation } from '../../i18n';

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

  if (loading) {
    return (
      <div className="pt-3">
        {Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} index={i} />)}
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

  return (
    <div className="pt-3">
      {posts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)}
    </div>
  );
}
