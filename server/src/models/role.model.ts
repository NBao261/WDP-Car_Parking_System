import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from './user.model';

export interface IRole extends Document {
  code: UserRole;
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    code: { type: String, enum: Object.values(UserRole), required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    permissions: [{ type: String }],
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Role = mongoose.model<IRole>('Role', roleSchema);
