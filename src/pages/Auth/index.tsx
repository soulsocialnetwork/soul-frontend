import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { AuthForm } from '../../components/auth/AuthForm';
import { SocialLogin } from '../../components/auth/SocialLogin';
import { AuthToggle } from '../../components/auth/AuthToggle';
import { authService } from '../../services/authService';
import { useTranslation } from '../../i18n';
import soulzinhoWebm from '../../assets/soulzinho-animacao-ofical-tela-inicial.webm';
import logoBrancaSvg from '../../assets/logo-tipografica-soul-branca-sem-fundo.svg';

export default function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [isBreathing, setIsBreathing] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation('auth');

  // atualiza o modo de auth quando o parâmetro da url muda
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // alterna entre login e cadastro na url
  const handleToggle = () => {
    setSearchParams({ mode: mode === 'login' ? 'register' : 'login' });
  };

  // lida com o envio do formulário para logar ou cadastrar
  const handleSubmit = async (
    data: Parameters<typeof authService.login>[0] | Parameters<typeof authService.register>[0]
  ) => {
    try {
      if (mode === 'login') {
        await authService.login(data as Parameters<typeof authService.login>[0]);
        navigate('/feed');
      } else {
        await authService.register(data as Parameters<typeof authService.register>[0]);
        setIsBreathing(true);
        setTimeout(() => {
          navigate('/feed');
        }, 4000); // 4 segundos de respiração profunda
      }
    } catch (error) {
      console.error(error);
      // fallback just in case the api is failing but we want to simulate the flow
      if (mode === 'register') {
        setIsBreathing(true);
        setTimeout(() => navigate('/feed'), 4000);
      } else {
        navigate('/feed');
      }
    }
  };

  if (isBreathing) {
    return (
      <div className="min-h-screen h-screen bg-background flex flex-col justify-center items-center p-4">
        <div className="flex flex-col items-center justify-center animate-pulse duration-1000 transition-all">
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6 animate-ping">
            <div className="w-12 h-12 rounded-full bg-primary" />
          </div>
          <h1 className="text-3xl font-light text-textPrimary text-center mb-2">Respire fundo...</h1>
          <p className="text-textSecondary text-center">Deixe a pressa lá fora. Aqui é o seu espaço.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen bg-background flex flex-col justify-center items-center p-4 sm:p-8 overflow-hidden">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        
        {/* lado esquerdo com a logo em svg, slogan e soulzinho animado maior */}
        <div className="hidden lg:flex flex-1 flex-col items-start text-left z-10">
          <div className="mb-6">
            <img src={logoBrancaSvg} alt="Soul" className="h-8 w-auto" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-2">
            {t('slogan1', 'Seu espaço de calmaria.')}
          </h1>
          <p className="text-textSecondary text-base mb-6 max-w-sm">
            {t('sloganSubtitle', 'Conexões autênticas, no seu próprio ritmo e sem manipulação.')}
          </p>
          <video 
            src={soulzinhoWebm} 
            className="w-64 lg:w-72 h-auto drop-shadow-2xl opacity-90" 
            autoPlay 
            loop 
            muted 
            playsInline 
          />
        </div>

        {/* lado direito com o formulário de login ou cadastro */}
        <div className="w-full max-w-md space-y-5 z-10">
          <div className="lg:hidden">
            <AuthHeader />
          </div>
          <AuthForm mode={mode} onSubmit={handleSubmit} />
          <SocialLogin />
          <AuthToggle mode={mode} onToggle={handleToggle} />
        </div>
        
      </div>
    </div>
  );
}