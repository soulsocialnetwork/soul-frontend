import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { PostCard } from '../../components/feed/PostCard';
import { postService, type Post } from '../../services/postService';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setError('Post não encontrado.'); setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    postService.getPostById(id)
      .then(p => { if (!cancelled) { setPost(p); } })
      .catch(() => { if (!cancelled) setError('Não foi possível carregar o post.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  return (
    <div className="h-[100dvh] bg-background flex flex-col lg:flex-row overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-0 pt-4 pb-24 lg:pb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-4 px-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>

            {loading && (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-white/30" />
              </div>
            )}

            {!loading && error && (
              <div className="flex flex-col items-center gap-3 py-16 text-center px-4">
                <AlertCircle className="w-10 h-10 text-white/20" />
                <p className="text-white/40 text-sm">{error}</p>
                <button
                  onClick={() => navigate(-1)}
                  className="text-xs text-white/50 hover:text-white border border-white/10 px-4 py-2 rounded-full transition-colors mt-2"
                >
                  Voltar
                </button>
              </div>
            )}

            {!loading && post && (
              <PostCard
                post={post}
                onDelete={() => navigate(-1)}
              />
            )}
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
