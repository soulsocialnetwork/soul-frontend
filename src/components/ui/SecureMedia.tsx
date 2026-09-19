import { forwardRef, useEffect, useState, type ImgHTMLAttributes, type VideoHTMLAttributes } from 'react';
import { api } from '../../services/api';

function useMedia(src?: string) {
  const [resolved, setResolved] = useState<{ source?: string; url: string }>({ url: '' });
  let protectedUrl: string | null = null;
  if (src) {
    try {
      const parsed = new URL(src, window.location.origin);
      const backend = new URL(import.meta.env.VITE_API_URL || '/', window.location.origin);
      if ([window.location.origin, backend.origin].includes(parsed.origin) && /^(\/api)?\/media\/files\//.test(parsed.pathname)) {
        protectedUrl = parsed.pathname.replace(/^\/api/, '');
      }
    } catch { /* Local object/data URLs and public assets need no API request. */ }
  }
  useEffect(() => {
    if (!protectedUrl) return;
    const controller = new AbortController();
    let objectUrl = '';
    api.get<Blob>(protectedUrl, { responseType: 'blob', signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(data);
        setResolved({ source: src, url: objectUrl });
      })
      .catch(() => { if (!controller.signal.aborted) setResolved({ source: src, url: '' }); });
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [src, protectedUrl]);
  return protectedUrl ? (resolved.source === src ? resolved.url || undefined : undefined) : src;
}
export const SecureImage = forwardRef<HTMLImageElement, ImgHTMLAttributes<HTMLImageElement>>(({ src, ...props }, ref) => {
  const url = useMedia(src);
  return <img {...props} ref={ref} src={url} />;
});
export const SecureVideo = forwardRef<HTMLVideoElement, VideoHTMLAttributes<HTMLVideoElement>>(({ src, poster, ...props }, ref) => {
  const url = useMedia(src);
  const posterUrl = useMedia(poster);
  return <video {...props} ref={ref} src={url} poster={posterUrl} />;
});
