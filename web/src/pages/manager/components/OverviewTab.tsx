import { Building2, MapPin } from 'lucide-react';
import { User, AssignedFacility } from '../../../types/user.types';

interface OverviewTabProps {
  managerFacilities: AssignedFacility[];
  staffList: User[];
}

export function OverviewTab({ managerFacilities, staffList }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {managerFacilities.length === 0 ? (
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Bạn chưa được phân công tòa nhà nào.</p>
          <p className="text-xs mt-1">Liên hệ Admin để được phân công.</p>
        </div>
      ) : (
        managerFacilities.map((facility) => (
          <div key={facility._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-[#060606]">{facility.name}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <p className="text-xs text-gray-400">{facility.address}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                facility.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
              }`}>
                {facility.status}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>🕐 {facility.openTime} – {facility.closeTime}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">Nhân viên được phân công:</p>
              <p className="text-sm font-bold text-[#060606]">
                {staffList.filter((s) =>
                  s.assignedFacilities?.some((f: any) =>
                    (typeof f === 'string' ? f : (f as AssignedFacility)._id) === facility._id
                  )
                ).length} nhân viên
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
