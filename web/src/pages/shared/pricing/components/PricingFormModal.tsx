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

  const getVtId = (vt: any) => (typeof vt === 'object' ? vt._id : vt);
  const getFacId = (f: any) => (typeof f === 'object' ? f._id : f);

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
    if (isEdit) return; // Không can thiệp nếu đang edit
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
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4 pt-10"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-[#062F28]">
              {isEdit ? 'Chỉnh Sửa Bảng Giá' : 'Thêm Bảng Giá Mới'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Thiết lập cấu hình thu phí cho bãi đỗ xe</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {isEdit && (
          <div className="bg-amber-50 border-b border-amber-100 px-6 py-3 flex gap-3 items-start text-amber-800">
            <ShieldAlert size={18} className="shrink-0 mt-0.5 text-amber-600" />
            <div className="text-sm">
              <span className="font-semibold block mb-0.5">Lưu ý quan trọng khi cập nhật</span>
              Nếu bảng giá này <b>đã từng được áp dụng</b> cho bất kỳ lượt xe nào, hệ thống sẽ từ
              chối việc thay đổi giá tiền để bảo vệ dữ liệu lịch sử. Trong trường hợp đó, bạn vui
              lòng tạo bảng giá mới.
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar"
        >
          {/* SECTION 1: THÔNG TIN CHUNG */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[#062F28] border-b pb-2">1. Thông tin chung</h3>

            {/* Facility */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Vị trí tòa nhà / bãi đỗ
              </label>
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
                        className={`${getInputCls(hasErr, '!bg-transparent !border-transparent !shadow-none !px-0')} flex items-center justify-between transition-colors ${isLocked ? 'bg-gray-100 opacity-70 cursor-not-allowed' : 'cursor-pointer'} !py-2`}
                      >
                        <div className={selected ? 'text-[#062F28]' : 'text-gray-400'}>
                          {selected ? (
                            <div className="flex items-center gap-3 py-1">
                              <div
                                style={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: 12,
                                  background: 'rgba(159,232,112,0.15)',
                                  border: '1px solid rgba(159,232,112,0.3)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                }}
                              >
                                <Building2
                                  size={24}
                                  style={{ color: '#062F28' }}
                                />
                              </div>
                              <div className="flex flex-col gap-1 min-w-0">
                                <span className="font-bold text-[16px] text-[#062F28] truncate">
                                  {selected.name}
                                </span>
                                <span className="flex items-center gap-2 text-[14px] text-gray-500 font-normal">
                                  <MapPin size={15} className="shrink-0" />{' '}
                                  <span className="truncate">{selected.address}</span>
                                </span>
                                <span className="flex items-center gap-2 text-[14px] text-gray-500 font-normal">
                                  <Clock size={15} className="shrink-0" /> {selected.openTime} -{' '}
                                  {selected.closeTime}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm py-1 block">-- Chọn cơ sở --</span>
                          )}
                        </div>
                        {!isLocked && (
                          <ChevronDown
                            size={16}
                            className={`text-gray-400 transition-transform ${isFacOpen ? 'rotate-180' : ''}`}
                          />
                        )}
                      </div>
                      <AnimatePresence>
                        {isFacOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setIsFacOpen(false)}
                            />
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50 max-h-40 overflow-y-auto"
                            >
                              {facilities.map((f) => (
                                <div
                                  key={f._id}
                                  onClick={() => {
                                    field.onChange(f._id);
                                    setIsFacOpen(false);
                                  }}
                                  className={`px-4 py-3 cursor-pointer border-b border-gray-50 last:border-0 ${field.value === f._id ? 'bg-[#9FE870]/20' : 'hover:bg-gray-50'}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 12,
                                        background: 'rgba(159,232,112,0.15)',
                                        border: '1px solid rgba(159,232,112,0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                      }}
                                    >
                                      <Building2
                                        size={22}
                                        style={{ color: '#062F28' }}
                                      />
                                    </div>
                                    <div className="flex flex-col gap-1 min-w-0">
                                      <span
                                        className={`text-[15px] ${field.value === f._id ? 'text-[#062F28] font-bold' : 'text-gray-700 font-semibold'}`}
                                      >
                                        {f.name}
                                      </span>
                                      <div className="flex items-center gap-3 text-[13px] text-gray-500 font-normal">
                                        <span className="flex items-center gap-1.5 truncate max-w-[250px]">
                                          <MapPin size={14} className="shrink-0" /> {f.address}
                                        </span>
                                        <span className="flex items-center gap-1.5 shrink-0">
                                          <Clock size={14} /> {f.openTime} - {f.closeTime}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
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

            {/* Tên Bảng Giá */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Tên Bảng Giá <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                className={getInputCls(!!errors.name)}
                placeholder="Xe máy - Theo giờ"
              />
              {errors.name && <p className={errCls}>{errors.name.message}</p>}
            </div>

            {/* Vehicle type */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Loại Xe <span className="text-red-500">*</span>
              </label>
              <Controller
                control={control}
                name="vehicleTypeId"
                render={({ field }) => {
                  const selected = vehicleTypes.find((v) => v._id === field.value);
                  const SelectedIcon =
                    selected?.icon && ICON_MAP[selected.icon] ? ICON_MAP[selected.icon] : Car;
                  const hasErr = !!errors.vehicleTypeId;
                  const borderClass = isVtOpen
                    ? hasErr
                      ? 'ring-2 ring-red-200 border-red-500'
                      : 'ring-2 ring-[#9FE870] border-[#9FE870]'
                    : hasErr
                      ? ''
                      : 'hover:border-[#9FE870]';
                  return (
                    <div className="relative">
                      <div
                        onClick={() => !isEdit && setIsVtOpen(!isVtOpen)}
                        className={`${getInputCls(hasErr)} flex items-center justify-between cursor-pointer transition-colors ${isEdit ? 'bg-gray-100 opacity-70 pointer-events-none' : ''} ${borderClass}`}
                      >
                        <span className={selected ? 'text-[#062F28]' : 'text-gray-400'}>
                          {selected ? (
                            <span className="flex items-center gap-2">
                              <SelectedIcon size={16} className="text-[#062F28]" />
                              {selected.name}
                            </span>
                          ) : (
                            '-- Chọn loại xe --'
                          )}
                        </span>
                        <ChevronDown
                          size={16}
                          className={`text-gray-400 transition-transform ${isVtOpen ? 'rotate-180' : ''}`}
                        />
                      </div>
                      <AnimatePresence>
                        {isVtOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setIsVtOpen(false)}
                            />
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50 max-h-40 overflow-y-auto"
                            >
                              {vehicleTypes.map((v) => {
                                const IconComp =
                                  v.icon && ICON_MAP[v.icon] ? ICON_MAP[v.icon] : Car;
                                return (
                                  <div
                                    key={v._id}
                                    onClick={() => {
                                      field.onChange(v._id);
                                      setIsVtOpen(false);
                                    }}
                                    className={`px-3 py-2.5 text-sm cursor-pointer flex items-center gap-2 whitespace-normal break-words ${field.value === v._id ? 'bg-[#9FE870]/20 text-[#062F28] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                                  >
                                    <IconComp
                                      size={16}
                                      className={`flex-shrink-0 ${field.value === v._id ? 'text-[#062F28]' : 'text-gray-400'}`}
                                    />
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

          {/* SECTION 2: CƠ CHẾ THU PHÍ */}
          <div className="space-y-4">
            <h3 className="font-semibold text-[#062F28] border-b pb-2">2. Cơ chế thu phí</h3>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Loại Hình Thu Phí <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col gap-2">
                {FEE_TYPE_OPTIONS.map(([val, label]) => (
                  <Controller
                    key={val}
                    control={control}
                    name="uiFeeType"
                    render={({ field }) => (
                      <label
                        className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 cursor-pointer transition-all text-sm font-semibold ${field.value === val ? 'border-[#062F28] bg-[#9FE870]/20 text-[#062F28] ring-1 ring-[#062F28]' : errors.uiFeeType ? 'border-red-500 bg-white text-gray-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
                      >
                        <input
                          type="radio"
                          className="w-4 h-4 accent-[#062F28]"
                          value={val}
                          checked={field.value === val}
                          onChange={() => {
                            field.onChange(val);
                          }}
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

          {currentUiFeeType && (
            <>
              {/* SECTION 3: MỨC GIÁ */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="font-semibold text-[#062F28]">3. Cấu hình mức giá</h3>
                  {currentUiFeeType === 'time_window' && (
                    <button
                      type="button"
                      onClick={() =>
                        append({ label: '', amount: 0, unit: 'giờ', startTime: '', endTime: '' })
                      }
                      className="text-xs font-bold text-[#062F28] hover:bg-[#9FE870]/20 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Plus size={14} /> Thêm Khung Giờ
                    </button>
                  )}
                </div>

                <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  {currentUiFeeType === 'time_window' && (
                    <div className="text-xs text-blue-600 bg-blue-50 p-2.5 rounded-lg border border-blue-100 mb-3 flex items-start gap-2">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      <span>
                        Các khung giờ bạn thêm vào{' '}
                        <b>bắt buộc phải nối tiếp nhau và phủ kín toàn bộ thời gian hoạt động</b>{' '}
                        của Tòa nhà này
                        {currentFacility
                          ? ` (${currentFacility.openTime} - ${currentFacility.closeTime})`
                          : ''}
                        . Vượt ngoài các khung giờ sẽ tính theo Phí quá giờ.
                      </span>
                    </div>
                  )}

                  {fields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="flex flex-wrap gap-3 items-start bg-white p-3 rounded-xl border border-gray-100 shadow-sm relative"
                    >
                      {currentUiFeeType === 'time_window' && (
                        <div className="w-full flex items-center gap-2 mb-1">
                          <div className="flex-1">
                            <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
                              Từ giờ (HH:mm) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="time"
                              {...register(`rates.${idx}.startTime`)}
                              className={getInputCls(!!errors.rates?.[idx]?.startTime, 'py-1.5')}
                            />
                            {errors.rates?.[idx]?.startTime && (
                              <p className={errCls}>{errors.rates[idx]!.startTime!.message}</p>
                            )}
                          </div>
                          <div className="text-gray-300 mt-5">-</div>
                          <div className="flex-1">
                            <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
                              Đến giờ (HH:mm) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="time"
                              {...register(`rates.${idx}.endTime`)}
                              className={getInputCls(!!errors.rates?.[idx]?.endTime, 'py-1.5')}
                            />
                            {errors.rates?.[idx]?.endTime && (
                              <p className={errCls}>{errors.rates[idx]!.endTime!.message}</p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex-1 min-w-[120px]">
                        <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
                          Tên khung giờ<span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register(`rates.${idx}.label`)}
                          placeholder={
                            currentUiFeeType === 'hourly'
                              ? idx === 0
                                ? 'Giờ đầu'
                                : 'Giờ tiếp theo'
                              : currentUiFeeType === 'per_turn'
                                ? 'Mỗi lượt'
                                : 'Khung ngày'
                          }
                          className={getInputCls(
                            !!errors.rates?.[idx]?.label,
                            'py-1.5 font-medium'
                          )}
                        />
                        {errors.rates?.[idx]?.label && (
                          <p className={errCls}>{errors.rates[idx]!.label!.message}</p>
                        )}
                      </div>

                      <div className="w-32">
                        <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
                          Đơn giá (VNĐ) <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register(`rates.${idx}.amount`)}
                          type="number"
                          min="0"
                          placeholder="0"
                          className={getInputCls(
                            !!errors.rates?.[idx]?.amount,
                            'py-1.5 font-bold text-lg text-[#062F28]'
                          )}
                        />
                      </div>

                      <div className="w-20">
                        <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
                          Đơn vị
                        </label>
                        <input
                          {...register(`rates.${idx}.unit`)}
                          readOnly
                          className={`${getInputCls(false, 'py-1.5')} bg-gray-100 text-gray-500 cursor-not-allowed`}
                        />
                      </div>

                      {fields.length > 1 && currentUiFeeType === 'time_window' && (
                        <button
                          type="button"
                          onClick={() => remove(idx)}
                          className="absolute -top-2 -right-2 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 p-1 rounded-full shadow-sm transition-all"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  {errors.rates?.root && <p className={errCls}>{errors.rates.root.message}</p>}
                </div>
              </div>

              {/* SECTION 4: CÀI ĐẶT NÂNG CAO */}
              <div className="space-y-4">
                <h3 className="font-semibold text-[#062F28] border-b pb-2">
                  4. Phụ phí & Cài đặt nâng cao
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {/* Grace period: always visible */}
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
                      Thời gian miễn phí (Phút) <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('gracePeriodMinutes')}
                      type="number"
                      min="0"
                      max="60"
                      className={getInputCls(!!errors.gracePeriodMinutes)}
                      placeholder="0"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Miễn phí X phút đầu</p>
                    {errors.gracePeriodMinutes && (
                      <p className={errCls}>{errors.gracePeriodMinutes.message}</p>
                    )}
                  </div>

                  {/* First block hours: Hourly & duration */}
                  {currentUiFeeType === 'hourly' && (
                    <div>
                      <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
                        Số giờ tính phí đầu (Giờ)<span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('firstBlockHours')}
                        type="number"
                        min="1"
                        className={getInputCls(!!errors.firstBlockHours)}
                        placeholder="1"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Số giờ của mức giá đầu tiên</p>
                      {errors.firstBlockHours && (
                        <p className={errCls}>{errors.firstBlockHours.message}</p>
                      )}
                    </div>
                  )}

                  {/* Max daily fee: Hourly */}
                  {(currentUiFeeType === 'hourly' || currentUiFeeType === 'time_window') && (
                    <div>
                      <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1">
                        Mức phí tối đa / Ngày (VNĐ)<span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('maxDailyFee')}
                        type="number"
                        min="0"
                        className={getInputCls(!!errors.maxDailyFee)}
                        placeholder="0"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">0 = Không giới hạn</p>
                      {errors.maxDailyFee && <p className={errCls}>{errors.maxDailyFee.message}</p>}
                    </div>
                  )}

                  {/* Overnight fee: Per turn or Hourly */}
                  {(currentUiFeeType === 'per_turn' || currentUiFeeType === 'hourly') && (
                    <div>
                      <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <Moon size={11} />
                        Phí Qua Đêm (VNĐ) <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('overnightFee')}
                        type="number"
                        min="0"
                        className={getInputCls(!!errors.overnightFee)}
                        placeholder="0"
                      />
                      {errors.overnightFee && (
                        <p className={errCls}>{errors.overnightFee.message}</p>
                      )}
                    </div>
                  )}

                  {/* Overtime fee: Time window & Hourly */}
                  {(currentUiFeeType === 'time_window' || currentUiFeeType === 'hourly') && (
                    <div>
                      <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                        <Clock size={11} />
                        Phí Quá Giờ (VNĐ/h) <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('overtimeFeePerHour')}
                        type="number"
                        min="0"
                        className={getInputCls(!!errors.overtimeFeePerHour)}
                        placeholder="0"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        {currentUiFeeType === 'hourly'
                          ? 'Tính thêm khi đỗ quá 24h'
                          : 'Ngoài khung giờ hoạt động'}
                      </p>
                      {errors.overtimeFeePerHour && (
                        <p className={errCls}>{errors.overtimeFeePerHour.message}</p>
                      )}
                    </div>
                  )}

                  {/* Lost card fee: always visible */}
                  <div>
                    <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <CreditCard size={11} />
                      Phí Mất Thẻ (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('lostCardFee')}
                      type="number"
                      min="0"
                      className={getInputCls(!!errors.lostCardFee)}
                      placeholder="50000"
                    />
                    {errors.lostCardFee && <p className={errCls}>{errors.lostCardFee.message}</p>}
                  </div>
                </div>
              </div>
            </>
          )}
        </form>

        {/* Actions Footer */}
        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex justify-end gap-3">
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
            className="px-6 py-2.5 text-sm font-bold text-[#9FE870] bg-[#062F28] rounded-xl hover:bg-[#062F28]/90 transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
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
