import { Request, Response, NextFunction } from 'express';
import { FeedbackService } from '../services/feedback.service';

export class FeedbackController {
  /**
   * POST /feedbacks
   * FR-17.1: Tạo phản hồi (Driver only)
   */
  static async createFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const feedback = await FeedbackService.createFeedback(userId, req.body);
      res.status(201).json({ success: true, data: feedback });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /feedbacks
   * FR-17.2: Xem danh sách phản hồi
   */
  static async getFeedbacks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const role = req.user!.role;
      const result = await FeedbackService.getFeedbacks(userId, role, req.query);
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
   * GET /feedbacks/:id
   * Xem chi tiết phản hồi
   */
  static async getFeedbackById(req: Request, res: Response, next: NextFunction) {
    try {
      const feedback = await FeedbackService.getFeedbackById(req.params.id as string);
      res.status(200).json({ success: true, data: feedback });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /feedbacks/:id/status
   * FR-17.3: Xử lý phản hồi (Manager/Admin)
   */
  static async updateFeedbackStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const managerId = req.user!.userId;
      const feedback = await FeedbackService.updateFeedbackStatus(
        req.params.id as string,
        managerId,
        req.body
      );
      res.status(200).json({ success: true, data: feedback });
    } catch (error) {
      next(error);
    }
  }
}
