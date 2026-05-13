import { Router } from 'express';
import { VehicleTypeController } from '../controllers/vehicleType.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.use(verifyToken);

router.get('/', checkRole([UserRole.ADMIN, UserRole.MANAGER]), VehicleTypeController.getAllVehicleTypes);
router.get('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER]), VehicleTypeController.getVehicleTypeById);

router.post('/', checkRole([UserRole.ADMIN, UserRole.MANAGER]), VehicleTypeController.createVehicleType);
router.patch('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER]), VehicleTypeController.updateVehicleType);
router.delete('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER]), VehicleTypeController.softDeleteVehicleType);

export default router;
