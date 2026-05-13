import { Router } from 'express';
import { PublicController } from '../controllers/public.controller';

const router = Router();

router.get('/facilities', PublicController.getPublicFacilities);
router.get('/facilities/:facilityId/pricing', PublicController.getPublicPricing);
router.get('/facilities/:facilityId/available-slots', PublicController.getAvailableSlots);

export default router;
