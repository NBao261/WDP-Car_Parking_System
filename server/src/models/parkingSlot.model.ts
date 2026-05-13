import mongoose, { Schema, Document } from 'mongoose';

export enum SlotStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  MAINTENANCE = 'maintenance',
  LOCKED = 'locked',
}

export interface IParkingSlot extends Document {
  code: string;
  floorId: mongoose.Types.ObjectId;
  facilityId: mongoose.Types.ObjectId;
  vehicleTypeId: mongoose.Types.ObjectId;
  status: SlotStatus;
  currentSessionId: mongoose.Types.ObjectId | null;
  maintenanceReason: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const parkingSlotSchema = new Schema<IParkingSlot>(
  {
    code: { type: String, required: true, trim: true },
    floorId: { type: Schema.Types.ObjectId, ref: 'Floor', required: true },
    facilityId: { type: Schema.Types.ObjectId, ref: 'ParkingFacility', required: true },
    vehicleTypeId: { type: Schema.Types.ObjectId, ref: 'VehicleType', required: true },
    status: { type: String, enum: Object.values(SlotStatus), default: SlotStatus.AVAILABLE },
    currentSessionId: { type: Schema.Types.ObjectId, ref: 'ParkingSession', default: null },
    maintenanceReason: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

parkingSlotSchema.index({ facilityId: 1, floorId: 1, status: 1 });
parkingSlotSchema.index({ code: 1, facilityId: 1 }, { unique: true });

export const ParkingSlot = mongoose.model<IParkingSlot>('ParkingSlot', parkingSlotSchema);
