import { Router } from 'express';
import { PricingController } from '../controllers/pricing.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.use(verifyToken);

router.get('/', checkRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]), PricingController.getAllPricingPlans);
router.get('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]), PricingController.getPricingPlanById);

router.post('/', checkRole([UserRole.ADMIN, UserRole.MANAGER]), PricingController.createPricingPlan);
router.patch('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER]), PricingController.updatePricingPlan);
router.delete('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER]), PricingController.deactivatePricingPlan);

export default router;
