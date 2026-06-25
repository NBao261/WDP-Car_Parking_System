import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserRole } from '../../../shared/types';
import { AssignedFacility } from '../types/user.types';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  mustChangePassword?: boolean;
  /** Populated facility objects fetched from /users/me after login */
  assignedFacilities: AssignedFacility[];
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string, refreshToken?: string) => void;
  setAssignedFacilities: (facilities: AssignedFacility[]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, token, refreshToken) => {
        set({
          user,
          token,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
        });
      },

      setAssignedFacilities: (facilities) => {
        set((state) => ({
          user: state.user ? { ...state.user, assignedFacilities: facilities } : null,
        }));
      },

      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('token');
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

