import { apiClient } from './api';
import { Facility } from './facility.service';
import { PricingPlan } from './pricing.service';
import { ParkingSlot } from './slot.service';

export interface PublicFacilityListResponse {
  success: boolean;
  data: Facility[];
}

export interface PublicPricingResponse {
  success: boolean;
  data: PricingPlan[];
}

export interface AvailableSlotCount {
  vehicleTypeId: string;
  vehicleTypeCode: string;
  vehicleTypeName: string;
  availableCount: number;
}

export interface PublicAvailableSlotsResponse {
  success: boolean;
  data: AvailableSlotCount[];
}

export const publicService = {
  getFacilities: async (): Promise<PublicFacilityListResponse> => {
    return apiClient.get('/public/facilities');
  },

  getPricing: async (facilityId: string): Promise<PublicPricingResponse> => {
    return apiClient.get(`/public/facilities/${facilityId}/pricing`);
  },

  getAvailableSlots: async (facilityId: string): Promise<PublicAvailableSlotsResponse> => {
    return apiClient.get(`/public/facilities/${facilityId}/available-slots`);
  },
};
