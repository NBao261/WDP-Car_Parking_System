import { apiClient } from './api';

export interface CreateReservationPayload {
  facilityId: string;
  vehicleTypeId: string;
  licensePlate: string;
  startTime: string; // ISO string
}

export interface Reservation {
  _id: string;
  code: string;
  userId: any;
  facilityId: any;
  vehicleTypeId: any;
  slotId: any;
  licensePlate: string;
  startTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'USED' | 'CANCELLED' | 'EXPIRED';
  cancellationFee: number;
  createdAt: string;
}

export const reservationService = {
  create: async (payload: CreateReservationPayload): Promise<{ success: boolean; data: Reservation }> => {
    return apiClient.post('/reservations', payload);
  },

  getMyReservations: async (params?: any): Promise<{ success: boolean; data: Reservation[]; pagination: any }> => {
    return apiClient.get('/reservations', { params });
  },

  cancel: async (id: string): Promise<{ success: boolean; data: Reservation }> => {
    return apiClient.post(`/reservations/${id}/cancel`);
  },

  getById: async (id: string): Promise<{ success: boolean; data: Reservation }> => {
    return apiClient.get(`/reservations/${id}`);
  }
};
