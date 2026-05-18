import { Request, Response, NextFunction } from 'express';
import { ExceptionService } from '../services/exception.service';

export class ExceptionController {
  /**
   * Thêm ngoại lệ mới (Staff)
   */
  static async createException(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        ...req.body,
        staffId: req.user?.userId,
      };
      const exception = await ExceptionService.createException(data);
      res.status(201).json({ success: true, data: exception });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách ngoại lệ
   */
  static async getExceptions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ExceptionService.getExceptions(req.query);
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Duyệt / Xử lý ngoại lệ (Manager)
   */
  static async resolveException(req: Request, res: Response, next: NextFunction) {
    try {
      const exceptionId = req.params.id as string;
      const data = {
        ...req.body,
        managerId: req.user?.userId,
      };

      const exception = await ExceptionService.resolveException(exceptionId, data);
      res.status(200).json({ success: true, data: exception });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Kích hoạt quét tự động xe quá hạn (System/Cron/Admin)
   */
  static async detectOverdue(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await ExceptionService.detectOverdueSessions();
      res.status(200).json({
        success: true,
        message: `Đã quét và phát hiện ${count} lượt gửi xe quá hạn.`,
        data: { count },
      });
    } catch (error) {
      next(error);
    }
  }
}
