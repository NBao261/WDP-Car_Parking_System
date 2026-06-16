import cloudinary from '../config/cloudinary';
import fs from 'fs';
import path from 'path';
import { ParkingSession } from '../models/parkingSession.model';

export class UploadService {
  /**
   * Background task: Xử lý gộp cả ảnh checkIn và checkOut
   * khi xe ra khỏi bãi (COMPLETED session).
   */
  static async processCompletedSessionImages(sessionId: string): Promise<void> {
    try {
      if (!process.env.CLOUDINARY_CLOUD_NAME) return;

      const session = await ParkingSession.findById(sessionId);
      if (!session) return;

      let updatedFields: any = {};

      if (session.checkInImage && session.checkInImage.startsWith('/uploads/alpr/')) {
        const cloudUrl = await this._uploadAndDeleteLocal(session.checkInImage);
        if (cloudUrl) updatedFields.checkInImage = cloudUrl;
      }

      if (session.checkOutImage && session.checkOutImage.startsWith('/uploads/alpr/')) {
        const cloudUrl = await this._uploadAndDeleteLocal(session.checkOutImage);
        if (cloudUrl) updatedFields.checkOutImage = cloudUrl;
      }

      if (Object.keys(updatedFields).length > 0) {
        await ParkingSession.findByIdAndUpdate(sessionId, updatedFields);
        console.log(`[UploadService] [OK] Đã sync Cloudinary thành công cho session ${sessionId}`);
      }
    } catch (error) {
      console.error(`[UploadService] [FAIL] Sync background thất bại cho session ${sessionId}:`, error);
    }
  }

  private static async _uploadAndDeleteLocal(localUrl: string): Promise<string | null> {
    const filename = path.basename(localUrl);
    const localFilePath = path.join(__dirname, '../../public/uploads/alpr', filename);

    if (!fs.existsSync(localFilePath)) return null;

    try {
      const cloudinaryUrl = await new Promise<string>((resolve, reject) => {
        cloudinary.uploader.upload(
          localFilePath,
          { folder: 'smart_parking/alpr' },
          (error, result) => {
            if (error || !result) reject(error);
            else resolve(result.secure_url);
          }
        );
      });

      fs.unlinkSync(localFilePath);
      return cloudinaryUrl;
    } catch (err) {
      console.error(`[UploadService] Lỗi xử lý file ${filename}:`, err);
      return null;
    }
  }
}
