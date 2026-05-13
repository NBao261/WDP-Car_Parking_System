import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

// Only ADMIN can manage users
router.use(verifyToken);
router.use(checkRole([UserRole.ADMIN]));

router.post('/', UserController.createUser);
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.patch('/:id', UserController.updateUser);
router.delete('/:id', UserController.softDeleteUser);

router.post('/:id/lock', UserController.lockUser);
router.post('/:id/unlock', UserController.unlockUser);
router.post('/:id/reset-password', UserController.resetPassword);

export default router;
