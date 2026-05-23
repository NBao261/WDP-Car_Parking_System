import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Edit, Trash2, Eye, Building2 } from 'lucide-react';
import { Car } from 'lucide-react';
import { VehicleType } from '../../../../services/vehicleType.service';
import { SLOT_SIZE_LABELS, ICON_MAP } from './constants';

interface VehicleRowProps {
  vehicle: VehicleType;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  isLast?: boolean;
}

export function VehicleRow({ vehicle, onEdit, onView, onDelete, isLast }: VehicleRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { label, color } = SLOT_SIZE_LABELS[vehicle.slotSize] || { label: vehicle.slotSize, color: 'bg-gray-100 text-gray-600 border-gray-200' };

  const uniqueFacilities = Array.from(
    new Map(
      (vehicle.floors || [])
        .map((floor) => {
          if (!floor.facilityId) return null;
          const isObj = typeof floor.facilityId === 'object';
          const id = isObj ? (floor.facilityId as any)._id : floor.facilityId;
          const name = isObj ? (floor.facilityId as any).name : 'Tòa nhà ' + id;
          return [id, { id, name }];
        })
        .filter(Boolean) as [string, { id: string; name: string }][]
    ).values()
  );

  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="hover:bg-gray-50/50 transition-colors group"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-600">
            {(() => { const Icon = (vehicle.icon && ICON_MAP[vehicle.icon]) ? ICON_MAP[vehicle.icon] : Car; return <Icon size={20} strokeWidth={1.5} />; })()}
          </div>
          <div>
            <p className="font-semibold text-[#060606] text-sm">{vehicle.name}</p>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{vehicle.code}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${color}`}>{label}</span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {uniqueFacilities.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {uniqueFacilities.map(fac => (
              <span key={fac.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100/60 shadow-sm">
                <Building2 size={12} />
                {fac.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-400 italic">Chưa liên kết</span>
        )}
      </td>
      <td className="px-6 py-4 text-xs text-gray-400">
        {new Date(vehicle.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 text-right relative">
        <button onClick={() => setMenuOpen((v) => !v)}
          className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <MoreVertical size={18} />
        </button>
        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, scale: 0.95, y: isLast ? 8 : -8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: isLast ? 8 : -8 }} transition={{ duration: 0.12 }}
              className={`absolute right-8 w-40 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 py-1.5 z-50 ${isLast ? 'bottom-10' : 'top-12'}`}>
              <div className="fixed inset-0 z-[-1]" onClick={() => setMenuOpen(false)} />
              <button onClick={() => { onView(); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Eye size={14} /> Xem Chi Tiết
              </button>
              <div className="h-px bg-gray-100 mx-2 my-1" />
              <button onClick={() => { onEdit(); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <Edit size={14} /> Chỉnh Sửa
              </button>
              <div className="h-px bg-gray-100 mx-2 my-1" />
              <button onClick={() => { onDelete(); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                <Trash2 size={14} /> Xóa
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </td>
    </motion.tr>
  );
}
