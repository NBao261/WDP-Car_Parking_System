import { apiClient } from './api';

export enum SessionStatus {
  ACTIVE = 'active',
  PENDING_PAYMENT = 'pending_payment',
  COMPLETED = 'completed',
  EXCEPTION = 'exception',
}

export interface ParkingSession {
  _id: string;
  code: string;
  licensePlate: string;
  vehicleTypeId: string;
  facilityId: string;
  floorId: string;
  slotId: string;
  pricingPlanId: string;
  checkInTime: string;
  checkOutTime: string | null;
  gateIn: string;
  gateOut: string;
  status: SessionStatus;
  cardCode: string;
  totalFee: number;
}

export interface CheckInPayload {
  facilityId: string;
  vehicleTypeId: string;
  licensePlate: string;
  gateIn: string;
  floorId?: string;
  slotId?: string;
}

export const sessionService = {
  checkIn: async (payload: CheckInPayload): Promise<{ success: boolean; data: ParkingSession; message?: string }> => {
    return apiClient.post('/sessions/check-in', payload);
  },
  searchSession: async (params: { cardCode?: string; licensePlate?: string; code?: string }): Promise<{ success: boolean; data: ParkingSession }> => {
    return apiClient.get('/sessions/search', { params });
  },
  calculateFee: async (id: string): Promise<{ success: boolean; data: { totalFee: number; discount: number; finalFee: number; pricingPlan: any } }> => {
    return apiClient.get(`/sessions/${id}/fee`);
  },
  checkOut: async (id: string, payload: { gateOut: string }): Promise<{ success: boolean; data: ParkingSession; message?: string }> => {
    return apiClient.post(`/sessions/${id}/check-out`, payload);
  },
  getActiveSessions: async (params: any): Promise<{ success: boolean; data: ParkingSession[]; pagination?: any }> => {
    return apiClient.get('/sessions/active', { params });
  },
};
