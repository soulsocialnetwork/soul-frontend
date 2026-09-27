import { SecureImage } from '../../components/ui/SecureMedia';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { EyeOff, CheckCircle, Trash2, Loader2, AlertTriangle, ShieldOff, Users, Grid, XCircle } from 'lucide-react';
import { moderationService } from '../../services/moderationService';
import type { PostResponse } from '../../services/api/types';
import { Sidebar } from '../../components/layout/Sidebar';
import { BottomNav } from '../../components/layout/BottomNav';
import { cn } from '../../utils/cn';
import axios from 'axios';
import { getHttpErrorMessage } from '../../services/api';

type Tab = 'posts' | 'accounts' | 'soults' | 'banned';
type BannedAccount = Awaited<ReturnType<typeof moderationService.getBannedAccounts>>[number];

interface ReportResponse {
  id: string;
  targetId: string;
  targetType: string;
  targetUsername?: string;
  reason: string;
  createdAt: string;
}

// oferece ao administrador triagem de denúncias e revisão de contas e conteúdos
export default function ModerationPage() {
  const loadRequest = useRef(0);
  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [accounts, setAccounts] = useState<ReportResponse[]>([]);
  const [bannedAccounts, setBannedAccounts] = useState<BannedAccount[]>([]);
  const [banTarget, setBanTarget] = useState<{ reportId: string; accountId: string } | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    return () => { loadRequest.current += 1; };
  }, [activeTab]);

  const loadData = async () => {
    const request = ++loadRequest.current;
    setPosts([]);
    setAccounts([]);
    setBannedAccounts([]);
    setLoading(true);
    setAccessDenied(false);
    setError('');
    try {
      if (activeTab === 'posts') {
        const res = await moderationService.getHiddenPosts(0, 50);
        if (request === loadRequest.current) setPosts(res.content);
      } else if (activeTab === 'banned') {
        const res = await moderationService.getBannedAccounts();
        if (request === loadRequest.current) setBannedAccounts(res);
      } else {
        const res = activeTab === 'soults'
          ? await moderationService.getReportedSoults(0, 50)
          : await moderationService.getReportedAccounts(0, 50);
        if (request === loadRequest.current) setAccounts(res.content);
      }
    } catch (err) {
      if (request !== loadRequest.current) return;
      setError(getHttpErrorMessage(err));
      if (axios.isAxiosError(err) && (err.response?.status === 403 || err.response?.status === 401)) {
        setAccessDenied(true);
      }
    } finally {
      if (request === loadRequest.current) setLoading(false);
    }
  };

  const handleApprovePost = async (id: string) => {
    setError('');
    setActionLoading(`approve-${id}`);
    try {
      await moderationService.approvePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(getHttpErrorMessage(err));
      if (axios.isAxiosError(err) && (err.response?.status === 403 || err.response?.status === 401)) {
        setAccessDenied(true);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemovePost = async (id: string) => {
    setError('');
    setActionLoading(`remove-${id}`);
    try {
      await moderationService.removePost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(getHttpErrorMessage(err));
      if (axios.isAxiosError(err) && (err.response?.status === 403 || err.response?.status === 401)) {
        setAccessDenied(true);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanAccount = async (reportId: string, accountId: string) => {
    setError('');
    if (activeTab === 'accounts' && !banTarget) {
      setBanTarget({ reportId, accountId });
      setBanReason('');
      setBanDuration('');
      return;
    }
    setActionLoading(`ban-${reportId}`);
    try {
      if (activeTab === 'soults') await moderationService.removeSoult(accountId);
      else await moderationService.banAccount(accountId, banReason, banDuration ? Number(banDuration) : null);
      setAccounts(prev => prev.filter(r => r.targetId !== accountId));
      setBanTarget(null);
    } catch (err) {
      setError(getHttpErrorMessage(err));
      if (axios.isAxiosError(err) && (err.response?.status === 403 || err.response?.status === 401)) {
        setAccessDenied(true);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnban = async (accountId: string) => {
    if (!window.confirm('Desbanir esta conta e restaurar o acesso?')) return;
    setActionLoading(`unban-${accountId}`);
    setError('');
    try {
      await moderationService.unbanAccount(accountId);
      setBannedAccounts(prev => prev.filter(account => account.id !== accountId));
    } catch (err) {
      setError(getHttpErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };
  
  const handleIgnoreAccount = async (reportId: string, accountId: string) => {
    setError('');
    setActionLoading(`ignore-${reportId}`);
    try {
      if (activeTab === 'soults') await moderationService.ignoreSoultReport(accountId);
      else await moderationService.ignoreAccountReport(accountId);
      setAccounts(prev => prev.filter(r => r.targetId !== accountId));
    } catch (err) {
      setError(getHttpErrorMessage(err));
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

      <div className="flex flex-wrap gap-2 mb-6 bg-white/5 p-1 rounded-xl">
        <button
          disabled={actionLoading !== null} onClick={() => setActiveTab('posts')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors",
            activeTab === 'posts' ? "bg-white/10 text-white" : "text-textSecondary hover:text-white hover:bg-white/5"
          )}
        >
          <Grid className="w-4 h-4" />
          Publicações
        </button>
        <button
          disabled={actionLoading !== null} onClick={() => setActiveTab('accounts')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors",
            activeTab === 'accounts' ? "bg-white/10 text-white" : "text-textSecondary hover:text-white hover:bg-white/5"
          )}
        >
          <Users className="w-4 h-4" />
          Contas
        </button>
        <button disabled={actionLoading !== null} onClick={() => setActiveTab('soults')} className={cn(
          'flex-1 py-2 rounded-lg text-sm font-semibold',
          activeTab === 'soults' ? 'bg-white/10 text-white' : 'text-textSecondary hover:text-white'
        )}>Soults</button>
        <button disabled={actionLoading !== null} onClick={() => setActiveTab('banned')} className={cn(
          'flex-1 min-w-[110px] py-2 rounded-lg text-sm font-semibold',
          activeTab === 'banned' ? 'bg-white/10 text-white' : 'text-textSecondary hover:text-white'
        )}>Banidas</button>
      </div>

      {error && <div role="alert" className="mb-4 p-4 rounded-xl bg-red-500/10 text-red-400">{error}</div>}
      <button onClick={loadData} disabled={loading} className="mb-4 text-sm text-textSecondary hover:text-white disabled:opacity-50">Atualizar denúncias</button>

      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-textSecondary" />
        </div>
      ) : error && posts.length === 0 && accounts.length === 0 && bannedAccounts.length === 0 ? null : activeTab === 'banned' ? (
        bannedAccounts.length === 0 ? <p className="text-center py-16 text-textSecondary">Nenhuma conta banida.</p> :
        <div className="space-y-3">{bannedAccounts.map(account => <div key={account.id} className="soul-glass rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div><Link to={`/profile/${encodeURIComponent(account.username)}`} className="font-semibold text-white hover:underline">@{account.username}</Link>
            <p className="text-sm text-textSecondary">Motivo: {account.reason || 'Não informado'}</p>
            <p className="text-xs text-textSecondary">{account.banUntil ? `Até ${new Date(account.banUntil).toLocaleString('pt-BR')}` : 'Banimento permanente'} · {account.bannedAt ? new Date(account.bannedAt).toLocaleString('pt-BR') : 'Data não registrada'}</p>
          </div>
          <button onClick={() => handleUnban(account.id)} disabled={actionLoading !== null} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm disabled:opacity-50">Desbanir</button>
        </div>)}</div>
      ) : activeTab === 'posts' ? (
        posts.length === 0 ? (
          <div className="text-center py-20 soul-glass rounded-2xl">
            <EyeOff className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-textSecondary font-medium">Nenhum post aguardando revisão.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="soul-glass rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-5">
                {post.imageUrl ? (
                  <div className="w-full sm:w-40 aspect-square sm:aspect-auto sm:h-32 rounded-xl overflow-hidden shrink-0 bg-black/50">
                    <SecureImage src={post.imageUrl} alt="Reported" className="w-full h-full object-cover object-top opacity-80" />
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
                      <Link to={`/profile/${encodeURIComponent(post.username)}`} className="text-xs text-textSecondary hover:text-white underline">@{post.username}</Link>
                    </div>
                    <p className="text-sm text-textPrimary/90 line-clamp-3 mb-4">{post.content}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-auto">
                    <Link to={`/post/${post.id}`} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm">Abrir publicação</Link>
                    <Link to={`/profile/${encodeURIComponent(post.username)}`} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm">Ver perfil</Link>
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
        accounts.length === 0 ? (
          <div className="text-center py-20 soul-glass rounded-2xl">
            <ShieldOff className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-textSecondary font-medium">{activeTab === 'soults' ? 'Nenhum Soult aguardando revisão.' : 'Nenhuma conta aguardando revisão.'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map(report => (
              <div key={report.id} className="soul-glass rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-5">
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-white">{activeTab === 'soults' ? 'ID do Soult:' : 'ID da Conta:'}</span>
                      <span className="text-xs text-textSecondary font-mono">{report.targetId}</span>
                    </div>
                    <p className="text-sm text-textPrimary/90 mb-1">
                      <span className="font-semibold">Motivo:</span> {report.reason}
                    </p>
                    <p className="text-xs text-textSecondary">
                      Reportado em: {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    {report.targetUsername && <Link to={`/profile/${encodeURIComponent(report.targetUsername)}`} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm">Ver perfil @{report.targetUsername}</Link>}
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
                      {activeTab === 'soults' ? 'Remover Soult' : 'Banir Conta'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
      {banTarget && <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onMouseDown={event => { if (event.target === event.currentTarget) setBanTarget(null); }}>
        <form onSubmit={event => { event.preventDefault(); if (banTarget) void handleBanAccount(banTarget.reportId, banTarget.accountId); }} className="soul-glass rounded-2xl p-5 w-full max-w-md space-y-4">
          <h2 className="text-lg font-semibold">Banir conta</h2>
          <label className="block text-sm">Motivo<textarea required maxLength={500} value={banReason} onChange={event => setBanReason(event.target.value)} className="mt-2 w-full min-h-24 p-3 rounded-lg bg-black/30 border border-white/15 text-white" /></label>
          <label className="block text-sm">Duração<select value={banDuration} onChange={event => setBanDuration(event.target.value)} className="mt-2 w-full p-3 rounded-lg bg-black/30 border border-white/15 text-white">
            <option value="">Permanente</option><option value="24">24 horas</option><option value="72">3 dias</option><option value="168">7 dias</option><option value="720">30 dias</option>
          </select></label>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setBanTarget(null)} className="px-4 py-2 rounded-lg bg-white/10">Cancelar</button><button type="submit" disabled={actionLoading !== null || !banReason.trim()} className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 disabled:opacity-50">Confirmar banimento</button></div>
        </form>
      </div>}
      </div>
      <BottomNav />
    </div>
  );
}
