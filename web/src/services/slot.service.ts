import { apiClient } from './api';

export type SlotStatus = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'locked';

export interface ParkingSlot {
  _id: string;
  code: string;
  floorId: string;
  facilityId: string;
  vehicleTypeId: string | { _id: string; name: string; code: string; icon: string };
  status: SlotStatus;
  currentSessionId: string | null;
  maintenanceReason: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SlotListResponse {
  success: boolean;
  data: ParkingSlot[];
}

export interface CreateSlotPayload {
  code: string;
  floorId: string;
  facilityId: string;
  vehicleTypeId: string;
}

export interface CreateBulkSlotsPayload {
  facilityId: string;
  floorId: string;
  vehicleType: string;
  prefix: string;
  startNumber: number;
  count: number;
}

export interface UpdateSlotStatusPayload {
  status: SlotStatus;
  reason?: string;
}

export const slotService = {
  getByFloor: async (floorId: string): Promise<SlotListResponse> => {
    return apiClient.get(`/slots/floor/${floorId}`);
  },

  getById: async (id: string): Promise<{ success: boolean; data: ParkingSlot }> => {
    return apiClient.get(`/slots/${id}`);
  },

  create: async (payload: CreateSlotPayload): Promise<{ success: boolean; data: ParkingSlot }> => {
    return apiClient.post('/slots', payload);
  },

  createBulk: async (payload: CreateBulkSlotsPayload): Promise<{ success: boolean; data: ParkingSlot[]; count: number }> => {
    return apiClient.post('/slots/bulk', payload);
  },

  updateStatus: async (
    id: string,
    payload: UpdateSlotStatusPayload,
  ): Promise<{ success: boolean; data: ParkingSlot }> => {
    return apiClient.patch(`/slots/${id}/status`, payload);
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete(`/slots/${id}`);
  },
};
