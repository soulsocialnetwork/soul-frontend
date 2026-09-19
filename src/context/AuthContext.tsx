import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { tokenStorage } from '../services/api';
import { authService } from '../services/authService';
import type { CurrentUserResponse, LoginRequest } from '../services/api/types';

interface AuthContextValue {
  user: CurrentUserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_PUBLIC_PATHS = new Set(['/', '/auth', '/reset-password']);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(tokenStorage.getAccessToken()));
  const navigate = useNavigate();
  const location = useLocation();
  const pathnameRef = useRef(location.pathname);
  pathnameRef.current = location.pathname;

  useEffect(() => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const currentUser = await authService.getMe();
        if (!cancelled) {
          setUser(currentUser);
        }
      } catch (error) {
        if (cancelled) return;
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          tokenStorage.clearSession();
          setUser(null);
          if (!SESSION_PUBLIC_PATHS.has(pathnameRef.current)) {
            navigate('/auth', { replace: true });
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    const clear = () => { setUser(null); navigate('/auth', { replace: true }); };
    window.addEventListener('soul:session-expired', clear);
    return () => window.removeEventListener('soul:session-expired', clear);
  }, [navigate]);

  const refreshUser = useCallback(async () => { setUser(await authService.getMe()); }, []);

  const login = useCallback(async (data: LoginRequest) => {
    await authService.login(data);
    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        tokenStorage.clearSession();
        setUser(null);
      }
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } finally { setUser(null); sessionStorage.removeItem('@soul:intention_shown'); }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
