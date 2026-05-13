import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

// Only admin can manage roles and permissions
router.use(verifyToken, checkRole([UserRole.ADMIN]));

router.get('/', RoleController.getAllRoles);
router.post('/', RoleController.createRole);
router.put('/:id/permissions', RoleController.updatePermissions);
router.post('/assign', RoleController.assignRole);

export default router;
