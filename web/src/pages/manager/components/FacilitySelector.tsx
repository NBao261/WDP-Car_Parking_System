import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { facilityService, Facility } from '../../../services/facility.service';

interface FacilitySelectorProps {
  value: string;
  onChange: (facilityId: string, facilityName?: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * FacilitySelector — Dropdown chọn bãi xe cho Manager.
 *
 * - Manager có thể quản lý nhiều bãi → lấy danh sách từ user.assignedFacilities
 * - Nếu assignedFacilities rỗng (edge case): fallback gọi GET /facilities
 * - Tự động chọn bãi đầu tiên nếu chỉ có 1
 */
export function FacilitySelector({ value, onChange, placeholder = 'Chọn bãi xe', className }: FacilitySelectorProps) {
  const { user } = useAuthStore();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const assigned = user?.assignedFacilities ?? [];

    if (assigned.length > 0) {
      // Ưu tiên dùng danh sách được gán — không cần gọi API
      const list: Facility[] = assigned.map((af: any) => ({
        _id: af._id || af.facilityId,
        name: af.name || af.facilityName || 'Bãi xe',
        address: af.address || '',
        totalFloors: af.totalFloors || 0,
        openTime: af.openTime || '',
        closeTime: af.closeTime || '',
        description: af.description || '',
        images: [],
        status: 'active' as const,
        isDeleted: false,
        createdAt: '',
        updatedAt: '',
      }));
      setFacilities(list);
      // Auto-select nếu chỉ có 1 bãi và chưa có value
      if (list.length === 1 && !value) {
        onChange(list[0]._id, list[0].name);
      }
    } else {
      // Fallback: gọi API nếu không có assigned
      setLoading(true);
      facilityService.getAll({ status: 'active', limit: 50 })
        .then((res) => {
          setFacilities(res.data);
          if (res.data.length === 1 && !value) {
            onChange(res.data[0]._id, res.data[0].name);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className={`relative ${className ?? ''}`}>
      <select
        value={value}
        onChange={(e) => {
          const f = facilities.find(f => f._id === e.target.value);
          onChange(e.target.value, f?.name);
        }}
        disabled={loading || facilities.length === 0}
        className="appearance-none w-full pl-3 pr-8 h-[38px] border border-[#e8e9e8] rounded-lg bg-white text-[13px] text-[#060606] font-medium outline-none cursor-pointer focus:border-[#d7ee46] focus:ring-2 focus:ring-[#d7ee46]/30 transition-all disabled:opacity-50"
      >
        {!value && <option value="">{loading ? 'Đang tải...' : placeholder}</option>}
        {facilities.map((f) => (
          <option key={f._id} value={f._id}>{f.name}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" />
    </div>
  );
}
