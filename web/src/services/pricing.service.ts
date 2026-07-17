import { apiClient } from './api';

export type FeeType = 'per_turn' | 'hourly' | 'daily' | 'monthly';

export interface PricingRate {
  label: string;
  amount: number;
  unit: string;
  startTime?: string;
  endTime?: string;
}

export interface PricingPlan {
  _id: string;
  name: string;
  vehicleTypeId: string | { _id: string; name: string; code: string; icon: string };
  facilityId: string | { _id: string; name: string };
  feeType: FeeType;
  feeMethod?: string;
  rates: PricingRate[];
  overnightFee: number;
  overtimeFeePerHour: number;
  lostCardFee: number;
  gracePeriodMinutes: number;
  maxDailyFee: number;
  firstBlockHours: number;
  status: 'active' | 'inactive';
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PricingPlanListResponse {
  success: boolean;
  data: PricingPlan[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreatePricingPlanPayload {
  name: string;
  vehicleTypeId: string;
  facilityId: string;
  feeType: FeeType;
  feeMethod?: string;
  rates: PricingRate[];
  overnightFee?: number;
  overtimeFeePerHour?: number;
  lostCardFee?: number;
  gracePeriodMinutes?: number;
  maxDailyFee?: number;
  firstBlockHours?: number;
}

export interface UpdatePricingPlanPayload {
  name?: string;
  feeType?: FeeType;
  feeMethod?: string;
  rates?: PricingRate[];
  overnightFee?: number;
  overtimeFeePerHour?: number;
  lostCardFee?: number;
  gracePeriodMinutes?: number;
  maxDailyFee?: number;
  firstBlockHours?: number;
  status?: 'active' | 'inactive';
}

export const pricingService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    facilityId?: string;
    vehicleTypeId?: string;
    status?: string;
  }): Promise<PricingPlanListResponse> => {
    return apiClient.get('/pricing', { params });
  },

  getById: async (id: string): Promise<{ success: boolean; data: PricingPlan }> => {
    return apiClient.get(`/pricing/${id}`);
  },

  create: async (
    payload: CreatePricingPlanPayload
  ): Promise<{ success: boolean; data: PricingPlan }> => {
    return apiClient.post('/pricing', payload);
  },

  update: async (
    id: string,
    payload: UpdatePricingPlanPayload
  ): Promise<{ success: boolean; data: PricingPlan }> => {
    return apiClient.patch(`/pricing/${id}`, payload);
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete(`/pricing/${id}`);
  },

  getActiveSessionCount: async (id: string): Promise<{ success: boolean; data: { activeSessionCount: number } }> => {
    return apiClient.get(`/pricing/${id}/active-sessions`);
  },
};
