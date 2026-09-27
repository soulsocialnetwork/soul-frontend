import { useRef, useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  src: string;
  onCancel: () => void;
  onConfirm: (file: File, preview: string) => void;
}

const SIZE = 240;

export function AvatarCropper({ src, onCancel, onConfirm }: Props) {
  const imageRef = useRef<HTMLImageElement>(null);
  const pointerRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [error, setError] = useState('');
  const image = imageRef.current;
  const baseScale = image?.naturalWidth && image?.naturalHeight
    ? Math.max(SIZE / image.naturalWidth, SIZE / image.naturalHeight)
    : 1;
  const width = (image?.naturalWidth || SIZE) * baseScale * zoom;
  const height = (image?.naturalHeight || SIZE) * baseScale * zoom;
  const clamp = (x: number, y: number, currentZoom = zoom) => {
    const w = (image?.naturalWidth || SIZE) * baseScale * currentZoom;
    const h = (image?.naturalHeight || SIZE) * baseScale * currentZoom;
    return {
      x: Math.max((SIZE - w) / 2, Math.min((w - SIZE) / 2, x)),
      y: Math.max((SIZE - h) / 2, Math.min((h - SIZE) / 2, y)),
    };
  };

  const confirm = () => {
    if (!image?.complete || !image.naturalWidth) {
      setError('Aguarde a imagem carregar.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const context = canvas.getContext('2d');
    if (!context) return;
    const ratio = 512 / SIZE;
    context.drawImage(image, (SIZE / 2 - width / 2 + offset.x) * ratio,
      (SIZE / 2 - height / 2 + offset.y) * ratio, width * ratio, height * ratio);
    canvas.toBlob((blob) => {
      if (!blob) { setError('Não foi possível recortar a imagem.'); return; }
      onConfirm(new File([blob], 'avatar.png', { type: 'image/png' }), canvas.toDataURL('image/png'));
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md" onClick={onCancel}>
      <div className="w-full max-w-sm space-y-5 rounded-2xl border border-white/15 bg-[#1d1d1d] p-5" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between"><h3 className="text-lg font-bold">Ajustar foto de perfil</h3><button type="button" aria-label="Fechar" onClick={onCancel}><X size={20} /></button></div>
        <div className="mx-auto relative h-[240px] w-[240px] touch-none overflow-hidden rounded-[48px] bg-neutral-900 cursor-grab active:cursor-grabbing"
          onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); pointerRef.current = { x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y }; }}
          onPointerMove={(event) => { if (pointerRef.current) setOffset(clamp(pointerRef.current.offsetX + event.clientX - pointerRef.current.x, pointerRef.current.offsetY + event.clientY - pointerRef.current.y)); }}
          onPointerUp={() => { pointerRef.current = null; }} onPointerCancel={() => { pointerRef.current = null; }}>
          <img ref={imageRef} src={src} alt="Prévia do recorte" draggable={false} onLoad={() => setOffset({ x: 0, y: 0 })}
            style={{ width, height, left: `calc(50% - ${width / 2}px + ${offset.x}px)`, top: `calc(50% - ${height / 2}px + ${offset.y}px)` }}
            className="absolute max-w-none select-none" />
        </div>
        <p className="text-center text-xs text-zinc-400">Arraste para enquadrar. A foto será salva em formato quadrado.</p>
        <label className="block text-sm text-zinc-300">Zoom
          <input className="mt-2 w-full accent-white" type="range" min="1" max="3" step="0.01" value={zoom}
            onChange={(event) => { const value = Number(event.target.value); setZoom(value); setOffset(clamp(offset.x, offset.y, value)); }} />
        </label>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <div className="flex gap-2"><button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-white/15 py-2.5">Cancelar</button><button type="button" onClick={confirm} className="flex-1 rounded-lg bg-white py-2.5 font-semibold text-black">Usar foto</button></div>
      </div>
    </div>
  );
}
