import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';
import { verifyToken, checkRole, checkPermission } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';
import { validate } from '../middlewares/validate.middleware';
import {
  checkConditionsSchema,
  checkInSchema,
  suggestFloorSchema,
  searchSessionSchema,
} from '../validations/session.validation';
import { PERMISSIONS } from '../config/permissions';

const router = Router();

router.use(verifyToken);

// FR-8.1: Kiểm tra điều kiện xe vào bãi (Staff tạo session)
router.post(
  '/check-conditions',
  checkRole([UserRole.STAFF]),
  validate(checkConditionsSchema),
  checkPermission(PERMISSIONS.SESSION_CREATE),
  SessionController.checkConditions
);

// FR-9.1: Tạo lượt gửi xe — Staff only (SRS 3.4: chỉ Staff tạo)
router.post(
  '/check-in',
  checkRole([UserRole.STAFF]),
  validate(checkInSchema),
  checkPermission(PERMISSIONS.SESSION_CREATE),
  SessionController.checkIn
);

// FR-8.3: Gợi ý tầng/khu vực — Staff + Admin + Manager có thể xem
router.get(
  '/suggest-floor',
  checkRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
  validate(suggestFloorSchema),
  checkPermission(PERMISSIONS.SESSION_READ),
  SessionController.suggestFloors
);

// FR-10.1: Tìm lượt gửi xe — Staff + Admin + Manager
router.get(
  '/search',
  checkRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF]),
  validate(searchSessionSchema),
  checkPermission(PERMISSIONS.SESSION_READ),
  SessionController.searchSession
);

export default router;
