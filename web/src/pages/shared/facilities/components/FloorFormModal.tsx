import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  X,
  Check,
  Loader2,
  Search,
  AlertTriangle,
  Car,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { floorService, Floor } from '../../../../services/floor.service';
import { slotService } from '../../../../services/slot.service';
import { VehicleType } from '../../../../services/vehicleType.service';
import { ICON_MAP } from '../../../shared/vehicles/components/constants';

interface FloorModalProps {
  isOpen: boolean;
  onClose: () => void;
  floor?: Floor;
  facilityId: string;
  vehicleTypes: VehicleType[];
  onSuccess: () => void;
  currentFloorCount?: number;
  maxFloors?: number;
}

interface SlotGroup {
  vehicleTypeId: string;
  vehicleTypeName: string;
  vehicleTypeIcon: string;
  prefix: string;
  startNumber: number | string;
  count: number | string;
}

export function FloorFormModal({
  isOpen,
  onClose,
  floor,
  facilityId,
  vehicleTypes,
  onSuccess,
  currentFloorCount,
  maxFloors,
}: FloorModalProps) {
  const isEdit = !!floor;
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Slot groups — auto-generated from selected vehicle types
  const [slotGroups, setSlotGroups] = useState<SlotGroup[]>([]);

  const getInputClass = (fieldName: string) => {
    const base =
      'w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none transition-all disabled:opacity-50';
    if (errors[fieldName]) {
      return `${base} border border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50/10`;
    }
    return `${base} border border-gray-200 focus:ring-2 focus:ring-[#9FE870] focus:bg-white`;
  };

  const isFull =
    !isEdit &&
    currentFloorCount !== undefined &&
    maxFloors !== undefined &&
    currentFloorCount >= maxFloors;

  const filteredTypes = vehicleTypes.filter((vt) =>
    vt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate total slots from all groups
  const computedTotalSlots = slotGroups.reduce((sum, g) => sum + (Number(g.count) || 0), 0);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      if (floor) {
        setName(floor.name);
        const mappedTypes = (floor.allowedVehicleTypes || []).map((vt: any) =>
          typeof vt === 'string' ? vt : vt._id
        );
        setSelectedVehicleTypes(mappedTypes);
      } else {
        setName('');
        setSelectedVehicleTypes([]);
      }
      setSlotGroups([]);
      setErrors({});
      setSearchQuery('');
    }
  }, [isOpen, floor]);

  const toggleVehicle = (id: string) => {
    setSelectedVehicleTypes((prev) => {
      const next = prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id];
      if (next.length > 0 && errors.vehicleTypes) {
        setErrors((prevErrors) => ({ ...prevErrors, vehicleTypes: '' }));
      }
      return next;
    });
  };

  const updateSlotGroup = (index: number, partial: Partial<SlotGroup>) => {
    setSlotGroups((prev) => prev.map((g, i) => (i === index ? { ...g, ...partial } : g)));
    Object.keys(partial).forEach((key) => {
      const errKey = `slotGroup_${index}_${key}`;
      if (errors[errKey]) {
        setErrors((prev) => ({ ...prev, [errKey]: '' }));
      }
    });
  };

  // Step 1 → Step 2: generate slot groups from selected vehicle types
  const goToStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Vui lòng nhập tên tầng';
    if (selectedVehicleTypes.length === 0)
      newErrors.vehicleTypes = 'Vui lòng chọn ít nhất một loại xe';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    // Auto-generate one slot group per selected vehicle type
    const groups: SlotGroup[] = selectedVehicleTypes.map((vtId) => {
      const vt = vehicleTypes.find((v) => v._id === vtId);
      // Check if group already exists (preserve user input when going back & forth)
      const existing = slotGroups.find((g) => g.vehicleTypeId === vtId);
      if (existing) return existing;
      return {
        vehicleTypeId: vtId,
        vehicleTypeName: vt?.name || '',
        vehicleTypeIcon: vt?.icon || '',
        prefix: (vt?.code || '').toUpperCase().slice(0, 3),
        startNumber: 1,
        count: '',
      };
    });
    setSlotGroups(groups);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit) {
      // Edit mode: validate and submit from step 1
      const newErrors: Record<string, string> = {};
      if (!name.trim()) newErrors.name = 'Vui lòng nhập tên tầng';
      if (selectedVehicleTypes.length === 0)
        newErrors.vehicleTypes = 'Vui lòng chọn ít nhất một loại xe';
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
      setIsSubmitting(true);
      try {
        await floorService.update(floor!._id, { name });
        await floorService.assignVehicleTypes(floor!._id, selectedVehicleTypes);
        toast.success('Cập nhật tầng thành công');
        onSuccess();
        onClose();
      } catch (err: any) {
        toast.error(err.message || 'Đã xảy ra lỗi');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Create mode: validate step 2
    const newErrors: Record<string, string> = {};
    slotGroups.forEach((g, i) => {
      if (!g.prefix.trim()) newErrors[`slotGroup_${i}_prefix`] = 'Nhập tiền tố';
      if (!g.count || Number(g.count) < 1)
        newErrors[`slotGroup_${i}_count`] = 'Nhập số lượng';
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    if (isFull) {
      toast.error(`Không thể thêm tầng. Cơ sở này chỉ cho phép tối đa ${maxFloors} tầng.`);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create floor
      const created = await floorService.create({
        facilityId,
        name,
        totalSlots: computedTotalSlots,
      });
      const floorId = created.data._id;

      // 2. Assign vehicle types
      await floorService.assignVehicleTypes(floorId, selectedVehicleTypes);

      // 3. Create slots for each group
      for (const group of slotGroups) {
        if (!group.prefix || !group.count) continue;
        await slotService.createBulk({
          facilityId,
          floorId,
          vehicleType: group.vehicleTypeId,
          prefix: group.prefix.toUpperCase(),
          startNumber: Number(group.startNumber) || 1,
          count: Number(group.count),
        });
      }

      toast.success(`Tạo tầng "${name}" thành công với ${computedTotalSlots} slot`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Đã xảy ra lỗi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
              <h2 className="text-lg font-bold text-[#062F28]">
                {isEdit ? 'Sửa tầng' : 'Thêm tầng mới'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isEdit
                  ? 'Cập nhật thông tin & loại xe'
                  : step === 1
                    ? 'Bước 1/2 — Thông tin tầng'
                    : 'Bước 2/2 — Phân bổ slot'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Step indicator (create mode only) */}
          {!isEdit && !isFull && (
            <div className="px-6 pt-4 pb-0">
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                    step === 1
                      ? 'bg-[#9FE870] text-[#062F28]'
                      : 'bg-[#062F28] text-white'
                  }`}
                >
                  {step > 1 ? <Check size={14} /> : '1'}
                </div>
                <div
                  className={`flex-1 h-0.5 rounded transition-colors ${
                    step >= 2 ? 'bg-[#9FE870]' : 'bg-gray-200'
                  }`}
                />
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                    step === 2
                      ? 'bg-[#9FE870] text-[#062F28]'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  2
                </div>
              </div>
              <div className="flex justify-between mt-1.5 mb-1">
                <span className={`text-[11px] font-medium ${step === 1 ? 'text-[#062F28]' : 'text-gray-400'}`}>
                  Thông tin
                </span>
                <span className={`text-[11px] font-medium ${step === 2 ? 'text-[#062F28]' : 'text-gray-400'}`}>
                  Phân bổ slot
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="p-6 overflow-y-auto flex-1 space-y-4">
            {isFull ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Đã đạt giới hạn</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Cơ sở này chỉ cho phép tối đa {maxFloors} tầng. Bạn không thể thêm tầng mới.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors shadow-sm w-full"
                >
                  Đã hiểu và Đóng
                </button>
              </div>
            ) : (
              <>
                {/* ======== STEP 1: Tên tầng + Chọn loại xe ======== */}
                {(step === 1 || isEdit) && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {/* Floor name */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                          Tên tầng <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name) setErrors({ ...errors, name: '' });
                          }}
                          className={getInputClass('name')}
                          placeholder="Floor B1, Floor 1, Zone A..."
                        />
                        {errors.name && (
                          <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                        )}
                      </div>

                      {/* Vehicle type selector */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Các loại xe cho phép <span className="text-red-500">*</span>
                            <span className="text-gray-400 font-normal ml-1">
                              ({selectedVehicleTypes.length} đã chọn)
                            </span>
                          </label>
                        </div>

                        <div className="relative mb-3">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={14} className="text-gray-400" />
                          </div>
                          <input
                            type="text"
                            placeholder="Tìm kiếm loại xe..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#9FE870] focus:bg-white transition-all"
                          />
                        </div>

                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                          {filteredTypes.map((vt) => {
                            const isSelected = selectedVehicleTypes.includes(vt._id);
                            return (
                              <button
                                key={vt._id}
                                type="button"
                                onClick={() => toggleVehicle(vt._id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                                  isSelected
                                    ? 'bg-[#9FE870] text-[#062F28] border-[#9FE870] scale-[1.03]'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <span className="mr-1">
                                  {(() => {
                                    const IconComp =
                                      vt.icon && ICON_MAP[vt.icon] ? ICON_MAP[vt.icon] : Car;
                                    return <IconComp size={16} />;
                                  })()}
                                </span>
                                {vt.name}
                                {isSelected && <Check size={13} />}
                              </button>
                            );
                          })}
                          {filteredTypes.length === 0 && (
                            <p className="text-xs text-gray-400 py-2">
                              Không tìm thấy loại xe phù hợp với "{searchQuery}".
                            </p>
                          )}
                        </div>
                        {errors.vehicleTypes && (
                          <p className="text-xs text-red-500 mt-2">{errors.vehicleTypes}</p>
                        )}
                      </div>

                      {/* Step 1 buttons */}
                      <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={onClose}
                          disabled={isSubmitting}
                          className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-60"
                        >
                          Hủy
                        </button>
                        {isEdit ? (
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 text-sm font-bold text-white bg-[#062F28] rounded-xl hover:bg-[#062F28]/90 transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
                          >
                            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                            Lưu Thay Đổi
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={goToStep2}
                            className="px-5 py-2.5 text-sm font-bold text-white bg-[#062F28] rounded-xl hover:bg-[#062F28]/90 transition-colors shadow-sm flex items-center gap-2"
                          >
                            Tiếp theo
                            <ChevronRight size={16} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}

                {/* ======== STEP 2: Phân bổ slot (create only) ======== */}
                {step === 2 && !isEdit && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-gray-700">
                          Phân bổ slot cho từng loại xe
                        </label>
                        <span className="text-xs font-medium text-[#062F28] bg-[#9FE870]/30 px-2.5 py-1 rounded-lg">
                          Tổng: {computedTotalSlots} slot
                        </span>
                      </div>

                      <div className="space-y-3">
                        {slotGroups.map((group, index) => {
                          const Icon =
                            group.vehicleTypeIcon && ICON_MAP[group.vehicleTypeIcon]
                              ? ICON_MAP[group.vehicleTypeIcon]
                              : Car;

                          return (
                            <div
                              key={group.vehicleTypeId}
                              className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-3"
                            >
                              {/* Vehicle type header (fixed, not selectable) */}
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-[#9FE870]/20 flex items-center justify-center shrink-0">
                                  <Icon size={15} className="text-[#062F28]" />
                                </div>
                                <span className="text-sm font-bold text-[#062F28]">
                                  {group.vehicleTypeName}
                                </span>
                              </div>

                              {/* Prefix + Start + Count */}
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <label className="text-xs font-medium text-gray-600 block mb-1">
                                    Tiền tố
                                  </label>
                                  <input
                                    type="text"
                                    value={group.prefix}
                                    onChange={(e) =>
                                      updateSlotGroup(index, {
                                        prefix: e.target.value.toUpperCase(),
                                      })
                                    }
                                    placeholder="XM"
                                    maxLength={4}
                                    className={`w-full border rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9FE870] ${
                                      errors[`slotGroup_${index}_prefix`]
                                        ? 'border-red-400'
                                        : 'border-gray-200'
                                    }`}
                                  />
                                  {errors[`slotGroup_${index}_prefix`] && (
                                    <p className="text-[10px] text-red-500 mt-0.5">
                                      {errors[`slotGroup_${index}_prefix`]}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-600 block mb-1">
                                    Từ số
                                  </label>
                                  <input
                                    type="number"
                                    min={1}
                                    value={group.startNumber}
                                    onChange={(e) =>
                                      updateSlotGroup(index, {
                                        startNumber:
                                          e.target.value === '' ? '' : Number(e.target.value),
                                      })
                                    }
                                    placeholder="1"
                                    className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9FE870]"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-600 block mb-1">
                                    Số lượng
                                  </label>
                                  <input
                                    type="number"
                                    min={1}
                                    max={999}
                                    value={group.count}
                                    onChange={(e) =>
                                      updateSlotGroup(index, {
                                        count:
                                          e.target.value === '' ? '' : Number(e.target.value),
                                      })
                                    }
                                    placeholder="50"
                                    className={`w-full border rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9FE870] ${
                                      errors[`slotGroup_${index}_count`]
                                        ? 'border-red-400'
                                        : 'border-gray-200'
                                    }`}
                                  />
                                  {errors[`slotGroup_${index}_count`] && (
                                    <p className="text-[10px] text-red-500 mt-0.5">
                                      {errors[`slotGroup_${index}_count`]}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Preview */}
                              {group.prefix && Number(group.count) > 0 && (
                                <div className="bg-white rounded-lg px-3 py-2 border border-gray-100">
                                  <p className="text-xs text-gray-500">
                                    <span className="font-semibold text-[#062F28]">
                                      Dự kiến:
                                    </span>{' '}
                                    <span className="font-mono font-semibold text-[#062F28]">
                                      {group.prefix}
                                      {Number(group.startNumber) || 1}
                                    </span>
                                    {Number(group.count) > 1 && (
                                      <>
                                        {' → '}
                                        <span className="font-mono font-semibold text-[#062F28]">
                                          {group.prefix}
                                          {(Number(group.startNumber) || 1) +
                                            Number(group.count) -
                                            1}
                                        </span>
                                      </>
                                    )}
                                    <span className="ml-1.5 text-gray-400">
                                      ({group.vehicleTypeName} — {Number(group.count)} slot)
                                    </span>
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Step 2 buttons */}
                      <div className="pt-2 flex justify-between gap-3 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => {
                            setStep(1);
                            setErrors({});
                          }}
                          disabled={isSubmitting}
                          className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-60 flex items-center gap-1.5"
                        >
                          <ChevronLeft size={16} />
                          Quay lại
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-5 py-2.5 text-sm font-bold text-white bg-[#062F28] rounded-xl hover:bg-[#062F28]/90 transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
                        >
                          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                          Tạo Tầng ({computedTotalSlots} slot)
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
