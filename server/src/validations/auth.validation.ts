import { z } from 'zod';
import { UserRole } from '../models/user.model';

// FR-18.1: Register (Admin tạo tài khoản)
export const registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format'),
    phone: z
      .string({ required_error: 'Phone is required' })
      .regex(/^(0|\+84)\d{9,10}$/, 'Invalid phone number format'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters'),
    role: z.nativeEnum(UserRole, { required_error: 'Role is required' }),
    assignedFacilities: z
      .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid facility ID'))
      .optional(),
  }),
});

// Login
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format'),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password is required'),
  }),
});

// Refresh Token
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z
      .string({ required_error: 'Refresh token is required' })
      .min(1, 'Refresh token is required'),
  }),
});
