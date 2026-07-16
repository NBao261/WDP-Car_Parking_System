export function formatPlate(raw: string): string {
  if (!raw) return '';
  let s = raw.toUpperCase();
  
  // Xóa tất cả ngoại trừ chữ cái, số, dấu gạch ngang và dấu chấm
  s = s.replace(/[^A-Z0-9\-\.]/g, '');

  // Xóa dấu gạch ngang bị thừa sau mã tỉnh (VD: 66-F1 -> 66F1) để tránh lỗi format tiền tố
  s = s.replace(/^(\d{2})-([A-Z])/, '$1$2');

  // Chuẩn hoá thành chuỗi ký tự liền mạch để xử lý
  let clean = s.replace(/[^A-Z0-9]/g, '');
  
  if (clean.length < 3) return clean;

  // Nếu người dùng đã gõ dấu '-' thì giữ nguyên format tiền tố
  // Tách dựa trên dấu gạch ngang CUỐI CÙNG
  if (s.includes('-')) {
    const lastDash = s.lastIndexOf('-');
    let prefixClean = s.substring(0, lastDash).replace(/[^A-Z0-9]/g, '');
    const suffixClean = s.substring(lastDash + 1).replace(/[^A-Z0-9]/g, '');
    
    // Yêu cầu format: 66-F1-876.56
    prefixClean = prefixClean.replace(/^(\d{2})([A-Z0-9]+)$/, '$1-$2');
    
    let formatted = prefixClean;
    if (suffixClean.length > 0) {
      formatted += '-';
      if (suffixClean.length === 4) {
         formatted += suffixClean;
      } else if (suffixClean.length >= 5) {
         formatted += `${suffixClean.substring(0, 3)}.${suffixClean.substring(3, 5)}`;
      } else {
         formatted += suffixClean;
      }
    }
    return formatted;
  }
  
  // Xử lý auto-format từ chuỗi không dấu
  const province = clean.substring(0, 2);
  const rest = clean.substring(2);
  const match = rest.match(/^([A-Z]{1,2}[0-9]?)(.*)$/);
  
  if (!match) return clean;
  
  const [, series, tail] = match;
  let formatted = `${province}-${series}`;
  
  if (tail.length > 0) {
    formatted += '-';
    if (tail.length === 4) {
      formatted += tail;
    } else if (tail.length >= 5) {
      formatted += `${tail.substring(0, 3)}.${tail.substring(3, 5)}`;
    } else {
      formatted += tail;
    }
  }
  
  return formatted;
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

