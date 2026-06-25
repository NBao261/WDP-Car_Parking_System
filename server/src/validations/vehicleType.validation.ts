import { z } from 'zod';
import { SlotSize } from '../models/vehicleType.model';

export const createVehicleTypeSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(1),
    code: z.string({ required_error: 'Code is required' }).min(1),
    slotSize: z.nativeEnum(SlotSize, { required_error: 'Slot size is required' }),
    description: z.string().optional(),
    icon: z.string().optional(),
  }),
});

export const updateVehicleTypeSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    code: z.string().min(1).optional(),
    slotSize: z.nativeEnum(SlotSize).optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
  }),
});
