import { z } from 'zod';
import { ExceptionType, ExceptionStatus } from '../models/exception.model';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createExceptionSchema = z.object({
  body: z.object({
    sessionId: z.string({ required_error: 'ID lượt gửi không được để trống' }).regex(objectIdRegex, 'Invalid session ID format'),
    type: z.nativeEnum(ExceptionType, { required_error: 'Vui lòng chọn loại ngoại lệ hợp lệ' }),
    description: z.string({ required_error: 'Vui lòng cung cấp mô tả' }).min(1, 'Mô tả không được để trống'),
    surcharge: z.number().min(0).optional(),
  }),
});

export const getExceptionsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
    status: z.nativeEnum(ExceptionStatus).optional(),
    type: z.nativeEnum(ExceptionType).optional(),
    sessionId: z.string().regex(objectIdRegex, 'Invalid session ID format').optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }).optional(),
});

export const resolveExceptionSchema = z.object({
  body: z.object({
    status: z.enum([ExceptionStatus.RESOLVED, ExceptionStatus.REJECTED], { required_error: 'Trạng thái xử lý không hợp lệ' }),
    managerNote: z.string().optional().default(''),
    newLicensePlate: z.string().optional(),
    newSlotId: z.string().regex(objectIdRegex, 'Invalid slot ID format').optional(),
  }).refine((data) => {
    // We cannot easily check `type` from the request body as it's not provided, it's fetched from the DB.
    // If we wanted to enforce newLicensePlate when type=wrong_plate, we'd have to do it in the service or pass type in body.
    return true;
  }),
});
