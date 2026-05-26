import { apiClient } from './api';

export type SlotSize = 'small' | 'medium' | 'large';

export interface VehicleType {
  _id: string;
  name: string;
  code: string;
  slotSize: SlotSize;
  description: string;
  icon: string;
  floors?: {
    _id: string;
    name: string;
    facilityId: { _id: string; name: string } | string;
  }[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleTypeListResponse {
  success: boolean;
  data: VehicleType[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreateVehicleTypePayload {
  name: string;
  code: string;
  slotSize: SlotSize;
  description?: string;
  icon?: string;
  floors?: string[];
}

export interface UpdateVehicleTypePayload {
  name?: string;
  slotSize?: SlotSize;
  description?: string;
  icon?: string;
  floors?: string[];
}

export const vehicleTypeService = {
  getAll: async (params?: { page?: number; limit?: number }): Promise<VehicleTypeListResponse> => {
    return apiClient.get('/vehicle-types', { params });
  },

  getById: async (id: string): Promise<{ success: boolean; data: VehicleType }> => {
    return apiClient.get(`/vehicle-types/${id}`);
  },

  create: async (payload: CreateVehicleTypePayload): Promise<{ success: boolean; data: VehicleType }> => {
    return apiClient.post('/vehicle-types', payload);
  },

  update: async (
    id: string,
    payload: UpdateVehicleTypePayload,
  ): Promise<{ success: boolean; data: VehicleType }> => {
    return apiClient.patch(`/vehicle-types/${id}`, payload);
  },

  softDelete: async (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete(`/vehicle-types/${id}`);
  },
};
