import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { X, Check, Loader2, Search, AlertTriangle, Car } from 'lucide-react';
import { floorService, Floor } from '../../../../services/floor.service';
import { VehicleType } from '../../../../services/vehicleType.service';
import { ICON_MAP } from '../../vehicles/components/constants';

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

export function FloorFormModal({ isOpen, onClose, floor, facilityId, vehicleTypes, onSuccess, currentFloorCount, maxFloors }: FloorModalProps) {
  const isEdit = !!floor;
  const [name, setName] = useState('');
  const [totalSlots, setTotalSlots] = useState<number | string>('');
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getInputClass = (fieldName: string) => {
    const base = "w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none transition-all disabled:opacity-50";
    if (errors[fieldName]) {
      return `${base} border border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50/10`;
    }
    return `${base} border border-gray-200 focus:ring-2 focus:ring-[#d7ee46] focus:bg-white`;
  };

  const isFull = !isEdit && currentFloorCount !== undefined && maxFloors !== undefined && currentFloorCount >= maxFloors;

  const filteredTypes = vehicleTypes.filter(vt =>
    vt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      if (floor) {
        setName(floor.name);
        setTotalSlots(floor.totalSlots);
        const mappedTypes = (floor.allowedVehicleTypes || []).map((vt: any) =>
          typeof vt === 'string' ? vt : vt._id
        );
        setSelectedVehicleTypes(mappedTypes);
      } else {
        setName('');
        setTotalSlots('');
        setSelectedVehicleTypes([]);
      }
      setErrors({});
    }
  }, [isOpen, floor]);

  const toggleVehicle = (id: string) => {
    setSelectedVehicleTypes((prev) => {
      const next = prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id];
      if (next.length > 0 && errors.vehicleTypes) {
        setErrors(prevErrors => ({ ...prevErrors, vehicleTypes: '' }));
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Vui lòng nhập tên tầng';
    if (!totalSlots) newErrors.totalSlots = 'Vui lòng nhập tổng số slot';
    if (selectedVehicleTypes.length === 0) newErrors.vehicleTypes = 'Vui lòng chọn ít nhất một loại xe';

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
      if (isEdit && floor) {
        await floorService.update(floor._id, { name, totalSlots: Number(totalSlots) });
        await floorService.assignVehicleTypes(floor._id, selectedVehicleTypes);
        toast.success('Cập nhật tầng thành công');
      } else {
        const created = await floorService.create({ facilityId, name, totalSlots: Number(totalSlots) });
        await floorService.assignVehicleTypes(created.data._id, selectedVehicleTypes);
        toast.success('Tạo tầng thành công');
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="text-lg font-bold text-[#060606]">{isEdit ? 'Sửa tầng' : 'Thêm tầng mới'}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{isEdit ? 'Cập nhật thông tin & loại xe' : 'Tạo tầng và gán loại xe'}</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>

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
                <button type="button" onClick={onClose}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors shadow-sm w-full">
                  Đã hiểu và Đóng
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tên tầng <span className="text-red-500">*</span></label>
                  <input type="text" value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    className={getInputClass('name')}
                    placeholder="Floor B1, Floor 1, Zone A..."
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tổng slot <span className="text-red-500">*</span></label>
                  <input type="number" min={1} max={999} placeholder="50" value={totalSlots}
                    onChange={(e) => {
                      setTotalSlots(e.target.value === '' ? '' : parseInt(e.target.value, 10));
                      if (errors.totalSlots) setErrors({ ...errors, totalSlots: '' });
                    }}
                    className={getInputClass('totalSlots')}
                  />
                  {errors.totalSlots && <p className="text-xs text-red-500 mt-1">{errors.totalSlots}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Các loại xe cho phép <span className="text-red-500">*</span>
                      <span className="text-gray-400 font-normal ml-1">({selectedVehicleTypes.length} đã chọn)</span>
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
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:bg-white transition-all"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                    {filteredTypes.map((vt) => {
                      const isSelected = selectedVehicleTypes.includes(vt._id);
                      return (
                        <button key={vt._id} type="button" onClick={() => toggleVehicle(vt._id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${isSelected
                            ? 'bg-[#d7ee46] text-[#060606] border-[#c4dc32] scale-[1.03]'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <span className="mr-1">
                            {(() => {
                              const IconComp = (vt.icon && ICON_MAP[vt.icon]) ? ICON_MAP[vt.icon] : Car;
                              return <IconComp size={16} />;
                            })()}
                          </span>
                          {vt.name}
                          {isSelected && <Check size={13} />}
                        </button>
                      );
                    })}
                    {filteredTypes.length === 0 && (
                      <p className="text-xs text-gray-400 py-2">Không tìm thấy loại xe phù hợp với "{searchQuery}".</p>
                    )}
                  </div>
                  {errors.vehicleTypes && <p className="text-xs text-red-500 mt-2">{errors.vehicleTypes}</p>}
                </div>

                <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
                  <button type="button" onClick={onClose} disabled={isSubmitting}
                    className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-60">
                    Hủy
                  </button>
                  <button type="submit" disabled={isSubmitting}
                    className="px-5 py-2.5 text-sm font-bold text-[#060606] bg-[#d7ee46] rounded-xl hover:bg-[#c4dc32] transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2">
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    {isEdit ? 'Lưu Thay Đổi' : 'Tạo Tầng'}
                  </button>
                </div>
              </>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
