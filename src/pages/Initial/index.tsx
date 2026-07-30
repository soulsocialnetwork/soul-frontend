import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { useTranslation } from '../../i18n';
import soulzinhoWebm from '../../assets/soulzinho-animacao-ofical-tela-inicial.webm';

export default function InitialPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('initial');

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between items-center p-6 sm:p-8 lg:p-12 overflow-x-hidden">
      <div className="w-full max-w-5xl my-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 py-8">
        
        {/* lado esquerdo com os textos principais e o soulzinho animado */}
        <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {t('headline1')}<br />
            {t('headline2')}{' '}
            <span className="inline-block bg-white text-background px-3 py-0.5 rounded-xl font-black my-1">
              {t('headline2Highlight')}
            </span><br />
            {t('headline3')}
          </h1>

          {/* animação do mascote rodando em loop com tamanho maior */}
          <div className="w-full flex items-center justify-center lg:justify-start mt-6 lg:mt-8">
            <video 
              src={soulzinhoWebm} 
              className="w-64 sm:w-80 lg:w-96 h-auto drop-shadow-2xl" 
              autoPlay 
              loop 
              muted 
              playsInline 
            />
          </div>
        </div>

        {/* botões de ação para entrar ou criar conta */}
        <div className="w-full max-w-sm flex flex-col justify-center gap-3 z-10">
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full text-base font-bold shadow-lg" 
            onClick={() => navigate('/auth?mode=register')}
          >
            {t('continue')}
          </Button>
          <Button 
            variant="secondary" 
            size="lg" 
            className="w-full text-base font-bold" 
            onClick={() => navigate('/auth')}
          >
            {t('haveAccount')}
          </Button>
        </div>

      </div>
    </div>
  );
}