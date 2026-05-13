import mongoose, { Schema, Document } from 'mongoose';

export enum PaymentMethod {
  CASH = 'cash',
  QR_PAY = 'qr_pay',
  E_WALLET = 'e_wallet',
  BANK_CARD = 'bank_card',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface IPayment extends Document {
  sessionId: mongoose.Types.ObjectId;
  transactionCode: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  staffId: mongoose.Types.ObjectId | null;
  driverId: mongoose.Types.ObjectId | null;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'ParkingSession', required: true },
    transactionCode: { type: String, required: true, unique: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: Object.values(PaymentMethod), required: true },
    status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
    staffId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    driverId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    note: { type: String, default: '' },
  },
  { timestamps: true }
);

paymentSchema.index({ sessionId: 1 });
paymentSchema.index({ createdAt: -1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
