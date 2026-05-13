import { Router } from 'express';
import { FloorController } from '../controllers/floor.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';
import { validate } from '../middlewares/validate.middleware';
import { createFloorSchema, updateFloorSchema, assignVehicleTypesSchema } from '../validations/floor.validation';


const router = Router();

router.use(verifyToken);

router.get('/', checkRole([UserRole.ADMIN, UserRole.MANAGER]), FloorController.getAllFloors);
router.get('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER]), FloorController.getFloorById);

router.post('/', checkRole([UserRole.ADMIN, UserRole.MANAGER]), validate(createFloorSchema), FloorController.createFloor);
router.patch('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER]), validate(updateFloorSchema), FloorController.updateFloor);
router.patch('/:id/assign-vehicles', checkRole([UserRole.ADMIN, UserRole.MANAGER]), validate(assignVehicleTypesSchema), FloorController.assignVehicleTypes);
router.delete('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER]), FloorController.softDeleteFloor);

export default router;
