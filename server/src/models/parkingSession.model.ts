import mongoose, { Schema, Document } from 'mongoose';

export enum SessionStatus {
  ACTIVE = 'active',
  PENDING_PAYMENT = 'pending_payment',
  COMPLETED = 'completed',
  EXCEPTION = 'exception',
}

export interface IParkingSession extends Document {
  code: string;
  licensePlate: string;
  vehicleTypeId: mongoose.Types.ObjectId;
  facilityId: mongoose.Types.ObjectId;
  floorId: mongoose.Types.ObjectId;
  slotId: mongoose.Types.ObjectId;
  pricingPlanId: mongoose.Types.ObjectId;
  checkInTime: Date;
  checkOutTime: Date | null;
  gateIn: string;
  gateOut: string;
  staffInId: mongoose.Types.ObjectId;
  staffOutId: mongoose.Types.ObjectId | null;
  driverId: mongoose.Types.ObjectId | null;
  reservationId: mongoose.Types.ObjectId | null;
  totalFee: number;
  assignmentMode: 'auto' | 'manual'; // RQ-ready: ghi nhận cách phân bổ slot
  status: SessionStatus;
  cardCode: string;
  checkInImage?: string;
  checkOutImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const parkingSessionSchema = new Schema<IParkingSession>(
  {
    code: { type: String, required: true, unique: true },
    licensePlate: { type: String, required: true, uppercase: true, trim: true },
    vehicleTypeId: { type: Schema.Types.ObjectId, ref: 'VehicleType', required: true },
    facilityId: { type: Schema.Types.ObjectId, ref: 'ParkingFacility', required: true },
    floorId: { type: Schema.Types.ObjectId, ref: 'Floor', required: true },
    slotId: { type: Schema.Types.ObjectId, ref: 'ParkingSlot', required: true },
    pricingPlanId: { type: Schema.Types.ObjectId, ref: 'PricingPlan', required: true },
    checkInTime: { type: Date, required: true, default: Date.now },
    checkOutTime: { type: Date, default: null },
    gateIn: { type: String, required: true },
    gateOut: { type: String, default: '' },
    staffInId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    staffOutId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    driverId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reservationId: { type: Schema.Types.ObjectId, ref: 'Reservation', default: null },
    totalFee: { type: Number, default: 0, min: 0 },
    assignmentMode: { type: String, enum: ['auto', 'manual'], default: 'manual' }, // RQ-ready
    status: { type: String, enum: Object.values(SessionStatus), default: SessionStatus.ACTIVE },
    cardCode: { type: String, required: true, unique: true },
    checkInImage: { type: String, default: null },
    checkOutImage: { type: String, default: null },
  },
  { timestamps: true }
);

parkingSessionSchema.index({ licensePlate: 1, status: 1 });
parkingSessionSchema.index({ facilityId: 1, status: 1 });
parkingSessionSchema.index({ checkInTime: -1 });

export const ParkingSession = mongoose.model<IParkingSession>(
  'ParkingSession',
  parkingSessionSchema
);
