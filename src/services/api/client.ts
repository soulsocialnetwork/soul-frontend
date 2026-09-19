import axios from 'axios';
import { endpoints } from './endpoints';
import { tokenStorage } from './token';

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

/**
 * URL base da API Spring Boot.
 * Configure em `.env` / `.env.local` via `VITE_API_URL`.
 * A URL real do backend ainda não está definida neste repositório.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (config.skipAuth || isPublicRequest(config.url)) {
    return config;
  }

  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshRequest: Promise<string> | null = null;
api.interceptors.response.use(response => response, async error => {
  const config = error.config;
  if (error.response?.status !== 401 || !config || config.skipAuth || isPublicRequest(config.url)) throw error;
  const refreshToken = tokenStorage.getRefreshToken();
  if (config.retried || !refreshToken) {
    tokenStorage.clearSession();
    window.dispatchEvent(new Event('soul:session-expired'));
    throw error;
  }
  config.retried = true;
  if (!refreshRequest) {
    refreshRequest = api.post(endpoints.user.refreshToken, { refreshToken }, { skipAuth: true })
      .then(({ data }) => {
        if (tokenStorage.getRefreshToken() !== refreshToken) throw new Error('Sessão alterada.');
        if (!data.token || !data.refreshToken) throw new Error('Resposta de sessão inválida.');
        tokenStorage.setAccessToken(data.token);
        tokenStorage.setRefreshToken(data.refreshToken);
        return data.token as string;
      })
      .catch(refreshError => {
        if (tokenStorage.getRefreshToken() === refreshToken && [400, 401, 403].includes(refreshError.response?.status)) {
          tokenStorage.clearSession();
          window.dispatchEvent(new Event('soul:session-expired'));
        }
        throw refreshError;
      })
      .finally(() => { refreshRequest = null; });
  }
  config.headers.Authorization = `Bearer ${await refreshRequest}`;
  return api(config);
});
