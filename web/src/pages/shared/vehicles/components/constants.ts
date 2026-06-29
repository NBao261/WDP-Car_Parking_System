import { Car, Bike, Truck, Bus, CarTaxiFront, BusFront, MoreHorizontal, type LucideIcon } from 'lucide-react';

/** Danh sách icon xe đường bộ — name lưu vào DB dưới dạng string */
export const ICON_OPTIONS: { name: string; label: string; Icon: LucideIcon }[] = [
  { name: 'Bicycle', label: 'Xe đạp', Icon: Bike },
  { name: 'Bike', label: 'Xe máy', Icon: Bike },
  { name: 'Car', label: 'Ô tô', Icon: Car },
  { name: 'CarTaxiFront', label: 'Taxi', Icon: CarTaxiFront },
  { name: 'Truck', label: 'Xe tải', Icon: Truck },
  { name: 'Bus', label: 'Xe buýt', Icon: Bus },
  { name: 'BusFront', label: 'Xe khách', Icon: BusFront },
  { name: 'MoreHorizontal', label: 'Xe khác', Icon: MoreHorizontal },
];
/** Lookup nhanh từ tên icon → component Lucide */
export const ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  ICON_OPTIONS.map(({ name, Icon }) => [name, Icon])
);

/** Tên icon mặc định */
export const DEFAULT_ICON = 'Car';

