import { Car, Bike, Truck, Bus, CarTaxiFront, BusFront, type LucideIcon } from 'lucide-react';
import { SlotSize } from '../../../../services/vehicleType.service';

/** Danh sách icon xe đường bộ — name lưu vào DB dưới dạng string */
export const ICON_OPTIONS: { name: string; label: string; Icon: LucideIcon }[] = [
  { name: 'Car', label: 'Ô tô', Icon: Car },
  { name: 'CarTaxiFront', label: 'Taxi', Icon: CarTaxiFront },
  { name: 'Bike', label: 'Xe máy', Icon: Bike },
  { name: 'Bicycle', label: 'Xe đạp', Icon: Bike },
  { name: 'Truck', label: 'Xe tải', Icon: Truck },
  { name: 'Bus', label: 'Xe buýt', Icon: Bus },
  { name: 'BusFront', label: 'Xe khách', Icon: BusFront },
];

/** Lookup nhanh từ tên icon → component Lucide */
export const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  ICON_OPTIONS.map(({ name, Icon }) => [name, Icon])
);

/** Tên icon mặc định */
export const DEFAULT_ICON = 'Car';

export const SLOT_SIZE_LABELS: Record<SlotSize, { label: string; color: string }> = {
  small: { label: 'Nhỏ', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  medium: { label: 'Vừa', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  large: { label: 'Lớn', color: 'bg-gray-100 text-gray-700 border-gray-200' },
};
