import { create } from 'zustand';
import { routesApi } from '../api/routesApi';
import type { MountainRoute } from '../types';

interface RoutesState {
  routes: MountainRoute[];
  isLoading: boolean;
  error: string | null;
  fetchRoutes: () => Promise<void>;
}

export const useRoutesStore = create<RoutesState>((set) => ({
  routes: [],
  isLoading: false,
  error: null,

  async fetchRoutes() {
    set({ isLoading: true, error: null });
    try {
      const routes = await routesApi.list();
      set({ routes, isLoading: false });
    } catch {
      set({ error: 'No se pudieron cargar las rutas.', isLoading: false });
    }
  },
}));
