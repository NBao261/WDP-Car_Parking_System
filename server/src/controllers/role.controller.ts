import { Request, Response, NextFunction } from 'express';
import { RoleService } from '../services/role.service';

export class RoleController {
  static async getAllRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await RoleService.getAllRoles();
      res.status(200).json({ success: true, data: roles });
    } catch (error) {
      next(error);
    }
  }

  static async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await RoleService.createRole(req.body);
      res.status(201).json({ success: true, data: role });
    } catch (error) {
      next(error);
    }
  }

  static async updatePermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { permissions } = req.body;
      const role = await RoleService.updatePermissions(id, permissions);
      res.status(200).json({ success: true, data: role });
    } catch (error) {
      next(error);
    }
  }

  static async assignRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, roleCode, customPermissions } = req.body;
      const user = await RoleService.assignRole(userId, roleCode, customPermissions);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}
