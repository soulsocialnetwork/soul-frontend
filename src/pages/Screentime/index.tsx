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
  Info
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { ScreenLoader } from '../../components/ui/ScreenLoader';

const WEEK_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const WEEK_FULL_NAMES = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

export default function ScreentimePage() {
  const [loading, setLoading] = useState(true);
  const [dailyGoal] = useState(120);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [showMoreWeekly, setShowMoreWeekly] = useState(false);
  const [focusTime, setFocusTime] = useState('30');
  const [focusTask, setFocusTask] = useState('');
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [focusTimeLeft, setFocusTimeLeft] = useState(0);
  const [isTryingToExit, setIsTryingToExit] = useState(false);
  const [exitTimer, setExitTimer] = useState(5);
  const [focusCompleted, setFocusCompleted] = useState(false);
  const [focusError, setFocusError] = useState('');

  const { t } = useTranslation('screentime');

  // Valores "mockados" para a UI premium
  const timeStr = '0h 00m';
  const goalStr = `${Math.floor(dailyGoal / 60)}h ${dailyGoal % 60}m`;
  const pct = 0;
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
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isFocusActive && focusTimeLeft > 0) {
      interval = setInterval(() => {
        setFocusTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isFocusActive && focusTimeLeft === 0) {
      setIsFocusActive(false);
      setFocusCompleted(true);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isFocusActive, focusTimeLeft]);

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
      return;
    }

    const minutes = parseInt(focusTime, 10);

    if (!Number.isNaN(minutes) && minutes > 0) {
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
              <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    {t('title', 'Tempo de Tela')}
                  </h1>

                  <p className="text-sm text-zinc-400 mt-0.5">
                    Visão geral da sua navegação hoje
                  </p>
                </div>



                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Left Column: Stats */}
                  <div className="space-y-6">
                    {/* Today Usage */}
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-30 group-hover:opacity-100 transition-opacity">
                        <Info className="w-4 h-4 text-white/40" />
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                            <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="6" />
                            <circle
                              cx="50"
                              cy="50"
                              r={radius}
                              fill="none"
                              stroke="url(#gradient)"
                              strokeWidth="6"
                              strokeLinecap="round"
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                              className="transition-all duration-1000 ease-out"
                            />
                            <defs>
                              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#fff" />
                                <stop offset="100%" stopColor="#666" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <Clock className="w-5 h-5 text-white/20 mb-1" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-semibold tracking-widest text-white/40 uppercase">
                            Uso de hoje
                          </p>
                          <p className="text-4xl font-extrabold text-white tracking-tight tabular-nums">
                            {timeStr}
                          </p>
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 mt-2 rounded-md bg-white/5 border border-white/10">
                            <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Meta</span>
                            <span className="text-[11px] text-white/90 font-medium">{goalStr}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Weekly Chart */}
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 transition-all duration-500">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-sm font-semibold text-white/80">
                            Esta semana
                          </h3>
                          <p className="text-xs text-white/40 mt-1">
                            Seu ritmo nos últimos dias
                          </p>
                        </div>
                        <button
                          onClick={() => setShowMoreWeekly(!showMoreWeekly)}
                          className="flex items-center gap-1.5 text-xs font-medium text-white/40 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/[0.05] transition-all"
                        >
                          <span>{showMoreWeekly ? 'Ocultar' : 'Detalhes'}</span>
                          {showMoreWeekly ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="flex items-end justify-between gap-2 h-40 px-1">
                        {WEEK_LABELS.map((label, index) => (
                          <div
                            key={index}
                            className="flex-1 flex flex-col items-center gap-3 h-full justify-end relative group"
                            onMouseEnter={() => setHoveredBarIndex(index)}
                            onMouseLeave={() => setHoveredBarIndex(null)}
                          >
                            {hoveredBarIndex === index && (
                              <div className="absolute -top-10 bg-white text-black text-[11px] font-bold px-2.5 py-1.5 rounded-lg shadow-2xl whitespace-nowrap z-20 animate-fade-in">
                                Sem dados
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
                              </div>
                            )}

                            <div className="w-full max-w-[28px] bg-white/[0.03] rounded-t-md h-full flex items-end overflow-hidden group-hover:bg-white/[0.06] transition-colors relative">
                              <div
                                className="w-full rounded-t-md bg-gradient-to-t from-white/10 to-white/30 transition-all duration-500"
                                style={{ height: '5%' }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-white/30 group-hover:text-white/80 transition-colors">
                              {label}
                            </span>
                          </div>
                        ))}
                      </div>

                      {showMoreWeekly && (
                        <div className="mt-8 pt-6 border-t border-white/[0.05] space-y-3 animate-fade-in">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">
                            Média diária
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            {WEEK_FULL_NAMES.slice(0, 4).map((day) => (
                              <div key={day} className="bg-white/[0.02] border border-white/[0.03] p-3 rounded-xl flex justify-between items-center">
                                <span className="text-xs text-white/60 font-medium">{day}</span>
                                <span className="text-xs text-white/20">—</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Focus Mode */}
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8 flex flex-col justify-between h-full relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 text-white/80 mb-8">
                        <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
                          <Moon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-bold tracking-widest uppercase">
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
                        className="w-full bg-white text-black font-bold rounded-xl py-4 text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.15)]"
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