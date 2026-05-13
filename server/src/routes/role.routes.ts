import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { verifyToken, checkRole, checkPermission } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';
import { validate } from '../middlewares/validate.middleware';
import { createRoleSchema, updatePermissionsSchema, assignRoleSchema } from '../validations/role.validation';
import { objectIdParamSchema } from '../validations/common.validation';
import { PERMISSIONS } from '../config/permissions';

const router = Router();

// Only admin can manage roles and permissions (FR-19 + 3.7 Permission Matrix)
router.use(verifyToken, checkRole([UserRole.ADMIN]));

// FR-19.1: CRUD vai trò
router.get('/', checkPermission(PERMISSIONS.ROLE_MANAGE), RoleController.getAllRoles);
router.get('/:id', validate(objectIdParamSchema), checkPermission(PERMISSIONS.ROLE_MANAGE), RoleController.getRoleById);
router.post('/', validate(createRoleSchema), checkPermission(PERMISSIONS.ROLE_MANAGE), RoleController.createRole);
router.delete('/:id', validate(objectIdParamSchema), checkPermission(PERMISSIONS.ROLE_MANAGE), RoleController.deleteRole);

// FR-19.2: Quản lý quyền
router.put('/:id/permissions', validate(updatePermissionsSchema), checkPermission(PERMISSIONS.ROLE_MANAGE), RoleController.updatePermissions);
router.post('/:id/reset-permissions', validate(objectIdParamSchema), checkPermission(PERMISSIONS.ROLE_MANAGE), RoleController.resetPermissions);

// FR-19.3: Gán vai trò cho user + xem merged permissions
router.post('/assign', validate(assignRoleSchema), checkPermission(PERMISSIONS.ROLE_MANAGE), RoleController.assignRole);
router.get('/user/:userId/permissions', checkPermission(PERMISSIONS.ROLE_MANAGE), RoleController.getUserPermissions);

export default router;
