import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '../services/config.service';
import { AuditService } from '../services/audit.service';

export class ConfigController {
  static async getAllConfigs(req: Request, res: Response, next: NextFunction) {
    try {
      const configs = await ConfigService.getAllConfigs();
      res.status(200).json({ success: true, data: configs });
    } catch (error) {
      next(error);
    }
  }

  static async getConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const key = req.params.key as string;
      const config = await ConfigService.getConfig(key);
      res.status(200).json({ success: true, data: config });
    } catch (error) {
      next(error);
    }
  }

  static async updateConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const key = req.params.key as string;
      const { value } = req.body;
      const userId = req.user!.userId;
      
      const config = await ConfigService.updateConfig(key, value, userId);
      
      if (config) {
        await AuditService.log({
          userId,
          action: 'UPDATE',
          entity: 'SystemConfig',
          entityId: config._id.toString(),
          changes: { key, newValue: value },
          ipAddress: req.ip
        });
      }

      res.status(200).json({ success: true, data: config });
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { action, entity, page = 1, limit = 50 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const filters: any = {};
      
      if (action) filters.action = action;
      if (entity) filters.entity = entity;

      const { logs, total } = await ConfigService.getAuditLogs(filters, skip, Number(limit));
      res.status(200).json({
        success: true,
        data: logs,
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
