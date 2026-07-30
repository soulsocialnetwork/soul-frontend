import { useTranslation } from '../../i18n';

interface GoalBarProps {
  label: string;
  usedMinutes: number;
  goalMinutes: number;
}

export function GoalBar({ label, usedMinutes, goalMinutes }: GoalBarProps) {
  const { t } = useTranslation('screentime');
  const pct = Math.min(usedMinutes / goalMinutes, 1);
  const isOver = pct >= 1;

  const fmt = (m: number) => m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-textPrimary font-medium">{label}</span>
        <span className={isOver ? 'text-red-400 font-semibold' : 'text-textSecondary'}>
          {fmt(usedMinutes)} <span className="opacity-40">{t('goals.of')}</span> {fmt(goalMinutes)}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-2xl bg-surfaceHighlight overflow-hidden">
        <div
          className="h-full rounded-2xl transition-all duration-700"
          style={{
            width: `${pct * 100}%`,
            background: isOver
              ? 'rgba(248, 113, 113, 0.7)'
              : `linear-gradient(90deg, rgba(52,211,153,0.5) 0%, rgba(52,211,153,0.85) 100%)`,
          }}
        />
      </div>
    </div>
  );
}
