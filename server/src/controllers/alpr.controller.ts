import { Request, Response } from 'express';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const ALPR_SERVICE_URL = process.env.ALPR_SERVICE_URL || 'http://localhost:8000/predict';

/**
 * Chuẩn hóa biển số xe Việt Nam từ kết quả OCR.
 */
const normalizeLicensePlate = (raw: string): string => {
  let s = raw.trim().toUpperCase();
  s = s.replace(/[*#@]/g, '-');
  s = s.replace(/\s*-\s*/g, '-');
  s = s.replace(/[^A-Z0-9\s.\-]/g, '');
  // Remove errant dash after province code if it exists (e.g., 66-F1 -> 66F1)
  s = s.replace(/^(\d{2})-([A-Z])/, '$1$2');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
};

/**
 * Lưu ảnh local cực nhanh (< 5ms) để trả về ngay cho giao diện.
 */
function saveLocally(file: Express.Multer.File): string {
  const dir = path.join(__dirname, '../../public/uploads/alpr');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const ext = path.extname(file.originalname) || '.jpg';
  const filename = `alpr_${Date.now()}${ext}`;
  fs.writeFileSync(path.join(dir, filename), file.buffer);
  return `/uploads/alpr/${filename}`;
}

export const scanLicensePlate = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Chưa có file ảnh.' });
      return;
    }

    // ── 1. Lưu file xuống ổ cứng local tức thì ─────────────────────────────
    let localImageUrl: string | null = null;
    try {
      localImageUrl = saveLocally(req.file);
    } catch (err) {
      console.error('[ALPR] Error saving local image:', err);
    }

    // ── 2. Gửi ảnh sang Python ALPR service ───────────────────────────────
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    let alprResponse;
    try {
      alprResponse = await axios.post(ALPR_SERVICE_URL, formData, {
        headers: { ...formData.getHeaders() },
        timeout: 30000,
      });
    } catch (err: any) {
      console.error('[ALPR] Service unreachable:', err.message);
      res.status(503).json({
        success: false,
        message: 'Dịch vụ nhận dạng không phản hồi. Vui lòng nhập biển số thủ công.',
      });
      return;
    }

    // ── 3. Xử lý kết quả OCR ──────────────────────────────────────────────
    const results: any[] = alprResponse.data.results ?? [];

    if (results.length === 0) {
      res.status(200).json({
        success: false,
        message: 'Không phát hiện biển số trong ảnh.',
        data: { imageUrl: localImageUrl },
      });
      return;
    }

    // Kết quả từ Python ALPR đã được sắp xếp chuẩn (ưu tiên biển hợp lệ trước, sau đó mới đến confidence).
    // Do đó lấy luôn kết quả đầu tiên, tránh tự sort lại chỉ bằng confidence gây ra việc nhầm sticker/chữ quảng cáo.
    const best = results[0];
    const normalizedPlate = normalizeLicensePlate(best.text);

    // ── 4. Trả về biển số + imageUrl (local) ngay lập tức ─────────────────
    res.status(200).json({
      success: true,
      message: `Nhận dạng biển số: ${normalizedPlate}`,
      data: {
        licensePlate: best.text,
        normalizedPlate,
        confidence: best.confidence,
        imageUrl: localImageUrl, // Đường dẫn local, hiển thị ngay lập tức
        allResults: results,
      },
    });

  } catch (error) {
    console.error('[ALPR] Controller error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
  }
};

