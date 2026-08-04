import { ArrowLeft, ShieldCheck, Lock, Database, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DataTransparencyPage() {
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
          <h1 className="text-lg font-bold">Transparência de Dados</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-5 pb-20 space-y-8 animate-fade-up">
        
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold">Seus Dados. Suas Regras.</h2>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-[280px] mx-auto">
            Não escondemos o que fazemos em Termos de Uso gigantes e ilegíveis. Aqui está a verdade nua e crua.
          </p>
        </div>

        <div className="space-y-4">
          
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex gap-4">
            <EyeOff className="w-6 h-6 text-zinc-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold mb-1">Zero Algoritmos Preditivos</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Nós <strong>NÃO</strong> rastreamos quanto tempo você olha para um post. Nós <strong>NÃO</strong> usamos inteligência artificial para adivinhar suas fraquezas e te manter rolando a tela. Seu feed é 100% cronológico.
              </p>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex gap-4">
            <Lock className="w-6 h-6 text-zinc-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold mb-1">Nenhum dado é vendido</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Como nosso modelo de negócio não é baseado em publicidade, nós não temos nenhum incentivo financeiro para vender, alugar ou compartilhar seu perfil com corretores de dados.
              </p>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex gap-4">
            <Database className="w-6 h-6 text-zinc-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold mb-1">O que nós armazenamos</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Apenas o estritamente necessário para o app funcionar: seu e-mail (criptografado), seu nome de usuário, os posts que você cria e as conexões (quem você segue).
              </p>
            </div>
          </div>

        </div>

        <div className="mt-8 p-5 rounded-2xl border border-dashed border-white/20 bg-transparent text-center space-y-2">
          <p className="text-sm text-zinc-300">
            Você é nosso cliente, não o nosso produto.
          </p>
          <p className="text-xs text-zinc-500">
            Se alguma vez mudarmos essa política, você será o primeiro a saber, e terá a opção de baixar todos os seus dados e excluir sua conta com 1 clique antes que a mudança entre em vigor.
          </p>
        </div>

      </main>
    </div>
  );
}
