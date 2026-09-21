import { useEffect, useRef, useState } from 'react';
import type { IScannerControls } from '@zxing/browser';
import { X } from 'lucide-react';
import { useCameraStream } from '../../hooks/useCameraStream';
import { parseProfileQr } from '../../utils/profileQr';

type QrScannerProps = {
  onUsername: (username: string) => void;
  onClose: () => void;
};

// lê o qr público de um perfil e entrega o usuário identificado ao fluxo de conexão
export function QrScanner({ onUsername, onClose }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const callbackRef = useRef(onUsername);
  const { start, stop } = useCameraStream();
  const [error, setError] = useState('');
  callbackRef.current = onUsername;

  useEffect(() => {
    let closed = false;
    const scan = async () => {
      try {
        const stream = await start({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        if (closed || !videoRef.current) { stream.getTracks().forEach(track => track.stop()); return; }
        const { BrowserQRCodeReader } = await import('@zxing/browser');
        if (closed || !videoRef.current) { stream.getTracks().forEach(track => track.stop()); return; }
        controlsRef.current = await new BrowserQRCodeReader().decodeFromStream(
          stream, videoRef.current, result => {
            if (closed || !result) return;
            const username = parseProfileQr(result.getText(), window.location.origin);
            if (!username) { setError('QR inválido: escaneie um perfil do Soul neste endereço.'); return; }
            closed = true;
            controlsRef.current?.stop();
            stop();
            callbackRef.current(username);
          }
        );
        if (closed) controlsRef.current.stop();
      } catch (cause) {
        if (!closed) {
          setError(cause instanceof Error ? cause.message : 'Não foi possível ler o QR Code.');
          stop();
        }
      }
    };
    void scan();
    return () => { closed = true; controlsRef.current?.stop(); stop(); };
  }, [start, stop]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/95 p-4" role="dialog" aria-modal="true" aria-label="Escanear QR de perfil" onClick={event => event.stopPropagation()}>
      <div className="w-full max-w-sm rounded-lg border border-white/10 bg-neutral-900 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-white">Escanear QR do Soul</h3>
          <button type="button" autoFocus onClick={onClose} aria-label="Fechar scanner" className="rounded-lg p-2 text-white/70 hover:bg-white/10"><X size={20} /></button>
        </div>
        <video ref={videoRef} muted playsInline autoPlay className="aspect-square w-full rounded-lg bg-black object-cover" />
        <p className="mt-3 text-center text-xs text-white/60">Aponte a câmera para o QR de um perfil do Soul.</p>
        {error && <p role="alert" className="mt-3 text-center text-sm text-red-300">{error}</p>}
      </div>
    </div>
  );
}
