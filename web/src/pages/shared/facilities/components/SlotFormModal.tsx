import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { X, Loader2, Check, Car, Search } from 'lucide-react';
import { ICON_MAP } from '../../../shared/vehicles/components/constants';
import { slotService } from '../../../../services/slot.service';
import { VehicleType } from '../../../../services/vehicleType.service';

interface SlotFormModalProps {
  facilityId: string;
  floorId: string;
  vehicleTypes: VehicleType[];
  totalSlots: number;
  currentSlotCount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function SlotFormModal({
  facilityId,
  floorId,
  vehicleTypes,
  totalSlots,
  currentSlotCount,
  onClose,
  onSuccess,
}: SlotFormModalProps) {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [loading, setLoading] = useState(false);
  const [vehicleType, setVehicleType] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (
      vehicleTypes.length > 0 &&
      vehicleType &&
      !vehicleTypes.some((vt) => vt._id === vehicleType)
    ) {
      setVehicleType('');
    }
  }, [vehicleTypes, vehicleType]);

  // Single
  const [code, setCode] = useState('');

  // Bulk
  const [prefix, setPrefix] = useState('');
  const [startNumber, setStartNumber] = useState<number | string>('');
  const [count, setCount] = useState<number | string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const filteredTypes = vehicleTypes.filter((vt) =>
    vt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const remainingSlots = Math.max(0, totalSlots - currentSlotCount);
  const isFull = remainingSlots === 0;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!vehicleType) newErrors.vehicleType = 'Vui lòng chọn loại xe';

    if (mode === 'single') {
      if (!code.trim()) newErrors.code = 'Vui lòng nhập mã slot';
    } else {
      if (!prefix.trim()) newErrors.prefix = 'Vui lòng nhập tiền tố';
      if (!startNumber) newErrors.startNumber = 'Vui lòng nhập số bắt đầu';
      if (!count) newErrors.count = 'Vui lòng nhập số lượng';
      else if (Number(count) > remainingSlots)
        newErrors.count = `Chỉ còn ${remainingSlots} slot trống. Vui lòng giảm số lượng.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (isFull) {
      toast.error(`Tầng đã đạt giới hạn ${totalSlots} slots`);
      return;
    }
    setLoading(true);
    try {
      if (mode === 'single') {
        if (!code.trim()) {
          toast.error('Vui lòng nhập mã slot');
          return;
        }
        await slotService.create({
          facilityId,
          floorId,
          vehicleTypeId: vehicleType,
          code: code.toUpperCase(),
        });
        toast.success(`Đã tạo slot ${code}`);
      } else {
        const numStart = Number(startNumber);
        const numCount = Number(count);
        const res = await slotService.createBulk({
          facilityId,
          floorId,
          vehicleType,
          prefix,
          startNumber: numStart,
          count: numCount,
        });
        toast.success(`Đã tạo ${(res as any).data.length ?? numCount} slot`);
      }
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Tạo slot thất bại');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-[#062F28]">Tạo Slot</h2>
            <p className="text-xs text-gray-500 mt-0.5">Thêm slot mới cho tầng hiện tại</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl mb-2 mt-2">
            <button
              onClick={() => {
                setMode('single');
                setErrors({});
              }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${mode === 'single' ? 'bg-[#9FE870] shadow-sm text-[#062F28]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Tạo 1 Slot
            </button>
            <button
              onClick={() => {
                setMode('bulk');
                setErrors({});
              }}
              className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${mode === 'bulk' ? 'bg-[#9FE870] shadow-sm text-[#062F28]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Tạo Nhiều Slot
            </button>
          </div>

          {/* Capacity indicator */}
          <div
            className={`flex items-center gap-2 text-sm mb-4 font-medium ${
              isFull ? 'text-red-600' : remainingSlots <= 5 ? 'text-amber-600' : 'text-[#062F28]'
            }`}
          >
            <span>Sức chứa tầng:</span>
            <span className="font-semibold">
              {currentSlotCount} / {totalSlots} slots{' '}
              {isFull ? '— Đã đầy' : `(còn ${remainingSlots})`}
            </span>
          </div>

          {mode === 'single' ? (
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Mã Slot <span className="text-red-500">*</span>
              </label>
              <input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  if (errors.code) setErrors({ ...errors, code: '' });
                }}
                placeholder="A1, B2"
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#9FE870] ${errors.code ? 'border-red-400' : 'border-gray-200'}`}
              />
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
            </div>
          ) : (
            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Tiền tố <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={prefix}
                    placeholder="A"
                    onChange={(e) => {
                      setPrefix(e.target.value.toUpperCase());
                      if (errors.prefix) setErrors({ ...errors, prefix: '' });
                    }}
                    maxLength={4}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#9FE870] ${errors.prefix ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.prefix && <p className="text-xs text-red-500 mt-1">{errors.prefix}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Bắt đầu từ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="1"
                    value={startNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStartNumber(val === '' ? '' : Number(val));
                      if (errors.startNumber) setErrors({ ...errors, startNumber: '' });
                    }}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#9FE870] ${errors.startNumber ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.startNumber && (
                    <p className="text-xs text-red-500 mt-1">{errors.startNumber}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Số lượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={remainingSlots}
                    placeholder="10"
                    value={count}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        setCount('');
                      } else {
                        const num = Number(val);
                        setCount(num > remainingSlots ? remainingSlots : num);
                      }
                      if (errors.count) setErrors({ ...errors, count: '' });
                    }}
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#9FE870] ${
                      errors.count ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  {errors.count && <p className="text-xs text-red-500 mt-1">{errors.count}</p>}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Cấu trúc dự kiến:{' '}
                <span className="font-mono font-semibold">
                  {prefix || 'A'}
                  {Number(startNumber) || 1}
                </span>
                ,{' '}
                <span className="font-mono font-semibold">
                  {prefix || 'A'}
                  {(Number(startNumber) || 1) + 1}
                </span>
                , … (<span className="font-semibold">{Number(count) || 10}</span> slot)
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Loại Xe <span className="text-red-500">*</span>
            </label>

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

            {vehicleTypes.length === 0 ? (
              <p className="text-xs text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
                Tầng này chưa được cấu hình loại xe cho phép. Vui lòng cấu hình ở phần chỉnh sửa
                tầng trước.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 p-1 max-h-40 overflow-y-auto">
                {filteredTypes.map((vt) => {
                  const isSelected = vehicleType === vt._id;
                  const Icon = vt.icon && ICON_MAP[vt.icon] ? ICON_MAP[vt.icon] : Car;
                  return (
                    <button
                      key={vt._id}
                      type="button"
                      onClick={() => {
                        setVehicleType(vt._id);
                        if (errors.vehicleType) setErrors({ ...errors, vehicleType: '' });
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                        isSelected
                          ? 'bg-[#9FE870] text-[#062F28] border-[#9FE870] scale-[1.03]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#9FE870]'
                      }`}
                    >
                      <Icon size={16} />
                      {vt.name}
                      {isSelected && <Check size={13} />}
                    </button>
                  );
                })}
                {filteredTypes.length === 0 && (
                  <p className="text-xs text-gray-400 py-2 w-full">
                    Không tìm thấy loại xe phù hợp với "{searchQuery}".
                  </p>
                )}
              </div>
            )}
            {errors.vehicleType && (
              <p className="text-xs text-red-500 mt-1.5">{errors.vehicleType}</p>
            )}
          </div>

          <div className="pt-4 mt-6 flex justify-end gap-3 border-t border-gray-100">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-60"
            >
              Hủy
            </button>
            <button
              disabled={loading || isFull || (mode === 'bulk' && Number(count) > remainingSlots)}
              onClick={handleSubmit}
              className="px-5 py-2.5 text-sm font-bold text-white bg-[#062F28] rounded-xl hover:bg-[#062F28]/90 transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {mode === 'single' ? 'Tạo Slot' : 'Tạo Nhiều Slot'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
