import crypto from 'crypto';

/**
 * Sinh mã lượt gửi xe: PS-YYYYMMDD-XXXX
 * Format: PS + ngày + 4 ký tự hex ngẫu nhiên (uppercase)
 */
export function generateSessionCode(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `PS-${dateStr}-${random}`;
}

/**
 * Sinh mã thẻ xe / QR code: CARD-XXXX-XXXX
 * 8 ký tự hex ngẫu nhiên (uppercase), chia 2 nhóm
 */
export function generateCardCode(): string {
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `CARD-${random.slice(0, 4)}-${random.slice(4, 8)}`;
}

/**
 * Sinh mã đặt chỗ: RSV-YYYYMMDD-XXXX
 * Format: RSV + ngày + 4 ký tự hex ngẫu nhiên (uppercase)
 */
export function generateReservationCode(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `RSV-${dateStr}-${random}`;
}
