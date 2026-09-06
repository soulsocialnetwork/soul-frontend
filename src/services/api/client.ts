import axios from 'axios';
import { endpoints } from './endpoints';
import { tokenStorage } from './token';

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
  }
}

const PUBLIC_PATHS: string[] = [
  endpoints.user.login,
  endpoints.user.create,
  endpoints.user.forgotPassword,
  endpoints.user.resetPassword,
];

function isPublicRequest(url = ''): boolean {
  return PUBLIC_PATHS.some((path) => url.includes(path));
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
