import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  /** GET /users/me — Profile của user hiện tại (mọi role, Staff dùng lấy assigned facilities) */
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getMe(req.user!.userId);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.createUser(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = await UserService.updateUser(id, req.body);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = await UserService.getUserById(id);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, status, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      const filters: any = {};
      if (role) filters.role = role;
      if (status) filters.status = status;

      const { users, total } = await UserService.getAllUsers(filters, skip, Number(limit));
      res.status(200).json({
        success: true,
        data: users,
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

  static async lockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = await UserService.lockUser(id);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async unlockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = await UserService.unlockUser(id);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  static async softDeleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await UserService.softDeleteUser(id);
      res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { newPassword } = req.body;
      const user = await UserService.resetPassword(id, newPassword);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /users/:id/assign-facilities — Manager phân công tòa nhà cho Staff */
  static async assignFacilities(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { facilityIds } = req.body;
      const callerUserId = req.user?.userId;
      const callerRole = req.user?.role;
      const user = await UserService.assignFacilities(id, facilityIds, callerUserId, callerRole);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}
