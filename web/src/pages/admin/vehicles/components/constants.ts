import { SlotSize } from '../../../../services/vehicleType.service';

export const ICON_OPTIONS = [
  '🚗', '🚕', '🚙', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚌', '🚎', '🏍️', '🛵', '🛺', '🚲', '🛴', '🛻', '🚚', '🚛', '🚜'
];

export const SLOT_SIZE_LABELS: Record<SlotSize, { label: string; color: string }> = {
  small: { label: 'Nhỏ', color: 'bg-blue-50 text-blue-700 border-blue-200/60' },
  medium: { label: 'Vừa', color: 'bg-amber-50 text-amber-700 border-amber-200/60' },
  large: { label: 'Lớn', color: 'bg-purple-50 text-purple-700 border-purple-200/60' },
};
