import { apiClient } from '../../../core/api/apiClient';
import { endpoints } from '../../../core/api/endpoints';
import type { UserRole } from '../types';

export interface SubscriptionStatusDto {
  role: UserRole;
  subscriptionStatus: 'inactive' | 'active' | 'canceled' | 'past_due';
  expiresAt: string | null;
  isPremium: boolean;
}

export const billingApi = {
  async getSubscriptionStatus() {
    const { data } = await apiClient.get<{ data: SubscriptionStatusDto }>(endpoints.subscriptionStatus);
    return data.data;
  },

  async subscribeToPremium(paymentMethodId?: string) {
    const { data } = await apiClient.post<{ data: SubscriptionStatusDto }>(endpoints.subscribe, {
      paymentMethodId,
    });
    return data.data;
  },
};
