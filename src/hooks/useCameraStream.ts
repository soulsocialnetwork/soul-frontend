import { useCallback, useEffect, useRef } from 'react';

// controla o ciclo de vida da câmera e encerra as faixas ao sair do fluxo
export function useCameraStream() {
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(false);
  const generationRef = useRef(0);

  const stop = useCallback(() => {
    generationRef.current += 1;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async (constraints: MediaStreamConstraints) => {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      throw new Error('A câmera exige HTTPS ou localhost e um navegador compatível.');
    }
    stop();
    const generation = generationRef.current;
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        throw new Error('Permissão de câmera ou microfone negada. Libere o acesso no navegador e tente novamente.');
      }
      if (error instanceof DOMException && error.name === 'NotFoundError') {
        throw new Error('Nenhuma câmera disponível foi encontrada.');
      }
      throw new Error('Não foi possível iniciar a câmera. Verifique se outro aplicativo está usando o dispositivo.');
    }
    if (!mountedRef.current || generation !== generationRef.current) {
      stream.getTracks().forEach(track => track.stop());
      throw new Error('Câmera fechada.');
    }
    streamRef.current = stream;
    return stream;
  }, [stop]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; stop(); };
  }, [stop]);

  return { start, stop, streamRef };
}
