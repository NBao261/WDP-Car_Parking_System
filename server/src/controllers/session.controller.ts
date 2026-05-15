import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../services/session.service';

export class SessionController {
  /**
   * POST /sessions/check-conditions
   * FR-8.1: Kiểm tra điều kiện xe vào bãi
   */
  static async checkConditions(req: Request, res: Response, next: NextFunction) {
    try {
      const { facilityId, vehicleTypeId } = req.body;
      const result = await SessionService.checkConditions(facilityId, vehicleTypeId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /sessions/check-in
   * FR-9.1: Tạo lượt gửi xe
   */
  static async checkIn(req: Request, res: Response, next: NextFunction) {
    try {
      const { facilityId, vehicleTypeId, licensePlate, gateIn, floorId, slotId } = req.body;
      const staffInId = req.user!.userId;

      const session = await SessionService.checkIn({
        facilityId,
        vehicleTypeId,
        licensePlate,
        gateIn,
        staffInId,
        floorId,
        slotId,
      });

      res.status(201).json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /sessions/suggest-floor
   * FR-8.3: Gợi ý tầng/khu vực
   */
  static async suggestFloors(req: Request, res: Response, next: NextFunction) {
    try {
      const { facilityId, vehicleTypeId } = req.query;
      const result = await SessionService.suggestFloors(
        facilityId as string,
        vehicleTypeId as string
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /sessions/active
   * FR-9.2: Xem danh sách lượt gửi đang hoạt động
   */
  static async getActiveSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SessionService.getActiveSessions(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /sessions/search
   * FR-10.1: Tìm lượt gửi xe
   */
  static async searchSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { cardCode, licensePlate, code } = req.query;
      const session = await SessionService.searchSession({
        cardCode: cardCode as string,
        licensePlate: licensePlate as string,
        code: code as string,
      });
      res.status(200).json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /sessions/:id/fee
   * FR-10.2: Tính phí tự động
   */
  static async calculateFee(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await SessionService.calculateFee(id as string);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /sessions/:id/check-out
   * FR-10.3: Thu phí gửi xe và check-out
   */
  static async checkOut(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { gateOut } = req.body;
      const staffOutId = req.user!.userId;

      const session = await SessionService.checkOut({
        sessionId: id as string,
        gateOut: gateOut as string,
        staffOutId: staffOutId as string,
      });

      res.status(200).json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  }
}
