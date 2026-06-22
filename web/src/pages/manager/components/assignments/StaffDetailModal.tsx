
import { motion, AnimatePresence } from 'framer-motion';
import { X, User as UserIcon, Building2, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';
import { User, AssignedFacility } from '../../../../types/user.types';

interface StaffDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff?: User;
  facilityMap: Record<string, string>;
}

export function StaffDetailModal({ isOpen, onClose, staff, facilityMap }: StaffDetailModalProps) {
  if (!isOpen || !staff) return null;

  const facilities = staff.assignedFacilities ?? [];
  const assignedFacilitiesNames = facilities.length === 0 
    ? []
    : facilities.map(f => {
        const id = typeof f === 'string' ? f : (f as AssignedFacility)._id;
        return typeof f !== 'string' && (f as AssignedFacility).name ? (f as AssignedFacility).name : (facilityMap[id] || 'Tòa nhà không xác định');
      });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between bg-gray-50/50 shrink-0">
            <div>
              <h2 className="text-lg font-bold text-[#060606]">Chi Tiết Nhân Viên</h2>
              <p className="text-sm text-gray-500 mt-0.5">Thông tin chi tiết về nhân viên</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-[#060606] hover:bg-[#d7ee46] rounded-xl transition-colors"><X size={20} /></button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm text-emerald-600">
                <UserIcon size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#060606]">{staff.name}</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                    staff.status === 'active'
                      ? 'bg-green-50 text-green-700 border-green-100'
                      : staff.status === 'locked'
                      ? 'bg-red-50 text-red-600 border-red-100'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    {staff.status === 'active' ? 'Hoạt động' : staff.status === 'locked' ? 'Bị khóa' : 'Không hoạt động'}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1"><Mail size={14} /> Email</p>
                <span className="text-sm font-medium text-gray-800 break-all">{staff.email}</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1"><Phone size={14} /> Số điện thoại</p>
                <p className="text-sm font-medium text-gray-800">{staff.phone || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1"><ShieldCheck size={14} /> Vai trò</p>
                <p className="text-sm font-medium text-gray-800">{staff.role}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1"><Clock size={14} /> Ngày tạo</p>
                <p className="text-sm font-medium text-gray-800">{new Date(staff.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tòa nhà được phân công ({assignedFacilitiesNames.length})</p>
              {assignedFacilitiesNames.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {assignedFacilitiesNames.map((facName, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                      <Building2 size={16} className="text-indigo-600" />
                      <span className="text-indigo-800 font-semibold text-sm">{facName}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Chưa được phân công tòa nhà nào.</p>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
            <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-[#d7ee46] hover:text-[#060606] hover:border-[#c4dc32] transition-colors">
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
