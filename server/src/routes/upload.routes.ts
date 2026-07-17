import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

/**
 * POST /upload/image
 * Upload ảnh đơn giản (không OCR) — dùng cho xe không có biển số.
 * Trả về: { success: true, data: { imageUrl: '/uploads/vehicles/<filename>' } }
 */
router.post('/image', upload.single('image'), (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'Không có file ảnh' });
    }

    const dir = path.join(__dirname, '../../public/uploads/vehicles');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `vehicle_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
    fs.writeFileSync(path.join(dir, filename), file.buffer);

    const imageUrl = `/uploads/vehicles/${filename}`;

    return res.json({
      success: true,
      data: { imageUrl },
    });
  } catch (error: any) {
    console.error('Upload image error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Upload thất bại' });
  }
});

export default router;
