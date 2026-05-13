import { Request, Response, NextFunction } from 'express';
import { FloorService } from '../services/floor.service';

export class FloorController {
  static async createFloor(req: Request, res: Response, next: NextFunction) {
    try {
      const floor = await FloorService.createFloor(req.body);
      res.status(201).json({ success: true, data: floor });
    } catch (error) {
      next(error);
    }
  }

  static async updateFloor(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const floor = await FloorService.updateFloor(id, req.body);
      res.status(200).json({ success: true, data: floor });
    } catch (error) {
      next(error);
    }
  }

  static async assignVehicleTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { allowedVehicleTypes } = req.body;
      const floor = await FloorService.assignVehicleTypes(id, allowedVehicleTypes);
      res.status(200).json({ success: true, data: floor });
    } catch (error) {
      next(error);
    }
  }

  static async softDeleteFloor(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await FloorService.softDeleteFloor(id);
      res.status(200).json({ success: true, message: 'Floor deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getFloorById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const floor = await FloorService.getFloorById(id);
      res.status(200).json({ success: true, data: floor });
    } catch (error) {
      next(error);
    }
  }

  static async getAllFloors(req: Request, res: Response, next: NextFunction) {
    try {
      const { facilityId, status, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const filters: any = {};
      if (facilityId) filters.facilityId = facilityId;
      if (status) filters.status = status;

      const { floors, total } = await FloorService.getAllFloors(filters, skip, Number(limit));
      res.status(200).json({
        success: true,
        data: floors,
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
}
