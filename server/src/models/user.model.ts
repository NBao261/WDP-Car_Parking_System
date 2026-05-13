import mongoose, { Schema, Document } from 'mongoose';

// ─── Enums ────────────────────────────────────────────
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  STAFF = 'staff',
  DRIVER = 'driver',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  LOCKED = 'locked',
}

// ─── Interface ────────────────────────────────────────
export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  assignedFacilities: mongoose.Types.ObjectId[];
  customPermissions: string[];
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  mustChangePassword: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

// ─── Schema ───────────────────────────────────────────
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(UserRole), required: true },
    status: { type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE },
    assignedFacilities: [{ type: Schema.Types.ObjectId, ref: 'ParkingFacility' }],
    customPermissions: [{ type: String }],
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    mustChangePassword: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
