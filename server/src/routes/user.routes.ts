import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';
import { validate } from '../middlewares/validate.middleware';
import { createUserSchema, updateUserSchema, resetPasswordSchema } from '../validations/user.validation';
import { objectIdParamSchema } from '../validations/common.validation';

const router = Router();

// Only ADMIN can manage users
router.use(verifyToken);
router.use(checkRole([UserRole.ADMIN]));

router.post('/', validate(createUserSchema), UserController.createUser);
router.get('/', UserController.getAllUsers);
router.get('/:id', validate(objectIdParamSchema), UserController.getUserById);
router.patch('/:id', validate(updateUserSchema), UserController.updateUser);
router.delete('/:id', validate(objectIdParamSchema), UserController.softDeleteUser);

router.post('/:id/lock', validate(objectIdParamSchema), UserController.lockUser);
router.post('/:id/unlock', validate(objectIdParamSchema), UserController.unlockUser);
router.post('/:id/reset-password', validate(resetPasswordSchema), UserController.resetPassword);

export default router;
