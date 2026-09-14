import { useState, useEffect } from 'react';
import { EyeOff, CheckCircle, Trash2, Loader2, AlertTriangle, ShieldOff } from 'lucide-react';
import { moderationService } from '../../services/moderationService';
import type { PostResponse } from '../../services/api/types';
import axios from 'axios';

// The page uses the real JWT token already attached by the api interceptor.
// If the backend returns 403 or 401, access is denied — no client-side workaround possible.

export default function ModerationPage() {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadHiddenPosts();
  }, []);

  const loadHiddenPosts = async () => {
    setLoading(true);
    setAccessDenied(false);
    try {
      const res = await moderationService.getHiddenPosts(0, 50);
      setPosts(res.content);
    } catch (err) {
      if (axios.isAxiosError(err) && (err.response?.status === 403 || err.response?.status === 401)) {
        setAccessDenied(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(`approve-${id}`);
    try {
      await moderationService.approvePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      if (axios.isAxiosError(err) && (err.response?.status === 403 || err.response?.status === 401)) {
        setAccessDenied(true);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (id: string) => {
    setActionLoading(`remove-${id}`);
    try {
      await moderationService.removePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      if (axios.isAxiosError(err) && (err.response?.status === 403 || err.response?.status === 401)) {
        setAccessDenied(true);
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-textSecondary" />
      </div>
    );
  }

  // Access is determined entirely by backend response (403/401).
  // No client-side flag can be manipulated to bypass this.
  if (accessDenied) {
    return (
      <div className="max-w-md mx-auto p-6 pt-20 flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-400">
          <ShieldOff className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white mb-2">Acesso Negado</h1>
          <p className="text-sm text-textSecondary leading-relaxed">
            Você não tem permissão para acessar o painel de moderação.
            Esta área é restrita a administradores autorizados pelo servidor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Centro de Moderação</h1>
          <p className="text-sm text-textSecondary">Publicações ocultadas devido a denúncias da comunidade.</p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/5 rounded-2xl">
          <EyeOff className="w-8 h-8 text-white/20 mx-auto mb-3" />
          <p className="text-textSecondary font-medium">Nenhum post aguardando revisão.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-5 transition-colors hover:bg-white/[0.05]">
              {post.imageUrl ? (
                <div className="w-full sm:w-40 aspect-square sm:aspect-auto sm:h-32 rounded-xl overflow-hidden shrink-0 bg-black/50">
                  <img src={post.imageUrl} alt="Reported" className="w-full h-full object-cover object-top opacity-80" />
                </div>
              ) : (
                <div className="w-full sm:w-40 aspect-square sm:aspect-auto sm:h-32 rounded-xl shrink-0 bg-white/5 flex items-center justify-center text-white/20 text-xs font-semibold">
                  Sem Imagem
                </div>
              )}

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-white">{post.name}</span>
                    <span className="text-xs text-textSecondary">@{post.username}</span>
                  </div>
                  <p className="text-sm text-textPrimary/90 line-clamp-3 mb-4">{post.content}</p>
                </div>

                <div className="flex items-center gap-3 mt-auto">
                  <button
                    onClick={() => handleApprove(post.id)}
                    disabled={actionLoading !== null}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-50"
                  >
                    {actionLoading === `approve-${post.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Aprovar
                  </button>
                  <button
                    onClick={() => handleRemove(post.id)}
                    disabled={actionLoading !== null}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-50"
                  >
                    {actionLoading === `remove-${post.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
