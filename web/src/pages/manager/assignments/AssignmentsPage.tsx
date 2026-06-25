import { useState, useEffect, useCallback } from 'react';
import { userService } from '../../../services/user.service';
import { facilityService } from '../../../services/facility.service';
import { useAuthStore } from '../../../store/useAuthStore';
import { User, AssignedFacility } from '../../../types/user.types';
import { UserRole } from '../../../../../shared/types';

import { AssignFacilityModal } from './components/AssignFacilityModal';
import { StaffManagementTab } from './components/StaffManagementTab';

export default function AssignmentsPage() {
  const { user } = useAuthStore();
  const managerFacilities = (user?.assignedFacilities ?? []) as AssignedFacility[];

  // Facility Map (ID -> Name)
  const [facilityMap, setFacilityMap] = useState<Record<string, string>>({});

  // Staff list state
  const [staffList, setStaffList] = useState<User[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffError, setStaffError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Assign modal state
  const [assignTarget, setAssignTarget] = useState<User | null>(null);

  const fetchStaff = useCallback(async () => {
    setStaffLoading(true);
    setStaffError('');
    try {
      const [res, facRes] = await Promise.all([
        userService.getAllUsers({ role: UserRole.STAFF, limit: 100 }),
        facilityService.getAll({ limit: 1000 }),
      ]);
      setStaffList(res.data ?? []);

      const map: Record<string, string> = {};
      facRes.data.forEach((f: any) => {
        map[f._id] = f.name;
      });
      setFacilityMap(map);
    } catch (err: any) {
      setStaffError(err.message || 'Không thể tải danh sách nhân viên.');
    } finally {
      setStaffLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#060606]">Phân công nhân viên</h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý và điều phối nhân viên cho các tòa nhà bạn đang phụ trách
        </p>
      </div>

      <StaffManagementTab
        staffList={staffList}
        staffLoading={staffLoading}
        staffError={staffError}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        fetchStaff={fetchStaff}
        managerFacilities={managerFacilities}
        facilityMap={facilityMap}
        onAssignClick={setAssignTarget}
      />

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
