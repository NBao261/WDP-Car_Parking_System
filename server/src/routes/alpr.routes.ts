import { Router } from 'express';
import multer from 'multer';
import { scanLicensePlate } from '../controllers/alpr.controller';
// Ensure you have auth middleware to restrict this to staff
// import { protect, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Configure multer to use memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit (ảnh chụp từ điện thoại thường 5-15MB)
  }
});

// Route for scanning license plate from image
// Add auth middleware in production: router.post('/scan', protect, authorize('staff', 'admin'), upload.single('image'), scanLicensePlate);
router.post('/scan', upload.single('image'), scanLicensePlate);

export default router;
