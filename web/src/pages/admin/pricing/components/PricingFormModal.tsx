import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, X, Loader2, Moon, Clock, CreditCard } from 'lucide-react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  pricingService, type PricingPlan, type CreatePricingPlanPayload, type UpdatePricingPlanPayload,
} from '../../../../services/pricing.service';
import { formSchema, type FormValues, FEE_TYPE_OPTIONS } from './constants';

interface FormModalProps {
  plan?: PricingPlan;
  facilities: any[];
  vehicleTypes: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export function PricingFormModal({ plan, facilities, vehicleTypes, onClose, onSuccess }: FormModalProps) {
  const isEdit = !!plan;

  const getVtId = (vt: any) => typeof vt === 'object' ? vt._id : vt;
  const getFacId = (f: any) => typeof f === 'object' ? f._id : f;

  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: plan
      ? {
        name: plan.name,
        vehicleTypeId: getVtId(plan.vehicleTypeId),
        facilityId: getFacId(plan.facilityId),
        feeType: plan.feeType,
        rates: plan.rates,
        overnightFee: plan.overnightFee,
        overtimeFeePerHour: plan.overtimeFeePerHour,
        lostCardFee: plan.lostCardFee,
      }
      : { feeType: '' as any, rates: [{ label: '', amount: 0, unit: '' }], overnightFee: 0, overtimeFeePerHour: 0, lostCardFee: 0 },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'rates' });

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEdit) {
        const payload: UpdatePricingPlanPayload = {
          name: data.name, feeType: data.feeType, rates: data.rates,
          overnightFee: data.overnightFee, overtimeFeePerHour: data.overtimeFeePerHour, lostCardFee: data.lostCardFee,
        };
        await pricingService.update(plan!._id, payload);
        toast.success('Cập nhật bảng giá thành công');
      } else {
        const payload: CreatePricingPlanPayload = { ...data };
        await pricingService.create(payload);
        toast.success('Tạo bảng giá mới thành công');
      }
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Thao tác thất bại');
    }
  };

  const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] bg-white';
  const errCls = 'text-xs text-red-500 mt-0.5';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4 pt-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#060606]">
            {isEdit ? 'Chỉnh Sửa Bảng Giá' : 'Thêm Bảng Giá Mới'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Tên Bảng Giá <span className="text-red-500">*</span></label>
            <input {...register('name')} className={inputCls} placeholder="VD: Xe máy - Theo giờ" />
            {errors.name && <p className={errCls}>{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Facility */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Cơ Sở <span className="text-red-500">*</span></label>
              <select {...register('facilityId')} className={isEdit ? `${inputCls} bg-gray-100 pointer-events-none opacity-70` : inputCls} tabIndex={isEdit ? -1 : 0}>
                <option value="">-- Chọn --</option>
                {facilities.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
              </select>
              {errors.facilityId && <p className={errCls}>{errors.facilityId.message}</p>}
            </div>

            {/* Vehicle type */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Loại Xe <span className="text-red-500">*</span></label>
              <select {...register('vehicleTypeId')} className={isEdit ? `${inputCls} bg-gray-100 pointer-events-none opacity-70` : inputCls} tabIndex={isEdit ? -1 : 0}>
                <option value="">-- Chọn --</option>
                {vehicleTypes.map((v) => <option key={v._id} value={v._id}>{v.icon} {v.name}</option>)}
              </select>
              {errors.vehicleTypeId && <p className={errCls}>{errors.vehicleTypeId.message}</p>}
            </div>
          </div>

          {/* Fee type */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Loại Phí <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {FEE_TYPE_OPTIONS.map(([val, label]) => (
                <Controller key={val} control={control} name="feeType" render={({ field }) => (
                  <label className={`flex items-center gap-2 border rounded-xl px-3 py-2 cursor-pointer transition-all text-sm font-semibold ${field.value === val ? 'border-[#d7ee46] bg-[#d7ee46] text-[#060606] scale-[1.03]' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}>
                    <input type="radio" className="sr-only" value={val} checked={field.value === val} onChange={() => field.onChange(val)} />
                    {label}
                  </label>
                )} />
              ))}
            </div>
            {errors.feeType && <p className={errCls}>{errors.feeType.message as string}</p>}
          </div>

          {/* Rates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Mức Giá <span className="text-red-500">*</span></label>
              <button type="button" onClick={() => append({ label: '', amount: 0, unit: 'giờ' })}
                className="text-xs font-medium text-[#060606] hover:underline flex items-center gap-1">
                <Plus size={12} /> Thêm Mức Giá
              </button>
            </div>
            <div className="space-y-2">
              {fields.map((field, idx) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input {...register(`rates.${idx}.label`)} placeholder="Nhãn (VD: Giờ đầu)" className={inputCls} />
                    {errors.rates?.[idx]?.label && <p className={errCls}>{errors.rates[idx]!.label!.message}</p>}
                  </div>
                  <div className="w-28">
                    <input {...register(`rates.${idx}.amount`)} type="number" placeholder="Giá" className={inputCls} />
                  </div>
                  <div className="w-20">
                    <input {...register(`rates.${idx}.unit`)} placeholder="Đơn vị" className={inputCls} />
                  </div>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(idx)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg mt-0.5">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.rates?.root && <p className={errCls}>{errors.rates.root.message}</p>}
          </div>

          {/* Surcharges */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1 flex items-center gap-1"><Moon size={11} />Phí Qua Đêm (đ)</label>
              <input {...register('overnightFee')} type="number" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1 flex items-center gap-1"><Clock size={11} />Phí Quá Giờ/h</label>
              <input {...register('overtimeFeePerHour')} type="number" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1 flex items-center gap-1"><CreditCard size={11} />Phí Mất Thẻ (đ)</label>
              <input {...register('lostCardFee')} type="number" className={inputCls} />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
            <button type="button" onClick={onClose} disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-60">
              Hủy
            </button>
            <button type="submit" disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-bold text-[#060606] bg-[#d7ee46] rounded-xl hover:bg-[#c4dc32] transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isEdit ? 'Lưu Thay Đổi' : 'Tạo Bảng Giá'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
