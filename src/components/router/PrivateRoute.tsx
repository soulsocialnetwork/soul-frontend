import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * PrivateRoute — só renderiza filhos se autenticado.
 * Se não estiver logado, redireciona para /auth.
 * Enquanto carrega o token, não redireciona ainda.
 */
export function PrivateRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Spinner mínimo enquanto verifica token
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
}

/**
 * PublicRoute — se o usuário já estiver logado,
 * redireciona para /feed automaticamente (ex: tela inicial, login).
 */
export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/feed" replace /> : <Outlet />;
}
