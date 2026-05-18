import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Building2, MapPin, Clock, Layers, MoreVertical,
  Edit, PowerOff, CheckCircle, Loader2, ExternalLink
} from 'lucide-react';
import { Facility, facilityService } from '../../../../services/facility.service';

interface FacilityCardProps {
  facility: Facility;
  onEdit: (f: Facility) => void;
  onViewFloors: (f: Facility) => void;
  onRefresh: () => void;
}

const StatusBadge = ({ status }: { status: 'active' | 'inactive' }) =>
  status === 'active' ? (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      Active
    </span>
  ) : (
    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      Inactive
    </span>
  );

export function FacilityCard({ facility, onEdit, onViewFloors, onRefresh }: FacilityCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDeactivate = async () => {
    setMenuOpen(false);
    if (!window.confirm(`Deactivate facility "${facility.name}"?\nEmpty slots will be set to maintenance.`))
      return;
    setLoading(true);
    try {
      await facilityService.deactivate(facility._id);
      toast.success(`Deactivated "${facility.name}"`);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    setMenuOpen(false);
    setLoading(true);
    try {
      await facilityService.update(facility._id, { status: 'active' });
      toast.success(`Reactivated "${facility.name}"`);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      onClick={() => onViewFloors(facility)}
      className={`cursor-pointer bg-white rounded-2xl border shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-all group ${
        facility.status === 'inactive' ? 'opacity-70 border-gray-200' : 'border-gray-100 hover:border-[#d7ee46]/50'
      }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              facility.status === 'active'
                ? 'bg-[#d7ee46]/20 text-[#6a7a0a]'
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <Building2 size={24} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-[#060606] text-lg leading-tight truncate">{facility.name}</h3>
            <div className="mt-1">
              <StatusBadge status={facility.status} />
            </div>
          </div>
        </div>

        {/* Actions menu */}
        <div className="relative">
          {loading ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <Loader2 size={16} className="animate-spin text-gray-400" />
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical size={18} />
            </button>
          )}

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.12 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-9 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20"
              >
                <div className="fixed inset-0 z-[-1]" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(facility); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit size={16} /> Edit
                </button>
                <div className="h-px bg-gray-100 mx-2 my-1" />
                {facility.status === 'active' ? (
                  <button
                    onClick={handleDeactivate}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <PowerOff size={16} /> Deactivate
                  </button>
                ) : (
                  <button
                    onClick={handleReactivate}
                    className="w-full text-left px-4 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                  >
                    <CheckCircle size={16} /> Reactivate
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Info rows */}
      <div className="space-y-3 text-sm text-gray-500 mt-2">
        <div className="flex items-start gap-2.5">
          <MapPin size={16} className="mt-0.5 flex-shrink-0 text-gray-400" />
          <span className="line-clamp-2">{facility.address}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-gray-400" />
            <span><strong className="text-gray-700">{facility.totalFloors}</strong> floors</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            <span>{facility.openTime} – {facility.closeTime}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      {facility.description && (
        <p className="text-sm text-gray-400 line-clamp-2 border-t border-gray-50 pt-4">
          {facility.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
        <span className="text-sm text-gray-400">
          {new Date(facility.createdAt).toLocaleDateString('en-US')}
        </span>
        <button
          onClick={() => { onViewFloors(facility); }}
          className="flex items-center gap-1.5 text-sm text-[#6a7a0a] font-semibold hover:text-[#d7ee46] transition-colors opacity-0 group-hover:opacity-100"
        >
          View Floors <ExternalLink size={14} />
        </button>
      </div>
    </motion.div>
  );
}
