import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';
import { ExportService } from '../services/export.service';
import { AppError } from '../middlewares/error.middleware';

/**
 * Controller xử lý các API Báo cáo & Thống kê (FR-6)
 *
 * Quyền truy cập (SRS 3.6): Chỉ Admin và Manager được xem báo cáo.
 * Middleware phân quyền được áp dụng tại routes (verifyToken + checkPermission).
 */
export class ReportController {
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

      const result = await ReportService.getTrafficReport({
        facilityId: facilityId as string,
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

      const result = await ReportService.getRevenueReport({
        facilityId: facilityId as string,
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

      const result = await ReportService.getOccupancyReport({
        facilityId: facilityId as string,
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

      const result = await ReportService.getPeakHoursReport({
        facilityId: facilityId as string,
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
   *
   * Trả về ma trận heatmap 2 chiều (tầng × loại xe) với chỉ số MFD:
   * - occupancyRate, effectiveOccupancy, optimalOccupancy (O*)
   * - operatingRegime: free-flow | capacity | congested
   * - flowProxy: lượt checkout 24h gần nhất
   * - gap: khoảng cách đến O* (dương = quá tải)
   *
   * Thuật toán: Macroscopic Fundamental Diagram (MFD) [P2]
   *
   * Query params:
   * - facilityId: ID bãi xe (khuyến nghị, cần cho heatmap có ý nghĩa)
   * - vehicleTypeId: ID loại phương tiện (tùy chọn, lọc 1 loại xe cụ thể)
   */
  static async getOccupancyHeatmap(req: Request, res: Response, next: NextFunction) {
    try {
      const { facilityId, vehicleTypeId } = req.query;

      const result = await ReportService.getOccupancyHeatmap({
        facilityId: facilityId as string,
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
      const { reportType, format, ...filters } = req.query;
      
      if (!reportType || !['traffic', 'revenue', 'occupancy', 'peak-hours'].includes(reportType as string)) {
        throw new AppError('Loại báo cáo không hợp lệ (traffic, revenue, occupancy, peak-hours)', 400);
      }
      if (!format || !['excel', 'pdf'].includes(format as string)) {
        throw new AppError('Định dạng xuất không hợp lệ (excel, pdf)', 400);
      }

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

      const buffer = await ExportService.generateReport(reportType as string, format as string, data);

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
