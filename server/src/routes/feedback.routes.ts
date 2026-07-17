import { Router } from 'express';
import { FeedbackController } from '../controllers/feedback.controller';
import { verifyToken, checkRole, checkPermission } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';
import { validate } from '../middlewares/validate.middleware';
import {
  createFeedbackSchema,
  getFeedbacksSchema,
  updateFeedbackStatusSchema,
} from '../validations/feedback.validation';
import { PERMISSIONS } from '../config/permissions';

const router = Router();

router.use(verifyToken);

// FR-17.1: Tạo phản hồi — Driver only (SRS 3.8: chỉ Driver gửi phản hồi)
router.post(
  '/',
  checkRole([UserRole.DRIVER]),
  validate(createFeedbackSchema),
  checkPermission(PERMISSIONS.FEEDBACK_CREATE),
  FeedbackController.createFeedback
);

// FR-17.2: Xem danh sách phản hồi — tất cả roles (filter theo role trong service)
router.get(
  '/',
  checkRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.DRIVER]),
  validate(getFeedbacksSchema),
  checkPermission(PERMISSIONS.FEEDBACK_READ),
  FeedbackController.getFeedbacks
);

// Xem chi tiết phản hồi
router.get(
  '/:id',
  checkRole([UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.DRIVER]),
  checkPermission(PERMISSIONS.FEEDBACK_READ),
  FeedbackController.getFeedbackById
);

// FR-17.3: Xử lý phản hồi — Manager/Admin only
router.put(
  '/:id/status',
  checkRole([UserRole.ADMIN, UserRole.MANAGER]),
  validate(updateFeedbackStatusSchema),
  checkPermission(PERMISSIONS.FEEDBACK_PROCESS),
  FeedbackController.updateFeedbackStatus
);

export default router;
