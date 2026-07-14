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

export function guessVehicleCategory(plateStr: string): string | null {
  if (plateStr.startsWith('KBS-')) return null;
  
  const upper = plateStr.toUpperCase().replace(/\./g, '');
  const parts = upper.split(/[-\s]+/);
  
  let series = "";
  if (parts.length >= 3) {
     series = parts[1];
  } else {
     const clean = upper.replace(/[-\s]/g, '');
     const m = clean.match(/^(\d{2})([A-ZĐ]+[0-9]?)(\d{4,5})$/);
     if (m) {
        series = m[2];
        if (clean.length === 8 && series.length === 2 && /\d/.test(series)) {
            series = series.charAt(0);
        }
     }
  }
  
  if (!series) return 'Motorbike';
  
  if (series === 'C' || series === 'H' || series === 'D') return 'Truck';
  if (series.length === 1) return 'Car';
  const carSpecialSeries = ['LD', 'KT', 'NN', 'NG', 'CV', 'DA', 'HC', 'MK', 'TĐ'];
  if (carSpecialSeries.includes(series)) return 'Car';
  if (series === 'MĐ') return 'ElectricMotorbike';
  return 'Motorbike';
}

export function matchVehicleType(plateStr: string, vehicleTypes: Array<{ _id: string, name: string }>): string | null {
  const category = guessVehicleCategory(plateStr);
  if (!category) return null;
  
  let targetType = vehicleTypes.find(v => {
    const norm = v.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]/g, '');
    if (category === 'Truck') return norm.includes('tai') || norm.includes('truck');
    if (category === 'ElectricMotorbike') return norm.includes('maydien') || norm.includes('xedien');
    if (category === 'Car') return (norm.includes('oto') && !norm.includes('moto')) || norm.includes('car');
    if (category === 'Motorbike') return norm.includes('may') || norm.includes('motorbike') || norm.includes('moto');
    return false;
  });
  
  if (!targetType) {
    if (category === 'Truck' || category === 'Car') {
        targetType = vehicleTypes.find(v => {
            const norm = v.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
            return (norm.includes('oto') && !norm.includes('moto')) || norm.includes('car');
        });
    } else {
        targetType = vehicleTypes.find(v => {
            const norm = v.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
            return norm.includes('may') || norm.includes('motorbike') || norm.includes('moto');
        });
    }
  }
  
  return targetType ? targetType._id : null;
}

