import { Router } from 'express';
import { FacilityController } from '../controllers/facility.controller';
import { verifyToken, checkRole, checkPermission } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';
import { validate } from '../middlewares/validate.middleware';
import { createFacilitySchema, updateFacilitySchema } from '../validations/facility.validation';
import { PERMISSIONS } from '../config/permissions';

const router = Router();

router.use(verifyToken);

// Xem thông tin tòa nhà (Admin, Manager, Staff đều có FACILITY_READ)
router.get(
  '/',
  checkRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
  checkPermission(PERMISSIONS.FACILITY_READ),
  FacilityController.getAllFacilities
);
router.get(
  '/:id',
  checkRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
  checkPermission(PERMISSIONS.FACILITY_READ),
  FacilityController.getFacilityById
);

// Tạo/Sửa/Xóa tòa nhà (chỉ Admin + Manager theo SRS 3.1)
router.post(
  '/',
  checkRole([UserRole.ADMIN, UserRole.MANAGER]),
  validate(createFacilitySchema),
  checkPermission(PERMISSIONS.FACILITY_CREATE),
  FacilityController.createFacility
);
router.patch(
  '/:id',
  checkRole([UserRole.ADMIN, UserRole.MANAGER]),
  validate(updateFacilitySchema),
  checkPermission(PERMISSIONS.FACILITY_UPDATE),
  FacilityController.updateFacility
);
router.delete(
  '/:id',
  checkRole([UserRole.ADMIN, UserRole.MANAGER]),
  checkPermission(PERMISSIONS.FACILITY_DELETE),
  FacilityController.deactivateFacility
);

export default router;
