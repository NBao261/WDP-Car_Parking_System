import mongoose, { Schema, Document } from 'mongoose';

// ─── Enums ────────────────────────────────────────────
export enum FacilityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

// ─── Interface ────────────────────────────────────────
export interface IParkingFacility extends Document {
  name: string;
  address: string;
  totalFloors: number;
  openTime: string; // HH:mm
  closeTime: string; // HH:mm
  description: string;
  images: string[];
  assignedUsers: mongoose.Types.ObjectId[]; // Two-way ref: các user được phân công tại bãi này
  status: FacilityStatus;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

// ─── Schema ───────────────────────────────────────────
const parkingFacilitySchema = new Schema<IParkingFacility>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    address: { type: String, required: true, trim: true },
    totalFloors: { type: Number, required: true, min: 1 },
    openTime: { type: String, required: true },
    closeTime: { type: String, required: true },
    description: { type: String, default: '' },
    images: [{ type: String }],
    assignedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Two-way ref ↔ User.assignedFacilities
    status: { type: String, enum: Object.values(FacilityStatus), default: FacilityStatus.ACTIVE },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

parkingFacilitySchema.index({ status: 1 });
parkingFacilitySchema.index({ assignedUsers: 1 });

export const ParkingFacility = mongoose.model<IParkingFacility>('ParkingFacility', parkingFacilitySchema);
