import { ArrowLeft, BookOpen, Brain, ShieldAlert, Target, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DigitalEducationPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-background text-white font-sans">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center px-4 h-16 max-w-lg mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors -ml-2 mr-2"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold">Educação Digital</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-5 pb-20 space-y-8 animate-fade-up">
        
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold leading-tight">O que você consome,<br/>molda quem você é.</h2>
          <p className="text-zinc-400 text-[15px] leading-relaxed">
            Acreditamos que a tecnologia deve servir a você, e não o contrário. 
            Entenda como o design das redes tradicionais afeta seu cérebro e como o Soul foi construído para devolver o seu controle.
          </p>
        </div>

        <div className="space-y-6 mt-10">
          
          <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <ShieldAlert className="w-24 h-24" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-lg font-bold">O Capitalismo de Vigilância</h3>
            <p className="text-sm text-zinc-400 leading-relaxed relative z-10">
              Nas redes convencionais, <strong>você é o produto</strong>. Cada clique, segundo de pausa num vídeo ou perfil visitado é rastreado para alimentar algoritmos que prevêem (e moldam) o seu comportamento, vendendo sua atenção para anunciantes.
            </p>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Brain className="w-24 h-24" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Brain className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold">O "Caça-Níqueis" no seu bolso</h3>
            <p className="text-sm text-zinc-400 leading-relaxed relative z-10">
              O movimento de <em>"puxar para atualizar"</em> (Pull-to-refresh) foi desenhado usando a mesma psicologia das máquinas caça-níqueis (recompensas intermitentes variáveis). Ele gera picos de dopamina que criam vícios involuntários.
            </p>
          </div>

          <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Target className="w-24 h-24" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
              <Target className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-lg font-bold">Bundling de Motivos</h3>
            <p className="text-sm text-zinc-400 leading-relaxed relative z-10">
              Você abre o app para responder uma mensagem urgente, mas o design te obriga a passar pelo feed. Isso é proposital: empacotar uma necessidade útil com um poço sem fundo de distrações. No Soul, nós separamos as coisas.
            </p>
          </div>

        </div>

        <div className="pt-8 border-t border-white/10 space-y-6">
          <div className="flex items-center gap-3">
            <Heart className="w-5 h-5 text-zinc-400" />
            <h3 className="text-lg font-bold">A Filosofia do Soul</h3>
          </div>
          <ul className="space-y-4 text-sm text-zinc-400">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-white mt-2 shrink-0" />
              <p><strong>Fricção Consciente:</strong> Adicionamos pausas estratégicas (como ao criar um post ou seguir alguém) para que seu córtex pré-frontal assuma o controle antes do impulso.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-white mt-2 shrink-0" />
              <p><strong>Fim das Métricas Sociais:</strong> Ocultamos números de seguidores e likes para reduzir a pressão social e focar na qualidade da conexão real.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-white mt-2 shrink-0" />
              <p><strong>Você no Controle:</strong> Sem feeds infinitos gerados por IA, sem anúncios, sem notificações urgentes desnecessárias.</p>
            </li>
          </ul>
        </div>

      </main>
    </div>
  );
}
