import { Router } from 'express';
import { FloorController } from '../controllers/floor.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.use(verifyToken);

router.get('/', checkRole([UserRole.ADMIN, UserRole.MANAGER]), FloorController.getAllFloors);
router.get('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER]), FloorController.getFloorById);

router.post('/', checkRole([UserRole.ADMIN, UserRole.MANAGER]), FloorController.createFloor);
router.patch('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER]), FloorController.updateFloor);
router.patch('/:id/assign-vehicles', checkRole([UserRole.ADMIN, UserRole.MANAGER]), FloorController.assignVehicleTypes);
router.delete('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER]), FloorController.softDeleteFloor);

export default router;
