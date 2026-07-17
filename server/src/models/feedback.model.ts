import mongoose, { Schema, Document } from 'mongoose';

export enum FeedbackType {
  LOST_CARD = 'lost_card',
  WRONG_FEE = 'wrong_fee',
  HARD_TO_FIND = 'hard_to_find',
  SLOT_OCCUPIED = 'slot_occupied',
  OTHER = 'other',
}

export enum FeedbackStatus {
  SUBMITTED = 'submitted',
  PROCESSING = 'processing',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
}

export interface IFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  facilityId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  type: FeedbackType;
  description: string;
  images: string[];
  status: FeedbackStatus;
  responseNote: string;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    facilityId: { type: Schema.Types.ObjectId, ref: 'ParkingFacility', required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'ParkingSession', required: true },
    type: { type: String, enum: Object.values(FeedbackType), required: true },
    description: { type: String, required: true },
    images: [{ type: String }],
    status: { type: String, enum: Object.values(FeedbackStatus), default: FeedbackStatus.SUBMITTED },
    responseNote: { type: String, default: '' },
  },
  { timestamps: true }
);

feedbackSchema.index({ userId: 1 });
feedbackSchema.index({ facilityId: 1 });
feedbackSchema.index({ status: 1 });

export const Feedback = mongoose.model<IFeedback>('Feedback', feedbackSchema);
