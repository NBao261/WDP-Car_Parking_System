import mongoose from 'mongoose';
import { ParkingSession } from '../models/parkingSession.model';
import { Payment } from '../models/payment.model';
import { ParkingSlot, SlotStatus } from '../models/parkingSlot.model';
import { Floor } from '../models/floor.model';
import { AppError } from '../middlewares/error.middleware';

// ─── Định nghĩa kiểu dữ liệu đầu vào ────────────────

/** Bộ lọc cho báo cáo lượt xe vào/ra (FR-6.1) */
interface DateRangeFilter {
  facilityId?: string;     // ID bãi xe (lọc theo bãi)
  floorId?: string;        // ID tầng (lọc theo tầng)
  vehicleTypeId?: string;  // ID loại phương tiện
  startDate?: string;      // Ngày bắt đầu (ISO date string)
  endDate?: string;        // Ngày kết thúc (ISO date string)
  groupBy?: 'day' | 'week' | 'month'; // Nhóm theo ngày/tuần/tháng
}

/** Bộ lọc cho báo cáo doanh thu (FR-6.2) */
interface RevenueFilter {
  facilityId?: string;     // ID bãi xe
  vehicleTypeId?: string;  // ID loại phương tiện
  paymentMethod?: string;  // Phương thức thanh toán (cash, qr_pay, e_wallet, bank_card)
  startDate?: string;      // Ngày bắt đầu
  endDate?: string;        // Ngày kết thúc
  groupBy?: 'day' | 'week' | 'month'; // Nhóm theo ngày/tuần/tháng
}

/** Bộ lọc cho báo cáo tỷ lệ lấp đầy (FR-6.3) */
interface OccupancyFilter {
  facilityId?: string;     // ID bãi xe
  vehicleTypeId?: string;  // ID loại phương tiện
}

/** Bộ lọc cho báo cáo khung giờ cao điểm (FR-6.4) */
interface PeakHoursFilter {
  facilityId?: string;     // ID bãi xe
  vehicleTypeId?: string;  // ID loại phương tiện
  startDate?: string;      // Ngày bắt đầu
  endDate?: string;        // Ngày kết thúc
}

// ─── Hàm tiện ích: Xây dựng điều kiện lọc theo ngày ──

/**
 * Tạo điều kiện MongoDB match cho khoảng thời gian
 * @param startDate - Ngày bắt đầu (ISO string)
 * @param endDate - Ngày kết thúc (ISO string)
 * @param dateField - Tên trường ngày cần lọc (mặc định: checkInTime)
 * @returns Đối tượng match cho MongoDB aggregation
 */
function buildDateMatch(startDate?: string, endDate?: string, dateField = 'checkInTime') {
  const match: any = {};
  if (startDate || endDate) {
    match[dateField] = {};
    if (startDate) match[dateField].$gte = new Date(startDate);
    if (endDate) match[dateField].$lte = new Date(endDate);
  }
  return match;
}

/**
 * Tạo biểu thức nhóm theo thời gian cho MongoDB $group stage
 * @param groupBy - Kiểu nhóm: 'day' | 'week' | 'month'
 * @param dateField - Trường ngày để nhóm (mặc định: $checkInTime)
 * @returns Biểu thức _id cho $group
 */
function getDateGroupExpression(groupBy: string, dateField = '$checkInTime') {
  switch (groupBy) {
    case 'week':
      // Nhóm theo tuần ISO (năm + số tuần)
      return {
        year: { $isoWeekYear: dateField },
        week: { $isoWeek: dateField },
      };
    case 'month':
      // Nhóm theo tháng (năm + tháng)
      return {
        year: { $year: dateField },
        month: { $month: dateField },
      };
    case 'day':
    default:
      // Nhóm theo ngày (năm + tháng + ngày)
      return {
        year: { $year: dateField },
        month: { $month: dateField },
        day: { $dayOfMonth: dateField },
      };
  }
}

/**
 * Chuyển đổi kết quả nhóm thành nhãn hiển thị (label)
 * Ví dụ: { year: 2026, month: 5, day: 1 } → "2026-05-01"
 * @param group - Đối tượng _id từ kết quả $group
 * @param groupBy - Kiểu nhóm: 'day' | 'week' | 'month'
 * @returns Chuỗi nhãn thời gian
 */
