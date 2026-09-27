import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { BadgeCheck, Loader2, Search } from 'lucide-react';
import { Sidebar } from '../../components/layout/Sidebar';
import { BottomNav } from '../../components/layout/BottomNav';
import { AvatarContent } from '../../components/ui/AvatarContent';
import { ProfileBadge, profileNameColor, type ProfileBadgeKind } from '../../components/profile/ProfileBadge';
import { useAuth } from '../../context/AuthContext';
import { getHttpErrorMessage } from '../../services/api';
import type { ProfileSummary } from '../../services/api/types';
import { userService, type UserProfile } from '../../services/userService';
import { cn } from '../../utils/cn';

const BADGES: { value: ProfileBadgeKind; label: string; description: string }[] = [
  { value: 'FOUNDER', label: 'Fundador', description: 'Equipe, criadores e participantes diretos do Soul' },
  { value: 'PARTNER', label: 'Parceiro', description: 'Parceiros oficiais do Soul' },
  { value: 'CREATOR', label: 'Criador', description: 'Criadores de conteúdo' },
  { value: 'NONE', label: 'Sem selo', description: 'Remover a promoção do perfil' },
];

export default function PromotePage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProfileSummary[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [selected, setSelected] = useState<UserProfile | null>(null);
  const [badge, setBadge] = useState<ProfileBadgeKind>('NONE');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const term = query.trim();
    if (!term || user?.role !== 'ADMIN') { setResults([]); setSearching(false); return; }
    let cancelled = false;
    setSearching(true);
    const timer = window.setTimeout(async () => {
      try {
        const page = await userService.searchProfiles(term, 0, 10);
        if (!cancelled) { setResults(page.content); setError(''); }
      } catch (cause) {
        if (!cancelled) { setResults([]); setError(getHttpErrorMessage(cause)); }
      } finally { if (!cancelled) setSearching(false); }
    }, 250);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [query, user?.role]);

  if (user?.role !== 'ADMIN') return <Navigate to="/feed" replace />;

  const selectProfile = async (username: string) => {
    setLoadingProfile(true); setError(''); setSuccess('');
    try {
      const profile = await userService.getByUsername(username);
      if (!profile) { setError('Perfil não encontrado.'); return; }
      setSelected(profile);
      setBadge(profile.profileBadge || 'NONE');
      setQuery('');
      setResults([]);
    } catch (cause) { setError(getHttpErrorMessage(cause)); }
    finally { setLoadingProfile(false); }
  };

  const saveBadge = async () => {
    if (!selected || saving || selected.username.toLowerCase() === 'soul' || badge === selected.profileBadge) return;
    setSaving(true); setError(''); setSuccess('');
    try {
      const updated = await userService.setProfileBadge(selected.username, badge);
      setSelected(updated);
      setBadge(updated.profileBadge || 'NONE');
      setSuccess(`Selo de @${updated.username} atualizado.`);
    } catch (cause) { setError(getHttpErrorMessage(cause)); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-[100dvh] bg-background text-textPrimary lg:flex">
      <Sidebar />
      <main className="mx-auto w-full max-w-2xl px-5 py-8 pb-28 sm:px-8 lg:pb-10">
        <h1 className="text-2xl font-bold text-white">Promover perfil</h1>
        <p className="mt-1 text-sm text-zinc-400">Encontre um perfil e escolha o selo que será exibido ao lado do nome.</p>

        <div className="relative mt-8">
          <label htmlFor="promote-search" className="mb-2 block text-xs text-zinc-400">Buscar pessoa</label>
          <Search aria-hidden="true" className="absolute bottom-3 left-3.5 h-4 w-4 text-zinc-500" />
          <input id="promote-search" value={query} onChange={event => setQuery(event.target.value)}
            placeholder="Nome ou @usuário" className="h-11 w-full rounded-lg border border-white/15 bg-white/[0.04] pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/40" />
        </div>

        {searching && <p role="status" className="mt-4 flex items-center gap-2 text-sm text-zinc-400"><Loader2 className="h-4 w-4 animate-spin" />Buscando perfis...</p>}
        {!searching && query.trim() && results.length === 0 && !error && <p className="mt-4 text-sm text-zinc-500">Nenhum perfil encontrado.</p>}
        {results.length > 0 && <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
          {results.map(profile => <button key={profile.id} type="button" onClick={() => void selectProfile(profile.username)} disabled={loadingProfile}
            className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06] disabled:opacity-50">
            <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-neutral-800 text-sm"><AvatarContent src={profile.profilePicture} name={profile.name || profile.username} /></span>
            <span className="min-w-0"><span className="flex items-center gap-1.5"><span className={cn('truncate text-sm font-semibold', profileNameColor(profile.profileBadge))}>@{profile.username}</span><ProfileBadge badge={profile.profileBadge} className="h-3.5 w-3.5" /></span><span className="block truncate text-xs text-zinc-400">{profile.name}</span></span>
          </button>)}
        </div>}

        {selected && <section className="mt-8 space-y-5" aria-label="Selo do perfil selecionado">
          <div className="flex items-center gap-3">
            <span className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-800 text-base"><AvatarContent src={selected.avatarUrl} name={selected.name || selected.username} /></span>
            <div className="min-w-0"><p className="flex items-center gap-1.5"><span className={cn('truncate font-semibold', profileNameColor(selected.profileBadge))}>@{selected.username}</span><ProfileBadge badge={selected.profileBadge} className="h-4 w-4" /></p><p className="truncate text-sm text-zinc-400">{selected.name}</p><Link to={`/profile/${encodeURIComponent(selected.username)}`} className="text-xs text-zinc-400 underline-offset-2 hover:text-white hover:underline">Ver perfil</Link></div>
          </div>
          <fieldset disabled={selected.username.toLowerCase() === 'soul' || saving} className="space-y-2 disabled:opacity-50">
            <legend className="mb-2 text-xs font-semibold text-zinc-400">Escolher selo</legend>
            {BADGES.map(option => <label key={option.value} className={cn('flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors', badge === option.value ? 'border-white/30 bg-white/[0.08]' : 'border-white/10 bg-white/[0.025] hover:bg-white/[0.05]')}>
              <input type="radio" name="profile-badge" value={option.value} checked={badge === option.value} onChange={() => { setBadge(option.value); setSuccess(''); }} className="accent-white" />
              <ProfileBadge badge={option.value} className="h-5 w-5" />
              <span className="min-w-0"><span className="block text-sm font-semibold text-white">{option.label}</span><span className="block text-xs text-zinc-400">{option.description}</span></span>
            </label>)}
          </fieldset>
          {selected.username.toLowerCase() === 'soul' && <p className="text-sm text-zinc-400">O perfil oficial mantém o selo de fundador.</p>}
          <button type="button" onClick={() => void saveBadge()} disabled={saving || selected.username.toLowerCase() === 'soul' || badge === selected.profileBadge}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-semibold text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}{saving ? 'Salvando...' : 'Aplicar selo'}
          </button>
        </section>}
        {error && <p role="alert" className="mt-5 text-sm text-red-300">{error}</p>}
        {success && <p role="status" className="mt-5 text-sm text-emerald-300">{success}</p>}
      </main>
      <BottomNav />
    </div>
  );
}
