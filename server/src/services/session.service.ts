import mongoose from 'mongoose';
import { ParkingSession, IParkingSession, SessionStatus } from '../models/parkingSession.model';
import { ParkingSlot, SlotStatus } from '../models/parkingSlot.model';
import { ParkingFacility } from '../models/parkingFacility.model';
import { VehicleType } from '../models/vehicleType.model';
import { Floor } from '../models/floor.model';
import { PricingPlan } from '../models/pricingPlan.model';
import { User } from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';
import { Exception, ExceptionStatus, ExceptionType } from '../models/exception.model';
import { Reservation, ReservationStatus } from '../models/reservation.model';
import { generateSessionCode, generateCardCode } from '../utils/codeGenerator';
import { getIO } from '../config/socket';

interface CheckConditionsResult {
  eligible: boolean;
  reason?: string;
  availableSlotCount: number;
}

interface SuggestedFloor {
  floorId: string;
  floorName: string;
  availableSlots: number;
  totalSlots: number;
}

interface CheckInData {
  facilityId?: string;
  vehicleTypeId?: string;
  licensePlate?: string;
  gateIn: string;
  staffInId: string;
  floorId?: string;
  slotId?: string;
  reservationCode?: string;
}

export class SessionService {
  /**
   * FR-8.1: Kiểm tra điều kiện xe vào bãi
   * (1) Loại xe có được phục vụ không
   * (2) Còn slot trống không
   * (3) Trong giờ hoạt động không
   * (4) Xe có trong blacklist không (placeholder)
   */
  static async checkConditions(facilityId: string, vehicleTypeId: string): Promise<CheckConditionsResult> {
    // 1. Kiểm tra facility tồn tại + active
    const facility = await ParkingFacility.findById(facilityId);
    if (!facility || facility.status !== 'active') {
      return { eligible: false, reason: 'Bãi xe không hoạt động hoặc không tồn tại', availableSlotCount: 0 };
    }

    // 2. Kiểm tra giờ hoạt động
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Nếu openTime == closeTime → hoạt động 24h, bỏ qua check
    if (facility.openTime !== facility.closeTime) {
      let isClosed = false;

      if (facility.openTime < facility.closeTime) {
        // Trường hợp bình thường: vd 06:00 - 22:00
        isClosed = currentTime < facility.openTime || currentTime >= facility.closeTime;
      } else {
        // Trường hợp qua đêm: vd 22:00 - 06:00
        isClosed = currentTime < facility.openTime && currentTime >= facility.closeTime;
      }

      if (isClosed) {
        return { eligible: false, reason: `Bãi xe đang đóng. Giờ hoạt động: ${facility.openTime} - ${facility.closeTime}`, availableSlotCount: 0 };
      }
    }

    // 3. Kiểm tra vehicleType tồn tại
    const vehicleType = await VehicleType.findById(vehicleTypeId);
    if (!vehicleType || vehicleType.isDeleted) {
      return { eligible: false, reason: 'Loại phương tiện không hợp lệ', availableSlotCount: 0 };
    }

    // 4. Kiểm tra loại xe có được phục vụ trong facility (qua floor.allowedVehicleTypes)
    const floorsServingVehicle = await Floor.find({
      facilityId,
      allowedVehicleTypes: vehicleTypeId,
      isDeleted: false,
      status: 'active',
    });

    if (floorsServingVehicle.length === 0) {
      return { eligible: false, reason: `Bãi xe không phục vụ loại xe "${vehicleType.name}"`, availableSlotCount: 0 };
    }

    // 5. Kiểm tra slot trống
    const availableSlotCount = await ParkingSlot.countDocuments({
      facilityId,
      vehicleTypeId,
      status: SlotStatus.AVAILABLE,
      isDeleted: false,
    });

    if (availableSlotCount === 0) {
      return { eligible: false, reason: `Bãi đầy cho loại xe "${vehicleType.name}"`, availableSlotCount: 0 };
    }

    // 6. Blacklist check (placeholder — chưa có model Blacklist)
    // TODO: Implement blacklist check when Blacklist model is available

    return { eligible: true, availableSlotCount };
  }

