import { cn } from '../../utils/cn';

export const filterTriggerClass = (active: boolean) => cn(
  'home-filter-pill flex min-w-0 items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap border shrink-0 transition-colors cursor-pointer md:w-full',
  active
    ? 'bg-white/[0.08] border-white/20 text-white'
    : 'bg-transparent border-white/5 text-textSecondary hover:bg-white/[0.04] hover:text-textPrimary'
);

export const filterOptionClass = (active: boolean) => cn(
  'w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors cursor-pointer',
  active ? 'bg-white/10 text-white font-semibold' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
);

export const filterClearClass = 'home-filter-pill px-3.5 py-2 text-sm font-medium border border-white/5 text-textSecondary/60 hover:text-textSecondary hover:bg-white/[0.04] whitespace-nowrap shrink-0 transition-colors cursor-pointer';
