import { z } from 'zod';
import { UserRole } from '../models/user.model';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// FR-19: Tạo vai trò
export const createRoleSchema = z.object({
  body: z.object({
    code: z.nativeEnum(UserRole, { required_error: 'Role code is required' }),
    name: z.string({ required_error: 'Role name is required' }).min(1, 'Role name is required'),
    description: z.string().optional(),
    permissions: z.array(z.string()).optional(),
  }),
});

// FR-19: Cập nhật quyền cho vai trò
export const updatePermissionsSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid role ID format'),
  }),
  body: z.object({
    permissions: z
      .array(z.string({ required_error: 'Permission must be a string' }), {
        required_error: 'Permissions array is required',
      })
      .min(0),
  }),
});

// FR-19: Gán vai trò cho user (PQ-05: Phân quyền động)
export const assignRoleSchema = z.object({
  body: z.object({
    userId: z
      .string({ required_error: 'User ID is required' })
      .regex(objectIdRegex, 'Invalid user ID format'),
    roleCode: z.nativeEnum(UserRole, { required_error: 'Role code is required' }),
    customPermissions: z.array(z.string()).optional(),
  }),
});
