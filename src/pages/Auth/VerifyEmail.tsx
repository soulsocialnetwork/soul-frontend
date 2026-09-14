import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Mail, Loader2, XCircle } from 'lucide-react';
import { api } from '../../services/api';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>(
    token ? 'loading' : 'no-token'
  );

  useEffect(() => {
    if (!token) return;
    api.get(`/user/verify-email?token=${encodeURIComponent(token)}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            {status === 'loading' && <Loader2 className="w-8 h-8 text-white/50 animate-spin" />}
            {status === 'success' && <CheckCircle className="w-8 h-8 text-white" />}
            {status === 'error' && <XCircle className="w-8 h-8 text-white/50" />}
            {status === 'no-token' && <Mail className="w-8 h-8 text-white/50" />}
          </div>
        </div>

        {status === 'loading' && (
          <>
            <h1 className="text-2xl font-bold text-white">Verificando seu e-mail</h1>
            <p className="text-sm text-white/40">Aguarde um momento...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="text-2xl font-bold text-white">E-mail verificado!</h1>
            <p className="text-sm text-white/50 leading-relaxed">
              Sua conta foi ativada com sucesso. Você já pode fazer login e começar a usar o Soul.
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all"
            >
              Fazer login
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-2xl font-bold text-white">Link inválido</h1>
            <p className="text-sm text-white/50 leading-relaxed">
              Este link de verificação expirou ou é inválido. Tente solicitar um novo e-mail de verificação.
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all"
            >
              Voltar ao login
            </button>
          </>
        )}

        {status === 'no-token' && (
          <>
            <h1 className="text-2xl font-bold text-white">Verifique seu e-mail</h1>
            <p className="text-sm text-white/50 leading-relaxed">
              Enviamos um link de verificação para o seu e-mail. Clique no link para ativar sua conta.
            </p>
            <p className="text-xs text-white/25">Não recebeu? Verifique sua caixa de spam.</p>
            <button
              onClick={() => navigate('/auth')}
              className="w-full py-3.5 border border-white/10 text-white/70 font-semibold rounded-xl hover:border-white/20 hover:text-white transition-all"
            >
              Voltar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
