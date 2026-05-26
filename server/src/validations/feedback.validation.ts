import { z } from 'zod';
import { FeedbackType, FeedbackStatus } from '../models/feedback.model';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createFeedbackSchema = z.object({
  body: z.object({
    sessionId: z.string().regex(objectIdRegex, 'Invalid session ID').optional(),
    type: z.nativeEnum(FeedbackType, { required_error: 'Loại phản hồi không được để trống' }),
    description: z.string({ required_error: 'Mô tả không được để trống' }).min(1, 'Mô tả không được để trống'),
    images: z.array(z.string().url('URL ảnh không hợp lệ')).optional().default([]),
  }),
});

export const getFeedbacksSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
    status: z.nativeEnum(FeedbackStatus).optional(),
    type: z.nativeEnum(FeedbackType).optional(),
    userId: z.string().regex(objectIdRegex).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }).optional(),
});

export const updateFeedbackStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid feedback ID'),
  }),
  body: z.object({
    status: z.enum([FeedbackStatus.PROCESSING, FeedbackStatus.RESOLVED, FeedbackStatus.REJECTED], {
      required_error: 'Trạng thái xử lý không hợp lệ',
    }),
    responseNote: z.string().optional().default(''),
  }),
});
