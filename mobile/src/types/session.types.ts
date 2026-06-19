export type SessionStatus = 'active' | 'pending_payment' | 'completed' | 'exception';

export interface ParkingSession {
  _id: string;
  code: string;
  licensePlate: string;
  facilityName: string;
  floorName: string;
  slotCode: string;
  vehicleTypeName: string;
  checkInTime: string;
  checkOutTime: string | null;
  status: SessionStatus;
  totalFee: number;
  pricingPlan?: any; 
}
