import { useEffect, useState } from 'react';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { Sidebar } from '../../components/layout/Sidebar';
import {
  Moon,
  Play,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { ScreenLoader } from '../../components/ui/ScreenLoader';
import { useAuth } from '../../context/AuthContext';
import { dayKey, useScreenUsage } from '../../hooks/useScreenUsage';

const formatMinutes = (total: number) => `${Math.floor(total / 60)}h ${String(total % 60).padStart(2, '0')}m`;
const dateLabel = (date: Date) => new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' }).format(date);

export default function ScreentimePage() {
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const usage = useScreenUsage(user?.id);
  const dailyGoal = user?.dailyTimeLimit ?? 120;
  const focusKey = 'soul:focus:' + user?.id;
  const [focusDeadline, setFocusDeadline] = useState<number | null>(null);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [rangeDays, setRangeDays] = useState<7 | 30>(7);
  const [showHistory, setShowHistory] = useState(false);
  const [focusTime, setFocusTime] = useState('30');
  const [focusTask, setFocusTask] = useState('');
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [focusTimeLeft, setFocusTimeLeft] = useState(0);
  const [isTryingToExit, setIsTryingToExit] = useState(false);
  const [exitTimer, setExitTimer] = useState(5);
  const [focusCompleted, setFocusCompleted] = useState(false);
  const [focusError, setFocusError] = useState('');

  const { t } = useTranslation('screentime');

  const today = dayKey();
  const minutesUsed = Math.floor((usage[today] || 0) / 60000);
  const timeStr = formatMinutes(minutesUsed);
  const goalStr = formatMinutes(dailyGoal);
  const pct = dailyGoal > 0 ? Math.min(1, (usage[today] || 0) / (dailyGoal * 60000)) : 0;
  const history = Array.from({ length: rangeDays }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (rangeDays - 1 - index));
    const key = dayKey(date);
    return { key, date, ms: usage[key], minutes: Math.floor((usage[key] || 0) / 60000) };
  });
  const completedDays = history.slice(0, -1).filter(day => day.ms !== undefined);
  const averageMinutes = completedDays.length
    ? Math.round(completedDays.reduce((sum, day) => sum + (day.ms || 0), 0) / completedDays.length / 60000)
    : null;
  const maxHistoryMs = Math.max(dailyGoal * 60000, ...history.map(day => day.ms || 0), 1);
  const recordedDays = history.filter(day => day.ms !== undefined).length;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - pct * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsFocusActive(false);
    setFocusDeadline(null);
    setFocusCompleted(false);
    try {
      const saved = JSON.parse(localStorage.getItem(focusKey) || 'null');
      if (saved && Number.isFinite(saved.deadline) && typeof saved.task === 'string') {
        setFocusTask(saved.task);
        if (saved.deadline > Date.now()) {
          setFocusDeadline(saved.deadline);
          setFocusTimeLeft(Math.ceil((saved.deadline - Date.now()) / 1000));
          setIsFocusActive(true);
        } else {
          setFocusCompleted(true);
          localStorage.removeItem(focusKey);
        }
      }
    } catch { /* Unavailable or invalid local history does not block the page. */ }
  }, [focusKey]);

  useEffect(() => {
    if (!isFocusActive || focusDeadline === null) return;
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((focusDeadline - Date.now()) / 1000));
      setFocusTimeLeft(seconds);
      if (seconds === 0) {
        setIsFocusActive(false);
        setFocusCompleted(true);
        try { localStorage.removeItem(focusKey); } catch { /* Finished in memory. */ }
      }
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [isFocusActive, focusDeadline, focusKey]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isTryingToExit && exitTimer > 0) {
      interval = setInterval(() => {
        setExitTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTryingToExit, exitTimer]);

  function startFocus() {
    if (!focusTask.trim()) {
      setFocusError('Descreva sua intenção para iniciar o foco.');
      return;
    }

    const minutes = Number(focusTime);
    if (!Number.isInteger(minutes) || minutes < 5 || minutes > 180) {
      setFocusError('Escolha entre 5 e 180 minutos.');
      return;
    }

    if (!Number.isNaN(minutes) && minutes > 0) {
      const deadline = Date.now() + minutes * 60000;
      try {
        localStorage.setItem(focusKey, JSON.stringify({ deadline, task: focusTask.trim() }));
      } catch {
        setFocusError('Não foi possível salvar a sessão neste navegador.');
        return;
      }
      setFocusError('');
      setFocusDeadline(deadline);
      setFocusTimeLeft(minutes * 60);
      setIsTryingToExit(false);
      setExitTimer(5);
      setFocusCompleted(false);
      setIsFocusActive(true);
    }
  }

  if (isFocusActive) {
    const minutes = Math.floor(focusTimeLeft / 60);
    const seconds = focusTimeLeft % 60;

    const timeDisplay = `${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="flex flex-col items-center max-w-md w-full text-center space-y-8">
          <Moon className="w-12 h-12 text-zinc-500" />

          <div className="space-y-2">
            <h2 className="text-xl text-zinc-400 font-medium">
              Focando em:
            </h2>

            <p className="text-3xl font-bold text-white leading-tight">
              {focusTask || 'Momento de Calmaria'}
            </p>
          </div>

          <div className="text-7xl font-extrabold text-white tabular-nums tracking-tight">
            {timeDisplay}
          </div>

          {!isTryingToExit ? (
            <button
              onClick={() => {
                setIsTryingToExit(true);
                setExitTimer(5);
              }}
              className="mt-12 text-zinc-500 hover:text-white transition-colors text-sm"
            >
              Encerrar antes do tempo
            </button>
          ) : (
            <div className="mt-8 flex flex-col items-center space-y-4 bg-white/[0.03] border border-white/10 p-6 rounded-2xl animate-slide-up">
              <p className="text-sm text-zinc-300">
                Sua tarefa já foi concluída?
              </p>

              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => {
                    setIsTryingToExit(false);
                  }}
                  className="flex-1 bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition-colors"
                >
                  Continuar
                </button>

                <button
                  disabled={exitTimer > 0}
                  onClick={() => {
                    setIsFocusActive(false);
                    setIsTryingToExit(false);
                    setFocusTimeLeft(0);
                    setFocusDeadline(null);
                    try { localStorage.removeItem(focusKey); } catch { /* Ended in memory. */ }
                  }}
                  className="flex-1 bg-transparent border border-white/20 text-white font-semibold py-3 rounded-xl disabled:opacity-30 transition-colors"
                >
                  {exitTimer > 0 ? `Sair (${exitTimer}s)` : 'Sair'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (focusCompleted) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="flex flex-col items-center max-w-md w-full text-center space-y-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-white">
              Sessão concluída!
            </h2>

            <p className="text-zinc-400 leading-relaxed max-w-xs mx-auto">
              Você se dedicou a:{' '}
              <strong className="text-white">
                {focusTask || 'sua sessão de foco'}
              </strong>
              . Esse tipo de atenção sustentada fortalece seu foco.
            </p>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 w-full space-y-1">
            <p className="text-xs text-zinc-500">
              Agora, antes de voltar ao app…
            </p>

            <p className="text-sm text-zinc-300 leading-relaxed">
              Respire fundo. Estique o corpo. Tome uma água. Você merece essa
              pausa real.
            </p>
          </div>

          <button
            onClick={() => {
              setFocusCompleted(false);
              setFocusTask('');
            }}
            className="text-zinc-500 hover:text-white text-sm transition-colors"
          >
            Continuar no Soul
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col lg:flex-row text-white font-sans antialiased">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 flex flex-col overflow-hidden">
          {loading ? (
            <ScreenLoader />
          ) : (
            <div className="flex-1 overflow-y-auto no-scrollbar pb-28 lg:pb-12">
              <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 space-y-5">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                    {t('title', 'Tempo de Tela')}
                  </h1>

                  <p className="text-sm text-zinc-400 mt-1">
                    Seu tempo no Soul, dia após dia, neste navegador.
                  </p>
                </div>



                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <section className="rounded-2xl border border-white/[0.09] bg-white/[0.04] p-5 sm:p-6" aria-label="Uso de hoje">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-[0.16em] uppercase text-white/45">Hoje</span>
                        <Clock className="w-4 h-4 text-white/35" aria-hidden="true" />
                      </div>
                      <div className="mt-5 flex flex-col sm:flex-row items-center gap-5 sm:gap-7">
                        <div className="relative w-28 h-28 shrink-0">
                          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label={`${Math.round(pct * 100)}% da meta diária`}>
                            <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="5" />
                            <circle cx="50" cy="50" r={radius} fill="none" stroke="#f4f4f5" strokeWidth="5" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-500" />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold tabular-nums text-white">{Math.round(pct * 100)}%</span>
                        </div>
                        <div className="min-w-0 text-center sm:text-left">
                          <p className="text-sm text-white/50">Tempo no Soul</p>
                          <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums text-white">{timeStr}</p>
                          <p className="mt-3 text-sm text-white/45">Meta diária <span className="font-semibold text-white/75">{goalStr}</span></p>
                        </div>
                      </div>
                    </section>

                    <section className="rounded-2xl border border-white/[0.09] bg-white/[0.04] p-5 sm:p-6" aria-label="Média diária">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold tracking-[0.16em] uppercase text-white/45">Média diária</span>
                        <TrendingUp className="w-4 h-4 text-white/35" aria-hidden="true" />
                      </div>
                      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums text-white">{averageMinutes === null ? '—' : formatMinutes(averageMinutes)}</p>
                      <p className="mt-2 text-sm leading-relaxed text-white/45">
                        {completedDays.length
                          ? `Baseada em ${completedDays.length} ${completedDays.length === 1 ? 'dia completo registrado' : 'dias completos registrados'} nos últimos ${rangeDays} dias.`
                          : 'Ainda não há dias completos registrados neste período.'}
                      </p>
                    </section>

                    <section className="rounded-2xl border border-white/[0.09] bg-white/[0.04] p-5 sm:p-6" aria-label="Histórico de uso">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-semibold tracking-tight text-white">Histórico</h2>
                          <p className="mt-1 text-xs text-white/40">{recordedDays} {recordedDays === 1 ? 'dia registrado' : 'dias registrados'} neste período</p>
                        </div>
                        <div className="inline-flex rounded-xl border border-white/[0.08] bg-black/25 p-1" role="group" aria-label="Período do histórico">
                          {([7, 30] as const).map(days => (
                            <button key={days} type="button" aria-pressed={rangeDays === days} onClick={() => { setRangeDays(days); setHoveredBarIndex(null); }} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${rangeDays === days ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}>
                              {days} dias
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 flex items-end justify-between gap-3 text-xs">
                        <span className="truncate capitalize text-white/50">{dateLabel((history[hoveredBarIndex ?? history.length - 1] ?? history[history.length - 1]).date)}</span>
                        <span className="font-semibold tabular-nums text-white">{(() => {
                          const day = history[hoveredBarIndex ?? history.length - 1] ?? history[history.length - 1];
                          return day.ms === undefined ? 'Sem registro' : formatMinutes(day.minutes);
                        })()}</span>
                      </div>
                      <div className="mt-4 flex h-28 items-end gap-1.5 border-b border-white/[0.08] pb-1">
                        {history.map((day, index) => (
                          <button
                            key={day.key}
                            type="button"
                            aria-label={`${dateLabel(day.date)}: ${day.ms === undefined ? 'sem registro' : formatMinutes(day.minutes)}`}
                            onMouseEnter={() => setHoveredBarIndex(index)}
                            onMouseLeave={() => setHoveredBarIndex(null)}
                            onFocus={() => setHoveredBarIndex(index)}
                            onBlur={() => setHoveredBarIndex(null)}
                            className="group flex h-full min-w-0 flex-1 items-end rounded-t-md focus-visible:outline focus-visible:outline-1 focus-visible:outline-white/60"
                          >
                            <span className={`block w-full rounded-t-md transition-colors ${day.key === today ? 'bg-white' : day.ms === undefined ? 'bg-white/[0.06]' : 'bg-white/35 group-hover:bg-white/60'}`} style={{ height: day.ms === undefined ? '3px' : `${Math.max(3, (day.ms / maxHistoryMs) * 100)}%` }} />
                          </button>
                        ))}
                      </div>
                      <div className="mt-2 flex justify-between text-[10px] font-medium text-white/35">
                        <span className="capitalize">{rangeDays === 7 ? new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(history[0].date) : `${history[0].date.getDate()}/${history[0].date.getMonth() + 1}`}</span>
                        <span>Hoje</span>
                      </div>

                      <button type="button" onClick={() => setShowHistory(value => !value)} aria-expanded={showHistory} className="mt-5 flex w-full items-center justify-between border-t border-white/[0.08] pt-4 text-sm font-medium text-white/65 hover:text-white transition-colors">
                        Ver dias registrados
                        {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {showHistory && <div className="mt-3 max-h-40 overflow-y-auto divide-y divide-white/[0.06]">
                        {history.filter(day => day.ms !== undefined).reverse().length === 0
                          ? <p className="py-3 text-sm text-white/40">Nenhum dia registrado ainda.</p>
                          : history.filter(day => day.ms !== undefined).reverse().map(day => (
                            <div key={day.key} className="flex items-center justify-between gap-3 py-3 text-sm">
                              <span className="capitalize text-white/55">{dateLabel(day.date)}</span>
                              <span className="font-semibold tabular-nums text-white">{formatMinutes(day.minutes)}</span>
                            </div>
                          ))}
                      </div>}
                    </section>
                  </div>

                  {/* Right Column: Focus Mode */}
                  <div className="bg-white/[0.04] border border-white/[0.09] rounded-2xl p-5 sm:p-6 flex flex-col justify-between lg:self-start relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 text-white/80 mb-8">
                        <div className="p-2.5 bg-white/[0.07] border border-white/[0.08] rounded-2xl">
                          <Moon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-semibold tracking-[0.16em] uppercase">
                          Modo Foco
                        </span>
                      </div>

                      <p className="text-sm text-white/50 mb-8 max-w-xs leading-relaxed">
                        Desconecte-se de distrações intencionalmente. Defina seu tempo e o que quer realizar.
                      </p>

                      <div className="space-y-6">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block">
                            Tempo (minutos)
                          </label>
                          <div className="flex items-center justify-between bg-black/40 border border-white/[0.05] rounded-xl overflow-hidden focus-within:border-white/20 transition-colors p-1">
                            <button
                              type="button"
                              onClick={() => setFocusTime((prev) => String(Math.max(5, (parseInt(prev, 10) || 0) - 5)))}
                              className="p-3 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              min={5}
                              value={focusTime}
                              onChange={(e) => setFocusTime(e.target.value)}
                              className="w-20 bg-transparent text-center text-2xl font-extrabold text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              type="button"
                              onClick={() => setFocusTime((prev) => String((parseInt(prev, 10) || 0) + 5))}
                              className="p-3 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2 block">
                            Minha intenção
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: Ler um livro, Meditar..."
                            value={focusTask}
                            onChange={(e) => {
                              setFocusTask(e.target.value);
                              if (e.target.value.trim()) setFocusError('');
                            }}
                            className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-colors"
                          />
                          {focusError && (
                            <p className="mt-2 text-xs text-red-400/80 font-medium">{focusError}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 mt-8 pt-8 border-t border-white/[0.05]">
                      <button
                        onClick={startFocus}
                        className="w-full bg-white text-black font-semibold rounded-xl py-4 text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-[0.98] transition-all"
                      >
                        <Play className="w-4 h-4 fill-black" />
                        <span>Iniciar foco</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
