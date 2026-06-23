import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service';
import { PaymentMethod } from '../models/payment.model';
import { AppError } from '../middlewares/error.middleware';

export class PaymentController {
  /**
   * POST /api/v1/payments/create-intent
   * Tạo Payment Intent cho thanh toán Online
   */
  static async createIntent(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId, method } = req.body;
      const driverId = req.user?.userId; // Lấy từ token người dùng
      
      if (!Object.values(PaymentMethod).includes(method as PaymentMethod)) {
        return next(new AppError('Phương thức thanh toán không hợp lệ', 400));
      }

      const result = await PaymentService.createPaymentIntent({ sessionId, method: method as PaymentMethod, driverId });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/payments/webhook
   * Webhook xác nhận thanh toán (từ Momo, VNPay...)
   */
  static async webhook(req: Request, res: Response, next: NextFunction) {
    try {
      const { transactionCode } = req.body; // Tuỳ API gateway mà lấy từ query hay body
      // Nếu Momo, data trả về nằm trong req.body: partnerCode, orderId, resultCode, signature...
      const orderId = req.body.orderId || transactionCode;
      
      if (!orderId) {
        return next(new AppError('Thiếu mã giao dịch', 400));
      }

      await PaymentService.confirmPaymentWebhook(orderId);
      res.status(200).json({ success: true, message: 'Xác nhận thanh toán thành công' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/payments/status/:transactionCode
   * API Polling kiểm tra trạng thái thanh toán Momo
   */
  static async checkStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { transactionCode } = req.params;
      const isPaid = await PaymentService.checkMomoOrderStatus(transactionCode);
      res.status(200).json({ success: true, data: { isPaid } });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/payments/cash-checkout
   * Checkout bằng tiền mặt tại cổng
   */
  static async cashCheckout(req: Request, res: Response, next: NextFunction) {
    try {
      const { sessionId, gateOut, checkOutImage } = req.body;
      const staffOutId = req.user?.userId;

      if (!staffOutId) {
         return next(new AppError('Chưa xác thực nhân viên', 401));
      }

      const result = await PaymentService.processCashCheckout({
        sessionId,
        staffOutId,
        gateOut,
        checkOutImage
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/payments/:sessionId
   * Lấy lịch sử giao dịch của 1 session
   */
  static async getPaymentsBySession(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = req.params.sessionId as string;
      const result = await PaymentService.getPaymentsBySession(sessionId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
