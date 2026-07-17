import { Request, Response, NextFunction } from 'express';
import { VehicleTypeService } from '../services/vehicleType.service';

export class VehicleTypeController {
  static async createVehicleType(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicleType = await VehicleTypeService.createVehicleType(req.body);
      res.status(201).json({ success: true, data: vehicleType });
    } catch (error) {
      next(error);
    }
  }

  static async updateVehicleType(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const vehicleType = await VehicleTypeService.updateVehicleType(id, req.body);
      res.status(200).json({ success: true, data: vehicleType });
    } catch (error) {
      next(error);
    }
  }

  static async softDeleteVehicleType(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await VehicleTypeService.softDeleteVehicleType(id);
      res.status(200).json({ success: true, message: 'Vehicle type deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getVehicleTypeById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const vehicleType = await VehicleTypeService.getVehicleTypeById(id);
      res.status(200).json({ success: true, data: vehicleType });
    } catch (error) {
      next(error);
    }
  }

  static async getAllVehicleTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const { vehicleTypes, total } = await VehicleTypeService.getAllVehicleTypes({}, skip, Number(limit));
      res.status(200).json({
        success: true,
        data: vehicleTypes,
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

  static async getSimilar(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, icon } = req.query;
      const vehicleTypes = await VehicleTypeService.getSimilarVehicleTypes(name as string, icon as string);
      res.status(200).json({ success: true, data: vehicleTypes });
    } catch (error) {
      next(error);
    }
  }
}
