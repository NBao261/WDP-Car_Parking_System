export interface Facility {
  _id: string;
  name: string;
  address: string;
  totalFloors: number;
  openTime: string;   // HH:mm
  closeTime: string;  // HH:mm
  description?: string;
  images?: string[];
  // GeoJSON Point — coordinates: [longitude, latitude]
  location?: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  status: 'active' | 'inactive';
  // Virtual field added by mobile after fetching available-slots
  availableSlots?: number | null;
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
