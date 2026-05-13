import mongoose, { Schema, Document } from 'mongoose';

export enum FeeType {
  PER_TURN = 'per_turn',
  HOURLY = 'hourly',
  DAILY = 'daily',
  MONTHLY = 'monthly',
}

export interface IPricingRate {
  label: string; // e.g. "Giờ đầu", "Giờ tiếp theo", "Qua đêm"
  amount: number;
  unit: string;
}

export interface IPricingPlan extends Document {
  name: string;
  vehicleTypeId: mongoose.Types.ObjectId;
  facilityId: mongoose.Types.ObjectId;
  feeType: FeeType;
  rates: IPricingRate[];
  overnightFee: number;
  overtimeFeePerHour: number;
  lostCardFee: number;
  status: 'active' | 'inactive';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pricingPlanSchema = new Schema<IPricingPlan>(
  {
    name: { type: String, required: true, trim: true },
    vehicleTypeId: { type: Schema.Types.ObjectId, ref: 'VehicleType', required: true },
    facilityId: { type: Schema.Types.ObjectId, ref: 'ParkingFacility', required: true },
    feeType: { type: String, enum: Object.values(FeeType), required: true },
    rates: [
      {
        label: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
        unit: { type: String, required: true },
      },
    ],
    overnightFee: { type: Number, default: 0, min: 0 },
    overtimeFeePerHour: { type: Number, default: 0, min: 0 },
    lostCardFee: { type: Number, default: 50000, min: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

pricingPlanSchema.index({ facilityId: 1, vehicleTypeId: 1, status: 1 });

export const PricingPlan = mongoose.model<IPricingPlan>('PricingPlan', pricingPlanSchema);
