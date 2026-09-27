import type { ReactNode } from 'react';

const metricClass = 'flex min-h-10 flex-col items-center justify-center px-2 py-1 text-white transition-opacity md:items-start';

export function ProfileMetric({ value, label, onClick }: { value: number; label: string; onClick?: () => void }) {
  const content: ReactNode = <>
    <span className="text-base font-bold leading-none tabular-nums">{value}</span>
    <span className="mt-1 whitespace-nowrap text-[12px] font-semibold leading-none text-white/80">{label}</span>
  </>;

  return onClick ? (
    <button type="button" onClick={onClick} className={`${metricClass} hover:opacity-70 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50`}>
      {content}
    </button>
  ) : <div className={metricClass}>{content}</div>;
}
