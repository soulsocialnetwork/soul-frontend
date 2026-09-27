import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, tokenStorage } from '../../services/api';

export default function ConfirmEmailChangePage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<'ready' | 'loading' | 'success' | 'error'>(token ? 'ready' : 'error');

  const confirm = async () => {
    if (!token) return;
    setStatus('loading');
    try {
      await api.post('/user/confirm-email-change', null, { params: { token }, skipAuth: true });
      setStatus('success');
    } catch { setStatus('error'); }
  };

  return <main className="flex min-h-[100dvh] items-center justify-center bg-background p-6 text-white">
    <div className="soul-glass w-full max-w-sm space-y-4 rounded-2xl p-6 text-center">
      <h1 className="text-xl font-semibold">{status === 'loading' ? 'Confirmando e-mail...' : status === 'success' ? 'E-mail alterado' : status === 'error' ? 'Link inválido ou expirado' : 'Confirme seu novo e-mail'}</h1>
      <p className="text-sm text-white/60">{status === 'success' ? 'Seu novo e-mail foi confirmado. Entre novamente com o novo endereço.' : status === 'error' ? 'Solicite outro link nas configurações da conta.' : status === 'loading' ? 'Aguarde um momento.' : 'Confirme que deseja alterar o endereço da sua conta Soul.'}</p>
      {token && status === 'ready' && <button type="button" onClick={() => void confirm()} className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black">Confirmar e-mail</button>}
      {(status === 'success' || status === 'error') && <button type="button" onClick={() => { tokenStorage.clearSession(); window.location.assign('/auth'); }} className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black">Ir para o login</button>}
    </div>
  </main>;
}
