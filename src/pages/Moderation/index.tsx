import { useState, useEffect } from 'react';
import { EyeOff, CheckCircle, Trash2, Loader2, AlertTriangle, ShieldOff, Users, Grid, XCircle } from 'lucide-react';
import { moderationService } from '../../services/moderationService';
import type { PostResponse } from '../../services/api/types';
import { Sidebar } from '../../components/layout/Sidebar';
import { BottomNav } from '../../components/layout/BottomNav';
import { cn } from '../../utils/cn';
import axios from 'axios';

type Tab = 'posts' | 'accounts';

interface ReportResponse {
  id: string;
  targetId: string;
  targetType: string;
  reason: string;
  createdAt: string;
}

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [accounts, setAccounts] = useState<ReportResponse[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setAccessDenied(false);
    try {
      if (activeTab === 'posts') {
        const res = await moderationService.getHiddenPosts(0, 50);
        setPosts(res.content);
      } else {
        const res = await moderationService.getReportedAccounts(0, 50);
        setAccounts(res.content);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && (err.response?.status === 403 || err.response?.status === 401)) {
        setAccessDenied(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePost = async (id: string) => {
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

  const handleRemovePost = async (id: string) => {
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

  const handleBanAccount = async (reportId: string, accountId: string) => {
    setActionLoading(`ban-${reportId}`);
    try {
      await moderationService.banAccount(accountId);
      setAccounts(prev => prev.filter(r => r.id !== reportId));
    } catch (err) {
      if (axios.isAxiosError(err) && (err.response?.status === 403 || err.response?.status === 401)) {
        setAccessDenied(true);
      }
    } finally {
      setActionLoading(null);
    }
  };
  
  const handleIgnoreAccount = async (reportId: string, accountId: string) => {
    setActionLoading(`ignore-${reportId}`);
    try {
      await moderationService.ignoreAccountReport(accountId);
      setAccounts(prev => prev.filter(r => r.id !== reportId));
    } catch (err) {
      if (axios.isAxiosError(err) && (err.response?.status === 403 || err.response?.status === 401)) {
        setAccessDenied(true);
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (accessDenied) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col lg:flex-row text-textPrimary">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md mx-auto flex flex-col items-center text-center gap-6">
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
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col lg:flex-row text-textPrimary select-none">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 animate-fade-in max-w-4xl mx-auto w-full pb-24 lg:pb-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Centro de Moderação</h1>
          <p className="text-sm text-textSecondary">Análise de conteúdo e contas denunciadas pela comunidade.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('posts')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors",
            activeTab === 'posts' ? "bg-white/10 text-white" : "text-textSecondary hover:text-white hover:bg-white/5"
          )}
        >
          <Grid className="w-4 h-4" />
          Publicações
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors",
            activeTab === 'accounts' ? "bg-white/10 text-white" : "text-textSecondary hover:text-white hover:bg-white/5"
          )}
        >
          <Users className="w-4 h-4" />
          Contas
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-textSecondary" />
        </div>
      ) : activeTab === 'posts' ? (
        posts.length === 0 ? (
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
                      onClick={() => handleApprovePost(post.id)}
                      disabled={actionLoading !== null}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                      {actionLoading === `approve-${post.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleRemovePost(post.id)}
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
        )
      ) : (
        // Contas Tab
        accounts.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/5 rounded-2xl">
            <ShieldOff className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-textSecondary font-medium">Nenhuma conta aguardando revisão.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map(report => (
              <div key={report.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-5 transition-colors hover:bg-white/[0.05]">
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-white">ID da Conta:</span>
                      <span className="text-xs text-textSecondary font-mono">{report.targetId}</span>
                    </div>
                    <p className="text-sm text-textPrimary/90 mb-1">
                      <span className="font-semibold">Motivo:</span> {report.reason}
                    </p>
                    <p className="text-xs text-textSecondary">
                      Reportado em: {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() => handleIgnoreAccount(report.id, report.targetId)}
                      disabled={actionLoading !== null}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                      {actionLoading === `ignore-${report.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      Ignorar
                    </button>
                    <button
                      onClick={() => handleBanAccount(report.id, report.targetId)}
                      disabled={actionLoading !== null}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-50"
                    >
                      {actionLoading === `ban-${report.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      Banir Conta
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
      </div>
      <BottomNav />
    </div>
  );
}
