import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus,
  X,
  Loader2,
  Moon,
  Clock,
  CreditCard,
  ChevronDown,
  Car,
  AlertTriangle,
  ShieldAlert,
  MapPin,
  Building2,
} from 'lucide-react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  pricingService,
  type PricingPlan,
  type CreatePricingPlanPayload,
  type UpdatePricingPlanPayload,
} from '../../../../services/pricing.service';
import {
  formSchema,
  type FormValues,
  FEE_TYPE_OPTIONS,
  mapToUiType,
  mapToBackendFeeConfig,
} from './constants';
import { ICON_MAP } from '../../../shared/vehicles/components/constants';

interface FormModalProps {
  plan?: PricingPlan;
  facilities: any[];
  vehicleTypes: any[];
  onClose: () => void;
  onSuccess: () => void;
  selectedFacilityId?: string;
  selectedVehicleTypeId?: string;
}

export function PricingFormModal({
  plan,
  facilities,
  vehicleTypes,
  onClose,
  onSuccess,
  selectedFacilityId,
  selectedVehicleTypeId,
}: FormModalProps) {
  const isEdit = !!plan;
  const [isFacOpen, setIsFacOpen] = useState(false);
  const [isVtOpen, setIsVtOpen] = useState(false);

  const getVtId = (vt: any) => (vt && typeof vt === 'object' ? vt._id : vt);
  const getFacId = (f: any) => (f && typeof f === 'object' ? f._id : f);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: plan
      ? {
          name: plan.name,
          vehicleTypeId: getVtId(plan.vehicleTypeId),
          facilityId: getFacId(plan.facilityId),
          uiFeeType: mapToUiType(plan.feeType, plan.feeMethod || '') as any,
          rates: (() => {
            const uiType = mapToUiType(plan.feeType, plan.feeMethod || '');
            if (uiType === 'hourly') {
              return [
                plan.rates[0] || { label: 'Giờ đầu', amount: 0, unit: 'giờ' },
                plan.rates[1] || { label: 'Giờ tiếp theo', amount: 0, unit: 'giờ' },
              ];
            }
            if (uiType === 'per_turn') {
              return [plan.rates[0] || { label: 'Mỗi lượt', amount: 0, unit: 'lượt' }];
            }
            return plan.rates;
          })(),
          overnightFee: plan.overnightFee,
          overtimeFeePerHour: plan.overtimeFeePerHour,
          lostCardFee: plan.lostCardFee,
          gracePeriodMinutes: plan.gracePeriodMinutes ?? 0,
          maxDailyFee: plan.maxDailyFee ?? 0,
          firstBlockHours: plan.firstBlockHours ?? 1,
        }
      : {
          facilityId: selectedFacilityId || ('' as any),
          vehicleTypeId: selectedVehicleTypeId || ('' as any),
          uiFeeType: undefined as any,
          rates: [],
          overnightFee: '' as any,
          overtimeFeePerHour: '' as any,
          lostCardFee: '' as any,
          gracePeriodMinutes: '' as any,
          maxDailyFee: '' as any,
          firstBlockHours: '' as any,
        },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'rates' });

  const currentUiFeeType = useWatch({ control, name: 'uiFeeType' });
  const currentFacilityId = useWatch({ control, name: 'facilityId' });
  const currentFacility = facilities.find((f) => f._id === currentFacilityId);

  // Tự động điều chỉnh rates khi thay đổi loại hình thu phí
  useEffect(() => {
    if (isEdit) return;
    if (currentUiFeeType === 'per_turn') {
      setValue('rates', [{ label: '', amount: '' as any, unit: 'lượt' }]);
    } else if (currentUiFeeType === 'hourly') {
      setValue('rates', [
        { label: '', amount: '' as any, unit: 'giờ' },
        { label: '', amount: '' as any, unit: 'giờ' },
      ]);
    } else if (currentUiFeeType === 'time_window') {
      setValue('rates', [
        { label: '', amount: '' as any, unit: 'giờ', startTime: '', endTime: '' },
      ]);
    }
  }, [currentUiFeeType, isEdit, setValue]);

  const onSubmit = async (data: FormValues) => {
    try {
      const { uiFeeType, ...restData } = data;
      const { feeType, feeMethod } = mapToBackendFeeConfig(uiFeeType);

      if (isEdit) {
        const payload: UpdatePricingPlanPayload = { ...restData, feeType, feeMethod } as any;
        await pricingService.update(plan!._id, payload);
        toast.success('Cập nhật bảng giá thành công');
      } else {
        const payload: CreatePricingPlanPayload = { ...restData, feeType, feeMethod } as any;
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
    const base = `w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all ${extra}`;
    if (hasError) {
      return `${base} border border-red-500 focus:ring-2 focus:ring-red-200 bg-white`;
    }
    return `${base} border border-gray-200 focus:ring-2 focus:ring-[#9FE870] bg-gray-50/50 text-gray-800`;
  };
  const errCls = 'text-xs text-red-500 mt-1';

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div>
            <h2 className="text-[17px] font-bold text-[#062F28]">
              {isEdit ? 'Chỉnh Sửa Bảng Giá' : 'Thêm Bảng Giá Mới'}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">Thiết lập cấu hình thu phí cho bãi đỗ xe</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-200 text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {isEdit && (
          <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex gap-3 items-start text-amber-800 shrink-0">
            <ShieldAlert size={16} className="shrink-0 mt-0.5 text-amber-500" />
            <p className="text-sm">
              <span className="font-semibold">Lưu ý: </span>
              Nếu bảng giá này <b>đã được áp dụng</b> cho lượt xe nào, hệ thống sẽ từ chối thay đổi giá tiền.
              Vui lòng tạo bảng giá mới thay thế.
            </p>
          </div>
        )}

        {/* Scrollable body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-gray-100"
        >
          {/* ── ROW 1: FACILITY (full-width) ─────────────────────────── */}
          <div className="px-6 py-4 bg-gray-50/50">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Building2 size={11} /> Tòa nhà áp dụng <span className="text-red-500">*</span>
            </p>
            <Controller
              control={control}
              name="facilityId"
              render={({ field }) => {
                const selected = facilities.find((f) => f._id === field.value);
                const hasErr = !!errors.facilityId;
                const isLocked = isEdit || !!selectedFacilityId;
                return (
                  <div className="relative">
                    <div
                      onClick={() => !isLocked && setIsFacOpen(!isFacOpen)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        isLocked
                          ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-70'
                          : isFacOpen
                          ? 'border-[#9FE870] bg-white shadow-sm cursor-pointer'
                          : hasErr
                          ? 'border-red-300 bg-red-50/30 cursor-pointer'
                          : 'border-gray-200 bg-white hover:border-[#9FE870]/50 cursor-pointer'
                      }`}
                    >
                      <div
                        style={{
                          width: 40, height: 40, borderRadius: 10,
                          background: 'rgba(159,232,112,0.15)',
                          border: '1px solid rgba(159,232,112,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}
                      >
                        <Building2 size={18} style={{ color: '#062F28' }} />
                      </div>
                      {selected ? (
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[14px] text-[#062F28] truncate">{selected.name}</p>
                          <div className="flex items-center gap-4 mt-0.5">
                            <span className="flex items-center gap-1 text-[12px] text-gray-400 truncate">
                              <MapPin size={11} className="shrink-0" />{selected.address}
                            </span>
                            <span className="flex items-center gap-1 text-[12px] text-gray-400 shrink-0">
                              <Clock size={11} />{selected.openTime} – {selected.closeTime}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 flex-1">-- Chọn tòa nhà / bãi đỗ xe --</span>
                      )}
                      {!isLocked && (
                        <ChevronDown
                          size={15}
                          className={`text-gray-400 shrink-0 transition-transform ${isFacOpen ? 'rotate-180' : ''}`}
                        />
                      )}
                    </div>

                    <AnimatePresence>
                      {isFacOpen && (
                        <div
                          key="fac-overlay"
                          className="fixed inset-0 z-40"
                          onClick={() => setIsFacOpen(false)}
                        />
                      )}
                      {isFacOpen && (
                        <motion.div
                          key="fac-dropdown"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 max-h-52 overflow-y-auto"
                        >
                          {facilities.map((f) => (
                            <div
                              key={f._id}
                              onClick={() => { field.onChange(f._id); setIsFacOpen(false); }}
                              className={`px-4 py-2.5 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors ${
                                field.value === f._id ? 'bg-[#9FE870]/20' : 'hover:bg-gray-50'
                              }`}
                            >
                              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(159,232,112,0.15)', border: '1px solid rgba(159,232,112,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Building2 size={14} style={{ color: '#062F28' }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-[13px] truncate ${field.value === f._id ? 'text-[#062F28] font-bold' : 'text-gray-700 font-semibold'}`}>{f.name}</p>
                                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                                  <span className="flex items-center gap-1 truncate"><MapPin size={10} />{f.address}</span>
                                  <span className="flex items-center gap-1 shrink-0"><Clock size={10} />{f.openTime}–{f.closeTime}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {hasErr && <p className={errCls}>{errors.facilityId!.message}</p>}
                  </div>
                );
              }}
            />
          </div>

          {/* ── ROW 2: SYMMETRIC 2-COLUMN ────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

            {/* LEFT: Tên + Loại xe + Loại hình thu phí */}
            <div className="px-6 py-5 space-y-4">
              {/* Tên bảng giá */}
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Tên bảng giá <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name')}
                  className={getInputCls(!!errors.name)}
                  placeholder="Ví dụ: Xe máy - Theo giờ"
                />
                {errors.name && <p className={errCls}>{errors.name.message}</p>}
              </div>

              {/* Loại xe */}
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Loại xe <span className="text-red-500">*</span>
                </label>
                <Controller
                  control={control}
                  name="vehicleTypeId"
                  render={({ field }) => {
                    const selected = vehicleTypes.find((v) => v._id === field.value);
                    const SelectedIcon = selected?.icon && ICON_MAP[selected.icon] ? ICON_MAP[selected.icon] : Car;
                    const hasErr = !!errors.vehicleTypeId;
                    return (
                      <div className="relative">
                        <div
                          onClick={() => !isEdit && setIsVtOpen(!isVtOpen)}
                          className={`${getInputCls(hasErr)} flex items-center justify-between ${isEdit ? 'bg-gray-100 opacity-70 pointer-events-none' : 'cursor-pointer'} ${isVtOpen ? 'ring-2 ring-[#9FE870] border-[#9FE870]' : ''}`}
                        >
                          <span className={selected ? 'flex items-center gap-2 text-[#062F28]' : 'text-gray-400'}>
                            {selected ? <><SelectedIcon size={15} />{selected.name}</> : '-- Chọn loại xe --'}
                          </span>
                          <ChevronDown size={15} className={`text-gray-400 transition-transform ${isVtOpen ? 'rotate-180' : ''}`} />
                        </div>
                        <AnimatePresence>
                          {isVtOpen && (
                            <div key="vt-overlay" className="fixed inset-0 z-40" onClick={() => setIsVtOpen(false)} />
                          )}
                          {isVtOpen && (
                            <motion.div
                              key="vt-dropdown"
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl py-1 z-50 max-h-44 overflow-y-auto"
                            >
                              {vehicleTypes.map((v) => {
                                const IconComp = v.icon && ICON_MAP[v.icon] ? ICON_MAP[v.icon] : Car;
                                return (
                                  <div
                                    key={v._id}
                                    onClick={() => { field.onChange(v._id); setIsVtOpen(false); }}
                                    className={`px-3 py-2.5 text-sm cursor-pointer flex items-center gap-2 transition-colors ${field.value === v._id ? 'bg-[#9FE870]/20 text-[#062F28] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                                  >
                                    <IconComp size={15} className={field.value === v._id ? 'text-[#062F28]' : 'text-gray-400'} />
                                    {v.name}
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {hasErr && <p className={errCls}>{errors.vehicleTypeId!.message}</p>}
                      </div>
                    );
                  }}
                />
              </div>

              {/* Loại hình thu phí */}
              <div>
                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Loại hình thu phí <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col gap-2">
                  {FEE_TYPE_OPTIONS.map(([val, label]) => (
                    <Controller
                      key={val}
                      control={control}
                      name="uiFeeType"
                      render={({ field }) => (
                        <label
                          className={`flex items-center gap-2.5 border rounded-xl px-4 py-2.5 cursor-pointer transition-all text-sm font-semibold ${
                            field.value === val
                              ? 'border-[#062F28] bg-[#9FE870]/20 text-[#062F28] ring-1 ring-[#062F28]'
                              : errors.uiFeeType
                              ? 'border-red-300 bg-white text-gray-600'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-[#9FE870]/50 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            className="w-4 h-4 accent-[#062F28]"
                            value={val}
                            checked={field.value === val}
                            onChange={() => field.onChange(val)}
                          />
                          {label}
                        </label>
                      )}
                    />
                  ))}
                </div>
                {errors.uiFeeType && <p className={errCls}>{errors.uiFeeType.message}</p>}
              </div>
            </div>

            {/* RIGHT: Phụ phí & Cài đặt nâng cao */}
            <div className="px-6 py-5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Phụ phí &amp; Cài đặt nâng cao
              </p>
              {currentUiFeeType ? (
                <div className="grid grid-cols-2 gap-4">
                  {/* Grace period */}
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                      Miễn phí (Phút) <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('gracePeriodMinutes')}
                      type="number" min="0" max="60"
                      className={getInputCls(!!errors.gracePeriodMinutes)}
                      placeholder="0"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">X phút đầu miễn phí</p>
                    {errors.gracePeriodMinutes && <p className={errCls}>{errors.gracePeriodMinutes.message}</p>}
                  </div>

                  {/* Lost card fee */}
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                      <CreditCard size={11} /> Phí mất thẻ (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('lostCardFee')}
                      type="number" min="0"
                      className={getInputCls(!!errors.lostCardFee)}
                      placeholder="50000"
                    />
                    {errors.lostCardFee && <p className={errCls}>{errors.lostCardFee.message}</p>}
                  </div>

                  {/* First block hours: Hourly only */}
                  {currentUiFeeType === 'hourly' && (
                    <div>
                      <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                        Giờ tính mức đầu <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('firstBlockHours')}
                        type="number" min="1"
                        className={getInputCls(!!errors.firstBlockHours)}
                        placeholder="1"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Số giờ cho giá bậc 1</p>
                      {errors.firstBlockHours && <p className={errCls}>{errors.firstBlockHours.message}</p>}
                    </div>
                  )}

                  {/* Max daily fee */}
                  {(currentUiFeeType === 'hourly' || currentUiFeeType === 'time_window') && (
                    <div>
                      <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5">
                        Phí tối đa/Ngày (VNĐ) <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('maxDailyFee')}
                        type="number" min="0"
                        className={getInputCls(!!errors.maxDailyFee)}
                        placeholder="0"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">0 = Không giới hạn</p>
                      {errors.maxDailyFee && <p className={errCls}>{errors.maxDailyFee.message}</p>}
                    </div>
                  )}

                  {/* Overnight fee */}
                  {(currentUiFeeType === 'per_turn' || currentUiFeeType === 'hourly') && (
                    <div>
                      <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                        <Moon size={11} /> Phí qua đêm (VNĐ) <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('overnightFee')}
                        type="number" min="0"
                        className={getInputCls(!!errors.overnightFee)}
                        placeholder="0"
                      />
                      {errors.overnightFee && <p className={errCls}>{errors.overnightFee.message}</p>}
                    </div>
                  )}

                  {/* Overtime fee */}
                  {(currentUiFeeType === 'time_window' || currentUiFeeType === 'hourly') && (
                    <div>
                      <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                        <Clock size={11} /> Phí quá giờ (VNĐ/h) <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('overtimeFeePerHour')}
                        type="number" min="0"
                        className={getInputCls(!!errors.overtimeFeePerHour)}
                        placeholder="0"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        {currentUiFeeType === 'hourly' ? 'Khi đỗ quá 24h' : 'Ngoài khung hoạt động'}
                      </p>
                      {errors.overtimeFeePerHour && <p className={errCls}>{errors.overtimeFeePerHour.message}</p>}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full min-h-[160px] border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                  <AlertTriangle className="w-6 h-6 text-gray-200 mb-2" />
                  <p className="text-sm font-semibold text-gray-400">Chọn loại hình thu phí</p>
                  <p className="text-xs text-gray-300 mt-1">ở cột bên trái để thiết lập phụ phí</p>
                </div>
              )}
            </div>
          </div>

          {/* ── ROW 3: RATE CONFIG (full-width, conditional) ─────────── */}
          {currentUiFeeType && (
            <div className="px-6 py-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  Cấu hình mức giá <span className="text-red-500">*</span>
                </p>
                {currentUiFeeType === 'time_window' && (
                  <button
                    type="button"
                    onClick={() => append({ label: '', amount: 0, unit: 'giờ', startTime: '', endTime: '' })}
                    className="text-xs font-bold text-[#062F28] hover:bg-[#9FE870]/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors border border-[#9FE870]/40"
                  >
                    <Plus size={13} /> Thêm Khung Giờ
                  </button>
                )}
              </div>

              {currentUiFeeType === 'time_window' && (
                <div className="text-xs text-blue-700 bg-blue-50 px-3 py-2.5 rounded-xl border border-blue-100 mb-4 flex items-start gap-2">
                  <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                  <span>
                    Các khung giờ <b>phải nối tiếp nhau và phủ kín toàn bộ thời gian hoạt động</b> của tòa nhà
                    {currentFacility ? ` (${currentFacility.openTime} – ${currentFacility.closeTime})` : ''}.
                    Ngoài khung sẽ tính theo phí quá giờ.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {fields.map((fld, idx) => (
                  <div
                    key={fld.id}
                    className="bg-gray-50/60 border border-gray-100 rounded-xl p-4 relative"
                  >
                    {fields.length > 1 && currentUiFeeType === 'time_window' && (
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="absolute top-2 right-2 text-gray-300 hover:text-red-400 hover:bg-red-50 p-1 rounded-lg transition-all"
                      >
                        <X size={13} />
                      </button>
                    )}

                    {currentUiFeeType === 'time_window' && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1">
                          <label className="text-[10px] font-medium text-gray-400 uppercase block mb-1">Từ giờ <span className="text-red-500">*</span></label>
                          <input type="time" {...register(`rates.${idx}.startTime`)} className={getInputCls(!!errors.rates?.[idx]?.startTime, 'py-1.5')} />
                          {errors.rates?.[idx]?.startTime && <p className={errCls}>{errors.rates[idx]!.startTime!.message}</p>}
                        </div>
                        <span className="text-gray-300 mt-4">–</span>
                        <div className="flex-1">
                          <label className="text-[10px] font-medium text-gray-400 uppercase block mb-1">Đến giờ <span className="text-red-500">*</span></label>
                          <input type="time" {...register(`rates.${idx}.endTime`)} className={getInputCls(!!errors.rates?.[idx]?.endTime, 'py-1.5')} />
                          {errors.rates?.[idx]?.endTime && <p className={errCls}>{errors.rates[idx]!.endTime!.message}</p>}
                        </div>
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="text-[10px] font-medium text-gray-400 uppercase block mb-1">
                        Tên khung <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register(`rates.${idx}.label`)}
                        placeholder={
                          currentUiFeeType === 'hourly'
                            ? idx === 0 ? 'Giờ đầu' : 'Giờ tiếp theo'
                            : currentUiFeeType === 'per_turn' ? 'Mỗi lượt' : 'Khung giờ'
                        }
                        className={getInputCls(!!errors.rates?.[idx]?.label, 'py-1.5 font-medium')}
                      />
                      {errors.rates?.[idx]?.label && <p className={errCls}>{errors.rates[idx]!.label!.message}</p>}
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] font-medium text-gray-400 uppercase block mb-1">
                          Đơn giá (VNĐ) <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register(`rates.${idx}.amount`)}
                          type="number" min="0" placeholder="0"
                          className={getInputCls(!!errors.rates?.[idx]?.amount, 'py-1.5 font-bold text-[#062F28]')}
                        />
                      </div>
                      <div className="w-16">
                        <label className="text-[10px] font-medium text-gray-400 uppercase block mb-1">Đơn vị</label>
                        <input
                          {...register(`rates.${idx}.unit`)}
                          readOnly
                          className={`${getInputCls(false, 'py-1.5')} bg-gray-100 text-gray-400 cursor-not-allowed text-center`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {errors.rates?.root && <p className={errCls}>{errors.rates.root.message}</p>}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            Hủy Bỏ
          </button>
          <button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-bold text-[#062F28] bg-[#9FE870] rounded-xl hover:bg-[#9FE870]/90 transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isEdit ? 'Lưu Thay Đổi' : 'Tạo Bảng Giá'}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
