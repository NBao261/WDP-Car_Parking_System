import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Car, Building2, Loader2 } from 'lucide-react';
import { VehicleType } from '../../../../services/vehicleType.service';
import { floorService, Floor } from '../../../../services/floor.service';
import { facilityService, Facility } from '../../../../services/facility.service';
import { ICON_MAP } from './constants';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: VehicleType;
}

export function VehicleDetailModal({ isOpen, onClose, vehicle }: DetailModalProps) {
  const [facilitiesWithFloors, setFacilitiesWithFloors] = useState<
    Record<string, { id: string; name: string; floors: { id: string; name: string }[] }>
  >({});
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);

  useEffect(() => {
    if (isOpen && vehicle) {
      const fetchLinks = async () => {
        setIsLoadingLinks(true);
        try {
          const [floorsRes, facilitiesRes] = await Promise.all([
            floorService.getAll({ limit: 1000 }),
            facilityService.getAll({ limit: 1000 }),
          ]);

          const facMap = Object.fromEntries(
            facilitiesRes.data.map((f: Facility) => [f._id, f.name])
          );

          const linkedFloors = floorsRes.data.filter((fl: Floor) =>
            fl.allowedVehicleTypes.some(
              (vt: any) => (typeof vt === 'string' ? vt : vt._id) === vehicle._id
            )
          );

          const grouped = linkedFloors.reduce((acc: any, floor: Floor) => {
            const facId =
              typeof floor.facilityId === 'string'
                ? floor.facilityId
                : (floor.facilityId as any)?._id;
            const facName = facMap[facId] || 'Tòa nhà ' + facId;

            if (!facId) return acc;

            if (!acc[facId]) {
              acc[facId] = { id: facId, name: facName, floors: [] };
            }
            acc[facId].floors.push({ id: floor._id, name: floor.name });
            return acc;
          }, {});

          setFacilitiesWithFloors(grouped);
        } catch (error) {
          console.error('Failed to fetch linked floors', error);
          setFacilitiesWithFloors({});
        } finally {
          setIsLoadingLinks(false);
        }
      };

      fetchLinks();
    } else {
      setFacilitiesWithFloors({});
    }
  }, [isOpen, vehicle]);

  if (!isOpen || !vehicle) return null;



  const groupedFacilities = Object.values(facilitiesWithFloors);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between bg-gray-50/50 shrink-0">
            <div>
              <h2 className="text-lg font-bold text-[#060606]">Chi Tiết Loại Xe</h2>
              <p className="text-sm text-gray-500 mt-0.5">Thông tin chi tiết về loại phương tiện</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-[#060606] hover:bg-[#d7ee46] rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-sm text-emerald-600">
                {(() => {
                  const Icon =
                    vehicle.icon && ICON_MAP[vehicle.icon] ? ICON_MAP[vehicle.icon] : Car;
                  return <Icon size={32} strokeWidth={1.5} />;
                })()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#060606]">{vehicle.name}</h3>
                <p className="text-sm font-mono text-gray-500 mt-1">{vehicle.code}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Ngày Tạo
                </p>
                <p className="text-sm font-medium text-gray-800">
                  {new Date(vehicle.createdAt).toLocaleDateString()}
                </p>
              </div>

            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Tòa nhà & Tầng liên kết
              </p>
              {isLoadingLinks ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                  <Loader2 size={14} className="animate-spin" /> Đang tải dữ liệu liên kết...
                </div>
              ) : groupedFacilities.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {groupedFacilities.map((fac) => (
                    <div
                      key={fac.id}
                      className="flex flex-col gap-2 p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100"
                    >
                      <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-sm">
                        <Building2 size={16} />
                        {fac.name}
                      </div>
                      <div className="flex flex-wrap gap-2 pl-5">
                        {fac.floors.map((fl) => (
                          <span
                            key={fl.id}
                            className="inline-flex items-center px-2.5 py-1 bg-white text-gray-700 rounded-md text-xs font-semibold border border-indigo-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                          >
                            {fl.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Chưa liên kết tòa nhà/tầng nào.</p>
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Mô Tả
              </p>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 min-h-[80px]">
                {vehicle.description || (
                  <span className="text-gray-400 italic">Không có mô tả</span>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-[#d7ee46] hover:text-[#060606] hover:border-[#c4dc32] transition-colors"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
