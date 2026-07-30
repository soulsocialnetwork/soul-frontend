import { useState, useEffect, useCallback } from 'react';
import { Play, Square, Moon } from 'lucide-react';

export function FocusMode() {
  const [selectedMins, setSelectedMins] = useState(30);
  const [activity, setActivity]         = useState('');
  const [active, setActive]             = useState(false);
  const [remaining, setRemaining]       = useState(0);
  const [done, setDone]                 = useState(false);

  const start = useCallback(() => {
    setRemaining(selectedMins * 60);
    setActive(true);
    setDone(false);
  }, [selectedMins]);

  useEffect(() => {
    if (!active || remaining <= 0) {
      if (active && remaining <= 0) { setActive(false); setDone(true); }
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [active, remaining]);

  const hrs  = Math.floor(remaining / 3600);
  const mins = Math.floor((remaining % 3600) / 60);
  const secs = remaining % 60;
  const pct  = active ? 1 - remaining / (selectedMins * 60) : 0;
  const C    = 2 * Math.PI * 38;

  return (
    <div className="glass-card rounded-3xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Moon className="w-4 h-4 text-textSecondary" />
        <p className="text-xs text-textSecondary font-semibold uppercase tracking-widest">Modo Foco</p>
      </div>

      {!active ? (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-textSecondary px-1">Tempo (em minutos)</label>
            <input
              type="number"
              min={1}
              value={selectedMins || ''}
              onChange={(e) => setSelectedMins(parseInt(e.target.value) || 0)}
              className="glass-input w-full h-12 rounded-2xl px-4 text-lg font-semibold text-textPrimary outline-none text-center"
              placeholder="Ex: 45"
            />
          </div>
          {/* Activity input */}
          <div>
            <input
              type="text"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="O que você vai fazer? (ex: estudar, ler...)"
              className="glass-input w-full h-12 rounded-2xl px-4 text-sm text-textPrimary placeholder:text-textSecondary/50 outline-none"
            />
          </div>

          {done && (
            <p className="text-center text-sm text-emerald-400 font-semibold animate-fade-in">
              Foco concluído! 🎉
            </p>
          )}

          <button
            onClick={start}
            className="btn-primary-glass w-full py-3.5 rounded-2xl text-sm font-bold tracking-wide active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Iniciar foco
          </button>
        </>
      ) : (
        /* Active state */
        <div className="flex flex-col items-center gap-4 py-2 animate-fade-in">
          {activity && (
            <p className="text-xs text-textSecondary">
              Focando em: <span className="text-textPrimary font-semibold">{activity}</span>
            </p>
          )}

          {/* Ring */}
          <div className="relative">
            <svg viewBox="0 0 96 96" className="w-28 h-28 -rotate-90">
              <circle cx="48" cy="48" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              <circle
                cx="48" cy="48" r="38"
                fill="none"
                stroke="rgba(139,92,246,0.75)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${pct * C} ${C}`}
                style={{ transition: 'stroke-dasharray 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-textPrimary tabular-nums">
                {hrs > 0 ? `${hrs}:` : ''}{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
              </span>
            </div>
          </div>

          <button
            onClick={() => { setActive(false); setRemaining(0); }}
            className="glass-pill text-textSecondary hover:text-textPrimary px-6 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2 transition-all"
          >
            <Square className="w-3.5 h-3.5" />
            Encerrar foco
          </button>
        </div>
      )}
    </div>
  );
}
