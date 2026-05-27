import mongoose, { Schema, Document } from 'mongoose';

export enum FeeType {
  PER_TURN = 'per_turn',
  HOURLY = 'hourly',
  DAILY = 'daily',
}

export enum FeeMethod {
  FLAT_RATE = 'flat_rate',           // Đồng giá theo lượt (per_turn)
  DURATION_BASED = 'duration_based', // Theo độ dài thời gian gửi (hourly/daily)
  TIME_WINDOW = 'time_window',       // Theo khung giờ trong ngày (VD: 6h-16h = 4000đ)
}

export interface IPricingRate {
  label: string;       // e.g. "Giờ đầu", "6h-16h", "Phí lượt"
  amount: number;
  unit: string;
  startTime?: string;  // "06:00" — chỉ dùng khi feeMethod = time_window
  endTime?: string;    // "16:00" — chỉ dùng khi feeMethod = time_window
}

export interface IPricingPlan extends Document {
  name: string;
  vehicleTypeId: mongoose.Types.ObjectId;
  facilityId: mongoose.Types.ObjectId;
  feeType: FeeType;
  feeMethod: FeeMethod;
  rates: IPricingRate[];
  overnightFee: number;
  overtimeFeePerHour: number;
  lostCardFee: number;
  gracePeriodMinutes: number;
  maxDailyFee: number;
  firstBlockHours: number;
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
    feeMethod: { type: String, enum: Object.values(FeeMethod), default: FeeMethod.DURATION_BASED },
    rates: [
      {
        label: { type: String, required: true },
        amount: { type: Number, required: true, min: 0 },
        unit: { type: String, required: true },
        startTime: { type: String },  // "HH:MM" — chỉ dùng cho time_window
        endTime: { type: String },    // "HH:MM" — chỉ dùng cho time_window
      },
    ],
    overnightFee: { type: Number, default: 0, min: 0 },
    overtimeFeePerHour: { type: Number, default: 0, min: 0 },
    lostCardFee: { type: Number, default: 50000, min: 0 },
    gracePeriodMinutes: { type: Number, default: 0, min: 0, max: 60 },
    maxDailyFee: { type: Number, default: 0, min: 0 }, // 0 = không giới hạn
    firstBlockHours: { type: Number, default: 1, min: 1 }, // Số giờ của mốc đầu tiên (mặc định là 1)
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

pricingPlanSchema.index({ facilityId: 1, vehicleTypeId: 1, status: 1 });

export const PricingPlan = mongoose.model<IPricingPlan>('PricingPlan', pricingPlanSchema);
