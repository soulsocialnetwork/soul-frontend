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
      {/* Skeleton igual ao seu... omitido para brevidade mas apenas garantindo as classes "w-full h-full" no wrapper principal */}
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
      <div className="w-full h-full flex flex-col items-center justify-center px-4 text-center text-textSecondary animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white/40">
          <Film className="w-8 h-8" />
        </div>
        <p className="text-base font-semibold text-textPrimary">{t('empty')}</p>
        <p className="text-xs mt-1 text-textSecondary max-w-xs">{t('emptyHint')}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth">
      {soults.map((soult, index) => (
        /* Envolvendo o card em um container que exige 100% da altura e ativa o snap perfeitamente */
        <div key={soult.id} className="w-full h-full snap-start snap-always shrink-0 relative">
          <SoultCard soult={soult} index={index} />
        </div>
      ))}
    </div>
  );
}