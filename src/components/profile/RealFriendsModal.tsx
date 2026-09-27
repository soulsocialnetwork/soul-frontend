import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import * as QRCode from 'qrcode';
import { Camera, Link, UserPlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SecureImage } from '../ui/SecureMedia';
import { QrScanner } from './QrScanner';
import { userService, type UserProfile } from '../../services/userService';
import { getHttpErrorMessage } from '../../services/api';
import type { FollowRelationshipResponse, ProfileSummary } from '../../services/api/types';
import { AvatarContent } from '../ui/AvatarContent';
import { messageService } from '../../services/messageService';
import { ProfileBadge, profileNameColor } from './ProfileBadge';
import { profileListRowClass } from './listStyles';

type RealFriendsModalProps = { username: string; initialView?: 'friends' | 'qr'; onClose: () => void; onFriendsChanged?: () => void };
type FollowStatus = FollowRelationshipResponse['status'];
type RealFriendStatus = 'NONE' | 'SENT' | 'RECEIVED' | 'FRIENDS';

// lista amigos reais e conduz convites que dependem de seguimento mútuo
export function RealFriendsModal({ username, initialView = 'friends', onClose, onFriendsChanged }: RealFriendsModalProps) {
  const navigate = useNavigate();
  const profileUrl = `${window.location.origin}/profile/${encodeURIComponent(username)}`;
  const [qrImage, setQrImage] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [found, setFound] = useState<UserProfile | null>(null);
  const [followStatus, setFollowStatus] = useState<FollowStatus>('NOT_FOLLOWING');
  const [friendStatus, setFriendStatus] = useState<RealFriendStatus>('NONE');
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState<{ id: string; username: string; name: string }[]>([]);
  const [friends, setFriends] = useState<ProfileSummary[]>([]);
  const [confirmFriend, setConfirmFriend] = useState<ProfileSummary | null>(null);
  const [friendActionLoading, setFriendActionLoading] = useState(false);
  const [showQr, setShowQr] = useState(initialView === 'qr');

  useEffect(() => { void userService.getRealFriendRequests().then(setRequests).catch(() => setRequests([])); }, []);
  useEffect(() => { void userService.getRealFriends().then(setFriends).catch(() => setFriends([])); }, []);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(profileUrl, { width: 200, margin: 2, errorCorrectionLevel: 'M' })
      .then(image => { if (!cancelled) setQrImage(image); })
      .catch(() => { if (!cancelled) setError('Não foi possível gerar o QR. Use o link do perfil.'); });
    return () => { cancelled = true; };
  }, [profileUrl]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !scannerOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, scannerOpen]);

  const resolveUsername = async (scannedUsername: string) => {
    setScannerOpen(false);
    setFound(null);
    setError('');
    if (scannedUsername.toLowerCase() === username.toLowerCase()) {
      setError('Este QR pertence ao seu próprio perfil.');
      return;
    }
    setLoading(true);
    try {
      const [profile, relationship, realFriendStatus] = await Promise.all([
        userService.getByUsername(scannedUsername),
        userService.getFollowStatus(scannedUsername),
        userService.getRealFriendStatus(scannedUsername),
      ]);
      if (!profile) { setError('Usuário não encontrado.'); return; }
      setFound(profile);
      setFollowStatus(relationship.status);
      setFriendStatus(realFriendStatus);
    } catch (cause) {
      setError(isAxiosError(cause) && cause.response?.status === 404
        ? 'Usuário não encontrado.' : getHttpErrorMessage(cause));
    } finally { setLoading(false); }
  };

  const followFound = async () => {
    if (!found || followStatus !== 'NOT_FOLLOWING' || following) return;
    setFollowing(true);
    setError('');
    try {
      await userService.follow(found.username);
      setFollowStatus(found.privateProfile ? 'PENDING' : 'FOLLOWING');
      try { setFollowStatus((await userService.getFollowStatus(found.username)).status); }
      catch { }
    } catch (cause) {
      try {
        const relationship = await userService.getFollowStatus(found.username);
        setFollowStatus(relationship.status);
        if (relationship.status === 'NOT_FOLLOWING') setError(getHttpErrorMessage(cause));
      } catch { setError(getHttpErrorMessage(cause)); }
    } finally { setFollowing(false); }
  };

  const inviteFound = async () => {
    if (!found || friendStatus !== 'NONE') return;
    setFollowing(true); setError('');
    try { await userService.inviteRealFriend(found.username); setFriendStatus('SENT'); setError('Convite enviado. A pessoa precisa aceitar para virar Amigo Real.'); }
    catch (cause) { setError(getHttpErrorMessage(cause)); }
    finally { setFollowing(false); }
  };

  const talkBeforeLeaving = async () => {
    if (!confirmFriend || friendActionLoading) return;
    setFriendActionLoading(true); setError('');
    try {
      const conversation = await messageService.getOrCreateConversation(confirmFriend.username);
      onClose();
      navigate(`/messages?conversation=${encodeURIComponent(conversation.id)}`);
    } catch (cause) { setError(getHttpErrorMessage(cause)); }
    finally { setFriendActionLoading(false); }
  };

  const cutTies = async () => {
    if (!confirmFriend || friendActionLoading) return;
    setFriendActionLoading(true); setError('');
    try {
      await userService.removeRealFriend(confirmFriend.username);
      setFriends(previous => previous.filter(friend => friend.id !== confirmFriend.id));
      setConfirmFriend(null);
      onFriendsChanged?.();
    } catch (cause) { setError(getHttpErrorMessage(cause)); }
    finally { setFriendActionLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md" onClick={onClose} role="presentation">
      <div className="flex max-h-[85dvh] w-full max-w-sm min-w-0 flex-col gap-8 overflow-x-hidden overflow-y-auto animate-scale-up" role="dialog" aria-modal="true" aria-label={showQr ? 'Meu QR Code' : 'Amigos Reais'} onClick={event => event.stopPropagation()}>
        <div className="relative text-center">
          <h2 className="text-xl font-bold text-white">{showQr ? 'Meu QR Code' : 'Amigos Reais'}</h2>
          <button type="button" autoFocus onClick={onClose} aria-label="Fechar Amigos Reais" className="soul-glass absolute right-0 top-0 rounded-lg p-1.5 text-zinc-500 hover:text-white"><X size={19} /></button>
        </div>

        {!showQr && !confirmFriend && <div className="min-w-0 max-h-[38vh] space-y-2 overflow-x-hidden overflow-y-auto">
          {friends.length ? friends.map(friend => <div key={friend.id} className={profileListRowClass}>
            <button type="button" onClick={() => { onClose(); navigate(`/profile/${encodeURIComponent(friend.username)}`); }} className="flex min-w-0 flex-1 items-center gap-3 text-left">
              <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-neutral-800 text-sm"><AvatarContent src={friend.profilePicture} name={friend.name || friend.username} /></span>
              <span className="min-w-0"><span className="flex min-w-0 items-center gap-1.5"><span className={`truncate text-sm font-semibold ${profileNameColor(friend.profileBadge)}`}>{friend.username}</span><ProfileBadge badge={friend.profileBadge} className="h-3.5 w-3.5" /></span><span className="mt-0.5 block truncate text-xs text-zinc-400">{friend.name}</span></span>
            </button>
            <button type="button" onClick={() => { setError(''); setConfirmFriend(friend); }} className="shrink-0 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black transition-colors hover:bg-zinc-200">Cortar laços</button>
          </div>) : <p className="py-6 text-center text-sm text-zinc-400">Nenhum Amigo Real ainda.</p>}
        </div>}
        {confirmFriend && !showQr && <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <div><p className="text-sm font-semibold text-white">Antes de cortar laços com @{confirmFriend.username}</p><p className="mt-1 text-xs leading-relaxed text-zinc-400">Se quiser, vocês podem conversar primeiro. Enviar uma mensagem é opcional, e a outra pessoa decide se quer responder.</p></div>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={friendActionLoading} onClick={() => void talkBeforeLeaving()} className="flex-1 rounded-lg bg-white px-3 py-2.5 text-xs font-semibold text-black disabled:opacity-50">Abrir conversa</button>
            <button type="button" disabled={friendActionLoading} onClick={() => void cutTies()} className="flex-1 rounded-lg border border-red-400/20 px-3 py-2.5 text-xs font-semibold text-red-300 hover:bg-red-400/10 disabled:opacity-50">Cortar laços</button>
          </div>
          <button type="button" disabled={friendActionLoading} onClick={() => setConfirmFriend(null)} className="text-xs text-zinc-400 hover:text-white">Voltar para amigos</button>
        </div>}
        {showQr && <div className="flex flex-col items-center gap-3">
          <div className="rounded-lg bg-white p-4">
            {qrImage ? <img src={qrImage} alt={`QR do perfil @${username}`} width={200} height={200} className="block" />
              : <div className="flex h-[200px] w-[200px] items-center justify-center text-center text-sm text-black/70">QR indisponível</div>}
          </div>
          <p className="text-sm font-semibold text-white">@{username}</p>
          <p className="text-center text-xs text-zinc-400">O QR contém apenas o link público do perfil. Contas privadas exigem solicitação para seguir.</p>
        </div>}

        <div className="flex gap-2">
          <button type="button" onClick={() => setShowQr(value => !value)} className="soul-glass flex h-11 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white"><Link size={16} />{showQr ? 'Ver amigos' : 'Meu QR Code'}</button>
          <button type="button" disabled={loading || following} onClick={() => { setError(''); setScannerOpen(true); }} className="soul-glass flex h-11 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"><Camera size={16} />Escanear QR</button>
        </div>

        {loading && <p role="status" className="mt-4 text-center text-sm text-white/70">Procurando perfil...</p>}
        {error && <p role="alert" className="mt-4 text-center text-sm text-red-300">{error}</p>}
        {found && <div className="soul-glass mt-5 rounded-lg p-3">
          <div className="flex items-center gap-3">
            {found.avatarUrl ? <SecureImage src={found.avatarUrl} alt="" className="h-11 w-11 rounded-lg object-cover" /> : <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-neutral-800 font-bold">{found.name.charAt(0)}</div>}
            <div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{found.name}</p><p className="truncate text-xs text-zinc-400">@{found.username}{found.privateProfile ? ' · Perfil privado' : ''}</p></div>
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => { onClose(); navigate(`/profile/${encodeURIComponent(found.username)}`); }} className="soul-glass flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-white">Ver perfil</button>
            <button type="button" disabled={followStatus !== 'NOT_FOLLOWING' || following || found.banned} onClick={followFound} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black disabled:opacity-50"><UserPlus size={15} />{following ? 'Enviando...' : followStatus === 'PENDING' ? 'Solicitado' : followStatus === 'FOLLOWING' ? 'Seguindo' : 'Seguir'}</button>
          </div>
          <button type="button" disabled={followStatus !== 'FOLLOWING' || following || found.banned || friendStatus !== 'NONE'} onClick={inviteFound} className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg soul-glass px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><UserPlus size={15} />{friendStatus === 'FRIENDS' ? 'Já são Amigos Reais' : friendStatus === 'SENT' ? 'Convite enviado' : friendStatus === 'RECEIVED' ? 'Convite recebido' : 'Tornar amigos reais'}</button>
        </div>}
        {!showQr && requests.length > 0 && <div className="mt-5 space-y-2 border-t border-white/10 pt-4"><p className="text-xs font-semibold text-white">Convites recebidos</p>{requests.map(request => <div key={request.id} className="flex items-center justify-between gap-2 text-sm"><span className="truncate text-zinc-300">{request.name} · @{request.username}</span><button type="button" onClick={async () => { try { await userService.acceptRealFriendRequest(request.id); setRequests(items => items.filter(item => item.id !== request.id)); setFriends(await userService.getRealFriends()); onFriendsChanged?.(); } catch (cause) { setError(getHttpErrorMessage(cause)); } }} className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black">Aceitar</button></div>)}</div>}
      </div>
      {scannerOpen && <QrScanner onUsername={resolveUsername} onClose={() => setScannerOpen(false)} />}
    </div>
  );
}
