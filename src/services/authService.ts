import {
  api,
  endpoints,
  refreshAccessToken,
  tokenStore,
  waitForPendingRefresh,
  withSessionLock,
} from './api';
import type {
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
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
    await waitForPendingRefresh();
    let loginRevision = tokenStore.getRevision();
    const response = await withSessionLock(async () => {
      tokenStore.clearSession();
      loginRevision = tokenStore.getRevision();
      return api.post<LoginResponse>(endpoints.user.login, data, { skipAuth: true });
    });
    const payload = response.data;

    if (!payload?.token) {
      throw new Error('Resposta de login sem token.');
    }

    if (!tokenStore.setAccessToken(payload.token, loginRevision)) {
      throw new Error('A sessão foi alterada durante o login. Tente novamente.');
    }

    return payload;
  },

  async getMe(): Promise<CurrentUserResponse> {
    const response = await api.get<CurrentUserResponse>(endpoints.user.me);
    return response.data;
  },

  async restoreSession(): Promise<void> {
    await refreshAccessToken();
  },

  async logout(): Promise<void> {
    try {
      await waitForPendingRefresh();
      await withSessionLock(() => (
        api.post(endpoints.user.logout, undefined, { skipAuth: true })
      ));
    } catch {
    } finally {
      tokenStore.clearEverywhere();
    }
  },

  async changePassword(currentPassword: string, newPassword: string) {
    await api.put(endpoints.user.password, { currentPassword, newPassword });
  },
  async deleteAccount() {
    await waitForPendingRefresh();
    await api.delete(endpoints.user.me);
    tokenStore.clearEverywhere();
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
  async requestEmailChange(newEmail: string, currentPassword: string): Promise<void> {
    await api.put('/user/me/email', { newEmail, currentPassword });
  },
  async updatePrivacy(privateProfile: boolean) {
    await api.put('/user/me/privacy', { privateProfile });
  },
  async register(data: RegisterRequestDTO) {
    const response = await api.post(endpoints.user.create, data);
    return response.data;
  },
};
