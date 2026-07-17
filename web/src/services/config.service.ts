import { apiClient } from './api';

export interface SystemConfig {
  _id: string;
  key: string;
  value: any;
  description: string;
  updatedBy: string;
  updatedAt: string;
}

export interface AuditLog {
  _id: string;
  action: string;
  entity: string;
  entityId: string;
  changes: any;
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  ipAddress: string;
  result: string;
  createdAt: string;
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

  getLogs: async (params?: {
    action?: string;
    entity?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: AuditLog[];
    pagination: { total: number; page: number; limit: number; pages: number };
  }> => {
    return apiClient.get('/config/logs', { params });
  },
};
