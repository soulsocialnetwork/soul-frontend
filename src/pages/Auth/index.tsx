import { SecureImage, SecureVideo } from '../../components/ui/SecureMedia';
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { AuthForm } from '../../components/auth/AuthForm';
import { AuthToggle } from '../../components/auth/AuthToggle';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { getHttpErrorMessage } from '../../services/api';
import { useTranslation } from '../../i18n';
import soulzinhoWebm from '../../assets/soulzinho-animacao-ofical-tela-inicial.webm';
import logoBrancaSvg from '../../assets/logo-tipografica-soul-branca-sem-fundo.svg';

export default function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation('auth');

  // atualiza o modo de auth quando o parâmetro da url muda
  useEffect(() => {
    setMode(initialMode);
    setAuthError('');
  }, [initialMode]);

  // alterna entre login e cadastro na url
  const handleToggle = () => {
    setSearchParams({ mode: mode === 'login' ? 'register' : 'login' });
  };

  // lida com o envio do formulário para logar ou cadastrar
  const handleSubmit = async (
    data: Parameters<typeof login>[0] | Parameters<typeof authService.register>[0]
  ) => {
    setAuthError('');
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login(data as Parameters<typeof login>[0]);
        navigate('/feed');
      } else {
        await authService.register(data as Parameters<typeof authService.register>[0]);
        // After successful registration, log the user in
        await login({ 
          email: (data as Parameters<typeof authService.register>[0]).email, 
          password: (data as Parameters<typeof authService.register>[0]).password 
        });
        navigate('/verify-email');
      }
    } catch (error) {
      setAuthError(getHttpErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen h-screen bg-background flex flex-col justify-center items-center p-4 sm:p-8 overflow-hidden">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        
        {/* lado esquerdo com a logo em svg, slogan e soulzinho animado maior */}
        <div className="hidden lg:flex flex-1 flex-col items-start text-left z-10">
          <div className="mb-6">
            <SecureImage src={logoBrancaSvg} alt="Soul" className="h-8 w-auto" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-2">
            {t('slogan1', 'Seu espaço de calmaria.')}
          </h1>
          <p className="text-textSecondary text-base mb-6 max-w-sm">
            {t('sloganSubtitle', 'Conexões autênticas, no seu próprio ritmo e sem manipulação.')}
          </p>
          <SecureVideo 
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
          <AuthForm mode={mode} error={authError} isSubmitting={isSubmitting} onSubmit={handleSubmit} />
          <AuthToggle mode={mode} onToggle={handleToggle} />
        </div>
        
      </div>
    </div>
  );
}