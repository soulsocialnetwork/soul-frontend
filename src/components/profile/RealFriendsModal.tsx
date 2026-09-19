import { SecureImage } from '../ui/SecureMedia';
import { X, Users, Link } from 'lucide-react';

interface RealFriendsModalProps {
  username: string;
  onClose: () => void;
}

// Lightweight QR code generator (no external library)
// Uses a minimal QR encoding for small URLs via a free external render URL
function QRCodeDisplay({ value }: { value: string }) {
  // Use a QR rendering service that doesn't require install
  const encoded = encodeURIComponent(value);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encoded}&size=200x200&bgcolor=ffffff&color=000000&margin=0`;

  return (
    <div className="p-4 rounded-2xl bg-white">
      <SecureImage
        src={qrUrl}
        alt="QR Code"
        width={200}
        height={200}
        className="rounded-xl block"
        onError={(e) => {
          // fallback: show a canvas-based placeholder
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
}

export function RealFriendsModal({ username, onClose }: RealFriendsModalProps) {
  const profileUrl = `${window.location.origin}/profile/${username}`;

  function copyLink() {
    navigator.clipboard.writeText(profileUrl).catch(() => {});
  }

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm flex flex-col gap-6 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative text-center">
          <h2 className="text-xl font-bold text-white">Amigos Reais</h2>
          <p className="text-xs text-zinc-500 mt-1">
            Mostre este QR Code para adicionar amigos de verdade
          </p>
          <button
            onClick={onClose}
            className="absolute -top-1 -right-2 p-1.5 rounded-full text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-4">
          <QRCodeDisplay value={profileUrl} />

          <div className="text-center">
            <p className="text-sm font-semibold text-white">@{username}</p>
            <p className="text-xs text-zinc-500 mt-0.5">soul.app</p>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
          <Users className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
          <p className="text-xs text-zinc-400 leading-relaxed">
            Quando alguém escanear este QR Code, vocês dois serão adicionados como{' '}
            <span className="text-white font-semibold">Amigos Reais</span> — uma conexão
            especial além do seguir normal.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={copyLink}
            className="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl bg-white/[0.06] border border-white/10 text-white text-sm font-semibold hover:bg-white/10 active:scale-95 transition-all"
          >
            <Link className="w-4 h-4" />
            Copiar link
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-2xl bg-white text-black text-sm font-semibold hover:bg-white/90 active:scale-95 transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
