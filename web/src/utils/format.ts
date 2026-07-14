export function formatPlate(raw: string): string {
  if (!raw) return '';
  let s = raw.trim().toUpperCase();
  s = s.replace(/[^A-Z0-9\s.\-]/g, '');
  
  let clean = s.replace(/[^A-Z0-9]/g, '');
  
  s = s.replace(/\s+/g, '-');
  s = s.replace(/^(\d{2})([A-Z])/, '$1-$2');
  
  if (clean.length === 9) {
    s = s.replace(/^(\d{2}-[A-Z][0-9A-Z])(\d{5})$/, '$1-$2');
  }
  
  s = s.replace(/-(\d{3})(\d{2})$/, '-$1.$2');
  s = s.replace(/-+/g, '-');
  
  return s;
}
