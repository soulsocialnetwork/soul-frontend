import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import * as QRCode from 'qrcode';
import { Camera, Link, UserPlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SecureImage } from '../ui/SecureMedia';
import { QrScanner } from './QrScanner';
import { userService, type UserProfile } from '../../services/userService';
import { getHttpErrorMessage } from '../../services/api';
import type { FollowRelationshipResponse } from '../../services/api/types';

type RealFriendsModalProps = { username: string; onClose: () => void };
type FollowStatus = FollowRelationshipResponse['status'];

export function RealFriendsModal({ username, onClose }: RealFriendsModalProps) {
  const navigate = useNavigate();
  const profileUrl = `${window.location.origin}/profile/${encodeURIComponent(username)}`;
  const [qrImage, setQrImage] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [found, setFound] = useState<UserProfile | null>(null);
  const [followStatus, setFollowStatus] = useState<FollowStatus>('NOT_FOLLOWING');
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

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

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setError('');
    } catch { setError('Não foi possível copiar o link.'); }
  };

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
      const [profile, relationship] = await Promise.all([
        userService.getByUsername(scannedUsername),
        userService.getFollowStatus(scannedUsername),
      ]);
      if (!profile) { setError('Usuário não encontrado.'); return; }
      setFound(profile);
      setFollowStatus(relationship.status);
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
      catch { /* The follow succeeded; keep the non-repeatable local state. */ }
    } catch (cause) {
      // Another tab may have already created the relationship.
      try {
        const relationship = await userService.getFollowStatus(found.username);
        setFollowStatus(relationship.status);
        if (relationship.status === 'NOT_FOLLOWING') setError(getHttpErrorMessage(cause));
      } catch { setError(getHttpErrorMessage(cause)); }
    } finally { setFollowing(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md" onClick={onClose} role="presentation">
      <div className="w-full max-w-sm rounded-lg border border-white/10 bg-neutral-900 p-5 shadow-2xl" role="dialog" aria-modal="true" aria-label="Amigos Reais" onClick={event => event.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-3">
          <div><h2 className="text-xl font-bold text-white">Amigos Reais</h2><p className="mt-1 text-xs text-zinc-400">Compartilhe seu perfil ou escaneie o QR de outra pessoa.</p></div>
          <button type="button" autoFocus onClick={onClose} aria-label="Fechar Amigos Reais" className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white"><X size={19} /></button>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="rounded-lg bg-white p-4">
            {qrImage ? <img src={qrImage} alt={`QR do perfil @${username}`} width={200} height={200} className="block" />
              : <div className="flex h-[200px] w-[200px] items-center justify-center text-center text-sm text-black/70">QR indisponível</div>}
          </div>
          <p className="text-sm font-semibold text-white">@{username}</p>
          <p className="text-center text-xs text-zinc-400">O QR contém apenas o link público do perfil. Contas privadas exigem solicitação para seguir.</p>
        </div>

        <div className="mt-5 flex gap-2">
          <button type="button" onClick={copyLink} className="soul-glass flex h-11 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white"><Link size={16} />{copied ? 'Copiado' : 'Copiar link'}</button>
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
        </div>}
      </div>
      {scannerOpen && <QrScanner onUsername={resolveUsername} onClose={() => setScannerOpen(false)} />}
    </div>
  );
}
