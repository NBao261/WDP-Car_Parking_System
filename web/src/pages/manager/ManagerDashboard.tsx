import { useState, useEffect, useCallback } from 'react';
import { Building2 } from 'lucide-react';
import { userService } from '../../services/user.service';
import { useAuthStore } from '../../store/useAuthStore';
import { User, AssignedFacility } from '../../types/user.types';
import { UserRole } from '../../../../shared/types';

import { OverviewTab } from './components/OverviewTab';

export default function ManagerDashboard() {
  const { user } = useAuthStore();
  const managerFacilities = (user?.assignedFacilities ?? []) as AssignedFacility[];

  // Staff list state for overview stats
  const [staffList, setStaffList] = useState<User[]>([]);

  // ── Fetch Staff list ───────────────────────────────────────────
  const fetchStaff = useCallback(async () => {
    try {
      const res = await userService.getAllUsers({ role: UserRole.STAFF, limit: 100 });
      setStaffList(res.data ?? []);
    } catch (err: any) {
      console.error('Failed to fetch staff for overview', err);
    }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#060606]">Tổng Quan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Trạng thái hoạt động của các tòa nhà được phân công
        </p>
      </div>

      {/* Facilities badges */}
      {managerFacilities.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {managerFacilities.map((f) => (
            <span key={f._id} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d7ee46] text-[#060606] text-xs font-bold rounded-full">
              <Building2 size={12} />
              {f.name}
            </span>
          ))}
        </div>
      )}

      {/* ── Tab Content ── */}
      <OverviewTab
        managerFacilities={managerFacilities}
        staffList={staffList}
      />
    </div>
  );
}
