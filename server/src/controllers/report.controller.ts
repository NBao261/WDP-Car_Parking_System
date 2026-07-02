import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';
import { ExportService } from '../services/export.service';
import { AppError } from '../middlewares/error.middleware';
import { UserRole } from '../models/user.model';
import { ParkingFacility } from '../models/parkingFacility.model';

/**
 * Controller xử lý các API Báo cáo & Thống kê (FR-6)
 *
 * Quyền truy cập (SRS 3.6): Chỉ Admin và Manager được xem báo cáo.
 * Manager chỉ xem được báo cáo của các toà nhà mình được gán quản lý.
 * Middleware phân quyền được áp dụng tại routes (verifyToken + checkPermission).
 */
export class ReportController {

  /**
   * Helper: Lấy danh sách facilityIds mà manager được gán quản lý.
   * - Admin: không giới hạn (return undefined)
   * - Manager: return danh sách facilityId mà user nằm trong assignedUsers
   * - Nếu manager truyền facilityId cụ thể, validate nó thuộc danh sách được gán
   */
  private static async resolveManagerFacilityScope(
    req: Request,
    requestedFacilityId?: string
  ): Promise<{ facilityId?: string; facilityIds?: string[] }> {
    const user = req.user!;

    // Admin: không giới hạn
    if (user.role === UserRole.ADMIN) {
      return { facilityId: requestedFacilityId };
    }

    // Manager: chỉ xem facility mình quản lý
    const assignedFacilities = await ParkingFacility.find(
      { assignedUsers: user.userId, isDeleted: false },
      { _id: 1 }
    ).lean();

    const allowedIds = assignedFacilities.map((f) => f._id.toString());

    if (allowedIds.length === 0) {
      throw new AppError('Bạn chưa được gán quản lý toà nhà nào', 403);
    }

    // Nếu manager truyền facilityId cụ thể → validate
    if (requestedFacilityId) {
      if (!allowedIds.includes(requestedFacilityId)) {
        throw new AppError('Bạn không có quyền xem báo cáo của toà nhà này', 403);
      }
      return { facilityId: requestedFacilityId };
    }

    // Không truyền facilityId → scope xuống tất cả facility được gán
    return { facilityIds: allowedIds };
  }

  /**
   * GET /reports/traffic
   * FR-6.1: Báo cáo lượt xe vào/ra
   *
   * Query params:
   * - facilityId: ID bãi xe (tùy chọn)
   * - floorId: ID tầng (tùy chọn)
   * - vehicleTypeId: ID loại phương tiện (tùy chọn)
   * - startDate: Ngày bắt đầu - ISO date (tùy chọn)
   * - endDate: Ngày kết thúc - ISO date (tùy chọn)
   * - groupBy: Nhóm theo 'day' | 'week' | 'month' (mặc định: 'day')
   */
  static async getTrafficReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { facilityId, floorId, vehicleTypeId, startDate, endDate, groupBy } = req.query;

      const scope = await ReportController.resolveManagerFacilityScope(req, facilityId as string);

