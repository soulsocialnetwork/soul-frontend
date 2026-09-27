import { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { SecureImage, SecureVideo } from '../../components/ui/SecureMedia';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { Button } from '../../components/ui/Button';
import { useTranslation } from '../../i18n';
import logoBrancaSvg from '../../assets/logo-tipografica-soul-branca-sem-fundo.svg';
import soulzinhoWebm from '../../assets/soulzinho-animacao-ofical-tela-inicial.webm';

export default function EmailVerificationPreviewPage() {
  const { t } = useTranslation('auth');
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email;
  const codeRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState('');
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  return <main className="min-h-screen overflow-y-auto bg-background p-4 sm:p-8 flex flex-col items-center justify-center">
    <div className="flex w-full max-w-5xl flex-col items-center justify-between gap-8 lg:flex-row lg:gap-12">
      <div className="z-10 hidden flex-1 flex-col items-start text-left lg:flex">
        <div className="mb-6"><SecureImage src={logoBrancaSvg} alt="Soul" className="h-8 w-auto" /></div>
        <h1 className="mb-2 text-4xl font-extrabold leading-tight tracking-tight text-white lg:text-5xl">{t('slogan1', 'Seu espaço de calmaria.')}</h1>
        <p className="mb-6 max-w-sm text-base text-textSecondary">{t('sloganSubtitle', 'Conexões autênticas, no seu próprio ritmo e sem manipulação.')}</p>
        <SecureVideo src={soulzinhoWebm} className="h-auto w-64 opacity-90 drop-shadow-2xl lg:w-72" autoPlay loop muted playsInline />
      </div>

      <section aria-labelledby="email-preview-title" className="z-10 w-full max-w-md space-y-5">
        <div className="lg:hidden"><AuthHeader /></div>
        {done ? <>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white"><Check className="h-5 w-5" aria-hidden="true" /></div>
          <div>
            <h2 id="email-preview-title" className="text-2xl font-bold tracking-tight text-textPrimary">Tudo pronto</h2>
            <p className="mt-2 text-sm leading-relaxed text-textSecondary">Sua conta foi criada. Agora você pode entrar no Soul.</p>
          </div>
          <Link to="/auth" className="btn-primary-glass inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold">Fazer login <ArrowRight size={16} aria-hidden="true" /></Link>
        </> : <>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-textSecondary">Cadastro · Confirmação</p>
            <h2 id="email-preview-title" className="text-2xl font-bold tracking-tight text-textPrimary">Confirme seu e-mail</h2>
            <p className="mt-2 text-sm leading-relaxed text-textSecondary">Digite o código de 4 números para continuar.</p>
            {email && <p className="mt-1.5 text-sm font-medium text-textPrimary [overflow-wrap:anywhere]">{email}</p>}
          </div>

          <form className="flex flex-col gap-4" onSubmit={event => {
            event.preventDefault();
            if (code === '1234') { setDone(true); setError(''); }
            else setError(code.length < 4 ? 'Digite os 4 números do código.' : 'Código incorreto. Tente novamente.');
          }}>
            <div>
              <label htmlFor="email-preview-code" className="mb-2 block text-sm font-bold text-textPrimary">Código de verificação</label>
              <div className="relative">
                <input id="email-preview-code" ref={codeRef} autoFocus type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={4}
                  aria-invalid={!!error} value={code}
                  onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                  onChange={event => { setCode(event.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
                  className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0" />
                <div className="grid grid-cols-4 gap-3" aria-hidden="true">
                  {Array.from({ length: 4 }, (_, index) => <span key={index} className={`flex h-14 items-center justify-center rounded-xl border bg-white/[0.04] text-2xl font-semibold tabular-nums text-white transition-colors sm:h-16 ${focused && index === Math.min(code.length, 3) ? 'border-white/35' : 'border-white/10'}`}>{code[index] || ''}</span>)}
                </div>
              </div>
            </div>
            {error && <p role="alert" className="ml-1 text-xs text-red-400/80">{error}</p>}
            <Button type="submit" variant="primary" size="lg" className="mt-2 w-full gap-2">Confirmar código <ArrowRight size={16} aria-hidden="true" /></Button>
          </form>
          <div className="mt-10 text-center"><Link to="/auth" className="inline-flex min-h-10 items-center text-sm font-medium text-textSecondary transition-colors hover:text-textPrimary">Voltar ao login</Link></div>
        </>}
      </section>
    </div>
  </main>;
}
