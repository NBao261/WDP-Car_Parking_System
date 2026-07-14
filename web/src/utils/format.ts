export function formatPlate(raw: string): string {
  if (!raw) return '';
  let s = raw.trim().toUpperCase();
  s = s.replace(/[^A-Z0-9\s.\-]/g, '');
  s = s.replace(/\s+/g, ' ').trim();
  s = s.replace(/^(\d{2})([A-Z])/, '$1-$2');
  s = s.replace(/\s/g, '-');
  return s;
}
