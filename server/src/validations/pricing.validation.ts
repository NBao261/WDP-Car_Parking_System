import { z } from 'zod';
import { FeeType, FeeMethod } from '../models/pricingPlan.model';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM format

// Schema con cho mảng rates
const pricingRateSchema = z.object({
  label: z.string({ required_error: 'Rate label is required' }).min(1, 'Rate label is required'),
  amount: z
    .number({ required_error: 'Rate amount is required' })
    .min(0, 'Rate amount must be non-negative'),
  unit: z.string({ required_error: 'Rate unit is required' }).min(1, 'Rate unit is required'),
  startTime: z.string().regex(timeRegex, 'startTime must be in HH:MM format (00:00-23:59)').optional(),
  endTime: z.string().regex(timeRegex, 'endTime must be in HH:MM format (00:00-23:59)').optional(),
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
    feeMethod: z.nativeEnum(FeeMethod).optional(),
    rates: z
      .array(pricingRateSchema, { required_error: 'Rates are required' })
      .min(1, 'At least one rate is required'),
    overnightFee: z.number().min(0, 'Overnight fee must be non-negative').optional(),
    overtimeFeePerHour: z.number().min(0, 'Overtime fee must be non-negative').optional(),
    lostCardFee: z.number().min(0, 'Lost card fee must be non-negative').optional(),
    gracePeriodMinutes: z.number().min(0, 'Grace period must be non-negative').max(60, 'Grace period cannot exceed 60 minutes').optional(),
    maxDailyFee: z.number().min(0, 'Max daily fee must be non-negative').optional(),
    firstBlockHours: z.number().min(1, 'First block hours must be at least 1').optional(),
  }).refine((data) => {
    // Cross-field validation: time_window rates phải có startTime + endTime
    if (data.feeMethod === FeeMethod.TIME_WINDOW) {
      return data.rates.every(r => r.startTime && r.endTime);
    }
    return true;
  }, {
    message: 'Khi feeMethod là time_window, mỗi rate phải có startTime và endTime (HH:MM)',
    path: ['rates'],
  }).refine((data) => {
    // flat_rate chỉ được có 1 rate
    if (data.feeMethod === FeeMethod.FLAT_RATE && data.rates.length > 1) {
      return false;
    }
    return true;
  }, {
    message: 'Khi feeMethod là flat_rate, rates chỉ được có 1 phần tử',
    path: ['rates'],
  }).refine((data) => {
    // per_turn buộc flat_rate
    if (data.feeType === FeeType.PER_TURN && data.feeMethod && data.feeMethod !== FeeMethod.FLAT_RATE) {
      return false;
    }
    return true;
  }, {
    message: 'feeType per_turn chỉ hỗ trợ feeMethod flat_rate',
    path: ['feeMethod'],
  }),
});

// FR-5.3: Sửa bảng giá
export const updatePricingPlanSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    feeType: z.nativeEnum(FeeType).optional(),
    feeMethod: z.nativeEnum(FeeMethod).optional(),
    rates: z.array(pricingRateSchema).min(1).optional(),
    overnightFee: z.number().min(0).optional(),
    overtimeFeePerHour: z.number().min(0).optional(),
    lostCardFee: z.number().min(0).optional(),
    gracePeriodMinutes: z.number().min(0).max(60).optional(),
    maxDailyFee: z.number().min(0).optional(),
    firstBlockHours: z.number().min(1).optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }).refine((data) => {
    // Cross-field validation khi cập nhật rates với feeMethod time_window
    if (data.feeMethod === FeeMethod.TIME_WINDOW && data.rates) {
      return data.rates.every(r => r.startTime && r.endTime);
    }
    return true;
  }, {
    message: 'Khi feeMethod là time_window, mỗi rate phải có startTime và endTime (HH:MM)',
    path: ['rates'],
  }),
});
