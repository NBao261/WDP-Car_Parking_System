import mongoose, { Schema, Document } from 'mongoose';

export interface IVehicleType extends Document {
  name: string;
  code: string;
  description: string;
  icon: string;
  color: string;
  requiresPlate: boolean;
  floors: mongoose.Types.ObjectId[]; 
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const vehicleTypeSchema = new Schema<IVehicleType>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },
    color: { type: String, default: '' },
    requiresPlate: { type: Boolean, default: true },
    floors: [{ type: Schema.Types.ObjectId, ref: 'Floor' }], 
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

vehicleTypeSchema.index({ floors: 1 });

export const VehicleType = mongoose.model<IVehicleType>('VehicleType', vehicleTypeSchema);
