import { Router } from 'express';
import { ExceptionController } from '../controllers/exception.controller';
import { validate } from '../middlewares/validate.middleware';
import { createExceptionSchema, getExceptionsSchema, resolveExceptionSchema } from '../validations/exception.validation';
import { verifyToken, checkRole, checkPermission } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';
import { PERMISSIONS } from '../config/permissions';

const router = Router();

// Áp dụng bảo mật cho tất cả các routes
router.use(verifyToken);

// Staff và Manager đều xem được danh sách ngoại lệ
router.get('/', checkRole([UserRole.MANAGER, UserRole.STAFF, UserRole.ADMIN]), checkPermission(PERMISSIONS.SESSION_EXCEPTION), validate(getExceptionsSchema), ExceptionController.getExceptions);

// Chỉ Staff mới được tạo ngoại lệ (hoặc Admin)
router.post('/', checkRole([UserRole.STAFF, UserRole.ADMIN]), checkPermission(PERMISSIONS.SESSION_EXCEPTION), validate(createExceptionSchema), ExceptionController.createException);

// Chỉ Manager và Admin mới được duyệt ngoại lệ
router.patch('/:id/resolve', checkRole([UserRole.MANAGER, UserRole.ADMIN]), checkPermission(PERMISSIONS.SESSION_EXCEPTION), validate(resolveExceptionSchema), ExceptionController.resolveException);

// Kích hoạt quét quá hạn (System/Admin)
router.post('/detect-overdue', checkRole([UserRole.ADMIN, UserRole.MANAGER]), checkPermission(PERMISSIONS.SESSION_EXCEPTION), ExceptionController.detectOverdue);

export default router;
