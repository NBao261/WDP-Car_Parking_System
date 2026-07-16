import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './error.middleware';
import { UserRole, User } from '../models/user.model';
import { Role } from '../models/role.model';
import { DEFAULT_PERMISSIONS } from '../config/permissions';
import { getCache, setCache } from '../config/redis';

export interface AuthPayload {
  userId: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
      userPermissions?: string[];
    }
  }
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided or invalid format', 401);
    }

    const token = authHeader.split(' ')[1];
    
    // Check if token is in Redis blacklist (FR-19)
    const isBlacklisted = await getCache(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new AppError('Token has been revoked', 401);
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;

    req.user = decoded;
    next();
  } catch (error: any) {
    next(new AppError(`Unauthorized: ${error.message}`, 401));
  }
};

export const checkRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: Insufficient permissions', 403));
    }

    next();
  };
};

// ─── Permission Middleware (PQ-05: Phân quyền động) ───
// Runtime query — permissions thay đổi có hiệu lực ngay lập tức
// Merge: Role default permissions + DB role permissions + User custom permissions
export const checkPermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('Unauthorized', 401));
      }

      // Lấy merged permissions nếu chưa có (cache trong request)
      if (!req.userPermissions) {
        req.userPermissions = await resolveUserPermissions(req.user.userId, req.user.role);
      }

      if (!req.userPermissions.includes(requiredPermission)) {
        return next(new AppError(`Forbidden: Missing permission '${requiredPermission}'`, 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware cho nhiều permissions (OR logic — chỉ cần 1 trong list)
export const checkAnyPermission = (requiredPermissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('Unauthorized', 401));
      }

      if (!req.userPermissions) {
        req.userPermissions = await resolveUserPermissions(req.user.userId, req.user.role);
      }

      const hasAny = requiredPermissions.some((p) => req.userPermissions!.includes(p));
      if (!hasAny) {
        return next(new AppError('Forbidden: Insufficient permissions', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// ─── Helper: Merge permissions từ nhiều nguồn ─────────
// Ưu tiên: customPermissions (user-level) > DB role permissions > DEFAULT_PERMISSIONS
// Redis cache: permissions:user:{userId} — TTL 5 phút
async function resolveUserPermissions(userId: string, userRole: UserRole): Promise<string[]> {
  // 1. Try Redis cache first
  const cacheKey = `permissions:user:${userId}`;
  const cached = await getCache<string[]>(cacheKey);
  if (cached) return cached;

  // 2. Cache miss → query MongoDB
  const permissionSet = new Set<string>();

  // 2a. Default permissions theo role (fallback)
  const defaults = DEFAULT_PERMISSIONS[userRole] || [];
  defaults.forEach((p) => permissionSet.add(p));

  // 2b. DB role permissions (có thể đã được admin customize qua FR-19.2)
  const role = await Role.findOne({ code: userRole });
  if (role && role.permissions.length > 0) {
    role.permissions.forEach((p) => permissionSet.add(p));
  }

  // 2c. User custom permissions (PQ-05: quyền bổ sung ngoài vai trò)
  const user = await User.findById(userId).select('customPermissions');
  if (user && user.customPermissions.length > 0) {
    user.customPermissions.forEach((p) => permissionSet.add(p));
  }

  const permissions = Array.from(permissionSet);

  // 3. Cache vào Redis — TTL 5 phút
  await setCache(cacheKey, permissions, 300);

  return permissions;
}

