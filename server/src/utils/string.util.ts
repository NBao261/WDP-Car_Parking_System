export function normalizeVehicleTypeName(name: string): string {
  if (!name) return '';
  return name
    .trim()
    .replace(/[\u00A0\s]+/g, ' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}
