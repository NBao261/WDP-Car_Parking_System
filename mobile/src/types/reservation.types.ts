export type ReservationStatus = 'pending' | 'confirmed' | 'used' | 'cancelled' | 'expired';

export interface Reservation {
  _id: string;
  code: string;
  facilityId: {
    _id: string;
    name: string;
    address?: string;
  };
  vehicleTypeId: {
    _id: string;
    name: string;
  };
  slotId?: {
    _id: string;
    code: string;
    floorId: string;
  };
  licensePlate: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  status: ReservationStatus;
  cancellationFee?: number;
  createdAt: string;
}
