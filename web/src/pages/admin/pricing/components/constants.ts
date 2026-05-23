import { z } from 'zod';
import type { FeeType } from '../../../../services/pricing.service';

export const FEE_TYPE_LABELS: Record<FeeType, string> = {
  per_turn: 'Mỗi lượt',
  hourly: 'Theo giờ',
  daily: 'Theo ngày',
  monthly: 'Theo tháng',
};

export const FEE_TYPE_OPTIONS = (Object.entries(FEE_TYPE_LABELS) as [FeeType, string][]);

export const rateSchema = z.object({
  label: z.string().min(1, 'Bắt buộc'),
  amount: z.coerce.number().min(0, 'Phải ≥ 0'),
  unit: z.string().min(1, 'Bắt buộc'),
});

export const formSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên bảng giá'),
  vehicleTypeId: z.string().min(1, 'Chọn loại xe'),
  facilityId: z.string().min(1, 'Chọn cơ sở'),
  feeType: z.enum(['per_turn', 'hourly', 'daily', 'monthly'], {
    errorMap: () => ({ message: 'Vui lòng chọn loại phí' })
  }),
  rates: z.array(rateSchema).min(1, 'Cần ít nhất 1 mức giá'),
  overnightFee: z.coerce.number().min(0).default(0),
  overtimeFeePerHour: z.coerce.number().min(0).default(0),
  lostCardFee: z.coerce.number().min(0).default(50000),
});

export type FormValues = z.infer<typeof formSchema>;
