import { cn } from '../../utils/cn';

const TAB_KEYS = ['friends', 'articles', 'doGood'] as const;
export type FeedTab = typeof TAB_KEYS[number];

interface FeedTabsProps {
  active: FeedTab;
  onChange: (tab: FeedTab) => void;
}

const LABELS: Record<FeedTab, string> = {
  friends: 'Amigos',
  articles: 'Artigos',
  doGood: 'Fazer o bem',
};

export default function FeedTabs({ active, onChange }: FeedTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar" role="tablist">
      {TAB_KEYS.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={active === tab}
          onClick={() => onChange(tab)}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all duration-300',
            active === tab
              ? 'bg-white/[0.08] border-white/20 text-white shadow-sm'
              : 'bg-transparent border-white/5 text-textSecondary hover:bg-white/[0.04] hover:text-textPrimary'
          )}
        >
          {LABELS[tab]}
        </button>
      ))}
    </div>
  );
}
