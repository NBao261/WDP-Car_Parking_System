import mongoose, { Schema, Document } from 'mongoose';

export interface IFloor extends Document {
  facilityId: mongoose.Types.ObjectId;
  name: string;
  allowedVehicleTypes: mongoose.Types.ObjectId[];
  totalSlots: number;
  distanceToGate: number | null; // RQ-ready: khoảng cách tầng đến cổng/thang máy (mét)
  status: 'active' | 'inactive';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const floorSchema = new Schema<IFloor>(
  {
    facilityId: { type: Schema.Types.ObjectId, ref: 'ParkingFacility', required: true },
    name: { type: String, required: true, trim: true },
    allowedVehicleTypes: [{ type: Schema.Types.ObjectId, ref: 'VehicleType' }],
    totalSlots: { type: Number, default: 0 },
    distanceToGate: { type: Number, default: null, min: 0 }, // RQ-ready: khoảng cách đến cổng (m)
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

floorSchema.index({ facilityId: 1, status: 1 });

export const Floor = mongoose.model<IFloor>('Floor', floorSchema);
