import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ProfileSummary, FollowRelationshipResponse } from '../../services/api/types';
import { userService } from '../../services/userService';
import { getHttpErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AvatarContent } from '../ui/AvatarContent';
import { ProfileBadge, profileNameColor } from './ProfileBadge';
import { profileListRowClass } from './listStyles';
import { ConfirmUnfollowModal } from './ConfirmUnfollowModal';

type FollowStatus = FollowRelationshipResponse['status'];

interface ConnectionsModalProps {
  title: string;
  users: ProfileSummary[];
  loading: boolean;
  onClose: () => void;
  onRelationshipChange?: () => void;
}

export function ConnectionsModal({ title, users, loading, onClose, onRelationshipChange }: ConnectionsModalProps) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [statuses, setStatuses] = useState<Record<string, FollowStatus>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [unfollowTarget, setUnfollowTarget] = useState<ProfileSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const candidates = users.filter(profile => profile.id !== currentUser?.id);
    void Promise.all(candidates.map(async profile => {
      try { return [profile.username, (await userService.getFollowStatus(profile.username)).status] as const; }
      catch { return null; }
    })).then(results => {
      if (!cancelled) setStatuses(Object.fromEntries(results.filter(result => result !== null)));
    });
    return () => { cancelled = true; };
  }, [users, currentUser?.id]);

  const changeFollow = async (profile: ProfileSummary, confirmed = false) => {
    if (busy) return;
    if (statuses[profile.username] === 'FOLLOWING' && !confirmed) { setUnfollowTarget(profile); return; }
    setBusy(profile.username);
    setError('');
    try {
      const status = statuses[profile.username];
      if (status === 'FOLLOWING' || status === 'PENDING') await userService.unfollow(profile.username);
      else await userService.follow(profile.username);
      const refreshed = await userService.getFollowStatus(profile.username);
      setStatuses(previous => ({ ...previous, [profile.username]: refreshed.status }));
      onRelationshipChange?.();
    } catch (cause) {
      setError(getHttpErrorMessage(cause));
      try {
        const refreshed = await userService.getFollowStatus(profile.username);
        setStatuses(previous => ({ ...previous, [profile.username]: refreshed.status }));
      }
      catch { /* Preserve the last known status. */ }
    } finally { setBusy(null); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="flex h-[min(70dvh,620px)] w-full max-w-sm flex-col gap-8 animate-scale-up" role="dialog" aria-modal="true" aria-label={title}>
        <div className="relative text-center">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="soul-glass absolute -top-1 -right-1 rounded-lg p-1.5 text-zinc-500 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
        <div className="flex-1 space-y-2 overflow-y-auto">
          {loading ? <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-zinc-500" /></div>
            : users.length === 0 ? <p className="py-12 text-center text-sm text-zinc-500">Vazio</p>
              : users.map(profile => {
                const status = statuses[profile.username];
                return <div key={profile.id} className={profileListRowClass}>
                  <button type="button" onClick={() => { onClose(); navigate(`/profile/${encodeURIComponent(profile.username)}`); }} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-neutral-800 text-sm"><AvatarContent src={profile.profilePicture} name={profile.name || profile.username} /></span>
                    <span className="min-w-0"><span className="flex min-w-0 items-center gap-1.5"><span className={`truncate text-sm font-semibold ${profileNameColor(profile.profileBadge)}`}>{profile.username}</span><ProfileBadge badge={profile.profileBadge} className="h-3.5 w-3.5" /></span><span className="mt-0.5 block truncate text-xs text-zinc-400">{profile.name}</span></span>
                  </button>
                  {profile.id !== currentUser?.id && <button type="button" disabled={!status || !!busy} onClick={() => void changeFollow(profile)} className="shrink-0 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black transition-colors hover:bg-zinc-200 disabled:opacity-40">
                    {busy === profile.username ? 'Aguarde...' : status === 'FOLLOWING' ? 'Deixar de seguir' : status === 'PENDING' ? 'Cancelar pedido' : 'Seguir'}
                  </button>}
                </div>;
              })}
        </div>
      </div>
      {unfollowTarget && <ConfirmUnfollowModal username={unfollowTarget.username} onCancel={() => setUnfollowTarget(null)} onConfirm={() => { const target = unfollowTarget; setUnfollowTarget(null); void changeFollow(target, true); }} />}
    </div>
  );
}
