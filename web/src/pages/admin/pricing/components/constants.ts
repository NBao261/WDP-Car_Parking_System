import { z } from 'zod';
import type { FeeType as _FeeType } from '../../../../services/pricing.service';

export const FEE_TYPE_LABELS: Record<string, string> = {
  per_turn: 'Theo lượt',
  hourly: 'Theo giờ',
  time_window: 'Theo khung giờ',
};

export const FEE_TYPE_OPTIONS = (Object.entries(FEE_TYPE_LABELS) as [string, string][]);

// Mapping từ UI type sang Backend payload
export const mapToBackendFeeConfig = (uiType: string) => {
  if (uiType === 'time_window') return { feeType: 'hourly', feeMethod: 'time_window' };
  if (uiType === 'hourly') return { feeType: 'hourly', feeMethod: 'duration_based' };
  return { feeType: 'per_turn', feeMethod: 'flat_rate' };
};

export const mapToUiType = (feeType: string, feeMethod: string) => {
  if (feeType === 'hourly' && feeMethod === 'time_window') return 'time_window';
  if (feeType === 'hourly') return 'hourly';
  return 'per_turn';
};

export const rateSchema = z.object({
  label: z.string().min(1, 'Bắt buộc'),
  amount: z.coerce.number({ invalid_type_error: 'Bắt buộc' }).min(0, 'Không được nhập số âm'),
  unit: z.string().min(1, 'Bắt buộc'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

export const formSchema = z.object({
  name: z.string({ required_error: 'Vui lòng nhập tên bảng giá' }).min(1, 'Vui lòng nhập tên bảng giá'),
  vehicleTypeId: z.string({ required_error: 'Vui lòng chọn loại xe' }).min(1, 'Vui lòng chọn loại xe'),
  facilityId: z.string({ required_error: 'Vui lòng chọn cơ sở' }).min(1, 'Vui lòng chọn cơ sở'),
  uiFeeType: z.enum(['per_turn', 'hourly', 'time_window'], {
    errorMap: () => ({ message: 'Vui lòng chọn loại hình thu phí' })
  }),
  rates: z.array(rateSchema).min(1, 'Cần ít nhất 1 mức giá'),
  overnightFee: z.coerce.number({ invalid_type_error: 'Bắt buộc' }).min(0, 'Không được nhập số âm').default(0),
  overtimeFeePerHour: z.coerce.number({ invalid_type_error: 'Bắt buộc' }).min(0, 'Không được nhập số âm').default(0),
  lostCardFee: z.coerce.number({ invalid_type_error: 'Bắt buộc' }).min(0, 'Không được nhập số âm').default(50000),
  gracePeriodMinutes: z.coerce.number({ invalid_type_error: 'Bắt buộc' }).min(0, 'Không được nhập số âm').max(60, 'Tối đa 60 phút').default(0),
  maxDailyFee: z.coerce.number({ invalid_type_error: 'Bắt buộc' }).min(0, 'Không được nhập số âm').default(0),
  firstBlockHours: z.coerce.number({ invalid_type_error: 'Bắt buộc' }).min(1, 'Tối thiểu 1 giờ').default(1),
});

export type FormValues = z.infer<typeof formSchema>;
