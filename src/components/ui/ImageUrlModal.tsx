import { SecureImage } from './SecureMedia';
import { useState } from 'react';
import { X, ImageIcon } from 'lucide-react';

interface ImageUrlModalProps {
  title?: string;
  initialUrl?: string;
  onConfirm: (url: string) => void;
  onClose: () => void;
  circular?: boolean;
}

export function ImageUrlModal({
  title = 'Inserir imagem por URL',
  initialUrl = '',
  onConfirm,
  onClose,
  circular = false,
}: ImageUrlModalProps) {
  const [url, setUrl] = useState(initialUrl);
  const [imgError, setImgError] = useState(false);

  const hasValidUrl = url.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08]">
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <input
            type="url"
            value={url}
            autoFocus
            onChange={(e) => {
              setUrl(e.target.value);
              setImgError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && hasValidUrl) onConfirm(url.trim());
              if (e.key === 'Escape') onClose();
            }}
            placeholder="https://..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
          />

          {hasValidUrl && (
            <div
              className={`overflow-hidden bg-black/30 border border-white/10 ${
                circular ? 'rounded-full w-24 h-24 mx-auto' : 'rounded-2xl w-full'
              }`}
            >
              {imgError ? (
                <div className="w-full h-24 flex flex-col items-center justify-center text-zinc-500 gap-2">
                  <ImageIcon className="w-5 h-5" />
                  <p className="text-xs">URL inválida ou inacessível</p>
                </div>
              ) : (
                <SecureImage
                  src={url}
                  alt="Preview"
                  className={`object-cover ${circular ? 'w-full h-full' : 'w-full max-h-40'}`}
                  onError={() => setImgError(true)}
                  onLoad={() => setImgError(false)}
                />
              )}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-sm font-semibold text-zinc-400 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-all"
          >
            Cancelar
          </button>
          <button
            disabled={!hasValidUrl || imgError}
            onClick={() => onConfirm(url.trim())}
            className="flex-1 py-3 text-sm font-semibold text-black bg-white rounded-xl hover:bg-zinc-100 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
