import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, Layers, Calendar, Lock, Car } from 'lucide-react';
import { Floor } from '../../../../services/floor.service';
import { VehicleType } from '../../../../services/vehicleType.service';
import { ICON_MAP } from '../../../shared/vehicles/components/constants';

function getBarTextColor(pct: number) {
  if (pct > 85) return 'text-[#E24B4A]';
  if (pct >= 60) return 'text-[#BA7517]';
  return 'text-[#3B6D11]';
}

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  floor?: Floor;
  stats?: { total: number; occupied: number; fillRate: number };
  vehicleTypes?: VehicleType[];
}

export function FloorDetailModal({ isOpen, onClose, floor, stats, vehicleTypes = [] }: DetailModalProps) {
  if (!isOpen || !floor) return null;

  const isActive = floor.status === 'active';
  const badgeStyle = isActive
    ? { background: '#ECFDF5', color: '#047857', border: '1px solid #D1FAE5' }
    : { background: '#f0f1f0', color: '#6b6e6b', border: '1px solid #e2e3e2' };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h2 className="text-lg font-bold text-[#060606]">Chi tiết Tầng</h2>
              <p className="text-xs text-gray-500 mt-0.5">Xem thông tin và thống kê sức chứa</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                  Vị trí Tầng
                </p>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 5, ...badgeStyle }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? '#10b981' : '#9b9e9b' }} />
                  {isActive ? 'HOẠT ĐỘNG' : 'ĐÃ TẮT'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#f4f9ea] flex items-center justify-center border border-[#e2edce] shrink-0 text-[#4a7c20]">
                  <Layers size={32} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1.5">
                    <h3 className="text-xl font-bold text-[#060606]">{floor.name}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[13px] text-gray-400 mt-2">
                    <Calendar size={13} /> Ngày tạo: <span className="text-gray-600 font-medium">{new Date(floor.createdAt).toLocaleDateString('vi-VN')}</span>
                    {!isActive && (
                      <>
                        <span className="mx-1.5 text-gray-300">•</span>
                        <Lock size={13} className="text-red-400" /> <span className="text-red-500">Tạm khóa:</span> <span className="text-gray-600 font-medium">{new Date(floor.updatedAt).toLocaleDateString('vi-VN')}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5 mb-2">
                Các loại xe cho phép
              </p>
              {vehicleTypes.length > 0 ? (
                <div className="flex items-center gap-2 flex-wrap">
                  {vehicleTypes.map(v => {
                    const IconComp = (v.icon && ICON_MAP[v.icon]) ? ICON_MAP[v.icon] : Car;
                    return (
                      <span key={v._id} className="px-2.5 py-1.5 bg-[#f4f9ea] text-[#4a7c20] border border-[#e2edce] text-[12px] font-semibold rounded-lg flex items-center gap-1.5 shadow-sm">
                        <IconComp size={14} className="text-[#4a7c20]" /> {v.name}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm text-gray-400 italic">
                  Không có loại xe nào được hỗ trợ
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5 mb-2">
                Thống kê sức chứa
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div style={{ background: 'rgba(204,226,66,0.15)', borderRadius: 10, padding: '12px 4px' }}>
                  <div className="text-xl tabular-nums font-semibold" style={{ color: '#060606' }}>{stats?.total ?? 0}</div>
                  <div style={{ fontSize: 12, color: '#6b6e6b', marginTop: 2 }}>Tổng slot</div>
                </div>
                <div style={{ background: 'rgba(204,226,66,0.15)', borderRadius: 10, padding: '12px 4px' }}>
                  <div className="text-xl tabular-nums font-semibold" style={{ color: '#060606' }}>{stats?.occupied ?? 0}</div>
                  <div style={{ fontSize: 12, color: '#6b6e6b', marginTop: 2 }}>Đang dùng</div>
                </div>
                <div style={{ background: 'rgba(204,226,66,0.15)', borderRadius: 10, padding: '12px 4px' }}>
                  <div className={`text-xl tabular-nums font-semibold ${getBarTextColor(stats?.fillRate ?? 0)}`}>{stats?.fillRate ?? 0}%</div>
                  <div style={{ fontSize: 12, color: '#6b6e6b', marginTop: 2 }}>Lấp đầy</div>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-2 flex justify-end">
            <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-[#cce242] hover:border-[#cce242] hover:text-[#060606] transition-all shadow-sm">
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
