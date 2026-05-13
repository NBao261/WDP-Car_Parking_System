import mongoose, { Schema, Document } from 'mongoose';

export enum ExceptionType {
  LOST_CARD = 'lost_card',
  WRONG_PLATE = 'wrong_plate',
  OVERTIME = 'overtime',
  WRONG_ZONE = 'wrong_zone',
  UNPAID = 'unpaid',
  OTHER = 'other',
}

export enum ExceptionStatus {
  NEW = 'new',
  PROCESSING = 'processing',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

export interface IException extends Document {
  sessionId: mongoose.Types.ObjectId;
  type: ExceptionType;
  description: string;
  staffId: mongoose.Types.ObjectId;
  managerId: mongoose.Types.ObjectId | null;
  managerNote: string;
  surcharge: number;
  status: ExceptionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const exceptionSchema = new Schema<IException>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'ParkingSession', required: true },
    type: { type: String, enum: Object.values(ExceptionType), required: true },
    description: { type: String, required: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    managerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    managerNote: { type: String, default: '' },
    surcharge: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: Object.values(ExceptionStatus), default: ExceptionStatus.NEW },
  },
  { timestamps: true }
);

exceptionSchema.index({ sessionId: 1 });
exceptionSchema.index({ type: 1, status: 1 });

export const Exception = mongoose.model<IException>('Exception', exceptionSchema);
