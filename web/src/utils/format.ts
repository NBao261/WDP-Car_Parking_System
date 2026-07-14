export function formatPlate(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  } else if (cleaned.length === 9) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}.${cleaned.slice(7)}`;
  }
  
  return cleaned;
}
