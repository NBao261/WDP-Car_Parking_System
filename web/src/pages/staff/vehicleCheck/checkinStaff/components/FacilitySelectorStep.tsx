import { MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { AssignedFacility } from '../../../../../types/user.types';

interface FacilitySelectorStepProps {
  facilities: AssignedFacility[];
  onSelect: (facility: AssignedFacility) => void;
}

/**
 * Hiển thị khi Staff được gán nhiều hơn 1 tòa nhà.
 * Staff chọn tòa nhà mình đang trực để bắt đầu ca làm việc.
 */
export default function FacilitySelectorStep({ facilities, onSelect }: FacilitySelectorStepProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-5">
        <h3 className="text-sm font-bold text-[#060606]">Chọn tòa nhà đang trực</h3>
        <p className="text-xs text-gray-400 mt-1">
          Bạn đang được phân công tại {facilities.length} tòa nhà
        </p>
      </div>

      <div className="space-y-3">
        {facilities.map((facility) => (
          <button
            key={facility._id}
            onClick={() => onSelect(facility)}
            className="w-full text-left p-4 bg-gray-50 hover:bg-[#f0f9dc] border border-gray-200 hover:border-[#d7ee46] rounded-xl transition-all group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-[#060606] group-hover:text-[#060606] truncate">
                  {facility.name}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                  <p className="text-xs text-gray-400 truncate">{facility.address}</p>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                  <p className="text-xs text-gray-500 font-medium">
                    {facility.openTime} – {facility.closeTime}
                  </p>
                </div>
              </div>
              <div className="shrink-0 mt-0.5">
                {facility.status === 'active' ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
