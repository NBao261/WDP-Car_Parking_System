import mongoose, { Schema, Document } from 'mongoose';

export interface IVehicle extends Document {
  userId: mongoose.Types.ObjectId;
  vehicleTypeId: mongoose.Types.ObjectId;
  licensePlate: string;
  nickname: string;
  image: string;
  isDefault: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleTypeId: { type: Schema.Types.ObjectId, ref: 'VehicleType', required: true },
    licensePlate: { type: String, required: true, uppercase: true, trim: true },
    nickname: { type: String, default: '', trim: true },
    image: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Unique biển số per user (chỉ trong các xe chưa bị xoá)
vehicleSchema.index(
  { userId: 1, licensePlate: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

vehicleSchema.index({ userId: 1, isDeleted: 1 });

export const Vehicle = mongoose.model<IVehicle>('Vehicle', vehicleSchema);
