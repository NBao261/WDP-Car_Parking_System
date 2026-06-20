import { Request, Response, NextFunction } from 'express';
import { ChatbotService } from '../services/ai/chatbot.service';
import { AppError } from '../middlewares/error.middleware';

export class AIController {
  // ─── Chatbot (FR-6.5 / RQ5) ─────────────────────────────

  /**
   * POST /api/v1/ai/chat-query
   * Body: { message: string }
   * 
   * Gửi câu hỏi cho AI Chatbot, nhận câu trả lời + dữ liệu
   */
  static async chatQuery(req: Request, res: Response, next: NextFunction) {
    try {
      const { message } = req.body;
      const userId = (req as any).user?._id?.toString();

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        throw new AppError('Vui lòng nhập câu hỏi', 400);
      }

      if (message.length > 500) {
        throw new AppError('Câu hỏi quá dài (tối đa 500 ký tự)', 400);
      }

      // Lấy danh sách facility mà user được phân công (scope)
      const facilityScope = (req as any).user?.assignedFacilities?.map(
        (f: any) => f?.toString?.() || f
      );

      const result = await ChatbotService.processQuery(userId, message.trim(), facilityScope);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/ai/chat-history
   * Query: page, limit
   * 
   * Lấy lịch sử chat của user hiện tại (phân trang)
   */
  static async getChatHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id?.toString();
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await ChatbotService.getChatHistory(userId, page, limit);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/ai/chat-history
   * 
   * Xóa toàn bộ lịch sử chat của user hiện tại
   */
  static async clearChatHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?._id?.toString();
      const result = await ChatbotService.clearChatHistory(userId);

      return res.json({
        success: true,
        message: `Đã xóa ${result.deletedCount} tin nhắn`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/ai/quick-replies
   * 
   * Lấy danh sách gợi ý câu hỏi nhanh
   */
  static async getQuickReplies(_req: Request, res: Response, next: NextFunction) {
    try {
      const replies = ChatbotService.getQuickReplies();

      return res.json({
        success: true,
        data: replies,
      });
    } catch (error) {
      next(error);
    }
  }
}
