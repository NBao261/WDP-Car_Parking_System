import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Building2, ChevronDown, Plus, Layers, Loader2,
  Lock, Wrench, CheckCircle2, RotateCcw, Trash2, X, AlertTriangle,
} from 'lucide-react';
import { facilityService, type Facility } from '../../../services/facility.service';
import { floorService, type Floor } from '../../../services/floor.service';
import { vehicleTypeService, type VehicleType } from '../../../services/vehicleType.service';
import { slotService, type ParkingSlot, type SlotStatus } from '../../../services/slot.service';
import { SlotGrid } from '../../../components/ui/SlotGrid';
import { SlotStatusBadge } from '../../../components/ui/SlotStatusBadge';

// ── Status Change Modal ─────────────────────────────────
interface StatusModalProps {
  slot: ParkingSlot | null;
  onClose: () => void;
  onSuccess: () => void;
}

const NEXT_STATUSES: Record<SlotStatus, SlotStatus[]> = {
  available: ['maintenance', 'locked'],
  occupied: ['maintenance'],
  reserved: ['available', 'locked'],
  maintenance: ['available'],
  locked: ['available'],
};

const STATUS_LABELS: Record<SlotStatus, string> = {
  available: 'Trống',
  occupied: 'Đang dùng',
  reserved: 'Đặt trước',
  maintenance: 'Bảo trì',
  locked: 'Khóa',
};

