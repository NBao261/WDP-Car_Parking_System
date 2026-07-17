import { IconCar, IconMotorbike, IconBike, type Icon } from '@tabler/icons-react';

/** Danh sách icon xe đường bộ — name lưu vào DB dưới dạng string */
export const ICON_OPTIONS: { name: string; label: string; Icon: Icon }[] = [
  { name: 'Car', label: 'Ô tô', Icon: IconCar },
  { name: 'CarElectric', label: 'Ô tô điện', Icon: IconCar },
  { name: 'Motorbike', label: 'Xe máy', Icon: IconMotorbike },
  { name: 'MotorbikeElectric', label: 'Xe máy điện', Icon: IconMotorbike },
  { name: 'Bicycle', label: 'Xe đạp', Icon: IconBike },
];

/** Lookup nhanh từ tên icon → component Tabler */
export const ICON_MAP: Record<string, Icon> = {
  Car: IconCar,
  CarElectric: IconCar,
  Motorbike: IconMotorbike,
  MotorbikeElectric: IconMotorbike,
  Bicycle: IconBike,
};

/** Tên icon mặc định */
export const DEFAULT_ICON = 'Car';

/** Cấu hình màu sắc cố định cho các loại xe */
export const getVehicleColorTheme = (code?: string, icon?: string) => {
  const c = code?.toUpperCase() || '';
  const i = icon?.toLowerCase() || '';

  // Xe Ô tô Điện — nền teal nhạt, icon teal đậm
  if (c.includes('XEOTODIEN') || c.includes('OTO DIEN') || c.includes('Ô TÔ ĐIỆN') || i === 'carelectric') {
    return { bg: '#E1F5EE', text: '#0F6E56' };
  }
  // Xe Máy Điện — nền xanh lá nhạt, icon xanh lá đậm
  if (c.includes('XEMAYDIEN') || c.includes('MAY DIEN') || c.includes('MÁY ĐIỆN') || i === 'motorbikeelectric') {
    return { bg: '#EAF3DE', text: '#3B6D11' };
  }
  // Nền xanh lá rất nhạt cho xe đạp (Bicycle)
  if (c.includes('BICYCLE') || c.includes('DAP') || i === 'bicycle') {
    return { bg: '#D4EDBC', text: '#5A8A2F' };
  }
  // Nền lime brand icon đen cho xe máy (Motorbike)
  if (c.includes('MOTORBIKE') || c.includes('BIKE') || c.includes('MAY') || i === 'motorbike') {
    return { bg: '#9FE870', text: '#062F28' };
  }
  // Nền teal đậm icon lime cho xe ô tô (Car)
  if (c.includes('CAR') || c.includes('OTO') || c.includes('TO') || i === 'car') {
    return { bg: '#085041', text: '#9FE870' };
  }

  // Mặc định
  return { bg: '#F3F4F6', text: '#4B5563' };
};