import { SoultCard } from './SoultCard';
import type { Soult } from '../../services/soultService';
import { useTranslation } from '../../i18n';
import { ChevronDown, ChevronUp, Film } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface SoultListProps {
  soults: Soult[];
  loading?: boolean;
  initialId?: string | null;
}

function SoultSkeleton() {
  return (
    <div className="w-full h-full bg-neutral-900 overflow-hidden snap-start snap-always shrink-0 flex flex-col justify-between p-6 animate-pulse">
      <div className="flex justify-end pt-2">
        <div className="h-6 w-16 bg-white/10 rounded-full" />
      </div>

      <div className="flex items-end justify-between pb-16 lg:pb-4">
        <div className="space-y-3 w-3/4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg w-9 h-9 bg-white/10" />
            <div className="h-4 w-32 bg-white/10 rounded-lg" />
          </div>

          <div className="h-4 w-48 bg-white/10 rounded-lg" />

          <div className="h-3 w-full bg-white/10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SoultList({ soults, loading = false, initialId }: SoultListProps) {
  const { t } = useTranslation('soults');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    if (loading || !initialId) return;
    const index = soults.findIndex(soult => soult.id === initialId);
    if (index < 0) return;
    const frame = requestAnimationFrame(() => {
      const container = scrollRef.current;
      if (!container) return;
      container.scrollTop = index * container.clientHeight;
      setActiveIndex(index);
    });
    return () => cancelAnimationFrame(frame);
  }, [loading, initialId, soults]);
  const move = (direction: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const next = Math.max(0, Math.min(soults.length - 1, activeIndex + direction));
    container.scrollTo({
      top: next * container.clientHeight,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  };

  if (loading) {
    return (
      <div className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
        {Array.from({ length: 2 }).map((_, i) => (
          <SoultSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (soults.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center px-6 text-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl soul-glass flex items-center justify-center text-white/35 mb-4">
            <Film className="w-5 h-5" strokeWidth={1.7} />
          </div>

          <p className="text-sm font-medium text-white/90">
            {t('empty')}
          </p>

          <p className="text-xs mt-1.5 text-white/35 max-w-[260px] leading-relaxed">
            {t('emptyHint')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
    <div ref={scrollRef} onScroll={event => {
      const container = event.currentTarget;
      if (container.clientHeight) setActiveIndex(Math.round(container.scrollTop / container.clientHeight));
    }} className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
      {soults.map((soult, index) => (
        <div
          key={soult.id}
          className="w-full h-full snap-start snap-always shrink-0 relative"
        >
          <SoultCard soult={soult} index={index} isActive={index === activeIndex} />
        </div>
      ))}
    </div>
    <div className="hidden lg:flex absolute top-1/2 -right-20 -translate-y-1/2 flex-col gap-3">
      <button aria-label="Soult anterior" disabled={activeIndex === 0} onClick={() => move(-1)} className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/10 active:scale-90 transition-all disabled:opacity-25 disabled:cursor-not-allowed"><ChevronUp size={22} /></button>
      <button aria-label="Próximo Soult" disabled={activeIndex >= soults.length - 1} onClick={() => move(1)} className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/10 active:scale-90 transition-all disabled:opacity-25 disabled:cursor-not-allowed"><ChevronDown size={22} /></button>
    </div>
    </div>
  );
}
