import { apiClient } from './api';
import { AuthResponse } from '../../../shared/types';

export const authService = {
  login: async (
    email: string,
    password: string
  ): Promise<{ success: boolean; data: AuthResponse }> => {
    return apiClient.post('/auth/login', { email, password });
  },

  register: async (data: any): Promise<{ success: boolean }> => {
    return apiClient.post('/auth/register', data);
  },

  // TODO: Verify with backend team if these endpoints exist
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  verifyOtp: async (email: string, otp: string): Promise<{ success: boolean; token: string }> => {
    return apiClient.post('/auth/verify-otp', { email, otp });
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ success: boolean }> => {
    return apiClient.post('/auth/reset-password', { token, newPassword });
  },
};
