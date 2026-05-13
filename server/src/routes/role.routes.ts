import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';
import { validate } from '../middlewares/validate.middleware';
import { createRoleSchema, updatePermissionsSchema, assignRoleSchema } from '../validations/role.validation';

const router = Router();

// Only admin can manage roles and permissions
router.use(verifyToken, checkRole([UserRole.ADMIN]));

router.get('/', RoleController.getAllRoles);
router.post('/', validate(createRoleSchema), RoleController.createRole);
router.put('/:id/permissions', validate(updatePermissionsSchema), RoleController.updatePermissions);
router.post('/assign', validate(assignRoleSchema), RoleController.assignRole);

export default router;