      const result = await ReportService.getTrafficReport({
        ...scope,
        floorId: floorId as string,
        vehicleTypeId: vehicleTypeId as string,
        startDate: startDate as string,
        endDate: endDate as string,
        groupBy: groupBy as 'day' | 'week' | 'month',
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /reports/revenue
   * FR-6.2: Báo cáo doanh thu
   *
   * Query params:
   * - facilityId: ID bãi xe (tùy chọn)
   * - vehicleTypeId: ID loại phương tiện (tùy chọn)
   * - paymentMethod: Phương thức thanh toán - cash/qr_pay/e_wallet/bank_card (tùy chọn)
   * - startDate: Ngày bắt đầu - ISO date (tùy chọn)
   * - endDate: Ngày kết thúc - ISO date (tùy chọn)
   * - groupBy: Nhóm theo 'day' | 'week' | 'month' (mặc định: 'day')
   */
  static async getRevenueReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { facilityId, vehicleTypeId, paymentMethod, startDate, endDate, groupBy } = req.query;

      const scope = await ReportController.resolveManagerFacilityScope(req, facilityId as string);

      const result = await ReportService.getRevenueReport({
        ...scope,
        vehicleTypeId: vehicleTypeId as string,
        paymentMethod: paymentMethod as string,
        startDate: startDate as string,
        endDate: endDate as string,
        groupBy: groupBy as 'day' | 'week' | 'month',
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /reports/occupancy
   * FR-6.3: Báo cáo tỷ lệ lấp đầy
   *
   * Trả về dữ liệu realtime tỷ lệ slot đang sử dụng / tổng slot theo từng tầng.
   *
   * Query params:
   * - facilityId: ID bãi xe (tùy chọn)
   * - vehicleTypeId: ID loại phương tiện (tùy chọn)
   */
  static async getOccupancyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { facilityId, vehicleTypeId } = req.query;

      const scope = await ReportController.resolveManagerFacilityScope(req, facilityId as string);

      const result = await ReportService.getOccupancyReport({
        ...scope,
        vehicleTypeId: vehicleTypeId as string,
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /reports/peak-hours
   * FR-6.4: Báo cáo khung giờ cao điểm
   *
   * Trả về phân bố hoạt động theo 24 giờ trong ngày và top 3 giờ cao điểm.
   *
   * Query params:
   * - facilityId: ID bãi xe (tùy chọn)
   * - vehicleTypeId: ID loại phương tiện (tùy chọn)
   * - startDate: Ngày bắt đầu - ISO date (tùy chọn)
   * - endDate: Ngày kết thúc - ISO date (tùy chọn)
   */
  static async getPeakHoursReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { facilityId, vehicleTypeId, startDate, endDate } = req.query;

      const scope = await ReportController.resolveManagerFacilityScope(req, facilityId as string);

      const result = await ReportService.getPeakHoursReport({
        ...scope,
        vehicleTypeId: vehicleTypeId as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /reports/occupancy/heatmap
   * FR-6.3 mở rộng: Occupancy heatmap theo tầng + loại xe
   */
  static async getOccupancyHeatmap(req: Request, res: Response, next: NextFunction) {
    try {
      const { facilityId, vehicleTypeId } = req.query;

      const scope = await ReportController.resolveManagerFacilityScope(req, facilityId as string);

      const result = await ReportService.getOccupancyHeatmap({
        ...scope,
        vehicleTypeId: vehicleTypeId as string,
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /reports/export
   * FR-6 (Export): Xuất báo cáo ra Excel hoặc PDF
   *
   * Query params:
   * - reportType: traffic | revenue | occupancy | peak-hours
   * - format: excel | pdf
   * - Các query params khác tương ứng với từng loại báo cáo
   */
  static async exportReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { reportType, format, facilityId, ...otherFilters } = req.query;
      
      if (!reportType || !['traffic', 'revenue', 'occupancy', 'peak-hours', 'comprehensive'].includes(reportType as string)) {
        throw new AppError('Loại báo cáo không hợp lệ (traffic, revenue, occupancy, peak-hours, comprehensive)', 400);
      }
      if (!format || !['excel', 'pdf'].includes(format as string)) {
        throw new AppError('Định dạng xuất không hợp lệ (excel, pdf)', 400);
      }

      // Enforce manager scope cho export
      const scope = await ReportController.resolveManagerFacilityScope(req, facilityId as string);
      const filters = { ...otherFilters, ...scope };

      let buffer: Buffer;

      if (reportType === 'comprehensive') {
        // Xuất báo cáo tổng hợp: gọi cả 4 loại song song
        const [trafficData, revenueData, occupancyData, peakHoursData] = await Promise.all([
          ReportService.getTrafficReport(filters),
          ReportService.getRevenueReport(filters),
          ReportService.getOccupancyReport(filters),
          ReportService.getPeakHoursReport(filters),
        ]);

        buffer = await ExportService.generateComprehensiveReport(format as string, {
          revenue: revenueData,
          traffic: trafficData,
          occupancy: occupancyData,
          peakHours: peakHoursData,
        });
      } else {
        // Xuất từng loại riêng lẻ (giữ nguyên logic cũ)
        let data;
        switch (reportType) {
          case 'traffic': 
            data = await ReportService.getTrafficReport(filters); 
            break;
          case 'revenue': 
            data = await ReportService.getRevenueReport(filters); 
            break;
          case 'occupancy': 
            data = await ReportService.getOccupancyReport(filters); 
            break;
          case 'peak-hours': 
            data = await ReportService.getPeakHoursReport(filters); 
            break;
        }
        buffer = await ExportService.generateReport(reportType as string, format as string, data);
      }

      const contentType = format === 'excel' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'application/pdf';
      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      const filename = `report_${reportType}_${new Date().getTime()}.${extension}`;

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
}
