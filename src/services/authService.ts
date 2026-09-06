import { api, endpoints, tokenStorage } from './api';
import type {
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
} from './api/types';

export interface RegisterRequestDTO {
  name: string;
  username: string;
  email: string;
  dateOfBirth: string;
  password: string;
}

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(endpoints.user.login, data, {
      skipAuth: true,
    });
    const payload = response.data;

    if (!payload?.token) {
      throw new Error('Resposta de login sem token.');
    }

    tokenStorage.setAccessToken(payload.token);
    if (payload.refreshToken) {
      tokenStorage.setRefreshToken(payload.refreshToken);
    }

    return payload;
  },

  async getMe(): Promise<CurrentUserResponse> {
    const response = await api.get<CurrentUserResponse>(endpoints.user.me);
    return response.data;
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        const body: RefreshTokenRequest = { refreshToken };
        await api.post(endpoints.user.logout, body);
      }
    } finally {
      tokenStorage.clearSession();
    }
  },

  async register(data: RegisterRequestDTO) {
    const response = await api.post(endpoints.user.create, data);
    return response.data;
  },
};
