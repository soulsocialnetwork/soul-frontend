import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Heart, ChevronDown } from 'lucide-react';

const TAB_KEYS = ['house', 'friends', 'education', 'bem'] as const;
export type FeedTab = typeof TAB_KEYS[number];

export const CATEGORIES = [
  { id: 'natureza',   label: '🌿 Natureza' },
  { id: 'arte',       label: '🎨 Arte' },
  { id: 'leitura',    label: '📚 Leitura' },
  { id: 'culinaria',  label: '🍳 Culinária' },
  { id: 'movimento',  label: '🏃 Movimento' },
  { id: 'musica',     label: '🎵 Música' },
  { id: 'reflexao',   label: '🧘 Reflexão' },
  { id: 'viagem',     label: '✈️ Viagem' },
  { id: 'tecnologia', label: '💻 Tecnologia' },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];

interface FeedTabsProps {
  active: FeedTab;
  onChange: (tab: FeedTab) => void;
  activeCategories: CategoryId[];
  onToggleCategory: (id: CategoryId) => void;
  onClearCategories: () => void;
}

const isBR = typeof navigator !== 'undefined' && navigator.language.startsWith('pt');

const LABELS: Record<FeedTab, string> = {
  house: isBR ? 'Capítulos' : 'Chapters',
  friends: isBR ? 'Amigos' : 'Friends',
  education: isBR ? 'Educação' : 'Education',
  bem: isBR ? '🤝 Fazer o Bem' : '🤝 Doing Good',
};

export default function FeedTabs({
  active,
  onChange,
  activeCategories,
  onToggleCategory,
  onClearCategories,
}: FeedTabsProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCategoriesCount = activeCategories.length;
  const hasActiveCategories = selectedCategoriesCount > 0;

  return (
    <div className="w-full relative py-1" ref={dropdownRef}>
      {}
      <div 
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth max-w-full pb-2 select-none" 
        style={{ WebkitOverflowScrolling: 'touch' }}
        role="tablist"
      >
        
        {}
        {TAB_KEYS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active === tab}
            onClick={() => onChange(tab)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border shrink-0 transition-all duration-300 cursor-pointer',
              active === tab
                ? 'bg-white/[0.08] border-white/20 text-white shadow-sm'
                : 'bg-transparent border-white/5 text-textSecondary hover:bg-white/[0.04] hover:text-textPrimary'
            )}
          >
            {tab === 'friends' && (
              <Heart 
                className={cn(
                  "w-3.5 h-3.5",
                  active === 'friends' ? "text-white fill-white/20" : "text-textSecondary"
                )} 
              />
            )}
            {LABELS[tab]}
          </button>
        ))}

        {}
        <button
          type="button"
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border shrink-0 transition-all duration-300 cursor-pointer',
            selectedCategoriesCount > 0
              ? 'bg-white/[0.08] border-white/20 text-white shadow-sm'
              : 'bg-transparent border-white/5 text-textSecondary hover:bg-white/[0.04] hover:text-textPrimary'
          )}
        >
          <span>Categorias</span>
          {selectedCategoriesCount > 0 && (
            <span className="w-4 h-4 bg-white text-black rounded-full text-[10px] flex items-center justify-center font-bold">
              {selectedCategoriesCount}
            </span>
          )}
          <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', isCategoryOpen && 'rotate-180')} />
        </button>

        {}
        {hasActiveCategories && (
          <button
            type="button"
            onClick={onClearCategories}
            className="px-3.5 py-2 rounded-full text-sm font-medium border border-white/5 text-textSecondary/60 hover:text-textSecondary hover:bg-white/[0.04] whitespace-nowrap shrink-0 transition-all cursor-pointer"
          >
            Limpar
          </button>
        )}
      </div>

      {}
      {isCategoryOpen && (
        <div className="absolute top-full mt-1 left-0 sm:left-auto sm:right-0 w-64 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-2 z-[99999] grid grid-cols-1 gap-1 animate-fade-up">
          <div className="px-3 py-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Filtrar por Categorias
          </div>
          {CATEGORIES.map(({ id, label }) => {
            const isActive = activeCategories.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => onToggleCategory(id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between cursor-pointer',
                  isActive
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                )}
              >
                <span>{label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}