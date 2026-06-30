import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Car, Building2, Loader2 } from 'lucide-react';
import { VehicleType } from '../../../../services/vehicleType.service';
import { floorService, Floor } from '../../../../services/floor.service';
import { facilityService, Facility } from '../../../../services/facility.service';
import { ICON_MAP, getVehicleColorTheme } from './constants';
import * as Dialog from '@radix-ui/react-dialog';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: VehicleType;
  allVehicles?: VehicleType[];
}

export function VehicleDetailModal({ isOpen, onClose, vehicle, allVehicles = [] }: DetailModalProps) {
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

  const groupedFacilities = Object.values(facilitiesWithFloors);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              />
            </Dialog.Overlay>
            <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto"
              >
                <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between bg-gray-50/50 shrink-0">
                  <div>
                    <h2 className="text-lg font-bold text-[#062F28]">Chi Tiết Loại Xe</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Thông tin chi tiết về loại phương tiện</p>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      className="p-2 text-gray-400 hover:text-[#062F28] hover:bg-[#9FE870]/20 rounded-xl transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="p-6 overflow-y-auto flex-1 flex flex-col space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        {(() => {
                          if (!vehicle) return null;
                          const colorTheme = getVehicleColorTheme(vehicle.code, vehicle.icon);
                          const Icon = vehicle.icon && ICON_MAP[vehicle.icon] ? ICON_MAP[vehicle.icon] : Car;
                          return (
                            <div
                              className="w-16 h-16 rounded-2xl flex items-center justify-center border-[1.5px] border-[#f0f0f0] shadow-sm shrink-0"
                              style={{ background: colorTheme.bg, color: colorTheme.text }}
                            >
                              <Icon size={32} strokeWidth={2} />
                            </div>
                          );
                        })()}
                        <div>
                          <h3 className="text-xl font-bold text-[#062F28]">{vehicle?.name}</h3>
                          <p className="text-sm font-mono text-gray-500 mt-1">{vehicle?.code}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Ngày Giờ Tạo
                          </p>
                          <span className="text-sm font-medium text-[#062F28]">
                            {vehicle ? `${new Date(vehicle.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${new Date(vehicle.createdAt).toLocaleDateString('vi-VN')}` : '-'}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Yêu cầu Biển số</p>
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold border ${vehicle?.requiresPlate !== false
                            ? 'bg-[#062F28] text-[#9FE870] border-[#062F28]'
                            : 'bg-[#ffffff] text-[#062F28] border-[#9FE870]'
                            }`}>
                            {vehicle?.requiresPlate !== false ? 'Có — Quét biển số' : 'Không — Dùng ảnh đối chiếu'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Tòa nhà & Tầng liên kết
                        </p>
                        {isLoadingLinks ? (
                          <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                            <Loader2 size={14} className="animate-spin" /> Đang tải dữ liệu liên kết...
                          </div>
                        ) : groupedFacilities.length > 0 ? (
                          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                            {groupedFacilities.map((fac) => (
                              <div
                                key={fac.id}
                                className="flex flex-col gap-2 p-3.5 bg-[#9FE870]/10 rounded-xl border border-[#9FE870]/20"
                              >
                                <div className="flex items-center gap-1.5 text-[#062F28] font-bold text-sm">
                                  <Building2 size={16} />
                                  {fac.name}
                                </div>
                                <div className="flex flex-wrap gap-2 pl-5">
                                  {fac.floors.map((fl) => (
                                    <span
                                      key={fl.id}
                                      className="inline-flex items-center px-2.5 py-1 bg-white text-gray-700 rounded-md text-xs font-semibold border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
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
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Mô Tả
                    </p>
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 min-h-[80px]">
                      {vehicle?.description || (
                        <span className="text-gray-400 italic">Không có mô tả</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
                  <Dialog.Close asChild>
                    <button
                      className="px-5 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-[#9FE870] hover:text-[#062F28] hover:border-[#9FE870]/70 transition-colors"
                    >
                      Đóng
                    </button>
                  </Dialog.Close>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}