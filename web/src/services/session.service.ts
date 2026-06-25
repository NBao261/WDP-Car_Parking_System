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
  checkInImage?: string;
}

export interface CheckInPayload {
  facilityId: string;
  vehicleTypeId: string;
  licensePlate: string;
  gateIn: string;
  floorId?: string;
  slotId?: string;
  reservationCode?: string; // Thêm cho luồng đặt chỗ trước
  checkInImage?: string; // Ảnh xe đầu vào (URL hoặc base64)
}

export const sessionService = {
  checkIn: async (
    payload: CheckInPayload
  ): Promise<{ success: boolean; data: ParkingSession; message?: string }> => {
    return apiClient.post('/sessions/check-in', payload);
  },
  searchSession: async (params: {
    cardCode?: string;
    licensePlate?: string;
    code?: string;
  }): Promise<{ success: boolean; data: ParkingSession }> => {
    return apiClient.get('/sessions/search', { params });
  },
  getTodayTraffic: async (facilityId?: string) => {
    const params = facilityId ? `?facilityId=${facilityId}` : '';
    return apiClient.get(`/sessions/today-traffic${params}`);
  },
  calculateFee: async (
    id: string
  ): Promise<{
    success: boolean;
    data: { totalFee: number; discount: number; finalFee: number; pricingPlan: any };
  }> => {
    return apiClient.get(`/sessions/${id}/fee`);
  },
  checkOut: async (
    id: string,
    payload: { gateOut: string; checkOutImage?: string }
  ): Promise<{ success: boolean; data: ParkingSession; message?: string }> => {
    return apiClient.post(`/sessions/${id}/check-out`, payload);
  },
  getActiveSessions: async (
    params: any
  ): Promise<{ success: boolean; data: ParkingSession[]; pagination?: any }> => {
    return apiClient.get('/sessions/active', { params });
  },
  getMySessions: async (): Promise<{ success: boolean; data: ParkingSession[] }> => {
    return apiClient.get('/sessions/my-sessions');
  },
};
