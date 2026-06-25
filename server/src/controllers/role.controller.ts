import { Request, Response, NextFunction } from 'express';
import { RoleService } from '../services/role.service';

export class RoleController {
  // FR-19.1: Xem danh sách vai trò
  static async getAllRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await RoleService.getAllRoles();
      res.status(200).json({ success: true, data: roles });
    } catch (error) {
      next(error);
    }
  }

  // FR-19.1: Xem chi tiết vai trò
  static async getRoleById(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await RoleService.getRoleById(req.params.id as string);
      res.status(200).json({ success: true, data: role });
    } catch (error) {
      next(error);
    }
  }

  // FR-19.1: Tạo vai trò
  static async createRole(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await RoleService.createRole(req.body);
      res.status(201).json({ success: true, data: role });
    } catch (error) {
      next(error);
    }
  }

  // FR-19.2: Cập nhật quyền cho vai trò
  static async updatePermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { permissions } = req.body;
      const role = await RoleService.updatePermissions(id, permissions);
      res.status(200).json({ success: true, data: role });
    } catch (error) {
      next(error);
    }
  }

  // FR-19.1: Xóa vai trò (guard: default + assigned users)
  static async deleteRole(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await RoleService.deleteRole(req.params.id as string);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // FR-19.3: Gán vai trò cho người dùng + custom permissions (PQ-05)
  static async assignRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, roleCode, customPermissions } = req.body;
      const user = await RoleService.assignRole(userId, roleCode, customPermissions);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  // Xem merged permissions của user
  static async getUserPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await RoleService.getUserPermissions(req.params.userId as string);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Reset permissions về default
  static async resetPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const role = await RoleService.resetPermissionsToDefault(req.params.id as string);
      res.status(200).json({ success: true, data: role });
    } catch (error) {
      next(error);
    }
  }
}
