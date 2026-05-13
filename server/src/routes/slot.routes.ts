import { Router } from 'express';
import { SlotController } from '../controllers/slot.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';
import { validate } from '../middlewares/validate.middleware';
import { createSlotSchema, createBulkSlotsSchema, updateSlotStatusSchema } from '../validations/slot.validation';
import { objectIdParamSchema, floorIdParamSchema } from '../validations/common.validation';

const router = Router();

router.use(verifyToken);

router.get('/floor/:floorId', checkRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]), validate(floorIdParamSchema), SlotController.getSlotsByFloor);
router.get('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]), validate(objectIdParamSchema), SlotController.getSlotById);

router.post('/', checkRole([UserRole.ADMIN, UserRole.MANAGER]), validate(createSlotSchema), SlotController.createSlot);
router.post('/bulk', checkRole([UserRole.ADMIN, UserRole.MANAGER]), validate(createBulkSlotsSchema), SlotController.createBulkSlots);
router.patch('/:id/status', checkRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]), validate(updateSlotStatusSchema), SlotController.updateSlotStatus);
router.delete('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER]), validate(objectIdParamSchema), SlotController.deleteSlot);

export default router;
