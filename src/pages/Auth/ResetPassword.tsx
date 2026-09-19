import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, getHttpErrorMessage } from '../../services/api';
export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [token] = useState(() => params.get('token') || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  return <main className="min-h-screen bg-background text-white grid place-items-center p-6">
    <form className="w-full max-w-sm space-y-5" onSubmit={async event => {
      event.preventDefault(); setError('');
      if (token && (password !== confirm || password.length < 8 || new TextEncoder().encode(password).length > 72)) {
        setError('Use uma senha com pelo menos 8 caracteres e no máximo 72 bytes, e confirme a mesma senha.'); return;
      }
      setBusy(true);
      try {
        const body = new URLSearchParams(token ? { token, newPassword: password } : { email });
        await api.post(token ? '/user/reset-password' : '/user/forgot-password', body, { skipAuth: true, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        setDone(true); setPassword(''); setConfirm('');
        window.history.replaceState(null, '', window.location.pathname);
      } catch (failure) { setError(getHttpErrorMessage(failure)); }
      finally { setBusy(false); }
    }}>
      <h1 className="text-2xl font-bold">{token ? 'Redefinir senha' : 'Recuperar acesso'}</h1>
      {error && <p role="alert" className="text-red-400">{error}</p>}
      {done ? <p role="status">{token ? 'Senha alterada. Entre com sua nova senha.' : 'Se este e-mail estiver cadastrado, você receberá as instruções de recuperação.'}</p> : <>
        {token ? <>
          <label className="block">Nova senha<input required type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className="block w-full p-3 bg-white/10 rounded-xl" /></label>
          <label className="block">Confirmar senha<input required type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} className="block w-full p-3 bg-white/10 rounded-xl" /></label>
        </> : <label className="block">E-mail<input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="block w-full p-3 bg-white/10 rounded-xl" /></label>}
        <button disabled={busy} className="w-full p-3 bg-white text-black rounded-xl disabled:opacity-50">{busy ? 'Enviando...' : token ? 'Alterar senha' : 'Enviar instruções'}</button>
      </>}
      <Link className="block underline" to="/auth">Voltar ao login</Link>
    </form>
  </main>;
}
