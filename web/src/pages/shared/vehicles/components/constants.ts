import { Car, Bike, Truck, Motorbike, type LucideIcon } from 'lucide-react';

/** Danh sách icon xe đường bộ — name lưu vào DB dưới dạng string */
export const ICON_OPTIONS: { name: string; label: string; Icon: LucideIcon }[] = [
  { name: 'Bicycle', label: 'Xe đạp', Icon: Bike },
  { name: 'Motorbike', label: 'Xe máy', Icon: Motorbike },
  { name: 'Car', label: 'Xe ô tô', Icon: Car },
  { name: 'Truck', label: 'Xe bán tải', Icon: Truck },
];

/** Lookup nhanh từ tên icon → component Lucide */
export const ICON_MAP: Record<string, LucideIcon> = {
  Bicycle: Bike,
  Bike: Motorbike,
  Motorcycle: Motorbike,
  Motorbike: Motorbike,
  Car: Car,
  Truck: Truck,
};

/** Tên icon mặc định */
export const DEFAULT_ICON = 'Car';

/** Cấu hình màu sắc cố định cho các loại xe */
export const getVehicleColorTheme = (code?: string, icon?: string) => {
  const c = code?.toUpperCase() || '';
  const i = icon?.toLowerCase() || '';

  // Nền xanh nhạt cho xe đạp (Bicycle)
  if (c.includes('BICYCLE') || c.includes('DAP') || i === 'bicycle') {
    return { bg: '#EAF5E4', text: '#062F28' };
  }
  // Nền xanh lá icon đen cho xe máy (Motorbike)
  if (c.includes('MOTORBIKE') || c.includes('BIKE') || c.includes('MAY') || i === 'bike') {
    return { bg: '#9FE870', text: '#062F28' };
  }
  // Nền đen icon xanh cho xe ô tô (Car)
  if (c.includes('CAR') || c.includes('OTO') || c.includes('TO') || i === 'car') {
    return { bg: '#1A1A1A', text: '#9FE870' };
  }
  // Nền xám cho xe bán tải (Truck)
  if (c.includes('TRUCK') || c.includes('TAI') || i === 'truck') {
    return { bg: '#F3F4F6', text: '#4B5563' };
  }

  // Mặc định
  return { bg: '#F3F4F6', text: '#4B5563' };
};
