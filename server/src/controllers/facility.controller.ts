import { Request, Response, NextFunction } from 'express';
import { FacilityService } from '../services/facility.service';

export class FacilityController {
  static async createFacility(req: Request, res: Response, next: NextFunction) {
    try {
      const facility = await FacilityService.createFacility(req.body);
      res.status(201).json({ success: true, data: facility });
    } catch (error) {
      next(error);
    }
  }

  static async updateFacility(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const facility = await FacilityService.updateFacility(id, req.body);
      res.status(200).json({ success: true, data: facility });
    } catch (error) {
      next(error);
    }
  }

  static async deactivateFacility(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const facility = await FacilityService.deactivateFacility(id);
      res.status(200).json({ success: true, data: facility });
    } catch (error) {
      next(error);
    }
  }

  static async softDeleteFacility(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const facility = await FacilityService.softDeleteFacility(id);
      res.status(200).json({ success: true, message: 'Facility đã được xoá', data: facility });
    } catch (error) {
      next(error);
    }
  }

  static async getFacilityById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const facility = await FacilityService.getFacilityById(id);
      res.status(200).json({ success: true, data: facility });
    } catch (error) {
      next(error);
    }
  }

  static async getAllFacilities(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const filters: any = {};
      if (status) filters.status = status;

      const { facilities, total } = await FacilityService.getAllFacilities(filters, skip, Number(limit));
      res.status(200).json({
        success: true,
        data: facilities,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /:id/operations-config
   * Dành cho Staff: trả về cấu hình vận hành của Toà nhà (danh sách loại xe được phép)
   */
  static async getOperationsConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const config = await FacilityService.getOperationsConfig(id);
      res.status(200).json({ success: true, data: config });
    } catch (error) {
      next(error);
    }
  }
}