function formatGroupLabel(group: any, groupBy: string): string {
  switch (groupBy) {
    case 'week':
      return `${group.year}-W${String(group.week).padStart(2, '0')}`;
    case 'month':
      return `${group.year}-${String(group.month).padStart(2, '0')}`;
    case 'day':
    default:
      return `${group.year}-${String(group.month).padStart(2, '0')}-${String(group.day).padStart(2, '0')}`;
  }
}

// ─── Lớp dịch vụ Báo cáo ─────────────────────────────

export class ReportService {
  /**
   * FR-6.1: Báo cáo lượt xe vào/ra
   *
   * Thống kê số lượt xe check-in và check-out theo ngày/tuần/tháng.
   * Hỗ trợ lọc theo bãi xe, tầng, loại phương tiện và khoảng thời gian.
   *
   * Luồng xử lý:
   * 1. Aggregate check-in từ ParkingSession theo checkInTime
   * 2. Aggregate check-out từ ParkingSession theo checkOutTime (chỉ session đã hoàn thành)
   * 3. Gộp (merge) kết quả check-in/check-out theo nhãn thời gian
   * 4. Tính tổng và trả về summary + data chi tiết
   */
  static async getTrafficReport(filters: DateRangeFilter) {
    const { facilityId, floorId, vehicleTypeId, startDate, endDate, groupBy = 'day' } = filters;

    // ── Bước 1: Xây dựng điều kiện lọc (match stage) ──
    const matchStage: any = {};
    if (facilityId) matchStage.facilityId = new mongoose.Types.ObjectId(facilityId);
    if (floorId) matchStage.floorId = new mongoose.Types.ObjectId(floorId);
    if (vehicleTypeId) matchStage.vehicleTypeId = new mongoose.Types.ObjectId(vehicleTypeId);

    // Lọc theo khoảng thời gian check-in
    const dateMatch = buildDateMatch(startDate, endDate, 'checkInTime');
    Object.assign(matchStage, dateMatch);

    // Biểu thức nhóm theo thời gian
    const dateGroupExpr = getDateGroupExpression(groupBy, '$checkInTime');

    // ── Bước 2: Aggregate lượt xe VÀO (check-in) ──
    const checkInAgg = await ParkingSession.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: dateGroupExpr,
          checkInCount: { $sum: 1 }, // Đếm số lượt check-in
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
    ]);

    // ── Bước 3: Aggregate lượt xe RA (check-out) ──
    // Chỉ tính session đã có checkOutTime (xe đã ra bãi)
    const checkOutMatchStage: any = { ...matchStage };
    // Chuyển lọc ngày sang trường checkOutTime thay vì checkInTime
    delete checkOutMatchStage.checkInTime;
    if (startDate || endDate) {
      checkOutMatchStage.checkOutTime = {};
      if (startDate) checkOutMatchStage.checkOutTime.$gte = new Date(startDate);
      if (endDate) checkOutMatchStage.checkOutTime.$lte = new Date(endDate);
    }
    checkOutMatchStage.checkOutTime = checkOutMatchStage.checkOutTime || { $ne: null };

    const checkOutDateGroupExpr = getDateGroupExpression(groupBy, '$checkOutTime');

    const checkOutAgg = await ParkingSession.aggregate([
      { $match: checkOutMatchStage },
      {
        $group: {
          _id: checkOutDateGroupExpr,
          checkOutCount: { $sum: 1 }, // Đếm số lượt check-out
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
    ]);

    // ── Bước 4: Gộp dữ liệu check-in và check-out theo nhãn thời gian ──
    const mergedMap = new Map<string, { label: string; checkIn: number; checkOut: number }>();

    // Thêm dữ liệu check-in vào map
    for (const item of checkInAgg) {
      const label = formatGroupLabel(item._id, groupBy);
      mergedMap.set(label, { label, checkIn: item.checkInCount, checkOut: 0 });
    }

    // Gộp dữ liệu check-out vào map (bổ sung hoặc cập nhật)
    for (const item of checkOutAgg) {
      const label = formatGroupLabel(item._id, groupBy);
      const existing = mergedMap.get(label);
      if (existing) {
        existing.checkOut = item.checkOutCount;
      } else {
        mergedMap.set(label, { label, checkIn: 0, checkOut: item.checkOutCount });
      }
    }

    // Sắp xếp theo thời gian tăng dần
    const data = Array.from(mergedMap.values()).sort((a, b) => a.label.localeCompare(b.label));

    // ── Bước 5: Tính tổng kết ──
    const totalCheckIn = data.reduce((sum, d) => sum + d.checkIn, 0);
    const totalCheckOut = data.reduce((sum, d) => sum + d.checkOut, 0);

    return {
      groupBy,
      summary: {
        totalCheckIn,                              // Tổng lượt xe vào
        totalCheckOut,                             // Tổng lượt xe ra
        currentlyParked: totalCheckIn - totalCheckOut, // Số xe đang gửi (ước tính)
      },
      data, // Dữ liệu chi tiết theo từng mốc thời gian
    };
  }

  /**
   * FR-6.2: Báo cáo doanh thu
   *
   * Thống kê doanh thu gửi xe theo ngày/tuần/tháng.
   * Phân tích doanh thu theo 3 chiều:
   * - Theo mốc thời gian (byTimePeriod)
   * - Theo phương thức thanh toán (byMethod): cash, qr_pay, e_wallet, bank_card
   * - Theo loại phương tiện (byVehicleType): xe máy, ô tô, v.v.
   *
   * Luồng xử lý:
   * 1. Lọc Payment có status = 'completed'
   * 2. Join (lookup) với ParkingSession để lấy facilityId, vehicleTypeId
   * 3. Aggregate theo 3 chiều phân tích
   */
  static async getRevenueReport(filters: RevenueFilter) {
    const { facilityId, vehicleTypeId, paymentMethod, startDate, endDate, groupBy = 'day' } = filters;

    // ── Pipeline chính: Doanh thu theo mốc thời gian ──
    const pipeline: any[] = [];

    // Chỉ tính thanh toán đã hoàn thành (completed)
    const paymentMatch: any = { status: 'completed' };
    const dateMatch = buildDateMatch(startDate, endDate, 'createdAt');
    Object.assign(paymentMatch, dateMatch);
    // Lọc theo phương thức thanh toán nếu có
    if (paymentMethod) paymentMatch.method = paymentMethod;

    pipeline.push({ $match: paymentMatch });

    // Join với collection ParkingSession để lấy thông tin bãi xe và loại xe
    pipeline.push({
      $lookup: {
        from: 'parkingsessions',       // Tên collection MongoDB (viết thường)
        localField: 'sessionId',       // Trường liên kết bên Payment
        foreignField: '_id',           // Trường liên kết bên ParkingSession
        as: 'session',                 // Tên mảng kết quả
      },
    });
    pipeline.push({ $unwind: '$session' }); // Giải nén mảng thành object

    // Lọc theo bãi xe hoặc loại phương tiện (từ session)
    if (facilityId || vehicleTypeId) {
      const sessionMatch: any = {};
      if (facilityId) sessionMatch['session.facilityId'] = new mongoose.Types.ObjectId(facilityId);
      if (vehicleTypeId) sessionMatch['session.vehicleTypeId'] = new mongoose.Types.ObjectId(vehicleTypeId);
      pipeline.push({ $match: sessionMatch });
    }

    // Nhóm theo mốc thời gian và tính tổng doanh thu
    const dateGroupExpr = getDateGroupExpression(groupBy, '$createdAt');

    pipeline.push({
      $group: {
        _id: dateGroupExpr,
        totalRevenue: { $sum: '$amount' },      // Tổng doanh thu
        transactionCount: { $sum: 1 },          // Số giao dịch
        avgRevenue: { $avg: '$amount' },         // Doanh thu trung bình mỗi giao dịch
      },
    });

    pipeline.push({ $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } });

    const timeData = await Payment.aggregate(pipeline);

    // Định dạng kết quả theo mốc thời gian
    const data = timeData.map((item) => ({
      label: formatGroupLabel(item._id, groupBy),
      totalRevenue: Math.round(item.totalRevenue),     // Làm tròn doanh thu
      transactionCount: item.transactionCount,
      avgRevenue: Math.round(item.avgRevenue),          // Làm tròn trung bình
    }));

    // ── Pipeline phụ 1: Doanh thu theo phương thức thanh toán ──
    const methodPipeline: any[] = [
      { $match: paymentMatch },
      {
        $lookup: {
          from: 'parkingsessions',
          localField: 'sessionId',
          foreignField: '_id',
          as: 'session',
        },
      },
      { $unwind: '$session' },
    ];

    // Áp dụng lọc bãi xe / loại xe nếu có
    if (facilityId || vehicleTypeId) {
      const sessionMatch: any = {};
      if (facilityId) sessionMatch['session.facilityId'] = new mongoose.Types.ObjectId(facilityId);
      if (vehicleTypeId) sessionMatch['session.vehicleTypeId'] = new mongoose.Types.ObjectId(vehicleTypeId);
      methodPipeline.push({ $match: sessionMatch });
    }

    // Nhóm theo phương thức thanh toán
    methodPipeline.push({
      $group: {
        _id: '$method',                          // Nhóm theo method (cash, qr_pay, ...)
        totalRevenue: { $sum: '$amount' },       // Tổng doanh thu theo phương thức
        count: { $sum: 1 },                       // Số giao dịch
      },
    });

    const byMethod = await Payment.aggregate(methodPipeline);

    // ── Pipeline phụ 2: Doanh thu theo loại phương tiện ──
    const vehicleTypePipeline: any[] = [
      { $match: paymentMatch },
      {
        $lookup: {
          from: 'parkingsessions',
          localField: 'sessionId',
          foreignField: '_id',
          as: 'session',
        },
      },
      { $unwind: '$session' },
    ];

    // Lọc theo bãi xe nếu có
    if (facilityId) {
      vehicleTypePipeline.push({
        $match: { 'session.facilityId': new mongoose.Types.ObjectId(facilityId) },
      });
    }

    // Join với VehicleType để lấy tên loại xe
    vehicleTypePipeline.push(
      {
        $lookup: {
          from: 'vehicletypes',                   // Collection loại phương tiện
          localField: 'session.vehicleTypeId',
          foreignField: '_id',
          as: 'vehicleType',
        },
      },
      { $unwind: '$vehicleType' },
      {
        $group: {
          _id: { vehicleTypeId: '$session.vehicleTypeId', vehicleTypeName: '$vehicleType.name' },
          totalRevenue: { $sum: '$amount' },       // Tổng doanh thu theo loại xe
          count: { $sum: 1 },                       // Số giao dịch
        },
      }
    );

    const byVehicleType = await Payment.aggregate(vehicleTypePipeline);

    // ── Tính tổng kết ──
    const grandTotal = data.reduce((sum, d) => sum + d.totalRevenue, 0);
    const totalTransactions = data.reduce((sum, d) => sum + d.transactionCount, 0);
    const totalDays = data.length || 1; // Tránh chia cho 0

    return {
      groupBy,
      summary: {
        grandTotal,                                         // Tổng doanh thu
        totalTransactions,                                  // Tổng số giao dịch
        avgRevenuePerDay: Math.round(grandTotal / totalDays), // Doanh thu trung bình mỗi ngày
      },
      byTimePeriod: data, // Doanh thu theo mốc thời gian
      byMethod: byMethod.map((m) => ({
        method: m._id,                                      // Phương thức thanh toán
        totalRevenue: Math.round(m.totalRevenue),
        count: m.count,
      })),
      byVehicleType: byVehicleType.map((v) => ({
        vehicleTypeId: v._id.vehicleTypeId,                 // ID loại xe
        vehicleTypeName: v._id.vehicleTypeName,             // Tên loại xe
        totalRevenue: Math.round(v.totalRevenue),
        count: v.count,
      })),
    };
  }

  /**
   * FR-6.3: Báo cáo tỷ lệ lấp đầy
   *
   * Tính toán tỷ lệ slot đang sử dụng / tổng slot theo từng tầng (realtime).
   * Bao gồm effective occupancy = (occupied + reserved) / total
   * — dựa trên mô hình Reservation-Aware Capacity [P10] (Wang, Li & Xie, TRC 2022).
   *
   * Luồng xử lý:
   * 1. Lọc slot chưa bị xóa (isDeleted = false)
   * 2. Nhóm slot theo tầng, đếm từng trạng thái
   * 3. Join với Floor và ParkingFacility để lấy tên
   * 4. Tính occupancyRate và effectiveOccupancy
   */
  static async getOccupancyReport(filters: OccupancyFilter) {
    const { facilityId, vehicleTypeId } = filters;

    // Điều kiện lọc slot (chỉ lấy slot chưa bị xóa mềm)
    const slotMatch: any = { isDeleted: false };
    if (facilityId) slotMatch.facilityId = new mongoose.Types.ObjectId(facilityId);
    if (vehicleTypeId) slotMatch.vehicleTypeId = new mongoose.Types.ObjectId(vehicleTypeId);

    // Pipeline: Aggregate slot theo tầng
    const pipeline: any[] = [
      { $match: slotMatch },
      {
        $group: {
          _id: { floorId: '$floorId', facilityId: '$facilityId' },
          total: { $sum: 1 },                      // Tổng số slot
          occupied: {                               // Số slot đang có xe
            $sum: { $cond: [{ $eq: ['$status', SlotStatus.OCCUPIED] }, 1, 0] },
          },
          reserved: {                               // Số slot đã đặt trước
            $sum: { $cond: [{ $eq: ['$status', SlotStatus.RESERVED] }, 1, 0] },
          },
          available: {                              // Số slot trống
            $sum: { $cond: [{ $eq: ['$status', SlotStatus.AVAILABLE] }, 1, 0] },
          },
          maintenance: {                            // Số slot đang bảo trì
            $sum: { $cond: [{ $eq: ['$status', SlotStatus.MAINTENANCE] }, 1, 0] },
          },
          locked: {                                 // Số slot bị tạm khóa
            $sum: { $cond: [{ $eq: ['$status', SlotStatus.LOCKED] }, 1, 0] },
          },
        },
      },
      // Join với collection Floor để lấy tên tầng
      {
        $lookup: {
          from: 'floors',
          localField: '_id.floorId',
          foreignField: '_id',
          as: 'floor',
        },
      },
      { $unwind: '$floor' },
      // Join với collection ParkingFacility để lấy tên bãi xe
      {
        $lookup: {
          from: 'parkingfacilities',
          localField: '_id.facilityId',
          foreignField: '_id',
          as: 'facility',
        },
      },
      { $unwind: '$facility' },
      {
        $project: {
          _id: 0,
          floorId: '$_id.floorId',
          floorName: '$floor.name',
          facilityId: '$_id.facilityId',
          facilityName: '$facility.name',
          total: 1,
          occupied: 1,
          reserved: 1,
          available: 1,
          maintenance: 1,
          locked: 1,
          // Tỷ lệ lấp đầy thực tế = occupied / total (%)
          occupancyRate: {
            $cond: [
              { $gt: ['$total', 0] },
              { $round: [{ $multiply: [{ $divide: ['$occupied', '$total'] }, 100] }, 2] },
              0,
            ],
          },
          // Tỷ lệ lấp đầy hiệu quả = (occupied + reserved) / total (%)
          // Theo mô hình Reservation-Aware Capacity [P10]
          effectiveOccupancy: {
            $cond: [
              { $gt: ['$total', 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: [{ $add: ['$occupied', '$reserved'] }, '$total'] },
                      100,
                    ],
                  },
                  2,
                ],
              },
              0,
            ],
          },
        },
      },
      { $sort: { facilityName: 1, floorName: 1 } }, // Sắp xếp theo tên bãi → tên tầng
    ];

    const floors = await ParkingSlot.aggregate(pipeline);

    // ── Tính tổng kết toàn bộ hệ thống ──
    const totalSlots = floors.reduce((sum, f) => sum + f.total, 0);
    const totalOccupied = floors.reduce((sum, f) => sum + f.occupied, 0);
    const totalReserved = floors.reduce((sum, f) => sum + f.reserved, 0);
    const totalAvailable = floors.reduce((sum, f) => sum + f.available, 0);

    return {
      summary: {
        totalSlots,                    // Tổng số slot toàn hệ thống
        totalOccupied,                 // Tổng slot đang có xe
        totalReserved,                 // Tổng slot đã đặt trước
        totalAvailable,                // Tổng slot trống
        // Tỷ lệ lấp đầy chung (%)
        overallOccupancyRate: totalSlots > 0 ? Math.round((totalOccupied / totalSlots) * 10000) / 100 : 0,
        // Tỷ lệ lấp đầy hiệu quả chung (%) — bao gồm cả reserved
        effectiveOccupancyRate:
          totalSlots > 0
            ? Math.round(((totalOccupied + totalReserved) / totalSlots) * 10000) / 100
            : 0,
      },
      floors, // Dữ liệu chi tiết theo từng tầng
    };
  }

  /**
   * FR-6.4: Báo cáo khung giờ cao điểm
   *
   * Xác định các khung giờ có lượng xe vào/ra nhiều nhất trong ngày.
   * Phân bố hoạt động theo 24 giờ (0h → 23h) và xác định top 3 giờ cao điểm.
   *
   * Luồng xử lý:
   * 1. Aggregate check-in theo giờ trong ngày ($hour)
   * 2. Aggregate check-out theo giờ trong ngày
   * 3. Ghép vào bảng 24 giờ
   * 4. Xếp hạng và lấy top 3 giờ có tổng hoạt động cao nhất
   */
  static async getPeakHoursReport(filters: PeakHoursFilter) {
    const { facilityId, vehicleTypeId, startDate, endDate } = filters;

    // ── Xây dựng điều kiện lọc ──
    const matchStage: any = {};
    if (facilityId) matchStage.facilityId = new mongoose.Types.ObjectId(facilityId);
    if (vehicleTypeId) matchStage.vehicleTypeId = new mongoose.Types.ObjectId(vehicleTypeId);

    // Lọc theo khoảng thời gian
    const dateMatch = buildDateMatch(startDate, endDate, 'checkInTime');
    Object.assign(matchStage, dateMatch);

    // ── Aggregate lượt xe VÀO theo giờ trong ngày ──
    const checkInByHour = await ParkingSession.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { hour: { $hour: '$checkInTime' } }, // Nhóm theo giờ (0-23)
          checkInCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.hour': 1 } },
    ]);

    // ── Aggregate lượt xe RA theo giờ trong ngày ──
    const checkOutMatchStage: any = { ...matchStage };
    delete checkOutMatchStage.checkInTime;
    checkOutMatchStage.checkOutTime = { $ne: null }; // Chỉ tính session đã checkout
    if (startDate || endDate) {
      checkOutMatchStage.checkOutTime = { $ne: null };
      if (startDate) checkOutMatchStage.checkOutTime.$gte = new Date(startDate);
      if (endDate) checkOutMatchStage.checkOutTime.$lte = new Date(endDate);
    }

    const checkOutByHour = await ParkingSession.aggregate([
      { $match: checkOutMatchStage },
      {
        $group: {
          _id: { hour: { $hour: '$checkOutTime' } }, // Nhóm theo giờ (0-23)
          checkOutCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.hour': 1 } },
    ]);

    // ── Xây dựng bảng phân bố 24 giờ ──
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${String(i).padStart(2, '0')}:00 - ${String(i).padStart(2, '0')}:59`,
      checkIn: 0,       // Số lượt xe vào trong khung giờ này
      checkOut: 0,       // Số lượt xe ra trong khung giờ này
      totalActivity: 0,  // Tổng hoạt động = checkIn + checkOut
    }));

    // Điền dữ liệu check-in vào bảng 24 giờ
    for (const item of checkInByHour) {
      hourlyData[item._id.hour].checkIn = item.checkInCount;
    }

    // Điền dữ liệu check-out vào bảng 24 giờ
    for (const item of checkOutByHour) {
      hourlyData[item._id.hour].checkOut = item.checkOutCount;
    }

    // Tính tổng hoạt động mỗi giờ
    for (const h of hourlyData) {
      h.totalActivity = h.checkIn + h.checkOut;
    }

    // ── Xác định top 3 giờ cao điểm (giờ có nhiều hoạt động nhất) ──
    const sorted = [...hourlyData].sort((a, b) => b.totalActivity - a.totalActivity);
    const peakHours = sorted.slice(0, 3).map((h) => ({
      hour: h.hour,
      label: h.label,
      totalActivity: h.totalActivity,
      checkIn: h.checkIn,
      checkOut: h.checkOut,
    }));

    // ── Tính tổng kết ──
    const totalActivity = hourlyData.reduce((sum, h) => sum + h.totalActivity, 0);
    const avgActivityPerHour = totalActivity / 24;

    return {
      summary: {
        totalActivity,                                              // Tổng hoạt động trong khoảng thời gian
        avgActivityPerHour: Math.round(avgActivityPerHour * 100) / 100, // Trung bình hoạt động mỗi giờ
        peakHours,                                                  // Top 3 giờ cao điểm
      },
      hourlyDistribution: hourlyData, // Phân bố hoạt động theo 24 giờ
    };
  }
}
