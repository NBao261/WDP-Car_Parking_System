import { apiClient } from './api';
import { User, UserListResponse, CreateUserPayload, UpdateUserPayload } from '../types/user.types';
import { UserRole } from '../../../shared/types';

interface GetUsersParams {
  role?: UserRole | string;
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export const userService = {
  getAllUsers: async (params?: GetUsersParams): Promise<UserListResponse> => {
    return apiClient.get('/users', { params });
  },

  getUserById: async (id: string): Promise<{ success: boolean; data: User }> => {
    return apiClient.get(`/users/${id}`);
  },

  createUser: async (payload: CreateUserPayload): Promise<{ success: boolean; data: User }> => {
    return apiClient.post('/users', payload);
  },

  updateUser: async (id: string, payload: UpdateUserPayload): Promise<{ success: boolean; data: User }> => {
    return apiClient.patch(`/users/${id}`, payload);
  },

  deleteUser: async (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete(`/users/${id}`);
  },

  lockUser: async (id: string): Promise<{ success: boolean; data: User }> => {
    return apiClient.post(`/users/${id}/lock`);
  },

  unlockUser: async (id: string): Promise<{ success: boolean; data: User }> => {
    return apiClient.post(`/users/${id}/unlock`);
  },

  resetPassword: async (id: string, newPassword: string): Promise<{ success: boolean; data: User }> => {
    return apiClient.post(`/users/${id}/reset-password`, { newPassword });
  },
};
