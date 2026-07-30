import { api } from './api';

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface RegisterRequestDTO {
  name: string;
  email: string;
  dateOfBirth: string;
  password: string;
}

export const authService = {
  async login(data: LoginRequestDTO) {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  async register(data: RegisterRequestDTO) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
};