  /**
   * FR-9.1: Tạo lượt gửi xe (check-in)
   * Tạo session + cập nhật slot → Occupied + sinh mã thẻ
   */
  static async checkIn(data: CheckInData): Promise<IParkingSession> {
    let matchedReservation = null;

    // 0. BR-6.6: Nếu có reservationCode → auto-fill facilityId, vehicleTypeId, licensePlate từ reservation
    if (data.reservationCode) {
      matchedReservation = await Reservation.findOne({
        code: data.reservationCode,
        status: ReservationStatus.CONFIRMED,
      });

      if (!matchedReservation) {
        throw new AppError('Mã đặt chỗ không tồn tại hoặc đã được sử dụng/hủy', 404);
      }

      // Validate thời gian check-in: chỉ cho phép trong khoảng 30 phút trước startTime → endTime
      const now = new Date();
      const earlyWindow = 30 * 60 * 1000; // 30 phút
      const earliestCheckIn = new Date(matchedReservation.startTime.getTime() - earlyWindow);

      if (now < earliestCheckIn) {
        const startTimeStr = matchedReservation.startTime.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        const minutesEarly = Math.ceil((earliestCheckIn.getTime() - now.getTime()) / 60000);
        throw new AppError(
          `Chưa đến giờ check-in. Đặt chỗ bắt đầu lúc ${startTimeStr}. Bạn có thể check-in sớm nhất trước 30 phút (còn ${minutesEarly} phút nữa).`,
          400
        );
      }

      if (now > matchedReservation.endTime) {
        throw new AppError('Đặt chỗ đã hết hạn. Vui lòng tạo đặt chỗ mới hoặc check-in walk-in.', 400);
      }

      // Auto-fill các trường từ reservation
      data.facilityId = matchedReservation.facilityId.toString();
      data.vehicleTypeId = matchedReservation.vehicleTypeId.toString();
      data.licensePlate = matchedReservation.licensePlate;
    }

    // Đảm bảo các trường bắt buộc đã có (dù từ reservation hay từ request)
    if (!data.facilityId || !data.vehicleTypeId || !data.licensePlate) {
      throw new AppError('Thiếu thông tin bắt buộc: facilityId, vehicleTypeId, licensePlate', 400);
    }

    // 1. Kiểm tra điều kiện
    const conditions = await this.checkConditions(data.facilityId, data.vehicleTypeId);
    if (!conditions.eligible) {
      throw new AppError(conditions.reason || 'Không đủ điều kiện vào bãi', 400);
    }

    // 2. Validate staff được phân công tại facility này (FR-18.6)
    const staffUser = await User.findById(data.staffInId).select('assignedFacilities role');
    if (!staffUser) {
      throw new AppError('Staff user not found', 404);
    }
    const isAssigned = staffUser.assignedFacilities.some(
      (fId) => fId.toString() === data.facilityId
    );
    if (!isAssigned) {
      throw new AppError('Bạn không được phân công tại bãi xe này', 403);
    }

    // 3. Kiểm tra xe đang có session active (biển số trùng)
    const existingSession = await ParkingSession.findOne({
      licensePlate: data.licensePlate.toUpperCase(),
      status: SessionStatus.ACTIVE,
    });

    if (existingSession) {
      throw new AppError(`Xe biển số "${data.licensePlate}" đang có lượt gửi chưa kết thúc (${existingSession.code})`, 400);
    }

    // 4. Tìm bảng giá active
    const pricingPlan = await PricingPlan.findOne({
      facilityId: data.facilityId,
      vehicleTypeId: data.vehicleTypeId,
      status: 'active',
      isDeleted: false,
    });

    if (!pricingPlan) {
      throw new AppError('Không tìm thấy bảng giá active cho tổ hợp bãi xe + loại xe này', 400);
    }

    // 5. Tìm slot — dùng slot từ reservation nếu có, không thì auto-assign
    let slot;

    // Nếu có reservation → dùng slot đã reserved
    if (matchedReservation && matchedReservation.slotId) {
      slot = await ParkingSlot.findOne({
        _id: matchedReservation.slotId,
        status: SlotStatus.RESERVED,
        isDeleted: false,
      });
      // Nếu slot reserved bị lỗi → fallback auto-assign bên dưới
    }

    // Nếu không có reservationCode → kiểm tra xem có reservation nào match theo biển số không
    if (!matchedReservation) {
      const autoMatchReservation = await Reservation.findOne({
        licensePlate: data.licensePlate.toUpperCase(),
        facilityId: data.facilityId,
        status: ReservationStatus.CONFIRMED,
        startTime: { $lte: new Date(Date.now() + 30 * 60 * 1000) },
      });

      if (autoMatchReservation && autoMatchReservation.slotId) {
        matchedReservation = autoMatchReservation;
        slot = await ParkingSlot.findOne({
          _id: autoMatchReservation.slotId,
          status: SlotStatus.RESERVED,
          isDeleted: false,
        });
      }
    }

    // Nếu vẫn chưa có slot (không có reservation hoặc slot reserved bị lỗi) → fallback
    if (!slot) {
      if (data.slotId) {
        // User chọn slot cụ thể
        slot = await ParkingSlot.findOne({
          _id: data.slotId,
          facilityId: data.facilityId,
          vehicleTypeId: data.vehicleTypeId,
          status: SlotStatus.AVAILABLE,
          isDeleted: false,
        });

        if (!slot) {
          throw new AppError('Slot đã chọn không khả dụng', 400);
        }
      } else {
        // Auto-assign: tìm slot available, ưu tiên floor ít xe nhất
        const floorQuery: any = {
          facilityId: data.facilityId,
          allowedVehicleTypes: data.vehicleTypeId,
          isDeleted: false,
          status: 'active',
        };

        if (data.floorId) {
          floorQuery._id = data.floorId;
        }

        // Aggregate: tìm floor có nhiều slot trống nhất
        const floorSlotCounts = await ParkingSlot.aggregate([
          {
            $match: {
              facilityId: new mongoose.Types.ObjectId(data.facilityId),
              vehicleTypeId: new mongoose.Types.ObjectId(data.vehicleTypeId),
              status: SlotStatus.AVAILABLE,
              isDeleted: false,
              ...(data.floorId ? { floorId: new mongoose.Types.ObjectId(data.floorId) } : {}),
            },
          },
          { $group: { _id: '$floorId', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]);

        if (floorSlotCounts.length === 0) {
          throw new AppError('Không còn slot trống phù hợp', 400);
        }

        // Lấy slot đầu tiên từ floor có nhiều chỗ trống nhất
        const bestFloorId = floorSlotCounts[0]._id;
        slot = await ParkingSlot.findOne({
          floorId: bestFloorId,
          facilityId: data.facilityId,
          vehicleTypeId: data.vehicleTypeId,
          status: SlotStatus.AVAILABLE,
          isDeleted: false,
        }).sort({ code: 1 });

        if (!slot) {
          throw new AppError('Không còn slot trống phù hợp', 400);
        }
      }
    }

    // 5. Sinh mã session + mã thẻ xe (đảm bảo unique)
    let sessionCode = generateSessionCode();
    let cardCode = generateCardCode();

    // Retry nếu trùng (unlikely nhưng phòng)
    let retries = 5;
    while (retries > 0) {
      const codeExists = await ParkingSession.findOne({ $or: [{ code: sessionCode }, { cardCode }] });
      if (!codeExists) break;
      sessionCode = generateSessionCode();
      cardCode = generateCardCode();
      retries--;
    }

    if (retries === 0) {
      throw new AppError('Không thể tạo mã lượt gửi xe. Vui lòng thử lại.', 500);
    }

    // 6. Tạo session
    const session = new ParkingSession({
      code: sessionCode,
      licensePlate: data.licensePlate.toUpperCase(),
      vehicleTypeId: data.vehicleTypeId,
      facilityId: data.facilityId,
      floorId: slot.floorId,
      slotId: slot._id,
      pricingPlanId: pricingPlan._id,
      checkInTime: new Date(),
      gateIn: data.gateIn,
      staffInId: data.staffInId,
      cardCode,
      status: SessionStatus.ACTIVE,
    });

    await session.save();

    // 7. Cập nhật slot → Occupied
    slot.status = SlotStatus.OCCUPIED;
    slot.currentSessionId = session._id as mongoose.Types.ObjectId;
    await slot.save();

    // 8. BR-6.6: Nếu check-in từ reservation → chuyển reservation sang USED
    if (matchedReservation) {
      matchedReservation.status = ReservationStatus.USED;
      await matchedReservation.save();
    }

    // 8. Return session populated
    const populatedSession = await ParkingSession.findById(session._id)
      .populate('vehicleTypeId', 'name code icon')
      .populate('facilityId', 'name address')
      .populate('floorId', 'name')
      .populate('slotId', 'code')
      .populate('staffInId', 'name email');

    // Emit socket event
    try {
      getIO().to(`facility:${data.facilityId}`).emit('slot:statusChanged', {
        slotId: slot._id,
        status: SlotStatus.OCCUPIED,
        facilityId: data.facilityId,
      });
    } catch (err) {
      // Ignore if socket is not initialized
    }

    return populatedSession!;
  }

  /**
   * FR-8.3: Gợi ý tầng/khu vực phù hợp
   * Danh sách tầng có slot trống cho loại xe, sorted by available DESC
   */
  static async suggestFloors(facilityId: string, vehicleTypeId: string): Promise<SuggestedFloor[]> {
    // Tìm floors phục vụ loại xe này
    const floors = await Floor.find({
      facilityId,
      allowedVehicleTypes: vehicleTypeId,
      isDeleted: false,
      status: 'active',
    });

    if (floors.length === 0) {
      return [];
    }

    const floorIds = floors.map((f) => f._id);

    // Aggregate available slots per floor
    const slotCounts = await ParkingSlot.aggregate([
      {
        $match: {
          floorId: { $in: floorIds },
          vehicleTypeId: new mongoose.Types.ObjectId(vehicleTypeId),
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: { floorId: '$floorId', status: '$status' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Build result
    const floorMap = new Map<string, { available: number; total: number }>();
    for (const item of slotCounts) {
      const fid = item._id.floorId.toString();
      if (!floorMap.has(fid)) {
        floorMap.set(fid, { available: 0, total: 0 });
      }
      const entry = floorMap.get(fid)!;
      entry.total += item.count;
      if (item._id.status === SlotStatus.AVAILABLE) {
        entry.available += item.count;
      }
    }

    const result: SuggestedFloor[] = floors.map((floor) => {
      const stats = floorMap.get(floor._id.toString()) || { available: 0, total: 0 };
      return {
        floorId: floor._id.toString(),
        floorName: floor.name,
        availableSlots: stats.available,
        totalSlots: stats.total,
      };
    });

    // Sort by available DESC
    result.sort((a, b) => b.availableSlots - a.availableSlots);

    return result;
  }

  /**
   * FR-10.1: Tìm lượt gửi xe
   * Tìm theo: cardCode, licensePlate, hoặc session code
   */
  static async searchSession(query: { cardCode?: string; licensePlate?: string; code?: string }): Promise<IParkingSession> {
    const searchConditions: any = { status: SessionStatus.ACTIVE };

    if (query.cardCode) {
      searchConditions.cardCode = query.cardCode;
    } else if (query.licensePlate) {
      searchConditions.licensePlate = query.licensePlate.toUpperCase();
    } else if (query.code) {
      searchConditions.code = query.code;
    } else {
      throw new AppError('Cần ít nhất 1 tham số tìm kiếm (cardCode, licensePlate, hoặc code)', 400);
    }

    const session = await ParkingSession.findOne(searchConditions)
      .populate('vehicleTypeId', 'name code icon')
      .populate('facilityId', 'name address')
      .populate('floorId', 'name')
      .populate('slotId', 'code status')
      .populate('pricingPlanId', 'name feeType rates')
      .populate('staffInId', 'name email');

    if (!session) {
      throw new AppError('Không tìm thấy lượt gửi xe', 404);
    }

    return session;
  }

  /**
   * FR-9.2: Xem danh sách lượt gửi đang hoạt động
   */
  static async getActiveSessions(query: any): Promise<{ data: IParkingSession[], total: number, page: number, totalPages: number }> {
    const { 
      page = 1, 
      limit = 10, 
      facilityId, 
      vehicleTypeId, 
      floorId, 
      licensePlate,
      sortBy = 'checkInTime',
      sortOrder = 'desc'
    } = query;

    const filter: any = { status: SessionStatus.ACTIVE };

    if (facilityId) filter.facilityId = facilityId;
    if (vehicleTypeId) filter.vehicleTypeId = vehicleTypeId;
    if (floorId) filter.floorId = floorId;
    if (licensePlate) filter.licensePlate = { $regex: licensePlate, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const sort: any = { [sortBy as string]: sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
      ParkingSession.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('vehicleTypeId', 'name code icon')
        .populate('facilityId', 'name address')
        .populate('floorId', 'name')
        .populate('slotId', 'code status')
        .populate('pricingPlanId', 'name feeType rates')
        .populate('staffInId', 'name email'),
      ParkingSession.countDocuments(filter)
    ]);

    return { 
      data, 
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    };
  }

  /**
   * FR-10.2: Tính phí tự động
   * Hỗ trợ 3 phương thức: flat_rate, duration_based, time_window
   */
  static async calculateFee(sessionId: string, checkOutTime: Date = new Date()): Promise<{ totalFee: number, details: any }> {
    const session = await ParkingSession.findById(sessionId).populate('pricingPlanId');
    if (!session) throw new AppError('Session không tồn tại', 404);
    
    const pricingPlan: any = session.pricingPlanId;
    if (!pricingPlan) throw new AppError('Không tìm thấy bảng giá cho session này', 400);

    const checkInTime = session.checkInTime;
    const durationMs = checkOutTime.getTime() - checkInTime.getTime();
    if (durationMs < 0) {
      throw new AppError('Thời gian ra phải sau thời gian vào', 400);
    }

    const durationMinutes = durationMs / (1000 * 60);
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));

    // ── Grace Period: miễn phí nếu gửi trong thời gian cho phép ──
    if (pricingPlan.gracePeriodMinutes > 0 && durationMinutes <= pricingPlan.gracePeriodMinutes) {
      // Vẫn tính exception surcharge nếu có
      let exceptionSurcharge = 0;
      let lostCardFeeTotal = 0;
      const resolvedExceptions = await Exception.find({ sessionId, status: ExceptionStatus.RESOLVED });
      for (const exc of resolvedExceptions) {
        exceptionSurcharge += exc.surcharge || 0;
        if (exc.type === ExceptionType.LOST_CARD) lostCardFeeTotal += pricingPlan.lostCardFee || 0;
      }
      return {
        totalFee: exceptionSurcharge + lostCardFeeTotal,
        details: {
          durationHours: 0, durationMinutes: Math.round(durationMinutes),
          baseFee: 0, overnightFee: 0, overtimeFee: 0,
          exceptionSurcharge, lostCardFee: lostCardFeeTotal,
          pricingPlanName: pricingPlan.name, feeMethod: pricingPlan.feeMethod || 'duration_based',
          gracePeriodApplied: true, daysDiff: 0,
        }
      };
    }

    let baseFee = 0;
    let overnightFee = 0;
    let overtimeFee = 0;

    // Tính số ngày chênh lệch (dùng cho flat_rate / duration_based overnight)
    const startDay = new Date(checkInTime.getFullYear(), checkInTime.getMonth(), checkInTime.getDate());
    const endDay = new Date(checkOutTime.getFullYear(), checkOutTime.getMonth(), checkOutTime.getDate());
    const daysDiff = Math.round((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24));

    // Xác định feeMethod (backward compat: nếu chưa có feeMethod thì suy từ feeType)
    const feeMethod = pricingPlan.feeMethod || 
      (pricingPlan.feeType === 'per_turn' ? 'flat_rate' : 'duration_based');

    // ═══════════════════════════════════════════════════
    // NHÁNH 1: FLAT_RATE (đồng giá theo lượt)
    // ═══════════════════════════════════════════════════
    if (feeMethod === 'flat_rate') {
      baseFee = pricingPlan.rates[0]?.amount || 0;
      if (daysDiff > 0 && pricingPlan.overnightFee > 0) {
        overnightFee = pricingPlan.overnightFee * daysDiff;
      }
    }
    // ═══════════════════════════════════════════════════
    // NHÁNH 2: DURATION_BASED (theo thời gian gửi)
    // ═══════════════════════════════════════════════════
    else if (feeMethod === 'duration_based') {
      // Dùng index thay vì .find() label text — rates[0] = giờ đầu, rates[1] = giờ tiếp theo
      const firstRate = pricingPlan.rates[0]?.amount || 0;
      const nextRate = pricingPlan.rates[1]?.amount || firstRate;

      if (durationHours <= 1) {
        baseFee = firstRate;
      } else {
        baseFee = firstRate + (durationHours - 1) * nextRate;
      }

      // Áp dụng maxDailyFee (giá trần mỗi ngày)
      if (pricingPlan.maxDailyFee > 0) {
        const totalDays = Math.max(1, daysDiff + 1); // ít nhất 1 ngày
        const maxTotal = pricingPlan.maxDailyFee * totalDays;
        if (baseFee > maxTotal) {
          baseFee = maxTotal;
        }
      }

      if (daysDiff > 0 && pricingPlan.overnightFee > 0) {
        overnightFee = pricingPlan.overnightFee * daysDiff;
      }

      // Phí quá giờ (nếu durationHours > 24)
      if (durationHours > 24 && pricingPlan.overtimeFeePerHour > 0) {
        overtimeFee = (durationHours - 24) * pricingPlan.overtimeFeePerHour;
      }
    }
    // ═══════════════════════════════════════════════════
    // NHÁNH 3: TIME_WINDOW (theo khung giờ trong ngày)
    // ═══════════════════════════════════════════════════
    else if (feeMethod === 'time_window') {
      baseFee = this.calculateTimeWindowFee(checkInTime, checkOutTime, pricingPlan.rates, pricingPlan.maxDailyFee || 0);
    }
    // Fallback
    else {
      baseFee = pricingPlan.rates[0]?.amount || 0;
    }

    // ── Cộng phí từ exception đã resolved (surcharge + lostCardFee) ──
    let exceptionSurcharge = 0;
    let lostCardFeeTotal = 0;

    const resolvedExceptions = await Exception.find({
      sessionId: sessionId,
      status: ExceptionStatus.RESOLVED,
    });

    for (const exc of resolvedExceptions) {
      exceptionSurcharge += exc.surcharge || 0;
      if (exc.type === ExceptionType.LOST_CARD) {
        lostCardFeeTotal += pricingPlan.lostCardFee || 0;
      }
    }

    const totalFee = baseFee + overnightFee + overtimeFee + exceptionSurcharge + lostCardFeeTotal;

    return {
      totalFee,
      details: {
        durationHours,
        durationMinutes: Math.round(durationMinutes),
        baseFee,
        overnightFee,
        overtimeFee,
        exceptionSurcharge,
        lostCardFee: lostCardFeeTotal,
        pricingPlanName: pricingPlan.name,
        feeMethod,
        gracePeriodApplied: false,
        daysDiff
      }
    };
  }

  /**
   * Thuật toán tính phí theo khung giờ trong ngày (Time-Window)
   * Chia khoảng thời gian gửi thành từng segment theo ngày lịch,
   * rồi check overlap từng segment với từng khung giờ rate → cộng dồn.
   */
  private static calculateTimeWindowFee(
    checkIn: Date, checkOut: Date,
    rates: Array<{ startTime?: string; endTime?: string; amount: number }>,
    maxDailyFee: number
  ): number {
    let totalFee = 0;

    // Chia thành segments theo ngày lịch
    const current = new Date(checkIn);
    while (current < checkOut) {
      // Xác định cuối ngày hiện tại (23:59:59.999) hoặc checkOut nếu sớm hơn
      const endOfDay = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 23, 59, 59, 999);
      const segmentEnd = checkOut < endOfDay ? checkOut : endOfDay;

      // Lấy thời gian HH:MM dạng phút trong ngày
      const segStartMinutes = current.getHours() * 60 + current.getMinutes();
      const segEndMinutes = segmentEnd.getHours() * 60 + segmentEnd.getMinutes();

      let dailyFee = 0;

      for (const rate of rates) {
        if (!rate.startTime || !rate.endTime) continue;

        const [rStartH, rStartM] = rate.startTime.split(':').map(Number);
        const [rEndH, rEndM] = rate.endTime.split(':').map(Number);
        const rStartMinutes = rStartH * 60 + rStartM;
        const rEndMinutes = rEndH * 60 + rEndM;

        let hasOverlap = false;

        if (rStartMinutes < rEndMinutes) {
          // Khung giờ bình thường (VD: 06:00 - 16:00)
          hasOverlap = segStartMinutes < rEndMinutes && segEndMinutes > rStartMinutes;
        } else {
          // Khung giờ qua đêm (VD: 22:00 - 06:00)
          // Segment overlap nếu nó nằm trước rEndMinutes HOẶC sau rStartMinutes
          hasOverlap = segStartMinutes >= rStartMinutes || segEndMinutes <= rEndMinutes
            || segStartMinutes < rEndMinutes || segEndMinutes > rStartMinutes;
          // Simplified: khung qua đêm thì check if NOT trong khoảng giữa
          const gapStart = rEndMinutes;
          const gapEnd = rStartMinutes;
          // Nằm hoàn toàn trong gap (không overlap) nếu: segStart >= gapStart AND segEnd <= gapEnd
          const inGap = segStartMinutes >= gapStart && segEndMinutes <= gapEnd;
          hasOverlap = !inGap;
        }

        if (hasOverlap) {
          dailyFee += rate.amount;
        }
      }

      // Áp dụng maxDailyFee cho từng ngày
      if (maxDailyFee > 0 && dailyFee > maxDailyFee) {
        dailyFee = maxDailyFee;
      }

      totalFee += dailyFee;

      // Chuyển sang đầu ngày tiếp theo
      current.setTime(new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1, 0, 0, 0, 0).getTime());
    }

    return totalFee;
  }

  /**
   * FR-10.3: Thu phí gửi xe và check-out
   */
  static async checkOut(data: { sessionId: string, gateOut: string, staffOutId: string }): Promise<IParkingSession> {
    const session = await ParkingSession.findById(data.sessionId);
    if (!session) throw new AppError('Session không tồn tại', 404);
    if (session.status === SessionStatus.COMPLETED) {
      throw new AppError('Lượt gửi xe đã kết thúc', 400);
    }
    if (session.status === SessionStatus.EXCEPTION) {
      throw new AppError('Lượt gửi xe đang có ngoại lệ chưa được xử lý. Vui lòng giải quyết ngoại lệ trước khi checkout.', 400);
    }

    // Validate staff được phân công tại facility của session này (FR-18.6)
    const staffUser = await User.findById(data.staffOutId).select('assignedFacilities');
    if (!staffUser) throw new AppError('Staff user not found', 404);
    const isAssigned = staffUser.assignedFacilities.some(
      (fId) => fId.toString() === session.facilityId.toString()
    );
    if (!isAssigned) {
      throw new AppError('Bạn không được phân công tại bãi xe này', 403);
    }

    const checkOutTime = new Date();
    const feeResult = await this.calculateFee(data.sessionId, checkOutTime);

    session.checkOutTime = checkOutTime;
    session.gateOut = data.gateOut;
    session.staffOutId = new mongoose.Types.ObjectId(data.staffOutId);
    session.totalFee = feeResult.totalFee;
    session.status = SessionStatus.COMPLETED;
    
    await session.save();

    // Update slot -> Available
    const slot = await ParkingSlot.findById(session.slotId);
    if (slot) {
      slot.status = SlotStatus.AVAILABLE;
      slot.currentSessionId = null;
      slot.maintenanceReason = '';
      await slot.save();
    }

    const populatedSession = await ParkingSession.findById(session._id)
      .populate('vehicleTypeId', 'name code icon')
      .populate('facilityId', 'name address')
      .populate('floorId', 'name')
      .populate('slotId', 'code status')
      .populate('pricingPlanId', 'name feeType rates')
      .populate('staffInId', 'name email')
      .populate('staffOutId', 'name email');

    // Emit socket event
    try {
      getIO().to(`facility:${session.facilityId}`).emit('slot:statusChanged', {
        slotId: session.slotId,
        status: SlotStatus.AVAILABLE,
        facilityId: session.facilityId,
      });
    } catch (err) {
      // Ignore if socket is not initialized
    }

    return populatedSession!;
  }
}
