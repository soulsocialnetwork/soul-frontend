import { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { BottomNav } from '../../components/layout/BottomNav';
import { Sidebar } from '../../components/layout/Sidebar';
import { Pencil, Check, X, Moon, Play, Plus, Minus, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTranslation } from '../../i18n';

const TODAY_USED = 94; // 1h 34m
const WEEKLY = [35, 60, 95, 50, 94, 20, 0];
const WEEK_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
const WEEK_FULL_NAMES = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

import { ScreenLoader } from '../../components/ui/ScreenLoader';
import { useEffect } from 'react';

export default function ScreentimePage() {
  const [loading, setLoading] = useState(true);
  const [dailyGoal, setDailyGoal] = useState(120); // 2h em minutos
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [focusTime, setFocusTime] = useState('30');
  const [focusTask, setFocusTask] = useState('');
  const [showMoreWeekly, setShowMoreWeekly] = useState(false);
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [focusTimeLeft, setFocusTimeLeft] = useState(0);
  const [isTryingToExit, setIsTryingToExit] = useState(false);
  const [exitTimer, setExitTimer] = useState(5);
  const [focusCompleted, setFocusCompleted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Timer do Modo Foco
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isFocusActive && focusTimeLeft > 0) {
      interval = setInterval(() => {
        setFocusTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isFocusActive && focusTimeLeft === 0) {
      setIsFocusActive(false);
      setFocusCompleted(true); // Dispara tela de celebração
    }
    return () => clearInterval(interval);
  }, [isFocusActive, focusTimeLeft]);

  // Timer da Fricção de Saída
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTryingToExit && exitTimer > 0) {
      interval = setInterval(() => {
        setExitTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTryingToExit, exitTimer]);

  const { t } = useTranslation('screentime');

  const pct = Math.min(TODAY_USED / dailyGoal, 1);
  const weekMax = Math.max(...WEEKLY, dailyGoal, 100);

  const usedHours = Math.floor(TODAY_USED / 60);
  const usedMins = TODAY_USED % 60;
  const goalHours = Math.floor(dailyGoal / 60);
  const goalMins = dailyGoal % 60;

  const timeStr = `${usedHours > 0 ? `${usedHours}h ` : ''}${usedMins}m`;
  const goalStr = `${goalHours > 0 ? `${goalHours}h` : ''}${goalMins > 0 ? ` ${goalMins}m` : ''}`;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - pct * circumference;

  function saveGoal() {
    const val = parseInt(goalInput, 10);
    if (!isNaN(val) && val > 0 && val <= 24) {
      setDailyGoal(val * 60);
    }
    setEditingGoal(false);
  }

  function formatMinsToLabel(mins: number) {
    if (mins === 0) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m` : ''}`.trim();
  }

  if (isFocusActive) {
    const m = Math.floor(focusTimeLeft / 60);
    const s = focusTimeLeft % 60;
    const timeDisplay = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="flex flex-col items-center max-w-md w-full text-center space-y-8">
          <Moon className="w-12 h-12 text-zinc-500" />
          
          <div className="space-y-2">
            <h2 className="text-xl text-zinc-400 font-medium">Focando em:</h2>
            <p className="text-3xl font-bold text-white leading-tight">{focusTask || 'Momento de Calmaria'}</p>
          </div>

          <div className="text-7xl font-extrabold text-white tabular-nums tracking-tight">
            {timeDisplay}
          </div>

          {!isTryingToExit ? (
            <button 
              onClick={() => { setIsTryingToExit(true); setExitTimer(5); }}
              className="mt-12 text-zinc-500 hover:text-white transition-colors text-sm"
            >
              Encerrar antes do tempo
            </button>
          ) : (
            <div className="mt-8 flex flex-col items-center space-y-4 bg-white/[0.03] border border-white/10 p-6 rounded-3xl animate-slide-up">
              <p className="text-sm text-zinc-300">Sua tarefa já foi concluída?</p>
              <div className="flex items-center gap-3 w-full">
                <button 
                  onClick={() => setIsTryingToExit(false)}
                  className="flex-1 bg-white text-black font-semibold py-3 rounded-xl hover:bg-zinc-200 transition-colors"
                >
                  Continuar
                </button>
                <button 
                  disabled={exitTimer > 0}
                  onClick={() => { setIsFocusActive(false); setIsTryingToExit(false); }}
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

  // Tela de Celebração ao Concluir o Modo Foco
  if (focusCompleted) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="flex flex-col items-center max-w-md w-full text-center space-y-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-white">Sessão concluída!</h2>
            <p className="text-zinc-400 leading-relaxed max-w-xs mx-auto">
              Você se dedicou a: <strong className="text-white">{focusTask || 'sua sessão de foco'}</strong>. Esse tipo de atenção sustentada fortalece seu córtex pré-frontal.
            </p>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 w-full space-y-1">
            <p className="text-xs text-zinc-500">Agora, antes de voltar ao app&hellip;</p>
            <p className="text-sm text-zinc-300 leading-relaxed">Respire fundo. Estique o corpo. Tome uma água. Você merece essa pausa real.</p>
          </div>

          <button
            onClick={() => setFocusCompleted(false)}
            className="text-zinc-500 hover:text-white text-sm transition-colors"
          >
            Continuar no Soul
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0c0c0e] flex flex-col lg:flex-row text-white font-sans antialiased">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 flex flex-col overflow-hidden">
          {loading ? (
            <ScreenLoader />
          ) : (
            <div className="flex-1 overflow-y-auto no-scrollbar pb-28 lg:pb-12">
              <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

            {/* Cabeçalho */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {t('title', 'Tempo de Tela')}
              </h1>
              <p className="text-sm text-zinc-400 mt-0.5">
                Visão geral da sua navegação hoje
              </p>
            </div>

            {/* ALERTA DE META EXCEDIDA */}
            {TODAY_USED >= dailyGoal && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start sm:items-center justify-between animate-fade-in gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-400">Meta Diária Excedida</h4>
                    <p className="text-xs text-red-400/80 mt-0.5">Você ultrapassou o seu limite de tempo de tela hoje. Considere fazer uma pausa offline.</p>
                  </div>
                </div>
              </div>
            )}

            {/* PARTE SUPERIOR: 2 Cards lado a lado no PC */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
              
              {/* 1. Card Tempo de Uso Hoje */}
              <div className="bg-[#141416] border border-white/[0.06] rounded-3xl p-6 flex flex-col justify-between space-y-6">
                <div className="flex items-center gap-6">
                  {/* Anel SVG */}
                  <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle 
                        cx="50" 
                        cy="50" 
                        r={radius} 
                        fill="none" 
                        stroke="rgba(255, 255, 255, 0.08)" 
                        strokeWidth="7" 
                      />
                      <circle
                        cx="50" 
                        cy="50" 
                        r={radius}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-700 ease-out opacity-90"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-base font-bold text-white tracking-tight">
                        {Math.round(pct * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Dados */}
                  <div className="space-y-0.5">
                    <p className="text-xs text-zinc-400 font-medium">Uso de hoje</p>
                    <p className="text-4xl font-extrabold text-white tracking-tight tabular-nums">
                      {timeStr}
                    </p>
                    <p className="text-xs text-zinc-400">
                      Meta: <span className="text-zinc-300">{goalStr}</span>
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/[0.06] pt-4 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Alterar meta:</span>

                  {editingGoal ? (
                    <div className="flex items-center gap-1.5 bg-zinc-800/80 px-2.5 py-1 rounded-xl border border-white/10">
                      <input
                        type="number" 
                        min={1} 
                        max={24}
                        value={goalInput}
                        onChange={e => setGoalInput(e.target.value)}
                        className="w-8 bg-transparent text-center text-xs font-semibold text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveGoal();
                          if (e.key === 'Escape') setEditingGoal(false);
                        }}
                      />
                      <span className="text-xs text-zinc-400">h</span>
                      <button onClick={saveGoal} className="text-emerald-400 hover:text-emerald-300 ml-1">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setEditingGoal(false)} className="text-zinc-400 hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setGoalInput(String(goalHours || 1)); setEditingGoal(true); }}
                      className="flex items-center gap-2 bg-zinc-800/50 hover:bg-zinc-800 border border-white/10 px-3 py-1.5 rounded-xl text-xs text-zinc-300 transition-colors"
                    >
                      <span>{goalHours}h</span>
                      <Pencil className="w-3 h-3 text-zinc-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Card Modo Foco */}
              <div className="bg-[#141416] border border-white/[0.06] rounded-3xl p-6 space-y-5 flex flex-col justify-between">
                <div className="flex items-center gap-2.5 text-zinc-200">
                  <Moon className="w-4 h-4 text-zinc-300" />
                  <span className="text-xs font-bold tracking-widest uppercase">Modo Foco</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-zinc-400 mb-1.5 block">Tempo (em minutos)</label>
                    <div className="relative flex items-center bg-[#1c1c1f] border border-white/[0.08] rounded-2xl overflow-hidden focus-within:border-white/20 transition-colors">
                      <button
                        type="button"
                        onClick={() => setFocusTime(prev => String(Math.max(5, (parseInt(prev, 10) || 0) - 5)))}
                        className="px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <input 
                        type="number"
                        value={focusTime}
                        onChange={(e) => setFocusTime(e.target.value)}
                        className="w-full bg-transparent text-center text-lg font-bold text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />

                      <button
                        type="button"
                        onClick={() => setFocusTime(prev => String((parseInt(prev, 10) || 0) + 5))}
                        className="px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <input 
                      type="text"
                      placeholder="Descreva sua tarefa..."
                      value={focusTask}
                      onChange={(e) => setFocusTask(e.target.value)}
                      className="w-full bg-[#1c1c1f] border border-white/[0.08] rounded-2xl px-4 py-3.5 text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (!focusTask.trim()) {
                      alert('Por favor, defina uma intenção/tarefa para sua sessão.');
                      return;
                    }
                    const t = parseInt(focusTime, 10);
                    if (!isNaN(t) && t > 0) {
                      setFocusTimeLeft(t * 60);
                      setIsFocusActive(true);
                    }
                  }}
                  className="w-full bg-white text-black font-semibold rounded-2xl py-3.5 text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-[0.98] transition-all"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Iniciar foco</span>
                </button>
              </div>

            </div>

            {/* PARTE INFERIOR: Card Esta Semana 100% de largura abaixo dos dois acima */}
            <div className="bg-[#141416] border border-white/[0.06] rounded-3xl p-6 transition-all duration-300">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-sm font-medium text-zinc-300">Esta semana</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Média diária: 1h 15m</p>
                </div>

                <button 
                  onClick={() => setShowMoreWeekly(!showMoreWeekly)}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/5 transition-colors"
                >
                  <span>{showMoreWeekly ? 'Ver menos' : 'Ver mais'}</span>
                  {showMoreWeekly ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Gráfico principal */}
              <div className="flex items-end justify-between gap-3 sm:gap-6 h-36 px-2">
                {WEEKLY.map((val, i) => {
                  const isToday = i === 4; // Sexta
                  const heightPct = val === 0 ? 4 : Math.max((val / weekMax) * 100, 12);

                  return (
                    <div 
                      key={i} 
                      className="flex-1 flex flex-col items-center gap-3 h-full justify-end relative group cursor-pointer"
                      onMouseEnter={() => setHoveredBarIndex(i)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    >
                      {hoveredBarIndex === i && (
                        <div className="absolute -top-7 bg-zinc-800 border border-white/10 text-white text-[10px] px-2 py-0.5 rounded-md shadow-xl whitespace-nowrap z-20">
                          {formatMinsToLabel(val)}
                        </div>
                      )}

                      <div className="w-full max-w-[36px] bg-zinc-800/40 rounded-xl h-full flex items-end overflow-hidden p-0.5">
                        <div
                          className={cn(
                            'w-full rounded-lg transition-all duration-300',
                            isToday ? 'bg-white' : 'bg-zinc-600/60'
                          )}
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>

                      <span className={cn(
                        'text-xs font-semibold',
                        isToday ? 'text-white font-bold' : 'text-zinc-400'
                      )}>
                        {WEEK_LABELS[i]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Conteúdo Expandido (Ver Mais) */}
              {showMoreWeekly && (
                <div className="mt-8 pt-6 border-t border-white/[0.06] space-y-3 animate-in fade-in duration-300">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
                    Detalhamento do Tempo Diário
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {WEEKLY.map((val, idx) => {
                      const isOver = val >= dailyGoal;
                      return (
                        <div key={idx} className="bg-[#1c1c1f] border border-white/[0.05] p-3.5 rounded-2xl flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-white">{WEEK_FULL_NAMES[idx]}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">{formatMinsToLabel(val)} de uso</p>
                          </div>
                          <span className={cn(
                            'text-[10px] font-medium px-2 py-0.5 rounded-md border',
                            val === 0 ? 'bg-zinc-800/50 text-zinc-500 border-zinc-700/30' :
                            isOver ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          )}>
                            {val === 0 ? 'Sem dados' : isOver ? 'Meta Excedida' : 'Dentro da Meta'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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