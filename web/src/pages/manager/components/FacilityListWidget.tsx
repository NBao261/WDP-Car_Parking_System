import { Building2, Users } from 'lucide-react';
import { User, AssignedFacility } from '../../../types/user.types';

interface FacilityListWidgetProps {
  managerFacilities: AssignedFacility[];
  staffList: User[];
}

export function FacilityListWidget({ managerFacilities, staffList }: FacilityListWidgetProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5 h-full flex flex-col">
      <h2 className="text-[14px] font-semibold text-[#1a1a1a] mb-3">Danh sách tòa nhà bạn quản lý</h2>

      <div className="overflow-y-auto -mr-2 pr-2 facility-list-scroll max-h-[180px]">
        {managerFacilities.length === 0 ? (
          <div className="text-center text-[#6b7280] py-8">
            <Building2 className="w-6 h-6 mx-auto mb-1 text-[#9ca3af]" />
            <p className="text-[13px]">Chưa có tòa nhà nào.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {managerFacilities.map((facility, idx) => {
              const staffCount = staffList.filter((s) =>
                s.assignedFacilities?.some(
                  (f: any) =>
                    (typeof f === 'string' ? f : (f as AssignedFacility)._id) === facility._id
                )
              ).length;

              return (
                <div key={facility._id}>
                  <div className="flex items-center justify-between py-3 px-2 rounded-lg group cursor-default transition-all duration-150 hover:bg-[#f9f9f7] hover:border-l-2 hover:border-l-[#d7ee46] hover:pl-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#f5f5f3] flex items-center justify-center shrink-0">
                        <Building2 size={14} className="text-[#6b7280]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[14px] font-bold text-[#1a1a1a] truncate">
                          {facility.name}
                        </h3>
                        <p className="text-[12px] text-[#6b7280]">
                          {facility.openTime} – {facility.closeTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 text-[12px] text-[#6b7280]">
                        <Users size={12} />
                        <span>{staffCount}</span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-[6px] uppercase tracking-wider ${
                          facility.status === 'active'
                            ? 'bg-[#d7ee46] text-[#060606]'
                            : 'bg-[#f3f4f6] text-[#9ca3af]'
                        }`}
                      >
                        {facility.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  {idx < managerFacilities.length - 1 && (
                    <div className="border-b border-[#f0f0f0] mx-2" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .facility-list-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .facility-list-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .facility-list-scroll::-webkit-scrollbar-thumb {
          background-color: #e5e7eb;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
