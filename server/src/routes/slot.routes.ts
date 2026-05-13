import { Router } from 'express';
import { SlotController } from '../controllers/slot.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.use(verifyToken);

router.get('/floor/:floorId', checkRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]), SlotController.getSlotsByFloor);
router.get('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]), SlotController.getSlotById);

router.post('/', checkRole([UserRole.ADMIN, UserRole.MANAGER]), SlotController.createSlot);
router.post('/bulk', checkRole([UserRole.ADMIN, UserRole.MANAGER]), SlotController.createBulkSlots);
router.patch('/:id/status', checkRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]), SlotController.updateSlotStatus);
router.delete('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER]), SlotController.deleteSlot);

export default router;