function StatusModal({ slot, onClose, onSuccess }: StatusModalProps) {
  const [selected, setSelected] = useState<SlotStatus | ''>('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setSelected(''); setReason(''); }, [slot]);

  if (!slot) return null;
  const nexts = NEXT_STATUSES[slot.status] ?? [];
  const needsReason = selected === 'maintenance' || selected === 'locked';

  const handleSubmit = async () => {
    if (!selected) return;
    if (needsReason && !reason.trim()) { toast.error('Vui lòng nhập lý do'); return; }
    setLoading(true);
    try {
      await slotService.updateStatus(slot._id, { status: selected, reason: reason || undefined });
      toast.success(`Slot ${slot.code} → ${STATUS_LABELS[selected]}`);
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#060606]">Cập nhật trạng thái</h2>
            <p className="text-sm text-gray-500">Slot: <span className="font-semibold">{slot.code}</span></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Trạng thái hiện tại</p>
          <SlotStatusBadge status={slot.status} variant="full" />
        </div>

        {nexts.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl p-3">
            <AlertTriangle size={16} className="text-orange-500" />
            Không thể thay đổi trạng thái lúc này (slot đang được sử dụng).
          </div>
        ) : (
          <>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Chuyển sang</p>
              <div className="flex flex-wrap gap-2">
                {nexts.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelected(s)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                      selected === s
                        ? 'bg-[#060606] text-white border-[#060606]'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {needsReason && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Lý do <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Nhập lý do bảo trì / khóa slot..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#d7ee46] focus:border-transparent"
                />
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Hủy
              </button>
              <button
                disabled={!selected || loading}
                onClick={handleSubmit}
                className="flex-1 py-2.5 bg-[#060606] text-white rounded-xl text-sm font-medium hover:bg-black/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                Xác nhận
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ── Bulk Create Modal ────────────────────────────────────
interface BulkCreateModalProps {
  facilityId: string;
  floorId: string;
  vehicleTypes: VehicleType[];
  onClose: () => void;
  onSuccess: () => void;
}

function BulkCreateModal({ facilityId, floorId, vehicleTypes, onClose, onSuccess }: BulkCreateModalProps) {
  const [prefix, setPrefix] = useState('A');
  const [startNumber, setStartNumber] = useState(1);
  const [count, setCount] = useState(10);
  const [vehicleType, setVehicleType] = useState(vehicleTypes[0]?._id ?? '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!vehicleType) { toast.error('Chọn loại xe'); return; }
    setLoading(true);
    try {
      const res = await slotService.createBulk({ facilityId, floorId, vehicleType, prefix, startNumber, count });
      toast.success(`Đã tạo ${(res as any).count ?? count} slot`);
      onSuccess();
      onClose();
    } catch (e: any) {
      toast.error(e.message || 'Tạo slot thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#060606]">Tạo hàng loạt Slot</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"><X size={18} /></button>
        </div>

        <p className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
          Mã slot được sinh theo pattern: <span className="font-mono font-semibold">{prefix}{startNumber}</span>, <span className="font-mono font-semibold">{prefix}{startNumber + 1}</span>, … (<span className="font-semibold">{count}</span> slot)
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Prefix</label>
            <input
              value={prefix}
              onChange={(e) => setPrefix(e.target.value.toUpperCase())}
              maxLength={4}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Số bắt đầu</label>
            <input
              type="number"
              min={1}
              value={startNumber}
              onChange={(e) => setStartNumber(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Số lượng</label>
            <input
              type="number"
              min={1}
              max={200}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Loại xe</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d7ee46] bg-white"
            >
              {vehicleTypes.map((vt) => (
                <option key={vt._id} value={vt._id}>{vt.icon} {vt.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Hủy</button>
          <button
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-[#060606] text-white rounded-xl text-sm font-medium hover:bg-black/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Tạo slot
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function SlotsPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);

  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);

  const [facilityDropOpen, setFacilityDropOpen] = useState(false);
  const [floorDropOpen, setFloorDropOpen] = useState(false);

  const [pageLoading, setPageLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [statusSlot, setStatusSlot] = useState<ParkingSlot | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  // Filter
  const [filterStatus, setFilterStatus] = useState<SlotStatus | 'all'>('all');

  // Load initial data
  useEffect(() => {
    (async () => {
      setPageLoading(true);
      try {
        const [fRes, vtRes] = await Promise.all([
          facilityService.getAll({ limit: 100 }),
          vehicleTypeService.getAll({ limit: 100 }),
        ]);
        setFacilities(fRes.data);
        setVehicleTypes(vtRes.data);
        if (fRes.data.length > 0) setSelectedFacility(fRes.data[0]);
      } catch (e: any) {
        toast.error(e.message || 'Không thể tải dữ liệu');
      } finally {
        setPageLoading(false);
      }
    })();
  }, []);

  // Load floors when facility changes
  useEffect(() => {
    if (!selectedFacility) return;
    setSelectedFloor(null);
    setSlots([]);
    floorService.getAll({ facilityId: selectedFacility._id, limit: 100 }).then((res) => {
      setFloors(res.data);
      if (res.data.length > 0) setSelectedFloor(res.data[0]);
    });
  }, [selectedFacility]);

  // Load slots when floor changes
  const loadSlots = useCallback(async () => {
    if (!selectedFloor) return;
    setSlotsLoading(true);
    try {
      const res = await slotService.getByFloor(selectedFloor._id);
      setSlots(res.data);
    } catch (e: any) {
      toast.error(e.message || 'Không thể tải slot');
    } finally {
      setSlotsLoading(false);
    }
  }, [selectedFloor]);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  const vtMap = Object.fromEntries(vehicleTypes.map((v) => [v._id, v.name]));
  const filteredSlots = filterStatus === 'all' ? slots : slots.filter((s) => s.status === filterStatus);

  const filterButtons: { label: string; value: SlotStatus | 'all' }[] = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Trống', value: 'available' },
    { label: 'Đang dùng', value: 'occupied' },
    { label: 'Đặt trước', value: 'reserved' },
    { label: 'Bảo trì', value: 'maintenance' },
    { label: 'Khóa', value: 'locked' },
  ];

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#060606]">Quản lý Slot đỗ xe</h1>
          <p className="text-gray-500 text-sm">Bản đồ slot theo tầng, mã màu trạng thái (FR-4)</p>
        </div>
        {selectedFloor && (
          <button
            onClick={() => setBulkOpen(true)}
            className="bg-[#060606] text-white px-5 py-2.5 rounded-xl font-medium hover:bg-black/80 transition-colors flex items-center gap-2"
          >
            <Plus size={18} /> Tạo hàng loạt Slot
          </button>
        )}
      </div>

      {/* Selectors */}
      <div className="flex flex-wrap gap-3">
        {/* Facility Selector */}
        <div className="relative">
          <button
            onClick={() => setFacilityDropOpen((v) => !v)}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-w-48"
          >
            <Building2 size={16} className="text-gray-400" />
            <span className="flex-1 text-left truncate">
              {selectedFacility?.name ?? 'Chọn tòa nhà'}
            </span>
            <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
          </button>
          <AnimatePresence>
            {facilityDropOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="absolute top-full left-0 mt-1 z-30 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[220px]"
              >
                <div className="fixed inset-0 z-[-1]" onClick={() => setFacilityDropOpen(false)} />
                {facilities.map((f) => (
                  <button
                    key={f._id}
                    onClick={() => { setSelectedFacility(f); setFacilityDropOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      selectedFacility?._id === f._id ? 'bg-[#d7ee46]/20 font-semibold text-[#060606]' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floor Selector */}
        <div className="relative">
          <button
            onClick={() => floors.length > 0 && setFloorDropOpen((v) => !v)}
            disabled={floors.length === 0}
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-w-40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Layers size={16} className="text-gray-400" />
            <span className="flex-1 text-left">{selectedFloor?.name ?? 'Chọn tầng'}</span>
            <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
          </button>
          <AnimatePresence>
            {floorDropOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="absolute top-full left-0 mt-1 z-30 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[160px]"
              >
                <div className="fixed inset-0 z-[-1]" onClick={() => setFloorDropOpen(false)} />
                {floors.map((fl) => (
                  <button
                    key={fl._id}
                    onClick={() => { setSelectedFloor(fl); setFloorDropOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      selectedFloor?._id === fl._id ? 'bg-[#d7ee46]/20 font-semibold text-[#060606]' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {fl.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status filter */}
        <div className="flex gap-1.5 flex-wrap">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilterStatus(btn.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === btn.value
                  ? 'bg-[#060606] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={loadSlots}
          className="ml-auto p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
          title="Làm mới"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Map Card */}
      <motion.div
        key={selectedFloor?._id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        {!selectedFacility ? (
          <div className="py-20 text-center text-gray-400">
            <Building2 size={36} className="mx-auto mb-3 opacity-30" />
            <p>Chọn tòa nhà để xem bản đồ slot</p>
          </div>
        ) : !selectedFloor ? (
          <div className="py-20 text-center text-gray-400">
            <Layers size={36} className="mx-auto mb-3 opacity-30" />
            <p>{floors.length === 0 ? 'Tòa nhà này chưa có tầng nào.' : 'Chọn tầng để xem bản đồ slot'}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-[#d7ee46]/20 rounded-xl flex items-center justify-center">
                <Layers size={20} className="text-[#7a8c17]" />
              </div>
              <div>
                <h2 className="font-bold text-[#060606]">{selectedFloor.name} — {selectedFacility.name}</h2>
                <p className="text-sm text-gray-500">
                  {slots.length} slot tổng · {slots.filter(s => s.status === 'available').length} trống
                </p>
              </div>
            </div>

            <SlotGrid
              slots={filteredSlots}
              vehicleTypeMap={vtMap}
              onSlotClick={setStatusSlot}
              isLoading={slotsLoading}
            />
          </>
        )}
      </motion.div>

      {/* Slot list table (optional compact view) */}
      {slots.length > 0 && !slotsLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-[#060606] text-sm">Danh sách chi tiết</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Mã Slot</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Loại xe</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Lý do</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredSlots.map((slot) => {
                  const vtName = typeof slot.vehicleTypeId === 'object'
                    ? slot.vehicleTypeId.name
                    : (vtMap[slot.vehicleTypeId] ?? slot.vehicleTypeId);
                  return (
                    <tr key={slot._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-3 font-mono font-semibold text-[#060606]">{slot.code}</td>
                      <td className="px-6 py-3 text-gray-600">{vtName}</td>
                      <td className="px-6 py-3"><SlotStatusBadge status={slot.status} /></td>
                      <td className="px-6 py-3 text-gray-500 text-xs">{slot.maintenanceReason || '—'}</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setStatusSlot(slot)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Cập nhật trạng thái"
                          >
                            {slot.status === 'maintenance' ? <Wrench size={14} /> : slot.status === 'locked' ? <Lock size={14} /> : <CheckCircle2 size={14} />}
                          </button>
                          <button
                            onClick={async () => {
                              if (!window.confirm(`Xóa slot "${slot.code}"?`)) return;
                              try {
                                await slotService.delete(slot._id);
                                toast.success('Đã xóa slot');
                                loadSlots();
                              } catch (e: any) {
                                toast.error(e.message || 'Xóa thất bại');
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa slot"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {statusSlot && (
          <StatusModal
            slot={statusSlot}
            onClose={() => setStatusSlot(null)}
            onSuccess={loadSlots}
          />
        )}
        {bulkOpen && selectedFacility && selectedFloor && (
          <BulkCreateModal
            facilityId={selectedFacility._id}
            floorId={selectedFloor._id}
            vehicleTypes={vehicleTypes}
            onClose={() => setBulkOpen(false)}
            onSuccess={loadSlots}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
