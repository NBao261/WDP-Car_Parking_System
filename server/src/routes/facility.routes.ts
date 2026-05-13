import { Router } from 'express';
import { FacilityController } from '../controllers/facility.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.use(verifyToken);

// Managers and Admins can view facilities
router.get('/', checkRole([UserRole.ADMIN, UserRole.MANAGER]), FacilityController.getAllFacilities);
router.get('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER]), FacilityController.getFacilityById);

// Only Admins and Managers can modify facilities (based on the permission matrix)
// Usually Admins have full access, and Managers have access to their assigned facilities.
// We'll restrict these to ADMIN and MANAGER.
router.post('/', checkRole([UserRole.ADMIN, UserRole.MANAGER]), FacilityController.createFacility);
router.patch('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER]), FacilityController.updateFacility);
router.delete('/:id', checkRole([UserRole.ADMIN, UserRole.MANAGER]), FacilityController.deactivateFacility);

export default router;
