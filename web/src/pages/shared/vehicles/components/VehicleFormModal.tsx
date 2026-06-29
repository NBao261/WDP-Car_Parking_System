import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { X, Loader2, Building2, Layers, ChevronDown } from 'lucide-react';
import {
  vehicleTypeService,
  VehicleType,
  SlotSize,
  CreateVehicleTypePayload,
  UpdateVehicleTypePayload,
} from '../../../../services/vehicleType.service';
import { facilityService, Facility } from '../../../../services/facility.service';
import { floorService, Floor } from '../../../../services/floor.service';
import { ICON_OPTIONS } from './constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: VehicleType;
  onSuccess: () => void;
}

interface FormErrors {
  name?: string;
  code?: string;
  icon?: string;
}

export function VehicleFormModal({ isOpen, onClose, vehicle, onSuccess }: ModalProps) {
  const isEdit = !!vehicle;
  const [form, setForm] = useState<Omit<CreateVehicleTypePayload, 'slotSize'>>({
    name: '',
    code: '',
    description: '',
    icon: '',
    requiresPlate: true,
    floors: [],
  });
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [floorsList, setFloorsList] = useState<Floor[]>([]);
  const [, setIsLoadingFacilities] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      fetchFacilities();
      if (vehicle) {
        setForm({
          name: vehicle.name,
          code: vehicle.code,
          description: vehicle.description || '',
          icon: vehicle.icon || '',
          requiresPlate: vehicle.requiresPlate !== false,
          floors: vehicle.floors ? vehicle.floors.map((f) => f._id) : [],
        });
      } else {
        setForm({
          name: '',
          code: '',
          description: '',
          icon: '',
          requiresPlate: true,
          floors: [],
        });
      }
    }
  }, [isOpen, vehicle]);

  const fetchFacilities = async () => {
    setIsLoadingFacilities(true);
    try {
      const [facRes, floorRes] = await Promise.all([
        facilityService.getAll({ limit: 1000 }),
        floorService.getAll({ limit: 1000 }),
      ]);
      setFloorsList(floorRes.data);

      if (vehicle) {
        const initialFacIds = new Set<string>();
        vehicle.floors?.forEach((fl) => {
          const facId = typeof fl.facilityId === 'object' ? (fl.facilityId as any)._id : fl.facilityId;
          if (facId) {
            initialFacIds.add(facId);
          }
        });

        // Sắp xếp các tòa nhà đã gán lên đầu danh sách
        const sortedFacs = [...facRes.data].sort((a, b) => {
          const aSel = initialFacIds.has(a._id);
          const bSel = initialFacIds.has(b._id);
          if (aSel && !bSel) return -1;
          if (!aSel && bSel) return 1;
          return 0;
        });
        setFacilities(sortedFacs);
      } else {
        setFacilities(facRes.data);
      }
    } catch (err) {
      toast.error('Lỗi khi tải danh sách tòa nhà');
    } finally {
      setIsLoadingFacilities(false);
    }
  };

  const toggleFloor = (floorId: string) => {
    setForm((f) => {
      const floors = f.floors || [];
      if (floors.includes(floorId)) {
        return { ...f, floors: floors.filter((id) => id !== floorId) };
      }
      return { ...f, floors: [...floors, floorId] };
    });
  };

  const toggleAllFloorsInFacility = (facId: string) => {
    const facilityFloorIds = floorsList
      .filter((fl) => {
        const flFacId = typeof fl.facilityId === 'object' ? (fl.facilityId as any)._id : fl.facilityId;
        return flFacId === facId;
      })
      .map((fl) => fl._id);
    
    if (facilityFloorIds.length === 0) return;

    const allSelected = facilityFloorIds.every((id) => (form.floors || []).includes(id));

    setForm((f) => {
      let currentFloors = f.floors || [];
      if (allSelected) {
        currentFloors = currentFloors.filter((id) => !facilityFloorIds.includes(id));
      } else {
        currentFloors = Array.from(new Set([...currentFloors, ...facilityFloorIds]));
      }
      return { ...f, floors: currentFloors };
    });
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = 'Vui lòng nhập tên loại xe';
    if (!isEdit && !form.code.trim()) newErrors.code = 'Vui lòng nhập mã loại xe';
    if (!form.icon) newErrors.icon = 'Vui lòng chọn biểu tượng';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      if (isEdit && vehicle) {
        const payload: UpdateVehicleTypePayload = {
          name: form.name,
          slotSize: 'medium' as SlotSize,
          description: form.description,
          icon: form.icon,
          requiresPlate: form.requiresPlate,
          floors: form.floors,
        };
        await vehicleTypeService.update(vehicle._id, payload);
        toast.success('Cập nhật loại xe thành công');
      } else {
        const payload: CreateVehicleTypePayload = {
          ...form,
          slotSize: 'medium' as SlotSize,
        };
        await vehicleTypeService.create(payload);
        toast.success('Tạo loại xe mới thành công');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Đã xảy ra lỗi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear error on field change
  const setName = (val: string) => {
    setForm((f) => ({ ...f, name: val }));
    if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
  };
  const setCode = (val: string) => {
    setForm((f) => ({ ...f, code: val.toUpperCase() }));
    if (errors.code) setErrors((e) => ({ ...e, code: undefined }));
  };

  const inputBase =
    'w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all';
  const inputOk = 'border-gray-200 focus:ring-[#d7ee46]';
  const inputErr = 'border-red-400 focus:ring-red-300 bg-red-50/30';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="text-lg font-bold text-[#062F28]">
                {isEdit ? 'Chỉnh Sửa Loại Xe' : 'Thêm Loại Xe Mới'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isEdit ? 'Cập nhật thông tin loại phương tiện' : 'Tạo mới danh mục phương tiện'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="p-6 overflow-y-auto flex-1 flex flex-col space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Icon picker */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Biểu Tượng <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {ICON_OPTIONS.map(({ name, label, Icon }) => {
                      const isSelected = form.icon === name;
                      return (
                        <button
                          key={name}
                          type="button"
                          title={label}
                          onClick={() => {
                            setForm({ ...form, icon: name });
                            setErrors((e) => ({ ...e, icon: undefined }));
                          }}
                          className={`flex flex-col items-center justify-center gap-1.5 w-full py-3 rounded-xl border-2 transition-all ${isSelected
                            ? 'border-[#9FE870] bg-[#9FE870]/15 text-[#062F28] scale-105 shadow-sm'
                            : 'border-gray-200 text-gray-500 hover:border-[#9FE870]/50 hover:bg-[#9FE870]/5 hover:text-[#062F28]'
                            }`}
                        >
                          <Icon size={20} strokeWidth={1.5} />
                          <span className="text-[10px] font-semibold leading-none truncate w-full text-center px-1">
                            {label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.icon && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.icon}
                    </p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Tên Loại Xe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setName(e.target.value)}
                    className={`${inputBase} ${errors.name ? inputErr : inputOk}`}
                    placeholder="Xe máy, Ô tô, Xe đạp"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.name}
                    </p>
                  )}
                </div>

                {/* Code */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Mã Loại Xe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setCode(e.target.value)}
                    className={`${inputBase} ${errors.code ? inputErr : inputOk} uppercase`}
                    placeholder="MOTORBIKE, CAR, BICYCLE"
                  />
                  {errors.code && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.code}
                    </p>
                  )}
                </div>

                {/* Requires Plate Toggle */}
                <div>
                  <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Yêu cầu Biển số</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {form.requiresPlate !== false
                          ? 'Loại xe này cần quét biển số khi vào/ra'
                          : 'Xe không cần biển số (VD: xe đạp) — dùng ảnh đối chiếu'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, requiresPlate: !f.requiresPlate }))}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${form.requiresPlate !== false ? 'bg-[#9FE870]' : 'bg-gray-300'
                        }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${form.requiresPlate !== false ? 'translate-x-5' : 'translate-x-0'
                          }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Facilities & Floors */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tòa Nhà Áp Dụng
                  </label>

                  {facilities.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Không có tòa nhà khả dụng</p>
                  ) : (
                    <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto custom-scrollbar p-1">
                      {facilities.map((fac) => {
                        const facilityFloors = floorsList.filter((fl) => {
                          const flFacId = typeof fl.facilityId === 'object' ? (fl.facilityId as any)._id : fl.facilityId;
                          return flFacId === fac._id;
                        });
                        
                        const hasFloors = facilityFloors.length > 0;
                        const allSelected = hasFloors && facilityFloors.every(fl => (form.floors || []).includes(fl._id));
                        const someSelected = hasFloors && facilityFloors.some(fl => (form.floors || []).includes(fl._id));
                        
                        return (
                          <div key={fac._id} className={`border rounded-xl p-3 transition-all ${someSelected ? 'border-[#9FE870] bg-[#9FE870]/5' : 'border-gray-200 bg-white'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex-1 pr-2">
                                <span className="block text-sm font-bold text-gray-900">
                                  {fac.name}
                                </span>
                                {fac.address && (
                                  <span className="block text-[11px] text-gray-500 mt-0.5 truncate" title={fac.address}>
                                    {fac.address}
                                  </span>
                                )}
                              </div>
                              {hasFloors ? (
                                <button
                                  type="button"
                                  onClick={() => toggleAllFloorsInFacility(fac._id)}
                                  className={`text-xs px-2.5 py-1 rounded-lg transition-colors font-medium whitespace-nowrap ${allSelected ? 'bg-[#9FE870] text-[#062F28]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                  {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                </button>
                              ) : (
                                <span className="text-[11px] italic text-red-500 font-medium px-2 py-1 bg-red-50 rounded-md whitespace-nowrap">
                                  Chưa cấu hình tầng
                                </span>
                              )}
                            </div>
                            
                            {hasFloors && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {facilityFloors.map((fl) => {
                                  const isSelected = (form.floors || []).includes(fl._id);
                                  return (
                                    <div
                                      key={fl._id}
                                      onClick={() => toggleFloor(fl._id)}
                                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-all select-none ${isSelected
                                        ? 'border-[#9FE870] bg-[#9FE870]/20 text-[#062F28] font-bold shadow-sm'
                                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => {}}
                                        className="w-3.5 h-3.5 rounded text-[#062F28] border-gray-300 focus:ring-[#9FE870] accent-[#062F28] shrink-0 pointer-events-none"
                                      />
                                      <span className="whitespace-nowrap font-medium text-[13px]">{fl.name}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô Tả</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`${inputBase} ${inputOk} resize-none`}
                placeholder="Mô tả ngắn về loại xe..."
              />
            </div>

            {/* Footer */}
            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-bold text-[#062F28] bg-[#9FE870] rounded-xl hover:bg-[#9FE870]/80 transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isEdit ? 'Lưu Thay Đổi' : 'Tạo Loại Xe'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
