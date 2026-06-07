import { create } from 'zustand';
import { authApi } from '../api/authApi';
import { billingApi } from '../api/billingApi';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  /**
   * Calls GET /billing/subscription-status — the single source of truth
   * `StartRouteButton` reads to decide whether to show the simulated
   * full-screen ad (FREE) or skip it (PREMIUM).
   */
  refreshSubscriptionStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,

  async login(email, password) {
    set({ isLoading: true });
    try {
      const baseUser = await authApi.login(email, password);
      set({ user: { ...baseUser, isPremium: false } });
      await get().refreshSubscriptionStatus();
    } finally {
      set({ isLoading: false });
    }
  },

  async register(email, password, fullName) {
    set({ isLoading: true });
    try {
      const baseUser = await authApi.register(email, password, fullName);
      set({ user: { ...baseUser, isPremium: false } });
      await get().refreshSubscriptionStatus();
    } finally {
      set({ isLoading: false });
    }
  },

  logout() {
    authApi.logout();
    set({ user: null });
  },

  async refreshSubscriptionStatus() {
    const current = get().user;
    if (!current) return;

    const status = await billingApi.getSubscriptionStatus();
    set({ user: { ...current, role: status.role, isPremium: status.isPremium } });
  },
}));
