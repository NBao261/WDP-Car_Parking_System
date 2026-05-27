import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, X, Loader2, Moon, Clock, CreditCard, ChevronDown, Car } from 'lucide-react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  pricingService, type PricingPlan, type CreatePricingPlanPayload, type UpdatePricingPlanPayload,
} from '../../../../services/pricing.service';
import { formSchema, type FormValues, FEE_TYPE_OPTIONS } from './constants';
import { ICON_MAP } from '../../vehicles/components/constants';

interface FormModalProps {
  plan?: PricingPlan;
  facilities: any[];
  vehicleTypes: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export function PricingFormModal({ plan, facilities, vehicleTypes, onClose, onSuccess }: FormModalProps) {
  const isEdit = !!plan;
  const [isFacOpen, setIsFacOpen] = useState(false);
  const [isVtOpen, setIsVtOpen] = useState(false);

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

  const getInputCls = (hasError: boolean, extra = '') => {
    const base = `w-full rounded-xl px-3 py-2 text-sm focus:outline-none transition-all ${extra}`;
    if (hasError) {
      return `${base} border border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50/10`;
    }
    return `${base} border border-gray-200 focus:ring-2 focus:ring-[#d7ee46] bg-white text-gray-800`;
  };
  const errCls = 'text-xs text-red-500 mt-1';

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
            <input {...register('name')} className={getInputCls(!!errors.name)} placeholder="VD: Xe máy - Theo giờ" />
            {errors.name && <p className={errCls}>{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Facility */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Cơ Sở <span className="text-red-500">*</span></label>
              <Controller
                control={control}
                name="facilityId"
                render={({ field }) => {
                  const selected = facilities.find(f => f._id === field.value);
                  const hasErr = !!errors.facilityId;
                  const borderClass = isFacOpen
                    ? (hasErr ? 'ring-2 ring-red-200 border-red-500' : 'ring-2 ring-[#d7ee46] border-transparent')
                    : (hasErr ? '' : 'hover:border-[#d7ee46]');
                  return (
                    <div className="relative">
                      <div
                        onClick={() => !isEdit && setIsFacOpen(!isFacOpen)}
                        className={`${getInputCls(hasErr)} flex items-center justify-between cursor-pointer transition-colors ${isEdit ? 'bg-gray-100 opacity-70 pointer-events-none' : ''} ${borderClass}`}
                      >
                        <span className={selected ? 'text-[#060606]' : 'text-gray-400'}>
                          {selected ? selected.name : '-- Chọn --'}
                        </span>
                        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isFacOpen ? 'rotate-180' : ''}`} />
                      </div>
                      <AnimatePresence>
                        {isFacOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsFacOpen(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                              className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] py-1 z-50 max-h-40 overflow-y-auto overflow-x-hidden custom-scrollbar"
                            >
                              {facilities.map((f) => (
                                <div
                                  key={f._id}
                                  onClick={() => { field.onChange(f._id); setIsFacOpen(false); }}
                                  className={`px-3 py-2 text-sm cursor-pointer whitespace-normal break-words ${field.value === f._id ? 'bg-[#d7ee46]/20 text-[#060606] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                  {f.name}
                                </div>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }}
              />
              {errors.facilityId && <p className={errCls}>{errors.facilityId.message}</p>}
            </div>

            {/* Vehicle type */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Loại Xe <span className="text-red-500">*</span></label>
              <Controller
                control={control}
                name="vehicleTypeId"
                render={({ field }) => {
                  const selected = vehicleTypes.find(v => v._id === field.value);
                  const SelectedIcon = (selected?.icon && ICON_MAP[selected.icon]) ? ICON_MAP[selected.icon] : Car;
                  const hasErr = !!errors.vehicleTypeId;
                  const borderClass = isVtOpen
                    ? (hasErr ? 'ring-2 ring-red-200 border-red-500' : 'ring-2 ring-[#d7ee46] border-transparent')
                    : (hasErr ? '' : 'hover:border-[#d7ee46]');
                  return (
                    <div className="relative">
                      <div
                        onClick={() => !isEdit && setIsVtOpen(!isVtOpen)}
                        className={`${getInputCls(hasErr)} flex items-center justify-between cursor-pointer transition-colors ${isEdit ? 'bg-gray-100 opacity-70 pointer-events-none' : ''} ${borderClass}`}
                      >
                        <span className={selected ? 'text-[#060606]' : 'text-gray-400'}>
                          {selected ? (
                            <span className="flex items-center gap-2">
                              <SelectedIcon size={16} className="text-[#4a7c20]" />
                              {selected.name}
                            </span>
                          ) : '-- Chọn --'}
                        </span>
                        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isVtOpen ? 'rotate-180' : ''}`} />
                      </div>
                      <AnimatePresence>
                        {isVtOpen && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsVtOpen(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}
                              className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] py-1 z-50 max-h-40 overflow-y-auto overflow-x-hidden custom-scrollbar"
                            >
                              {vehicleTypes.map((v) => {
                                const IconComp = (v.icon && ICON_MAP[v.icon]) ? ICON_MAP[v.icon] : Car;
                                return (
                                  <div
                                    key={v._id}
                                    onClick={() => { field.onChange(v._id); setIsVtOpen(false); }}
                                    className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 whitespace-normal break-words ${field.value === v._id ? 'bg-[#d7ee46]/20 text-[#060606] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                                  >
                                    <IconComp size={16} className={`flex-shrink-0 ${field.value === v._id ? 'text-[#060606]' : 'text-gray-400'}`} />
                                    {v.name}
                                  </div>
                                );
                              })}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }}
              />
              {errors.vehicleTypeId && <p className={errCls}>{errors.vehicleTypeId.message}</p>}
            </div>
          </div>

          {/* Fee type */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Loại Phí <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {FEE_TYPE_OPTIONS.map(([val, label]) => (
                <Controller key={val} control={control} name="feeType" render={({ field }) => (
                  <label className={`flex items-center gap-2 border rounded-xl px-3 py-2 cursor-pointer transition-all text-sm font-semibold ${field.value === val ? 'border-[#d7ee46] bg-[#d7ee46] text-[#060606] scale-[1.03]' : (errors.feeType ? 'border-red-300 bg-red-50/10 text-gray-700 hover:border-red-400' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300')
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
                    <input {...register(`rates.${idx}.label`)} placeholder="Nhãn (VD: Giờ đầu)" className={getInputCls(!!errors.rates?.[idx]?.label)} />
                    {errors.rates?.[idx]?.label && <p className={errCls}>{errors.rates[idx]!.label!.message}</p>}
                  </div>
                  <div className="w-28">
                    <input {...register(`rates.${idx}.amount`)} type="number" min="0" placeholder="Giá" className={getInputCls(!!errors.rates?.[idx]?.amount)} />
                  </div>
                  <div className="w-20">
                    <input {...register(`rates.${idx}.unit`)} placeholder="Đơn vị" className={getInputCls(!!errors.rates?.[idx]?.unit)} />
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
              <input {...register('overnightFee')} type="number" min="0" className={getInputCls(!!errors.overnightFee)} />
              {errors.overnightFee && <p className={errCls}>{errors.overnightFee.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1 flex items-center gap-1"><Clock size={11} />Phí Quá Giờ/h</label>
              <input {...register('overtimeFeePerHour')} type="number" min="0" className={getInputCls(!!errors.overtimeFeePerHour)} />
              {errors.overtimeFeePerHour && <p className={errCls}>{errors.overtimeFeePerHour.message}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1 flex items-center gap-1"><CreditCard size={11} />Phí Mất Thẻ (đ)</label>
              <input {...register('lostCardFee')} type="number" min="0" className={getInputCls(!!errors.lostCardFee)} />
              {errors.lostCardFee && <p className={errCls}>{errors.lostCardFee.message}</p>}
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
