import { Request, Response } from 'express';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary';

const ALPR_SERVICE_URL = process.env.ALPR_SERVICE_URL || 'http://localhost:8000/predict';

/**
 * Chuẩn hóa biển số xe Việt Nam từ kết quả OCR.
 * Sửa các lỗi OCR phổ biến (*, #, nhầm O/0, I/1, B/8...).
 *
 * Định dạng VN: 63-B9 999.99 hoặc 63-B99999
 * Sau normalize: 63-B9 999.99 (giữ nguyên, trim + uppercase)
 */
const normalizeLicensePlate = (raw: string): string => {
  let s = raw.trim().toUpperCase();

  // Sửa dấu phân cách sai thường gặp từ OCR
  s = s.replace(/[*#@]/g, '-');   // * # @ → -
  s = s.replace(/\s*-\s*/g, '-'); // khoảng trắng quanh dấu - 

  // Loại bỏ ký tự lạ không phải chữ/số/khoảng trắng/dấu chấm/gạch
  s = s.replace(/[^A-Z0-9\s.\-]/g, '');

  // Biển số VN thường: 2 số - chữ cái (1-2) số (4-5)
  // Ví dụ: 63-B9 999.99, 30A-12345, 51G-123.45
  // Nếu pattern phần đầu khớp 2 số rồi đến chữ, chèn dấu - nếu thiếu
  s = s.replace(/^(\d{2})([A-Z])/, '$1-$2'); // 63B... → 63-B...

  // Nhiều khoảng trắng → 1
  s = s.replace(/\s+/g, ' ').trim();

  return s;
};


export const scanLicensePlate = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Chưa có file ảnh.' });
      return;
    }

    // ── 1. Gửi ảnh sang Python ALPR service ────────────────────────────────
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

    // ── 2. Lưu ảnh (Cloudinary → local fallback) ───────────────────────────
    let imageUrl = '';
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        const uploadResult: any = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'smart_parking/alpr' },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          streamifier.createReadStream(req.file!.buffer).pipe(stream);
        });
        imageUrl = uploadResult.secure_url;
      } catch (err) {
        console.error('[ALPR] Cloudinary error, falling back to local:', err);
        imageUrl = saveLocally(req.file!);
      }
    } else {
      imageUrl = saveLocally(req.file!);
    }

    // ── 3. Xử lý kết quả OCR ──────────────────────────────────────────────
    const results: any[] = alprResponse.data.results ?? [];

    if (results.length === 0) {
      res.status(200).json({
        success: false,
        message: 'Không phát hiện biển số trong ảnh.',
        data: { imageUrl },
      });
      return;
    }

    // Chọn kết quả có độ tin cậy cao nhất
    const best = results.sort((a, b) => b.confidence - a.confidence)[0];
    const normalizedPlate = normalizeLicensePlate(best.text);

    // ── 4. Trả về biển số — frontend tự xử lý check-in/checkout ──────────
    res.status(200).json({
      success: true,
      message: `Nhận dạng biển số: ${normalizedPlate}`,
      data: {
        licensePlate: best.text,
        normalizedPlate,
        confidence: best.confidence,
        imageUrl,
        allResults: results,
      },
    });

  } catch (error) {
    console.error('[ALPR] Controller error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
  }
};

// ── Helper lưu file local ───────────────────────────────────────────────────
function saveLocally(file: Express.Multer.File): string {
  const dir = path.join(__dirname, '../../public/uploads/alpr');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const ext = path.extname(file.originalname) || '.jpg';
  const filename = `alpr_${Date.now()}${ext}`;
  fs.writeFileSync(path.join(dir, filename), file.buffer);
  return `/uploads/alpr/${filename}`;
}
