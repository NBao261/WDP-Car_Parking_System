import { z } from 'zod';

export const createVehicleTypeSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(1),
    code: z.string({ required_error: 'Code is required' }).min(1).regex(/^[A-Z0-9_]+$/, 'Code can only contain uppercase letters, numbers and underscores'),
    description: z.string().optional(),
    icon: z.string().optional(),
  }),
});

export const updateVehicleTypeSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    code: z.string().min(1).regex(/^[A-Z0-9_]+$/, 'Code can only contain uppercase letters, numbers and underscores').optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
  }),
});

