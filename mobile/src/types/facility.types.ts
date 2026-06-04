export interface Facility {
  _id: string;
  name: string;
  address: string;
  location?: { lat: number; lng: number };
  status: 'active' | 'inactive';
  operationHours?: {
    open: string;
    close: string;
  };
  capacity?: number;
}

export interface VehicleTypeInfo {
  _id: string;
  name: string;
  code: string;
  slotSize: string;
  icon?: string;
}

export interface PricingRate {
  label: string;
  amount: number;
  unit: string;
  startTime?: string;
  endTime?: string;
}

export interface PricingPlan {
  _id: string;
  facilityId: string;
  vehicleTypeId: VehicleTypeInfo;
  name: string;
  feeType: string;
  feeMethod: string;
  rates: PricingRate[];
  overnightFee: number;
  overtimeFeePerHour: number;
  status: string;
}

export interface AvailableSlot {
  vehicleTypeId: string;
  vehicleTypeCode: string;
  vehicleTypeName: string;
  availableCount: number;
}
