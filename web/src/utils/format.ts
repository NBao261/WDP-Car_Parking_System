export function formatPlate(raw: string): string {
  if (!raw) return '';
  let s = raw.toUpperCase();
  
  // Xóa tất cả ngoại trừ chữ cái, số, dấu gạch ngang và dấu chấm
  s = s.replace(/[^A-Z0-9\-\.]/g, '');

  // Chuẩn hoá thành chuỗi ký tự liền mạch để xử lý
  let clean = s.replace(/[^A-Z0-9]/g, '');
  
  if (clean.length < 3) return clean;

  // Nếu người dùng đã gõ dấu '-' thì giữ nguyên format tiền tố (tránh nhập nhằng 59C-12345 và 59C1-2345)
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
         formatted += `${suffixClean.substring(0, 3)}.${suffixClean.substring(3)}`;
      } else {
         formatted += suffixClean;
      }
    }
    return formatted;
  }
  
  // Xử lý auto-format từ chuỗi không dấu (nhập nhanh)
  // Quy tắc: 2 số đầu (mã tỉnh) + 1-2 chữ cái (có thể có 1 số) + phần còn lại
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
      // 5 số thì thêm dấu chấm sau 3 số đầu
      formatted += `${tail.substring(0, 3)}.${tail.substring(3)}`;
    } else {
      formatted += tail;
    }
  }
  
  return formatted;
}

export function formatCurrency(amount: number): string {
  if (amount === undefined || amount === null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}
