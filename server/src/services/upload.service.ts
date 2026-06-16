import cloudinary from '../config/cloudinary';
import fs from 'fs';
import path from 'path';
import { ParkingSession } from '../models/parkingSession.model';

export class UploadService {
  /**
   * Background task: Tải ảnh từ local lên Cloudinary,
   * cập nhật lại vào DB, và xoá file local.
   */
  static async uploadLocalImageToCloudinary(sessionId: string, localUrl: string): Promise<void> {
    try {
      if (!process.env.CLOUDINARY_CLOUD_NAME) {
        // Nếu không có cấu hình Cloudinary, giữ nguyên URL local
        return;
      }

      // Trích xuất tên file từ localUrl (VD: "/uploads/alpr/alpr_12345.jpg")
      const filename = path.basename(localUrl);
      const localFilePath = path.join(__dirname, '../../public/uploads/alpr', filename);

      if (!fs.existsSync(localFilePath)) {
        console.error(`[UploadService] Không tìm thấy file local: ${localFilePath}`);
        return;
      }

      console.log(`[UploadService] Bắt đầu đẩy ảnh ngầm lên Cloudinary cho session ${sessionId}...`);

      // Upload lên Cloudinary
      const cloudinaryUrl = await new Promise<string>((resolve, reject) => {
        cloudinary.uploader.upload(
          localFilePath,
          { folder: 'smart_parking/alpr' },
          (error, result) => {
            if (error || !result) {
              reject(error || new Error('Lỗi upload Cloudinary không xác định'));
            } else {
              resolve(result.secure_url);
            }
          }
        );
      });

      // Cập nhật Database
      await ParkingSession.findByIdAndUpdate(sessionId, { checkInImage: cloudinaryUrl });
      console.log(`[UploadService] [OK] Đã cập nhật ảnh Cloudinary cho session ${sessionId}`);

      // Xoá file local để dọn dẹp dung lượng
      try {
        fs.unlinkSync(localFilePath);
        console.log(`[UploadService] [OK] Đã xoá file tạm: ${localFilePath}`);
      } catch (delError) {
        console.error(`[UploadService] Lỗi khi xoá file tạm:`, delError);
      }
    } catch (error) {
      console.error(`[UploadService] [FAIL] Upload background thất bại cho session ${sessionId}:`, error);
      // Ảnh local vẫn còn trong ổ cứng, UI vẫn hiển thị được qua local URL.
    }
  }
}
