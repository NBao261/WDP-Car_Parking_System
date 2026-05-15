import { apiClient } from './api';
import { Role, UserPermissions, AssignRolePayload } from '../types/role.types';

export const roleService = {
  getAllRoles: async (): Promise<{ success: boolean; data: Role[] }> => {
    return apiClient.get('/roles');
  },

  updatePermissions: async (id: string, permissions: string[]): Promise<{ success: boolean; data: Role }> => {
    return apiClient.put(`/roles/${id}/permissions`, { permissions });
  },

  resetPermissions: async (id: string): Promise<{ success: boolean; data: Role }> => {
    return apiClient.post(`/roles/${id}/reset-permissions`);
  },

  assignRole: async (payload: AssignRolePayload): Promise<{ success: boolean; data: any }> => {
    return apiClient.post('/roles/assign', payload);
  },

  getUserPermissions: async (userId: string): Promise<{ success: boolean; data: UserPermissions }> => {
    return apiClient.get(`/roles/user/${userId}/permissions`);
  },
};
