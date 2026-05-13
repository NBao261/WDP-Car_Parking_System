import { z } from 'zod';
import { FeeType } from '../models/pricingPlan.model';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// Schema con cho mảng rates
const pricingRateSchema = z.object({
  label: z.string({ required_error: 'Rate label is required' }).min(1, 'Rate label is required'),
  amount: z
    .number({ required_error: 'Rate amount is required' })
    .min(0, 'Rate amount must be non-negative'),
  unit: z.string({ required_error: 'Rate unit is required' }).min(1, 'Rate unit is required'),
});

// FR-5.1: Tạo bảng giá
export const createPricingPlanSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(1, 'Name is required'),
    vehicleTypeId: z
      .string({ required_error: 'Vehicle type ID is required' })
      .regex(objectIdRegex, 'Invalid vehicle type ID format'),
    facilityId: z
      .string({ required_error: 'Facility ID is required' })
      .regex(objectIdRegex, 'Invalid facility ID format'),
    feeType: z.nativeEnum(FeeType, { required_error: 'Fee type is required' }),
    rates: z
      .array(pricingRateSchema, { required_error: 'Rates are required' })
      .min(1, 'At least one rate is required'),
    overnightFee: z.number().min(0, 'Overnight fee must be non-negative').optional(),
    overtimeFeePerHour: z.number().min(0, 'Overtime fee must be non-negative').optional(),
    lostCardFee: z.number().min(0, 'Lost card fee must be non-negative').optional(),
  }),
});

// FR-5.3: Sửa bảng giá
export const updatePricingPlanSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    feeType: z.nativeEnum(FeeType).optional(),
    rates: z.array(pricingRateSchema).min(1).optional(),
    overnightFee: z.number().min(0).optional(),
    overtimeFeePerHour: z.number().min(0).optional(),
    lostCardFee: z.number().min(0).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});
