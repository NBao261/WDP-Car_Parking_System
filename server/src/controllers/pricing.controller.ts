import { Request, Response, NextFunction } from 'express';
import { PricingService } from '../services/pricing.service';

export class PricingController {
  static async createPricingPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await PricingService.createPricingPlan(req.body);
      res.status(201).json({ success: true, data: plan });
    } catch (error) {
      next(error);
    }
  }

  static async updatePricingPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const plan = await PricingService.updatePricingPlan(id, req.body);
      res.status(200).json({ success: true, data: plan });
    } catch (error) {
      next(error);
    }
  }

  static async deletePricingPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const plan = await PricingService.deletePricingPlan(id);
      res.status(200).json({ success: true, data: plan });
    } catch (error) {
      next(error);
    }
  }

  static async getPricingPlanById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const plan = await PricingService.getPricingPlanById(id);
      res.status(200).json({ success: true, data: plan });
    } catch (error) {
      next(error);
    }
  }

  static async getAllPricingPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const { facilityId, vehicleType, status, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const filters: any = {};
      
      if (facilityId) filters.facilityId = facilityId;
      if (vehicleType) filters.vehicleTypeId = vehicleType;
      if (status) filters.status = status;

      const { pricingPlans, total } = await PricingService.getAllPricingPlans(filters, skip, Number(limit));
      res.status(200).json({
        success: true,
        data: pricingPlans,
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

  static async getActiveSessionCount(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const count = await PricingService.getActiveSessionCount(id);
      res.status(200).json({ success: true, data: { activeSessionCount: count } });
    } catch (error) {
      next(error);
    }
  }
}
