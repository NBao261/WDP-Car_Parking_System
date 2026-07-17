export function formatPlate(raw: string): string {
  if (!raw) return '';
  let s = raw.toUpperCase();
  
  // Xóa ký tự không hợp lệ
  s = s.replace(/[^A-Z0-9\-]/g, '');
  let clean = s.replace(/[^A-Z0-9]/g, '');
  
  if (clean.length < 3) return clean;

  let prefix = "";
  let suffix = "";

  // Nếu người dùng có gõ dash, thử parse theo dash
  if (s.includes('-')) {
    const parts = s.split('-').filter(p => p.length > 0);
    if (parts.length >= 2) {
      const lastPart = parts[parts.length - 1];
      // Chỉ khi phần cuối cùng TOÀN SỐ thì mới tin tưởng đó là suffix
      if (/^[0-9]+$/.test(lastPart)) {
        suffix = lastPart;
        prefix = parts.slice(0, parts.length - 1).join('');
      }
    }
  }

  // Nếu không parse được bằng dash (vd user gõ "59-SA17234" -> lastPart là "SA17234" chứa chữ)
  // hoặc user không gõ dash
  if (!suffix) {
    const province = clean.substring(0, 2);
    const rest = clean.substring(2);
    
    // Ưu tiên: 2 chữ cái (SA) > 1 chữ 1 số (C1) > 1 chữ (A)
    const match = rest.match(/^([A-Z]{2}|[A-Z][0-9]|[A-Z])(.*)$/);
    if (match) {
      prefix = province + match[1];
      suffix = match[2];
    } else {
      prefix = clean;
      suffix = "";
    }
  }

  // Format prefix: thêm dash giữa mã tỉnh và series (nếu có)
  prefix = prefix.replace(/^(\d{2})([A-Z0-9]+)$/, '$1-$2');

  let formatted = prefix;
  if (suffix.length > 0) {
    formatted += '-';
    if (suffix.length === 4) {
      formatted += suffix;
    } else if (suffix.length >= 5) {
      formatted += `${suffix.substring(0, 3)}.${suffix.substring(3)}`;
    } else {
      formatted += suffix;
    }
  }

  return formatted;
}

export function formatCurrency(amount: number): string {
  if (amount === undefined || amount === null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}
