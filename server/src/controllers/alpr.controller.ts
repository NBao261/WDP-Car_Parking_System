import { Request, Response } from 'express';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary';

const ALPR_SERVICE_URL = process.env.ALPR_SERVICE_URL || 'http://localhost:8000/predict';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Thời gian tối đa chờ Cloudinary trước khi trả response (ms).
// Nếu upload chậm hơn mốc này → vẫn trả biển số, imageUrl = null (upload vẫn tiếp tục nền).
const CLOUDINARY_FAST_TIMEOUT_MS = 3000;

/**
 * Chuẩn hóa biển số xe Việt Nam từ kết quả OCR.
 */
const normalizeLicensePlate = (raw: string): string => {
  let s = raw.trim().toUpperCase();
  s = s.replace(/[*#@]/g, '-');
  s = s.replace(/\s*-\s*/g, '-');
  s = s.replace(/[^A-Z0-9\s.\-]/g, '');
  s = s.replace(/^(\d{2})([A-Z])/, '$1-$2');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
};

/**
 * Upload ảnh lên Cloudinary.
 * 
 * Production: chỉ Cloudinary.
 * Development (không có Cloudinary config): lưu local làm fallback.
 */
const uploadImage = (file: Express.Multer.File): Promise<string | null> => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    if (!IS_PRODUCTION) {
      // Dev fallback: lưu local
      try { return Promise.resolve(saveLocally(file)); }
      catch { return Promise.resolve(null); }
    }
    console.warn('[ALPR] CLOUDINARY_CLOUD_NAME not set — images will not be stored.');
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'smart_parking/alpr' },
      (error, result) => {
        if (error || !result) {
          console.error('[ALPR] Cloudinary upload failed:', error?.message);
          // Production: không fallback local, trả null
          const fallback = IS_PRODUCTION ? null : (() => {
            try { return saveLocally(file); } catch { return null; }
          })();
          resolve(fallback);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

/**
 * Race: upload Cloudinary vs timeout.
 * - Nếu Cloudinary xong trong CLOUDINARY_FAST_TIMEOUT_MS → trả URL thật.
 * - Nếu chậm hơn → trả null (upload vẫn tiếp tục nền, không block response).
 */
const uploadWithTimeout = (
  file: Express.Multer.File
): { fast: Promise<string | null>; background: Promise<string | null> } => {
  const uploadPromise = uploadImage(file);

  const fastRace = Promise.race([
    uploadPromise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), CLOUDINARY_FAST_TIMEOUT_MS)),
  ]);

  return { fast: fastRace, background: uploadPromise };
};

export const scanLicensePlate = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Chưa có file ảnh.' });
      return;
    }

    // ── 1. Bắt đầu upload ảnh SONG SONG với gửi sang ALPR ─────────────────
    //    (Cloudinary upload bắt đầu ngay từ đây, không đợi OCR xong)
    const { fast: fastUpload, background: bgUpload } = uploadWithTimeout(req.file);

    // ── 2. Gửi ảnh sang Python ALPR service ────────────────────────────────
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
      bgUpload.catch(console.error); // không bỏ upload
      return;
    }

    // ── 3. Đợi Cloudinary (nếu xong trước timeout) ─────────────────────────
    //    OCR thường mất 3-5s, Cloudinary mất 1-2s → thường xong cùng lúc.
    //    Race timeout 3s đảm bảo không bị block thêm quá lâu.
    const imageUrl = await fastUpload;

    // ── 4. Xử lý kết quả OCR ──────────────────────────────────────────────
    const results: any[] = alprResponse.data.results ?? [];

    if (results.length === 0) {
      res.status(200).json({
        success: false,
        message: 'Không phát hiện biển số trong ảnh.',
        data: { imageUrl },
      });
      bgUpload.catch(console.error);
      return;
    }

    const best = results.sort((a, b) => b.confidence - a.confidence)[0];
    const normalizedPlate = normalizeLicensePlate(best.text);

    // ── 5. Trả về biển số + imageUrl (Cloudinary URL hoặc null nếu chậm) ───
    res.status(200).json({
      success: true,
      message: `Nhận dạng biển số: ${normalizedPlate}`,
      data: {
        licensePlate: best.text,
        normalizedPlate,
        confidence: best.confidence,
        imageUrl,         // Cloudinary URL nếu upload kịp, null nếu chậm
        allResults: results,
      },
    });

    // ── 6. Nếu Cloudinary chưa xong, vẫn tiếp tục nền (để log/DB update) ──
    if (!imageUrl) {
      bgUpload
        .then((url) => {
          if (url) console.log(`[ALPR] Cloudinary delayed upload done: ${url} (plate: ${normalizedPlate})`);
        })
        .catch(console.error);
    }

  } catch (error) {
    console.error('[ALPR] Controller error:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ.' });
  }
};

// ── Helper lưu file local (CHỈ dùng ở development) ─────────────────────────
function saveLocally(file: Express.Multer.File): string {
  const dir = path.join(__dirname, '../../public/uploads/alpr');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const ext = path.extname(file.originalname) || '.jpg';
  const filename = `alpr_${Date.now()}${ext}`;
  fs.writeFileSync(path.join(dir, filename), file.buffer);
  return `/uploads/alpr/${filename}`;
}
