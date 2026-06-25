import { apiClient } from './api';

export interface SystemConfig {
  _id: string;
  key: string;
  value: any;
  description: string;
  updatedBy: string;
  updatedAt: string;
}

export const configService = {
  getAll: async (): Promise<{ success: boolean; data: SystemConfig[] }> => {
    return apiClient.get('/config');
  },

  getByKey: async (key: string): Promise<{ success: boolean; data: SystemConfig }> => {
    return apiClient.get(`/config/${key}`);
  },

  update: async (key: string, value: any): Promise<{ success: boolean; data: SystemConfig }> => {
    return apiClient.put(`/config/${key}`, { value });
  },
};
