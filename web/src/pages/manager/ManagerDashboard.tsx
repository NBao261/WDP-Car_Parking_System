import { useState, useEffect, useCallback } from 'react';
import { Users, Building2 } from 'lucide-react';
import { userService } from '../../services/user.service';
import { useAuthStore } from '../../store/useAuthStore';
import { User, AssignedFacility } from '../../types/user.types';
import { UserRole } from '../../../../shared/types';

import { AssignFacilityModal } from './components/AssignFacilityModal';
import { StaffManagementTab } from './components/StaffManagementTab';
import { OverviewTab } from './components/OverviewTab';

export default function ManagerDashboard() {
  const { user } = useAuthStore();
  const managerFacilities = (user?.assignedFacilities ?? []) as AssignedFacility[];

  const [activeTab, setActiveTab] = useState<'staff' | 'overview'>('staff');

  // Staff list state
  const [staffList, setStaffList] = useState<User[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffError, setStaffError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Assign modal state
  const [assignTarget, setAssignTarget] = useState<User | null>(null);

  // ── Fetch Staff list ───────────────────────────────────────────
  const fetchStaff = useCallback(async () => {
    setStaffLoading(true);
    setStaffError('');
    try {
      const res = await userService.getAllUsers({ role: UserRole.STAFF, limit: 100 });
      setStaffList(res.data ?? []);
    } catch (err: any) {
      setStaffError(err.message || 'Không thể tải danh sách nhân viên.');
    } finally {
      setStaffLoading(false);
    }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  return (
    <div className="min-h-screen bg-[#f4f5f4] p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#060606]">Manager Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý nhân viên và vận hành tòa nhà được phân công
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

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white p-1 rounded-xl border border-gray-200 w-fit">
        {[
          { key: 'staff', label: 'Bảng danh sách nhân viên', icon: Users },
          { key: 'overview', label: 'Tổng quan', icon: Building2 },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as 'staff' | 'overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === key
                ? 'bg-[#d7ee46] text-[#060606]'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === 'staff' && (
        <StaffManagementTab
          staffList={staffList}
          staffLoading={staffLoading}
          staffError={staffError}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          fetchStaff={fetchStaff}
          managerFacilities={managerFacilities}
          onAssignClick={setAssignTarget}
        />
      )}

      {activeTab === 'overview' && (
        <OverviewTab
          managerFacilities={managerFacilities}
          staffList={staffList}
        />
      )}

      {/* Assign Facility Modal */}
      {assignTarget && (
        <AssignFacilityModal
          staff={assignTarget}
          managerFacilities={managerFacilities}
          onClose={() => setAssignTarget(null)}
          onSuccess={fetchStaff}
        />
      )}
    </div>
  );
}
