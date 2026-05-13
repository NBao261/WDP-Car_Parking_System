import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { verifyToken, checkRole, checkPermission } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';
import { validate } from '../middlewares/validate.middleware';
import { createUserSchema, updateUserSchema, resetPasswordSchema } from '../validations/user.validation';
import { objectIdParamSchema } from '../validations/common.validation';
import { PERMISSIONS } from '../config/permissions';

const router = Router();

// SRS 3.7: Quản lý tài khoản — chỉ Admin
router.use(verifyToken);
router.use(checkRole([UserRole.ADMIN]));

router.post('/', validate(createUserSchema), checkPermission(PERMISSIONS.USER_MANAGE), UserController.createUser);
router.get('/', checkPermission(PERMISSIONS.USER_MANAGE), UserController.getAllUsers);
router.get('/:id', validate(objectIdParamSchema), checkPermission(PERMISSIONS.USER_MANAGE), UserController.getUserById);
router.patch('/:id', validate(updateUserSchema), checkPermission(PERMISSIONS.USER_MANAGE), UserController.updateUser);
router.delete('/:id', validate(objectIdParamSchema), checkPermission(PERMISSIONS.USER_MANAGE), UserController.softDeleteUser);

router.post('/:id/lock', validate(objectIdParamSchema), checkPermission(PERMISSIONS.USER_MANAGE), UserController.lockUser);
router.post('/:id/unlock', validate(objectIdParamSchema), checkPermission(PERMISSIONS.USER_MANAGE), UserController.unlockUser);
router.post('/:id/reset-password', validate(resetPasswordSchema), checkPermission(PERMISSIONS.USER_MANAGE), UserController.resetPassword);

export default router;
