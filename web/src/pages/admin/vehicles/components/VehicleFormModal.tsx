import { useState, useEffect } from 'react';
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
import { ICON_OPTIONS, ICON_MAP, SLOT_SIZE_LABELS } from './constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: VehicleType;
  onSuccess: () => void;
}

interface FormErrors {
  name?: string;
  code?: string;
  slotSize?: string;
  icon?: string;
}

export function VehicleFormModal({ isOpen, onClose, vehicle, onSuccess }: ModalProps) {
  const isEdit = !!vehicle;
  const [form, setForm] = useState<CreateVehicleTypePayload>({
    name: '', code: '', slotSize: '' as SlotSize, description: '', icon: '', floors: []
  });
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [floorsList, setFloorsList] = useState<Floor[]>([]);
  const [, setIsLoadingFacilities] = useState(false);
  const [selectedFacId, setSelectedFacId] = useState<string>('');
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
          slotSize: vehicle.slotSize,
          description: vehicle.description || '',
          icon: vehicle.icon || '',
          floors: vehicle.floors ? vehicle.floors.map(f => f._id) : []
        });
      } else {
        setForm({ name: '', code: '', slotSize: '' as SlotSize, description: '', icon: '', floors: [] });
      }
    }
  }, [isOpen, vehicle]);

  const fetchFacilities = async () => {
    setIsLoadingFacilities(true);
    try {
      const [facRes, floorRes] = await Promise.all([
        facilityService.getAll({ limit: 1000 }),
        floorService.getAll({ limit: 1000 })
      ]);
      setFacilities(facRes.data);
      setFloorsList(floorRes.data);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách tòa nhà');
    } finally {
      setIsLoadingFacilities(false);
    }
  };

  const availableFloors = selectedFacId
    ? floorsList.filter(fl => {
      const flFacId = typeof fl.facilityId === 'object' ? (fl.facilityId as any)._id : fl.facilityId;
      return flFacId === selectedFacId;
    })
    : [];

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = 'Vui lòng nhập tên loại xe';
    if (!isEdit && !form.code.trim()) newErrors.code = 'Vui lòng nhập mã loại xe';
    if (!form.slotSize) newErrors.slotSize = 'Vui lòng chọn kích thước slot';
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
          slotSize: form.slotSize,
          description: form.description,
          icon: form.icon,
          floors: form.floors
        };
        await vehicleTypeService.update(vehicle._id, payload);
        toast.success('Cập nhật loại xe thành công');
      } else {
        await vehicleTypeService.create(form);
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
    setForm(f => ({ ...f, name: val }));
    if (errors.name) setErrors(e => ({ ...e, name: undefined }));
  };
  const setCode = (val: string) => {
    setForm(f => ({ ...f, code: val.toUpperCase() }));
    if (errors.code) setErrors(e => ({ ...e, code: undefined }));
  };

  const inputBase = 'w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all';
  const inputOk = 'border-gray-200 focus:ring-[#d7ee46]';
  const inputErr = 'border-red-400 focus:ring-red-300 bg-red-50/30';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="text-lg font-bold text-[#060606]">{isEdit ? 'Chỉnh Sửa Loại Xe' : 'Thêm Loại Xe Mới'}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{isEdit ? 'Cập nhật thông tin loại phương tiện' : 'Tạo mới danh mục phương tiện'}</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="p-6 overflow-y-auto flex-1 space-y-4">
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
                      onClick={() => { setForm({ ...form, icon: name }); setErrors(e => ({ ...e, icon: undefined })); }}
                      className={`flex flex-col items-center justify-center gap-1.5 w-full py-3 rounded-xl border-2 transition-all ${isSelected
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-700 scale-105 shadow-sm'
                          : 'border-gray-200 text-gray-500 hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-600'
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
              {/* Preview icon đang chọn */}
              {form.icon && ICON_MAP[form.icon] && (() => {
                const SelectedIcon = ICON_MAP[form.icon];
                const selectedLabel = ICON_OPTIONS.find(o => o.name === form.icon)?.label ?? form.icon;
                return (
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                    <SelectedIcon size={14} className="text-emerald-500" />
                    <span>Đang chọn: <b className="text-gray-600">{selectedLabel}</b></span>
                  </div>
                );
              })()}
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
                placeholder="VD: Xe máy, Ô tô, Xe đạp..."
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
                disabled={isEdit}
                value={form.code}
                onChange={(e) => setCode(e.target.value)}
                className={`${inputBase} ${errors.code ? inputErr : inputOk} disabled:opacity-60 disabled:cursor-not-allowed uppercase`}
                placeholder="VD: MOTORBIKE, CAR, BICYCLE"
              />
              {errors.code && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.code}
                </p>
              )}
              {!isEdit && !errors.code && (
                <p className="text-xs text-gray-400 mt-1">Mã không thể thay đổi sau khi tạo</p>
              )}
            </div>

            {/* Slot Size */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kích Thước Slot <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(SLOT_SIZE_LABELS) as SlotSize[]).map((size) => {
                  const { label } = SLOT_SIZE_LABELS[size];
                  return (
                    <button key={size} type="button"
                      onClick={() => { setForm({ ...form, slotSize: size }); setErrors(e => ({ ...e, slotSize: undefined })); }}
                      className={`py-2 rounded-xl text-sm font-semibold border transition-all ${form.slotSize === size ? 'border-[#d7ee46] bg-[#d7ee46] text-[#060606] scale-[1.03]' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
                    >{label}</button>
                  );
                })}
              </div>
              {errors.slotSize && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <span>⚠</span> {errors.slotSize}
                </p>
              )}
            </div>

            {/* Facilities & Floors */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tòa Nhà & Tầng Hỗ Trợ</label>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {/* Facility Select */}
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 size={16} className="text-gray-500" />
                    </div>
                    <select
                      value={selectedFacId}
                      onChange={e => setSelectedFacId(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-300 transition-colors appearance-none font-medium text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer"
                    >
                      <option value="" disabled>Chọn tòa nhà</option>
                      {facilities.map(fac => (
                        <option key={fac._id} value={fac._id}>{fac.name}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown size={16} className="text-gray-400" />
                    </div>
                  </div>

                  {/* Floor Select */}
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Layers size={16} className="text-gray-500" />
                    </div>
                    <select
                      value=""
                      onChange={e => {
                        const val = e.target.value;
                        if (val && !form.floors?.includes(val)) {
                          setForm(f => ({ ...f, floors: [...(f.floors || []), val] }));
                        }
                      }}
                      className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-300 transition-colors appearance-none font-medium text-gray-700 shadow-sm hover:bg-gray-50 cursor-pointer"
                    >
                      <option value="">Thêm tầng...</option>
                      {availableFloors.map(fl => (
                        <option key={fl._id} value={fl._id} disabled={form.floors?.includes(fl._id)}>{fl.name}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <ChevronDown size={16} className="text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Selected Floors Chips */}
                {form.floors && form.floors.length > 0 ? (
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 min-h-[60px]">
                    {form.floors.map(floorId => {
                      const fl = floorsList.find(f => f._id === floorId);
                      const fac = facilities.find(f => f._id === (typeof fl?.facilityId === 'object' ? (fl.facilityId as any)._id : fl?.facilityId));
                      if (!fl) return null;
                      return (
                        <div key={floorId} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-sm shadow-sm hover:border-red-200 hover:shadow-md transition-all group">
                          <span className="font-medium text-gray-700">{fac?.name}</span>
                          <span className="text-gray-300 text-xs">/</span>
                          <span className="text-emerald-600 font-semibold">{fl.name}</span>
                          <button type="button" onClick={() => setForm(f => ({ ...f, floors: (f.floors || []).filter(id => id !== floorId) }))} className="ml-1 text-gray-300 group-hover:text-red-500 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô Tả</label>
              <textarea rows={2} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`${inputBase} ${inputOk} resize-none`}
                placeholder="Mô tả ngắn về loại xe..."
              />
            </div>

            {/* Footer */}
            <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
              <button type="button" onClick={onClose} disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-60">
                Hủy
              </button>
              <button type="submit" disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-bold text-[#060606] bg-[#d7ee46] rounded-xl hover:bg-[#c4dc32] transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2">
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
