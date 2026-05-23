import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/auth.middleware';
import { PERMISSIONS } from '../config/permissions';

const router = Router();

// ─── Tất cả route báo cáo yêu cầu đăng nhập ─────────
router.use(verifyToken);

// GET /reports/traffic
// FR-6.1: Báo cáo lượt xe vào/ra
// Quyền: report:traffic (Admin + Manager — theo SRS 3.6)
router.get(
  '/traffic',
  checkPermission(PERMISSIONS.REPORT_TRAFFIC),
  ReportController.getTrafficReport
);

// GET /reports/revenue
// FR-6.2: Báo cáo doanh thu
// Quyền: report:revenue (Admin + Manager — theo SRS 3.6)
router.get(
  '/revenue',
  checkPermission(PERMISSIONS.REPORT_REVENUE),
  ReportController.getRevenueReport
);

// GET /reports/occupancy
// FR-6.3: Báo cáo tỷ lệ lấp đầy
// Quyền: report:occupancy (Admin + Manager — theo SRS 3.6)
router.get(
  '/occupancy',
  checkPermission(PERMISSIONS.REPORT_OCCUPANCY),
  ReportController.getOccupancyReport
);

// GET /reports/peak-hours
// FR-6.4: Báo cáo khung giờ cao điểm
// Quyền: report:peak_hours (Admin + Manager — theo SRS 3.6)
router.get(
  '/peak-hours',
  checkPermission(PERMISSIONS.REPORT_PEAK_HOURS),
  ReportController.getPeakHoursReport
);

export default router;
