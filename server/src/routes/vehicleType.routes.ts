import { Router } from 'express';
import { VehicleTypeController } from '../controllers/vehicleType.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';
import { validate } from '../middlewares/validate.middleware';
import { createVehicleTypeSchema, updateVehicleTypeSchema } from '../validations/vehicleType.validation';


const router = Router();

router.use(verifyToken);

router.get('/', checkRole([UserRole.ADMIN, UserRole.MANAGER]), VehicleTypeController.getAllVehicleTypes);
router.get('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER]), VehicleTypeController.getVehicleTypeById);

router.post('/', checkRole([UserRole.ADMIN, UserRole.MANAGER]), validate(createVehicleTypeSchema), VehicleTypeController.createVehicleType);
router.patch('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER]), validate(updateVehicleTypeSchema), VehicleTypeController.updateVehicleType);
router.delete('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER]), VehicleTypeController.softDeleteVehicleType);

export default router;
