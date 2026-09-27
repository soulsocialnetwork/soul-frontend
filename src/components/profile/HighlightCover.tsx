import { SecureImage, SecureVideo } from '../ui/SecureMedia';
import { Plus } from 'lucide-react';

export function HighlightCover({ src, label, isNew = false }: { src?: string; label: string; isNew?: boolean }) {
  return <span className="block h-16 w-16 overflow-hidden rounded-lg border border-white/15 bg-neutral-800 transition-colors group-hover:bg-neutral-700 md:h-20 md:w-20">
    {isNew ? <span className="flex h-full w-full items-center justify-center"><Plus className="h-6 w-6 text-white/70 group-hover:text-white md:h-8 md:w-8" /></span>
      : src && /[.](mp4|webm)(?:[?#]|$)/i.test(src)
        ? <SecureVideo src={`${src}#t=0.001`} className="h-full w-full object-cover pointer-events-none" muted playsInline />
        : <SecureImage src={src} alt={label} className="h-full w-full object-cover" />}
  </span>;
}
