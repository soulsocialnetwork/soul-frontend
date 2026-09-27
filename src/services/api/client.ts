import axios from 'axios';
import { endpoints } from './endpoints';
import { tokenStore } from './token';

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
    retried?: boolean;
  }
}

const PUBLIC_PATHS: string[] = [
  endpoints.user.refreshToken,
  endpoints.user.logout,
  endpoints.user.login,
  endpoints.user.create,
  endpoints.user.forgotPassword,
  endpoints.user.resetPassword,
];

function isPublicRequest(url = ''): boolean {
  return PUBLIC_PATHS.some((path) => url.split('?')[0] === path);
}

// centraliza autenticação, renovação de tokens e expiração de sessão nas chamadas da api
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (config.skipAuth || isPublicRequest(config.url)) {
    return config;
  }

  const token = tokenStore.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshRequest: Promise<string> | null = null;

const SESSION_LOCK_NAME = 'soul:session-refresh';

export async function withSessionLock<T>(operation: () => Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request(SESSION_LOCK_NAME, operation);
  }
  return operation();
}

export function refreshAccessToken(): Promise<string> {
  if (!refreshRequest) {
    const revision = tokenStore.getRevision();
    refreshRequest = withSessionLock(() => (
      api.post(endpoints.user.refreshToken, undefined, { skipAuth: true })
    ))
      .then(({ data }) => {
        if (!data.token) throw new Error('Resposta de sessão inválida.');
        if (!tokenStore.setAccessToken(data.token, revision)) throw new Error('Sessão alterada.');
        return data.token as string;
      })
      .catch(refreshError => {
        if ([400, 401, 403].includes(refreshError.response?.status)) {
          tokenStore.clearEverywhere();
          window.dispatchEvent(new Event('soul:session-expired'));
        }
        throw refreshError;
      })
      .finally(() => { refreshRequest = null; });
  }
  return refreshRequest;
}

export async function waitForPendingRefresh(): Promise<void> {
  if (!refreshRequest) return;
  try { await refreshRequest; } catch { }
}

api.interceptors.response.use(response => response, async error => {
  const config = error.config;
  if (error.response?.status !== 401 || !config || config.skipAuth || isPublicRequest(config.url)) throw error;
  if (config.retried) {
    tokenStore.clearEverywhere();
    window.dispatchEvent(new Event('soul:session-expired'));
    throw error;
  }
  config.retried = true;
  config.headers.Authorization = `Bearer ${await refreshAccessToken()}`;
  return api(config);
});
