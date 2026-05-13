import { Router } from 'express';
import { PricingController } from '../controllers/pricing.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';
import { validate } from '../middlewares/validate.middleware';
import { createPricingPlanSchema, updatePricingPlanSchema } from '../validations/pricing.validation';
import { objectIdParamSchema } from '../validations/common.validation';

const router = Router();

router.use(verifyToken);

router.get('/', checkRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]), PricingController.getAllPricingPlans);
router.get('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]), validate(objectIdParamSchema), PricingController.getPricingPlanById);

router.post('/', checkRole([UserRole.ADMIN, UserRole.MANAGER]), validate(createPricingPlanSchema), PricingController.createPricingPlan);
router.patch('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER]), validate(updatePricingPlanSchema), PricingController.updatePricingPlan);
router.delete('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER]), validate(objectIdParamSchema), PricingController.deactivatePricingPlan);

export default router;
