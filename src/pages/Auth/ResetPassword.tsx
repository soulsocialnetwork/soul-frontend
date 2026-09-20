import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { api, getHttpErrorMessage } from '../../services/api';
import { SecureImage, SecureVideo } from '../../components/ui/SecureMedia';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useTranslation } from '../../i18n';
import logoBrancaSvg from '../../assets/logo-tipografica-soul-branca-sem-fundo.svg';
import soulzinhoWebm from '../../assets/soulzinho-animacao-ofical-tela-inicial.webm';

export default function ResetPasswordPage() {
  const { t } = useTranslation('auth');
  const [params] = useSearchParams();
  const [token] = useState(() => params.get('token') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const title = done ? token ? 'Senha atualizada' : 'Confira seu e-mail' : token ? 'Crie uma nova senha' : 'Recuperar acesso';
  const description = done
    ? token ? 'Tudo pronto. Agora você pode entrar no Soul com sua nova senha.' : 'Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha.'
    : token ? 'Escolha uma nova senha para voltar ao seu espaço.' : 'Informe o e-mail da sua conta. Vamos enviar as instruções para você voltar ao Soul.';
  return <main className="min-h-screen bg-background flex flex-col justify-center items-center p-4 sm:p-8 overflow-y-auto">
    <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
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
        <SecureVideo src={soulzinhoWebm} className="w-64 lg:w-72 h-auto drop-shadow-2xl opacity-90" autoPlay loop muted playsInline />
      </div>

      <section aria-labelledby="recovery-title" className="w-full max-w-md space-y-5 z-10">
        <div className="lg:hidden"><AuthHeader /></div>
        <div>
          <h2 id="recovery-title" className="text-2xl font-bold tracking-tight text-textPrimary">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-textSecondary" role={done ? 'status' : undefined}>{description}</p>
        </div>
        {done ? <div className="flex flex-col gap-4">
          {!token && <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3">
            <p className="text-sm font-medium break-all">{email}</p>
            <p className="mt-2 text-xs leading-relaxed text-textSecondary">Não encontrou? Confira também a pasta de spam. O envio pode levar alguns minutos.</p>
          </div>}
          <Link to="/auth" className="btn-primary-glass inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold">Voltar ao login<ArrowRight size={16} aria-hidden="true" /></Link>
          {!token && <button type="button" onClick={() => { setDone(false); setError(''); }} className="min-h-10 text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors">Usar outro e-mail</button>}
        </div> : <form className="flex flex-col gap-4" aria-busy={busy} onSubmit={async event => {
          event.preventDefault();
          if (busy) return;
          setError('');
          if (token && password.length < 8) { setError('A nova senha precisa ter pelo menos 8 caracteres.'); return; }
          if (token && new TextEncoder().encode(password).length > 72) { setError('A senha ficou muito longa. Use uma senha mais curta.'); return; }
          if (token && password !== confirm) { setError('As senhas não são iguais. Confira a confirmação.'); return; }
          setBusy(true);
          try {
            const body = new URLSearchParams(token ? { token, newPassword: password } : { email: email.trim() });
            await api.post(token ? '/user/reset-password' : '/user/forgot-password', body, { skipAuth: true, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
            setDone(true); setPassword(''); setConfirm('');
            window.history.replaceState(null, '', window.location.pathname);
          } catch (failure) { setError(getHttpErrorMessage(failure)); }
          finally { setBusy(false); }
        }}>
          {token ? <>
            <div>
              <Input label="Nova senha" required disabled={busy} type="password" autoComplete="new-password" minLength={8} aria-describedby="password-hint" value={password} onChange={event => setPassword(event.target.value)} autoFocus />
              <p id="password-hint" className="mt-1 text-xs text-textSecondary ml-1">Use pelo menos 8 caracteres.</p>
            </div>
            <Input label="Confirmar nova senha" required disabled={busy} type="password" autoComplete="new-password" value={confirm} onChange={event => setConfirm(event.target.value)} />
          </> : <Input label="E-mail da sua conta" required disabled={busy} type="email" autoComplete="email" placeholder="voce@exemplo.com" value={email} onChange={event => setEmail(event.target.value)} autoFocus />}
          {error && <p role="alert" className="text-xs text-red-400/80 ml-1 animate-fade-in">{error}</p>}
          <Button type="submit" variant="primary" size="lg" disabled={busy} className="mt-4 w-full gap-2">
            {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : null}
            {busy ? 'Enviando...' : token ? 'Salvar nova senha' : 'Enviar link de recuperação'}
            {!busy && <ArrowRight size={16} aria-hidden="true" />}
          </Button>
        </form>}
        <div className="mt-10 text-center">
          <Link to="/auth" className="inline-flex min-h-10 items-center text-sm font-medium text-textSecondary hover:text-textPrimary transition-colors">
            {done ? 'Voltar ao login' : 'Lembrou sua senha? Entrar na conta'}
          </Link>
        </div>
      </section>
    </div>
  </main>;
}
