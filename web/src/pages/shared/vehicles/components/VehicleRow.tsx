import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { VehicleType } from '../../../../services/vehicleType.service';
import { ICON_MAP, getVehicleColorTheme, DEFAULT_ICON } from './constants';

interface VehicleRowProps {
  vehicle: VehicleType;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  isLast?: boolean;
  index: number;
  globalIndex: number;
}

export function VehicleRow({ vehicle, index, globalIndex, onEdit, onView, onDelete, isLast }: VehicleRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="hover:bg-[#9FE870]/10 transition-colors group cursor-pointer"
      onClick={onView}
    >
      <td className="px-6 py-4 text-[#6b6b6b] text-[13px] text-center font-medium">
        {index}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {(() => {
            const colorTheme = getVehicleColorTheme(vehicle.code, vehicle.icon);
            const Icon = vehicle.icon && ICON_MAP[vehicle.icon] ? ICON_MAP[vehicle.icon] : ICON_MAP[DEFAULT_ICON];
            return (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-[#f0f0f0] shadow-sm shrink-0"
                style={{ background: colorTheme.bg, color: colorTheme.text }}
              >
                <Icon size={20} strokeWidth={2} />
              </div>
            );
          })()}
          <div>
            <p className="font-semibold text-[#062F28] text-base">{vehicle.name}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-500 font-mono tracking-wide">{vehicle.code}</span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(vehicle.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} {new Date(vehicle.createdAt).toLocaleDateString('vi-VN')}
      </td>
      <td className="px-6 py-4 text-right relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <MoreVertical size={18} />
        </button>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: isLast ? 8 : -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: isLast ? 8 : -8 }}
              transition={{ duration: 0.12 }}
              className={`absolute right-8 w-40 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 py-1.5 z-50 ${isLast ? 'bottom-10' : 'top-12'}`}
            >
              <div className="fixed inset-0 z-[-1]" onClick={() => setMenuOpen(false)} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Eye size={14} /> Xem Chi Tiết
              </button>
              <div className="h-px bg-gray-100 mx-2 my-1" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit size={14} /> Chỉnh Sửa
              </button>
              <div className="h-px bg-gray-100 mx-2 my-1" />
              {!['XEOTODIEN', 'XEMAYDIEN', 'XEOTO', 'XEMAY', 'XEDAP'].includes(vehicle.code.toUpperCase()) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 size={14} /> Xóa
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </td>
    </motion.tr>
  );
}
