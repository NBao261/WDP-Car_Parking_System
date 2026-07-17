import { apiClient } from './api';

export type FloorStatus = 'active' | 'inactive';

export interface Floor {
  _id: string;
  facilityId: string;
  name: string;
  allowedVehicleTypes: string[];
  totalSlots: number;
  status: FloorStatus;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FloorListResponse {
  success: boolean;
  data: Floor[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreateFloorPayload {
  facilityId: string;
  name: string;
  allowedVehicleTypes?: string[];
  totalSlots?: number;
}

export interface UpdateFloorPayload {
  name?: string;
  totalSlots?: number;
  status?: FloorStatus;
}

export const floorService = {
  getAll: async (params?: {
    facilityId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<FloorListResponse> => {
    return apiClient.get('/floors', { params });
  },

  getById: async (id: string): Promise<{ success: boolean; data: Floor }> => {
    return apiClient.get(`/floors/${id}`);
  },

  create: async (payload: CreateFloorPayload): Promise<{ success: boolean; data: Floor }> => {
    return apiClient.post('/floors', payload);
  },

  update: async (
    id: string,
    payload: UpdateFloorPayload
  ): Promise<{ success: boolean; data: Floor }> => {
    return apiClient.patch(`/floors/${id}`, payload);
  },

  assignVehicleTypes: async (
    id: string,
    allowedVehicleTypes: string[]
  ): Promise<{ success: boolean; data: Floor }> => {
    return apiClient.patch(`/floors/${id}/assign-vehicles`, { allowedVehicleTypes });
  },

  softDelete: async (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete(`/floors/${id}`);
  },
};
