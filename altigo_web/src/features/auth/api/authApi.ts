import { apiClient, tokenStorage } from '../../../core/api/apiClient';
import { endpoints } from '../../../core/api/endpoints';
import type { AuthResponseDto } from '../types';

export const authApi = {
  async login(email: string, password: string) {
    const { data } = await apiClient.post<{ data: AuthResponseDto }>(endpoints.login, { email, password });
    tokenStorage.set(data.data.token);
    return data.data.user;
  },

  async register(email: string, password: string, fullName?: string) {
    const { data } = await apiClient.post<{ data: AuthResponseDto }>(endpoints.register, {
      email,
      password,
      fullName,
    });
    tokenStorage.set(data.data.token);
    return data.data.user;
  },

  logout() {
    tokenStorage.clear();
  },
};
