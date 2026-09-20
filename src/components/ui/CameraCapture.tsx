import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Circle, RotateCcw, Square, X } from 'lucide-react';
import { useCameraStream } from '../../hooks/useCameraStream';

type CameraCaptureProps = {
  mode: 'photo' | 'video';
  maxMegabytes?: number;
  onCapture: (file: File) => void;
  onClose: () => void;
};

export function CameraCapture({ mode, maxMegabytes = 50, onCapture, onClose }: CameraCaptureProps) {
  const maxBytes = maxMegabytes * 1024 * 1024;
  const videoRef = useRef<HTMLVideoElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const previewUrlRef = useRef<string | null>(null);
  const closingRef = useRef(false);
  const requestRef = useRef(0);
  const { start, stop } = useCameraStream();
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(null);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');

  const clearPreview = useCallback(() => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setPreview(null);
  }, []);

  const openCamera = useCallback(async () => {
    const request = ++requestRef.current;
    setBusy(true);
    setError('');
    try {
      const stream = await start({ video: { facingMode: { ideal: 'environment' } }, audio: mode === 'video' });
      if (request !== requestRef.current || closingRef.current) { stream.getTracks().forEach(track => track.stop()); return; }
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (cause) {
      if (request === requestRef.current && !closingRef.current) {
        setError(cause instanceof Error ? cause.message : 'Não foi possível abrir a câmera.');
        stop();
      }
    } finally {
      if (request === requestRef.current && !closingRef.current) setBusy(false);
    }
  }, [mode, start, stop]);

  useEffect(() => {
    closingRef.current = false;
    void openCamera();
    return () => {
      closingRef.current = true;
      requestRef.current += 1;
      if (recorderRef.current?.state === 'recording') {
        recorderRef.current.onstop = null;
        recorderRef.current.stop();
      }
      stop();
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    };
  }, [openCamera, stop]);

  const close = () => {
    closingRef.current = true;
    requestRef.current += 1;
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.onstop = null;
      recorderRef.current.stop();
    }
    stop();
    clearPreview();
    onClose();
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video?.videoWidth || !video.videoHeight) { setError('A câmera ainda não está pronta.'); return; }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      if (closingRef.current) return;
      if (!blob) { setError('Não foi possível capturar a foto.'); return; }
      if (blob.size > maxBytes) { setError(`A foto deve ter no máximo ${maxMegabytes} MB.`); return; }
      const file = new File([blob], `soul-foto-${Date.now()}.jpg`, { type: 'image/jpeg' });
      stop();
      const url = URL.createObjectURL(file);
      previewUrlRef.current = url;
      setPreview({ file, url });
    }, 'image/jpeg', 0.9);
  };

  const beginRecording = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (!stream || typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') {
      setError('Este navegador não oferece gravação de vídeo pela câmera.');
      return;
    }
    const mimeType = ['video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4']
      .find(type => MediaRecorder.isTypeSupported(type));
    if (!mimeType) { setError('Este navegador não grava em MP4 ou WebM.'); return; }
    try {
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      recorder.ondataavailable = event => {
        if (event.data.size) chunksRef.current.push(event.data);
        if (chunksRef.current.reduce((size, chunk) => size + chunk.size, 0) > maxBytes && recorder.state === 'recording') recorder.stop();
      };
      recorder.onerror = () => { recorder.onstop = null; setError('A gravação falhou. Tente novamente.'); setRecording(false); stop(); };
      recorder.onstop = () => {
        setRecording(false);
        stop();
        if (closingRef.current) return;
        const type = mimeType.startsWith('video/mp4') ? 'video/mp4' : 'video/webm';
        const blob = new Blob(chunksRef.current, { type });
        if (!blob.size || blob.size > maxBytes) {
          setError(`O vídeo deve ter no máximo ${maxMegabytes} MB. Grave um trecho mais curto.`);
          return;
        }
        const file = new File([blob], `soul-video-${Date.now()}.${type === 'video/mp4' ? 'mp4' : 'webm'}`, { type });
        const url = URL.createObjectURL(file);
        previewUrlRef.current = url;
        setPreview({ file, url });
      };
      recorder.start(1000);
      setRecording(true);
      setError('');
    } catch {
      setError('Não foi possível iniciar a gravação.');
    }
  };

  const finishRecording = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  };

  const retry = () => { clearPreview(); void openCamera(); };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label={mode === 'photo' ? 'Tirar foto' : 'Gravar vídeo'} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); close(); } }}>
      <div className="w-full max-w-lg rounded-lg border border-white/10 bg-neutral-900 p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">{mode === 'photo' ? 'Tirar foto' : 'Gravar vídeo'}</h2>
          <button type="button" autoFocus aria-label="Fechar câmera" onClick={close} className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"><X size={20} /></button>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-black">
          <video ref={videoRef} autoPlay muted playsInline className={`h-full w-full object-cover ${preview ? 'hidden' : ''}`} />
          {preview && (mode === 'photo'
            ? <img src={preview.url} alt="Prévia da foto capturada" className="h-full w-full object-contain" />
            : <video src={preview.url} controls playsInline className="h-full w-full object-contain" />)}
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={close} className="rounded-lg px-4 py-2 text-sm text-white/70 hover:bg-white/10">Cancelar</button>
          {preview ? <>
            <button type="button" onClick={retry} className="soul-glass rounded-lg flex items-center gap-2 px-4 py-2 text-sm text-white"><RotateCcw size={16} /> Refazer</button>
            <button type="button" onClick={() => onCapture(preview.file)} className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black">Usar mídia</button>
          </> : error
            ? <button type="button" onClick={retry} className="soul-glass rounded-lg flex items-center gap-2 px-4 py-2 text-sm text-white"><RotateCcw size={16} />Tentar novamente</button>
            : mode === 'photo'
            ? <button type="button" disabled={busy || !!error} onClick={capturePhoto} className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-40"><Camera size={16} className="mr-2 inline" />Tirar foto</button>
            : recording
              ? <button type="button" onClick={finishRecording} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white"><Square size={16} className="mr-2 inline" />Parar</button>
              : <button type="button" disabled={busy || !!error} onClick={beginRecording} className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-40"><Circle size={16} className="mr-2 inline" />Gravar</button>}
        </div>
      </div>
    </div>
  );
}
