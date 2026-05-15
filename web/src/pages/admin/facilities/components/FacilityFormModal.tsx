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
  totalFloors: 1,
  openTime: '06:00',
  closeTime: '22:00',
  description: '',
};

export function FacilityFormModal({ isOpen, onClose, facility, onSuccess }: FacilityFormModalProps) {
  const isEdit = !!facility;
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    }
  }, [isOpen, facility]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEdit && facility) {
        await facilityService.update(facility._id, form);
        toast.success('Cập nhật bãi xe thành công');
      } else {
        await facilityService.create(form);
        toast.success('Tạo bãi xe thành công');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Đã có lỗi xảy ra');
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
                {isEdit ? 'Chỉnh sửa bãi xe' : 'Thêm bãi xe mới'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isEdit ? 'Cập nhật thông tin cơ sở bãi đỗ xe' : 'Tạo mới một tòa nhà / bãi đỗ xe'}
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
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
            {/* Tên bãi xe */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Tên bãi xe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all"
                  placeholder="VD: Tòa nhà Vincom Center"
                />
              </div>
            </div>

            {/* Địa chỉ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                <textarea
                  required
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all resize-none"
                  placeholder="VD: 72 Lê Thánh Tôn, Quận 1, TP.HCM"
                />
              </div>
            </div>

            {/* Số tầng */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Số tầng đỗ xe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Layers size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  required
                  min={1}
                  max={50}
                  value={form.totalFloors}
                  onChange={(e) => setForm({ ...form, totalFloors: Number(e.target.value) })}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Giờ hoạt động */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Giờ hoạt động <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3 items-center">
                <div className="relative flex-1">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="time"
                    required
                    value={form.openTime}
                    onChange={(e) => setForm({ ...form, openTime: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all"
                  />
                </div>
                <span className="text-gray-400 font-medium text-sm">đến</span>
                <div className="relative flex-1">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="time"
                    required
                    value={form.closeTime}
                    onChange={(e) => setForm({ ...form, closeTime: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả</label>
              <div className="relative">
                <FileText size={16} className="absolute left-3 top-3 text-gray-400" />
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all resize-none"
                  placeholder="Mô tả ngắn về bãi xe..."
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
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-bold text-[#060606] bg-[#d7ee46] rounded-xl hover:bg-[#c4dc32] transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isEdit ? 'Lưu thay đổi' : 'Tạo bãi xe'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
