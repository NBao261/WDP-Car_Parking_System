import mongoose, { Schema, Document } from 'mongoose';

export enum SlotSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export interface IVehicleType extends Document {
  name: string;
  code: string;
  slotSize: SlotSize;
  description: string;
  icon: string;
  floors: mongoose.Types.ObjectId[]; 
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const vehicleTypeSchema = new Schema<IVehicleType>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    slotSize: { type: String, enum: Object.values(SlotSize), required: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },
    floors: [{ type: Schema.Types.ObjectId, ref: 'Floor' }], 
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

vehicleTypeSchema.index({ floors: 1 });

export const VehicleType = mongoose.model<IVehicleType>('VehicleType', vehicleTypeSchema);
