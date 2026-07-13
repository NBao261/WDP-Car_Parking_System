import { create } from 'zustand';
import { apiClient, saveTokens, clearTokens, getAccessToken } from '../services/api';

// ─── Types ────────────────────────────────────────────
export type UserRole = 'admin' | 'manager' | 'staff' | 'driver';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  assignedFacilities?: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  setUser: (user: User) => void;
  selectedFacilityId: string | null;
  setSelectedFacilityId: (id: string | null) => void;
}

// ─── Store ────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  selectedFacilityId: null,

  setSelectedFacilityId: (id) => set({ selectedFacilityId: id }),

  login: async (email, password) => {
    const response: any = await apiClient.post('/auth/login', { email, password });
    const { user, tokens } = response.data;

    await saveTokens(tokens.accessToken, tokens.refreshToken);
    set({ user, isAuthenticated: true });
    await useAuthStore.getState().fetchProfile();
  },

  register: async (data) => {
    const response: any = await apiClient.post('/auth/register', {
      ...data,
      role: 'driver', // Mobile app always registers as driver
    });
    const { user, tokens } = response.data;

    await saveTokens(tokens.accessToken, tokens.refreshToken);
    set({ user, isAuthenticated: true });
    await useAuthStore.getState().fetchProfile();
  },

  logout: async () => {
    await clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  fetchProfile: async () => {
    try {
      const response: any = await apiClient.get('/users/me');
      set({ user: response.data, isAuthenticated: true });
    } catch (error) {
      console.error('Failed to fetch profile', error);
    }
  },

  checkAuth: async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }
      // Token exists — fetch profile to validate and get user data
      await useAuthStore.getState().fetchProfile();
      set({ isAuthenticated: true, isLoading: false });
    } catch {
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  setUser: (user) => set({ user }),
}));
