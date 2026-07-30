import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../i18n';
import { cn } from '../../utils/cn';

const BREAK_OPTIONS = [5, 10, 15, 30] as const;
type BreakMins = typeof BREAK_OPTIONS[number];

export function BreakTimer() {
  const { t } = useTranslation('screentime');
  const [selected, setSelected] = useState<BreakMins>(5);
  const [active, setActive] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [done, setDone] = useState(false);

  const startBreak = useCallback(() => {
    setRemaining(selected * 60);
    setActive(true);
    setDone(false);
  }, [selected]);

  useEffect(() => {
    if (!active || remaining <= 0) {
      if (active && remaining <= 0) { setActive(false); setDone(true); }
      return;
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [active, remaining]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct  = active ? 1 - remaining / (selected * 60) : 0;
  const C     = 2 * Math.PI * 32;

  return (
    <div className="glass-card rounded-3xl p-5 flex flex-col gap-4">

      { }
      {!active && (
        <div className="flex gap-2">
          {BREAK_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => setSelected(m)}
              className={cn(
                'flex-1 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200',
                selected === m
                  ? 'bg-white/12 text-textPrimary border border-white/15'
                  : 'text-textSecondary hover:text-textPrimary hover:bg-white/6'
              )}
            >
              {t(`breakOptions.${m}`)}
            </button>
          ))}
        </div>
      )}

      { }
      {active && (
        <div className="flex items-center gap-5 py-1 animate-fade-in">
          <svg viewBox="0 0 80 80" className="w-14 h-14 -rotate-90 shrink-0">
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
            <circle
              cx="40" cy="40" r="32"
              fill="none"
              stroke="rgba(139,92,246,0.7)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${pct * C} ${C}`}
              style={{ transition: 'stroke-dasharray 1s linear' }}
            />
          </svg>
          <div>
            <p className="text-3xl font-bold text-textPrimary tabular-nums">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </p>
            <p className="text-xs text-textSecondary mt-1">{t('breakActive')}</p>
          </div>
        </div>
      )}

      {done && (
        <p className="text-center text-sm text-emerald-400 font-semibold py-1 animate-fade-in">
          {t('breakDone')} 🎉
        </p>
      )}

      <button
        onClick={active ? () => { setActive(false); setRemaining(0); } : startBreak}
        className={cn(
          'w-full py-3.5 rounded-2xl text-sm font-bold tracking-wide transition-all duration-200 active:scale-[0.97]',
          active
            ? 'glass-pill text-textSecondary hover:text-textPrimary'
            : 'btn-primary-glass'
        )}
      >
        {active ? 'Cancelar pausa' : t('takeBreak')}
      </button>
    </div>
  );
}
