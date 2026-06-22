import mongoose, { Schema, Document } from 'mongoose';

// ─── Interface ────────────────────────────────────────────
export interface IChatHistory extends Document {
  userId: mongoose.Types.ObjectId;
  conversationId: string;
  title?: string;
  isFirstMessage?: boolean;
  message: string;
  intent: string;
  entities: Record<string, any>;
  response: string;
  responseData: Record<string, any>;
  chartType?: 'bar' | 'line' | 'pie' | 'table' | null;
  processingTimeMs: number;
  facilityScope?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────
const chatHistorySchema = new Schema<IChatHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    conversationId: { type: String, required: true, index: true },
    title: { type: String, trim: true, default: '' },
    isFirstMessage: { type: Boolean, default: false },
    message: { type: String, required: true, trim: true },
    intent: { type: String, required: true, trim: true },
    entities: { type: Schema.Types.Mixed, default: {} },
    response: { type: String, required: true },
    responseData: { type: Schema.Types.Mixed, default: {} },
    chartType: {
      type: String,
      enum: ['bar', 'line', 'pie', 'table', null],
      default: null,
    },
    processingTimeMs: { type: Number, default: 0 },
    facilityScope: [{ type: Schema.Types.ObjectId, ref: 'ParkingFacility' }],
  },
  { timestamps: true }
);

// Index cho query lịch sử chat nhanh
chatHistorySchema.index({ userId: 1, createdAt: -1 });
chatHistorySchema.index({ conversationId: 1, createdAt: -1 });

export const ChatHistory = mongoose.model<IChatHistory>('ChatHistory', chatHistorySchema);
