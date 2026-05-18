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
import { ICON_OPTIONS, SLOT_SIZE_LABELS } from './constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: VehicleType;
  onSuccess: () => void;
}

export function VehicleFormModal({ isOpen, onClose, vehicle, onSuccess }: ModalProps) {
  const isEdit = !!vehicle;
  const [form, setForm] = useState<CreateVehicleTypePayload>({
    name: '', code: '', slotSize: 'medium', description: '', icon: '🚗',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (vehicle) {
        setForm({
          name: vehicle.name,
          code: vehicle.code,
          slotSize: vehicle.slotSize,
          description: vehicle.description || '',
          icon: vehicle.icon || '🚗'
        });
      } else {
        setForm({ name: '', code: '', slotSize: 'medium', description: '', icon: '🚗' });
      }
    }
  }, [isOpen, vehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        toast.success('Vehicle type updated successfully');
      } else {
        await vehicleTypeService.create(form);
        toast.success('Vehicle type created successfully');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <h2 className="text-lg font-bold text-[#060606]">{isEdit ? 'Edit Vehicle Type' : 'Add New Vehicle Type'}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{isEdit ? 'Update vehicle information' : 'Create a new vehicle category'}</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
            {/* Icon picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Icon</label>
              <div className="flex gap-2 flex-wrap">
                {ICON_OPTIONS.map((icon) => (
                  <button key={icon} type="button"
                    onClick={() => setForm({ ...form, icon })}
                    className={`w-10 h-10 text-xl rounded-xl border-2 transition-all flex items-center justify-center ${form.icon === icon ? 'border-[#d7ee46] bg-[#d7ee46]/10 scale-110' : 'border-gray-200 hover:border-gray-300'}`}
                  >{icon}</button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vehicle Name <span className="text-red-500">*</span></label>
              <input type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all"
                placeholder="Ex: Motorbike, Car, Bicycle..."
              />
            </div>

            {/* Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vehicle Code <span className="text-red-500">*</span></label>
              <input type="text" required disabled={isEdit} value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed uppercase"
                placeholder="Ex: MOTORBIKE, CAR, BICYCLE"
              />
              {!isEdit && <p className="text-xs text-gray-400 mt-1">Code cannot be changed after creation</p>}
            </div>

            {/* Slot Size */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Slot Size <span className="text-red-500">*</span></label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea rows={2} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all resize-none"
                placeholder="Short description..."
              />
            </div>

            {/* Footer */}
            <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
              <button type="button" onClick={onClose} disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-60">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-bold text-[#060606] bg-[#d7ee46] rounded-xl hover:bg-[#c4dc32] transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2">
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isEdit ? 'Save Changes' : 'Create Type'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
