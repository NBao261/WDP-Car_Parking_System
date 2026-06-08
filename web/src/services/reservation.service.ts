import { apiClient } from './api';

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  USED = 'used',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export interface IReservation {
  _id: string;
  code: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  facilityId: {
    _id: string;
    name: string;
    address: string;
  };
  vehicleTypeId: {
    _id: string;
    name: string;
  };
  slotId: {
    _id: string;
    code: string;
    floorId: string;
  } | null;
  licensePlate: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  cancellationFee: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationFilterParams {
  page?: number;
  limit?: number;
  status?: ReservationStatus | string;
  facilityId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const reservationService = {
  getReservations: async (params: ReservationFilterParams): Promise<{ success: boolean; data: IReservation[]; pagination?: { total: number; page: number; totalPages: number } }> => {
    return apiClient.get('/reservations', { params });
  },
  getReservationById: async (id: string): Promise<{ success: boolean; data: IReservation }> => {
    return apiClient.get(`/reservations/${id}`);
  },
  checkReservationByPlate: async (plate: string): Promise<{ success: boolean; data: IReservation | null }> => {
    try {
      const response = await apiClient.get('/reservations', {
        params: {
          licensePlate: plate,
          status: ReservationStatus.CONFIRMED,
          limit: 10
        }
      });
      // Handle both cases: response.data is array or response.data.data is array
      const rawData = response.data;
      const reservations: IReservation[] = Array.isArray(rawData) ? rawData : (rawData?.data || []);

      if (response.success && reservations.length > 0) {
        const now = new Date().getTime();

        const activeReservations = reservations.filter(res => new Date(res.endTime).getTime() >= now);

        if (activeReservations.length === 0) {
          return { success: true, data: null };
        }

        let bestMatch = null;
        for (const res of activeReservations) {
          const startTime = new Date(res.startTime).getTime();
          const endTime = new Date(res.endTime).getTime();
          const earlyWindow = startTime - 30 * 60 * 1000;

          // Check if current time is within the allowed check-in window
          if (now >= earlyWindow && now <= endTime) {
            bestMatch = res;
            break;
          }
        }

        // If no exact time match, pick the closest upcoming reservation
        if (!bestMatch) {
          bestMatch = activeReservations.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];
        }

        return { success: true, data: bestMatch };
      }
      return { success: true, data: null };
    } catch (error) {
      console.error("Error checking reservation:", error);
      return { success: false, data: null };
    }
  }
};
