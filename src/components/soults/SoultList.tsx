import { SoultCard } from './SoultCard';
import type { Soult } from '../../services/soultService';
import { useTranslation } from '../../i18n';
import { Film } from 'lucide-react';

interface SoultListProps {
  soults: Soult[];
  loading?: boolean;
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
            <div className="w-9 h-9 rounded-full bg-white/10" />
            <div className="h-4 w-32 bg-white/10 rounded-lg" />
          </div>

          <div className="h-4 w-48 bg-white/10 rounded-lg" />

          <div className="h-3 w-full bg-white/10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SoultList({ soults, loading = false }: SoultListProps) {
  const { t } = useTranslation('soults');

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
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white/35 mb-4">
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
    <div className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth">
      {soults.map((soult, index) => (
        <div
          key={soult.id}
          className="w-full h-full snap-start snap-always shrink-0 relative"
        >
          <SoultCard soult={soult} index={index} />
        </div>
      ))}
    </div>
  );
}