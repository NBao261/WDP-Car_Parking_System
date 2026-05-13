import { create } from 'zustand';
import { UserRole } from '../../../shared/types'; // Reference shared types

interface AuthState {
  user: { id: string; name: string; email: string; role: UserRole } | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: any, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: (userData, token) => set({ user: userData, token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));
