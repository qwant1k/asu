import api from './axios';
import { AuthTokens, User } from '../shared/types';

export const authApi = {
  login: (username: string, password: string) =>
    api.post<AuthTokens>('/auth/login/', { username, password }),

  refreshToken: (refresh: string) =>
    api.post<{ access: string }>('/auth/token/refresh/', { refresh }),

  logout: (refresh: string) =>
    api.post('/auth/logout/', { refresh }),

  getMe: () =>
    api.get<User>('/auth/me/'),

  updateProfile: (data: Partial<User> | FormData) =>
    api.patch<User>(
      '/auth/me/',
      data,
      data instanceof FormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : undefined,
    ),
};
