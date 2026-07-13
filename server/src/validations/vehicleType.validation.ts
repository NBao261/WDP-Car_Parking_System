import { z } from 'zod';

export const createVehicleTypeSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(1),
    code: z.string({ required_error: 'Code is required' }).min(1),
    description: z.string().optional(),
    icon: z.string().optional(),
  }),
});

export const updateVehicleTypeSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    code: z.string().min(1).optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
  }),
});

