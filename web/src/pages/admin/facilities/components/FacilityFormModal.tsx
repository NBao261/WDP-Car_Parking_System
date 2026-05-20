import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, MapPin, Clock, Layers, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { facilityService, Facility, CreateFacilityPayload } from '../../../../services/facility.service';

interface FacilityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility?: Facility;
  onSuccess: () => void;
}

const DEFAULT_FORM: CreateFacilityPayload = {
  name: '',
  address: '',
  totalFloors: '' as any,
  openTime: '',
  closeTime: '',
  description: '',
};

// ── Reusable field wrapper ───────────────────────────────────────────────────
function FormField({
  label,
  required = false,
  error,
  icon: Icon,
  iconAlign = 'center',
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  icon: React.ElementType;
  iconAlign?: 'center' | 'top';
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon
          size={16}
          className={`absolute left-3 text-gray-400 ${
            iconAlign === 'top' ? 'top-3' : 'top-1/2 -translate-y-1/2'
          }`}
        />
        {children}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export function FacilityFormModal({ isOpen, onClose, facility, onSuccess }: FacilityFormModalProps) {
  const isEdit = !!facility;
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getInputClass = (fieldName: string, extra = '') => {
    const base = `w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none transition-all ${extra}`;
    if (errors[fieldName]) {
      return `${base} border border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50/10`;
    }
    return `${base} border border-gray-200 focus:ring-2 focus:ring-[#d7ee46] focus:bg-white`;
  };

  useEffect(() => {
    if (isOpen) {
      if (facility) {
        setForm({
          name: facility.name,
          address: facility.address,
          totalFloors: facility.totalFloors,
          openTime: facility.openTime,
          closeTime: facility.closeTime,
          description: facility.description || '',
        });
      } else {
        setForm(DEFAULT_FORM);
      }
      setErrors({});
    }
  }, [isOpen, facility]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Vui lòng nhập tên cơ sở';
    if (!form.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';
    if (!form.totalFloors) newErrors.totalFloors = 'Vui lòng nhập tổng số tầng';
    if (!form.openTime) newErrors.openTime = 'Vui lòng chọn giờ mở cửa';
    if (!form.closeTime) newErrors.closeTime = 'Vui lòng chọn giờ đóng cửa';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setIsSubmitting(true);
    try {
      if (isEdit && facility) {
        await facilityService.update(facility._id, form);
        toast.success('Cập nhật cơ sở thành công');
      } else {
        await facilityService.create(form);
        toast.success('Tạo cơ sở thành công');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Đã xảy ra lỗi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
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
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="text-lg font-bold text-[#060606]">
                {isEdit ? 'Sửa cơ sở' : 'Thêm cơ sở mới'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isEdit ? 'Cập nhật thông tin cơ sở' : 'Tạo tòa nhà / bãi đỗ xe mới'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="p-6 overflow-y-auto flex-1 space-y-4">
            {/* Facility Name */}
            <FormField label="Tên cơ sở" required icon={Building2} error={errors.name}>
              <input
                type="text"
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                className={getInputClass('name')}
                placeholder="Ex: Vincom Center"
              />
            </FormField>

            {/* Address */}
            <FormField label="Địa chỉ" required icon={MapPin} iconAlign="top" error={errors.address}>
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => {
                  setForm({ ...form, address: e.target.value });
                  if (errors.address) setErrors({ ...errors, address: '' });
                }}
                className={getInputClass('address', 'resize-none')}
                placeholder="Ex: 72 Le Thanh Ton, District 1, HCMC"
              />
            </FormField>

            {/* Total Floors */}
            <FormField label="Tổng số tầng" required icon={Layers} error={errors.totalFloors}>
              <input
                type="number"
                min={1}
                max={50}
                placeholder="Ex: 5"
                value={form.totalFloors}
                onChange={(e) => {
                  setForm({ ...form, totalFloors: e.target.value === '' ? ('' as any) : parseInt(e.target.value, 10) });
                  if (errors.totalFloors) setErrors({ ...errors, totalFloors: '' });
                }}
                className={getInputClass('totalFloors')}
              />
            </FormField>

            {/* Operating Hours */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Giờ hoạt động <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <div className="relative">
                    <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="time"
                      value={form.openTime}
                      onChange={(e) => {
                        setForm({ ...form, openTime: e.target.value });
                        if (errors.openTime) setErrors({ ...errors, openTime: '' });
                      }}
                      className={getInputClass('openTime')}
                    />
                  </div>
                  {errors.openTime && <p className="text-xs text-red-500 mt-1">{errors.openTime}</p>}
                </div>
                <span className="text-gray-400 font-medium text-sm mt-2.5">đến</span>
                <div className="flex-1">
                  <div className="relative">
                    <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="time"
                      value={form.closeTime}
                      onChange={(e) => {
                        setForm({ ...form, closeTime: e.target.value });
                        if (errors.closeTime) setErrors({ ...errors, closeTime: '' });
                      }}
                      className={getInputClass('closeTime')}
                    />
                  </div>
                  {errors.closeTime && <p className="text-xs text-red-500 mt-1">{errors.closeTime}</p>}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả</label>
              <div className="relative">
                <FileText size={16} className="absolute left-3 top-3 text-gray-400" />
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all resize-none"
                  placeholder="Mô tả ngắn gọn về cơ sở..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 flex justify-end gap-3 border-t border-gray-100 mt-2">
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
                className="px-5 py-2.5 text-sm font-bold text-[#060606] bg-[#d7ee46] rounded-xl hover:bg-[#c4dc32] transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isEdit ? 'Lưu thay đổi' : 'Tạo cơ sở'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
