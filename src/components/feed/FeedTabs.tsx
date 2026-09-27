import { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';
import { Heart, ChevronDown, HandHeart, BookOpen, GraduationCap } from 'lucide-react';
import { SOUL_CATEGORIES, type CategoryId } from '../../constants/categories';
import { filterTriggerClass, filterOptionClass, filterClearClass } from './filterStyles';
import { ORGANIZATION_FILTERS } from '../../data/organizationFilters';

const TAB_KEYS = ['house', 'friends', 'education', 'bem'] as const;
export type FeedTab = typeof TAB_KEYS[number];

const isBR =
  typeof navigator !== 'undefined' &&
  navigator.language.startsWith('pt');

export { type CategoryId } from '../../constants/categories';
export const CATEGORIES = SOUL_CATEGORIES;

interface FeedTabsProps {
  active: FeedTab;
  onChange: (tab: FeedTab) => void;
  activeCategories: CategoryId[];
  onToggleCategory: (id: CategoryId) => void;
  onClearCategories: () => void;
  organizationFilter: number;
  onOrganizationFilterChange: (filter: number) => void;
}

const LABELS: Record<FeedTab, string> = {
  house: isBR ? 'Capítulos' : 'Chapters',
  friends: isBR ? 'Amigos' : 'Friends',
  education: isBR ? 'Educação' : 'Education',
  bem: isBR ? 'Fazer o Bem' : 'Doing Good',
};
const TAB_ICONS = { house: BookOpen, friends: Heart, education: GraduationCap, bem: HandHeart };

export default function FeedTabs({
  active,
  onChange,
  activeCategories,
  onToggleCategory,
  onClearCategories,
  organizationFilter,
  onOrganizationFilterChange,
}: FeedTabsProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => setIsCategoryOpen(false), [active]);

  const selectedCategoriesCount = active === 'bem' ? Number(organizationFilter !== 0) : activeCategories.length;
  const hasActiveCategories = selectedCategoriesCount > 0;

  return (
    <div className="relative w-full py-1" ref={dropdownRef}>
      <div
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth max-w-full pb-2 select-none md:grid md:grid-cols-5 md:overflow-visible"
        style={{ WebkitOverflowScrolling: 'touch' }}
        role="tablist"
      >
        {TAB_KEYS.map((tab) => {
          const Icon = TAB_ICONS[tab];
          return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active === tab}
            onClick={() => onChange(tab)}
            className={cn(
              'home-filter-pill flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap border shrink-0 transition-all duration-300 cursor-pointer md:w-full',
              active === tab
                ? 'bg-white/[0.08] border-white/20 text-white shadow-sm'
                : 'bg-transparent border-white/5 text-textSecondary hover:bg-white/[0.04] hover:text-textPrimary'
            )}
          >
            <Icon aria-hidden="true" className={cn('h-4 w-4 shrink-0', active === tab ? 'text-white' : 'text-zinc-400')} strokeWidth={1.8} />

            {LABELS[tab]}
          </button>
        ); })}

        <button
          type="button"
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          aria-expanded={isCategoryOpen}
          aria-controls="feed-filter-menu"
          className={filterTriggerClass(hasActiveCategories)}
        >
          <span className="min-w-0 truncate">{active === 'bem' ? 'Tipos de ONG' : isBR ? 'Categorias' : 'Categories'}</span>

          {hasActiveCategories && (
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white text-black text-[10px] font-bold">
              {selectedCategoriesCount}
            </span>
          )}

          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-zinc-400 transition-transform',
              isCategoryOpen && 'rotate-180'
            )}
            aria-hidden="true"
          />
        </button>

        {hasActiveCategories && (
          <button
            type="button"
            onClick={() => active === 'bem' ? onOrganizationFilterChange(0) : onClearCategories()}
            className={filterClearClass}
          >
            {isBR ? 'Limpar' : 'Clear'}
          </button>
        )}
      </div>

      {isCategoryOpen && (
        <div id="feed-filter-menu" className="absolute top-full mt-1 left-0 sm:left-auto sm:right-0 w-64 max-h-[60vh] overflow-y-auto bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-2 z-[99999] grid grid-cols-1 gap-1 animate-fade-up">
          <div className="px-3 py-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            {active === 'bem' ? 'Filtrar por tipo de ONG' : isBR ? 'Filtrar por Categorias' : 'Filter by Categories'}
          </div>

          {active === 'bem' ? ORGANIZATION_FILTERS.map((item, index) => (
            <button key={item.label} type="button" aria-pressed={organizationFilter === index}
              onClick={() => { onOrganizationFilterChange(index); setIsCategoryOpen(false); }}
              className={filterOptionClass(organizationFilter === index)}>
              <span>{item.label}</span>
              {organizationFilter === index && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </button>
          )) : CATEGORIES.map(({ id, label, icon: Icon }) => {
            const isActive = activeCategories.includes(id);

            return (
              <button
                key={id}
                type="button"
                onClick={() => onToggleCategory(id)}
                className={filterOptionClass(isActive)}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </div>

                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
