import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { X, Loader2 } from 'lucide-react';
import {
  vehicleTypeService,
  VehicleType,
  SlotSize,
  CreateVehicleTypePayload,
  UpdateVehicleTypePayload,
} from '../../../../services/vehicleType.service';
import { ICON_OPTIONS, ICON_MAP, DEFAULT_ICON, SLOT_SIZE_LABELS } from './constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: VehicleType;
  onSuccess: () => void;
}

interface FormErrors {
  name?: string;
  code?: string;
}

export function VehicleFormModal({ isOpen, onClose, vehicle, onSuccess }: ModalProps) {
  const isEdit = !!vehicle;
  const [form, setForm] = useState<CreateVehicleTypePayload>({
    name: '', code: '', slotSize: 'medium', description: '', icon: DEFAULT_ICON,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (vehicle) {
        setForm({
          name: vehicle.name,
          code: vehicle.code,
          slotSize: vehicle.slotSize,
          description: vehicle.description || '',
          icon: vehicle.icon || DEFAULT_ICON
        });
      } else {
        setForm({ name: '', code: '', slotSize: 'medium', description: '', icon: DEFAULT_ICON });
      }
    }
  }, [isOpen, vehicle]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = 'Vui lòng nhập tên loại xe';
    if (!isEdit && !form.code.trim()) newErrors.code = 'Vui lòng nhập mã loại xe';
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
          icon: form.icon
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
  const inputOk   = 'border-gray-200 focus:ring-[#d7ee46]';
  const inputErr  = 'border-red-400 focus:ring-red-300 bg-red-50/30';

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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Biểu Tượng</label>
              <div className="grid grid-cols-4 gap-2">
                {ICON_OPTIONS.map(({ name, label, Icon }) => {
                  const isSelected = form.icon === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      title={label}
                      onClick={() => setForm({ ...form, icon: name })}
                      className={`flex flex-col items-center justify-center gap-1.5 w-full py-3 rounded-xl border-2 transition-all ${
                        isSelected
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
                      onClick={() => setForm({ ...form, slotSize: size })}
                      className={`py-2 rounded-xl text-sm font-semibold border transition-all ${form.slotSize === size ? 'border-[#d7ee46] bg-[#d7ee46] text-[#060606] scale-[1.03]' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
                    >{label}</button>
                  );
                })}
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
