import { useState, useEffect } from 'react';
import { BottomNav } from '../../components/layout/BottomNav';
import { Sidebar } from '../../components/layout/Sidebar';
import { SoultList } from '../../components/soults/SoultList';
import { soultService, type Soult } from '../../services/soultService';
import { useTranslation } from '../../i18n';

export default function SoulsPage() {
  const { t } = useTranslation('soults');
  const [soults, setSoults] = useState<Soult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    soultService.getSoults()
      .then(setSoults)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="h-[100dvh] bg-background flex flex-col lg:flex-row relative overflow-hidden">
      <Sidebar />

      {/* Container Principal centralizado */}
      <div className="flex-1 flex flex-col items-center justify-center min-w-0 relative">
        
        {/* Título (escondido no desktop, mostrado no topo em mobile) */}
        <div className="absolute top-6 left-4 z-50 lg:hidden max-w-[400px] w-full mx-auto pointer-events-none">
          <h1 className="text-2xl font-bold text-white drop-shadow-md">{t('title')}</h1>
        </div>

        {/* Emissão do Layout como de "Celular" no Desktop */}
        <main className="w-full h-full lg:w-[400px] lg:h-[calc(100dvh-3rem)] lg:max-h-[850px] lg:rounded-xl lg:border lg:border-white/10 lg:shadow-2xl overflow-hidden relative bg-black">
          <SoultList soults={soults} loading={loading} />
        </main>

      </div>

      <BottomNav />
    </div>
  );
}