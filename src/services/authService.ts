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

    tokenStorage.clearSession();
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
    } catch {
      // Always finish local logout, even when the server is unreachable.
    } finally {
      tokenStorage.clearSession();
    }
  },

  async changePassword(currentPassword: string, newPassword: string) {
    await api.put(endpoints.user.password, { currentPassword, newPassword });
  },
  async deleteAccount() {
    await api.delete(endpoints.user.me);
    tokenStorage.clearSession();
  },
  async updateProfile(data: { name: string; bio: string; profilePicture: string | null }) {
    const response = await api.put<CurrentUserResponse>(endpoints.user.me, data);
    return response.data;
  },
  async updateNotifications(data: object) {
    await api.put('/user/me/notifications', data);
  },
  async updateScreentime(dailyTimeLimit: number | null) {
    await api.put('/user/me/screentime', { dailyTimeLimit });
  },
  async register(data: RegisterRequestDTO) {
    const response = await api.post(endpoints.user.create, data);
    return response.data;
  },
};
