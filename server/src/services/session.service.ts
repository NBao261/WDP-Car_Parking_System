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
import { UploadService } from './upload.service';

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
  checkInImage?: string;
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

      // Không có trường endTime trong IReservation nên tính toán dựa trên startTime + 1h
      const lateWindow = 60 * 60 * 1000;
      const endTime = new Date(matchedReservation.startTime.getTime() + lateWindow);

      if (now > endTime) {
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

    // 3. Kiểm tra xe đang có session active hoặc exception (biển số trùng)
    const existingSession = await ParkingSession.findOne({
      licensePlate: data.licensePlate.toUpperCase(),
      status: { $in: [SessionStatus.ACTIVE, SessionStatus.EXCEPTION] },
    });

    if (existingSession) {
      if (existingSession.status === SessionStatus.EXCEPTION) {
        throw new AppError(`Xe biển số "${data.licensePlate}" đang có sự cố ngoại lệ cần xử lý (${existingSession.code}), không được phép vào gửi.`, 400);
      }
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
      driverId: matchedReservation ? matchedReservation.userId : null,
      checkInImage: data.checkInImage || null,
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

    // 9. Defer Background Upload: Ảnh local được giữ lại, sẽ đẩy lên Cloudinary cùng ảnh checkOut (trọn gói khi xe ra khỏi bãi)
    // UploadService.uploadLocalImageToCloudinary(session._id.toString(), session.checkInImage).catch(console.error);

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
    const searchConditions: any = { status: { $in: [SessionStatus.ACTIVE, SessionStatus.EXCEPTION] } };

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

    const filter: any = { status: { $in: [SessionStatus.ACTIVE, SessionStatus.EXCEPTION] } };

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
   * Lấy lưu lượng xe ra vào trong ngày hôm nay
   */
  static async getTodayTraffic(facilityId?: string): Promise<{ trafficIn: number; trafficOut: number }> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const filterIn: any = { checkInTime: { $gte: startOfDay, $lte: endOfDay } };
    const filterOut: any = { checkOutTime: { $gte: startOfDay, $lte: endOfDay } };

    if (facilityId) {
      filterIn.facilityId = facilityId;
      filterOut.facilityId = facilityId;
    }

    const [trafficIn, trafficOut] = await Promise.all([
      ParkingSession.countDocuments(filterIn),
      ParkingSession.countDocuments(filterOut)
    ]);

    return { trafficIn, trafficOut };
  }

  /**
   * Lấy danh sách lượt gửi của tài khoản Customer (Driver)
   */
  static async getMySessions(driverId: string, query: any): Promise<{ data: IParkingSession[], total: number }> {
    const filter: any = { driverId };

    if (query.status) {
      filter.status = query.status; // e.g., 'active' or 'completed'
    }

    const sort: any = { checkInTime: -1 }; // Mới nhất lên đầu

    const [data, total] = await Promise.all([
      ParkingSession.find(filter)
        .sort(sort)
        .populate('vehicleTypeId', 'name code icon')
        .populate('facilityId', 'name address')
        .populate('floorId', 'name')
        .populate('slotId', 'code status')
        .populate('pricingPlanId', 'name feeType rates'),
      ParkingSession.countDocuments(filter)
    ]);

    return { data, total };
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
      const firstBlock = pricingPlan.firstBlockHours || 1;

      if (durationHours <= firstBlock) {
        baseFee = firstRate;
      } else {
        baseFee = firstRate + (durationHours - firstBlock) * nextRate;
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
    // Rates chỉ phủ giờ hoạt động → ngoài giờ tính overtimeFeePerHour
    // ═══════════════════════════════════════════════════
    else if (feeMethod === 'time_window') {
      // Lookup facility operating hours
      const facility = await ParkingFacility.findById(session.facilityId);
      if (!facility) throw new AppError('Facility không tồn tại', 404);

      const twResult = this.calculateTimeWindowFee(
        checkInTime, checkOutTime, pricingPlan.rates,
        pricingPlan.maxDailyFee || 0,
        facility.openTime, facility.closeTime,
        pricingPlan.overtimeFeePerHour || 0
      );
      baseFee = twResult.baseFee;
      overtimeFee = twResult.overtimeFee;
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
   *
   * Logic mới:
   * - Rates chỉ phủ giờ hoạt động (openTime → closeTime)
   * - Ngoài giờ hoạt động → tính theo overtimeFeePerHour
   * - Hỗ trợ: bãi 24h (openTime === closeTime → không có overtime),
   *   bãi bình thường (VD: 06:00-22:00), bãi qua đêm (VD: 22:00-06:00)
   *
   * VD: Bãi 06:00-22:00, overtimeFeePerHour = 50,000đ
   *   rates = [
   *     { startTime: "06:00", endTime: "12:00", amount: 5000 },
   *     { startTime: "12:00", endTime: "22:00", amount: 10000 },
   *   ]
   *   Gửi 21:00 → 07:00 hôm sau:
   *     - 21:00-22:00 (1h khung 10k) = 10,000đ
   *     - 22:00-06:00 (8h overtime @ 50k) = 400,000đ
   *     - 06:00-07:00 (1h khung 5k) = 5,000đ
   *     - Tổng baseFee=15k, overtimeFee=400k → Total=415k
   */
  private static calculateTimeWindowFee(
    checkIn: Date, checkOut: Date,
    rates: Array<{ startTime?: string; endTime?: string; amount: number }>,
    maxDailyFee: number,
    openTime: string,
    closeTime: string,
    overtimeFeePerHour: number
  ): { baseFee: number; overtimeFee: number } {
    const [oH, oM] = openTime.split(':').map(Number);
    const [cH, cM] = closeTime.split(':').map(Number);
    const openMin = oH * 60 + oM;
    const closeMin = cH * 60 + cM;
    const is24h = openMin === closeMin;

    // ── Bước 1: Xây dựng danh sách interval phủ kín 24h ──
    // Mỗi interval có: from, to (phút trong ngày), amount, isOvertime
    type Interval = { from: number; to: number; amount: number; isOvertime: boolean };
    const allIntervals: Interval[] = [];

    // 1a. Thêm rate intervals (trong giờ hoạt động)
    for (const r of rates) {
      if (!r.startTime || !r.endTime) continue;
      const [sH, sM] = r.startTime.split(':').map(Number);
      const [eH, eM] = r.endTime.split(':').map(Number);
      const start = sH * 60 + sM;
      const end = eH * 60 + eM;
      if (start < end) {
        allIntervals.push({ from: start, to: end, amount: r.amount, isOvertime: false });
      } else if (start > end) {
        // Khung qua đêm → tách thành 2 khoảng
        allIntervals.push({ from: start, to: 1440, amount: r.amount, isOvertime: false });
        allIntervals.push({ from: 0, to: end, amount: r.amount, isOvertime: false });
      }
    }

    // 1b. Thêm overtime intervals (ngoài giờ hoạt động) — chỉ khi không phải 24h
    if (!is24h) {
      if (openMin < closeMin) {
        // Bãi bình thường: VD 06:00-22:00
        // Overtime: [0, openMin) và [closeMin, 1440)
        if (openMin > 0) {
          allIntervals.push({ from: 0, to: openMin, amount: overtimeFeePerHour, isOvertime: true });
        }
        if (closeMin < 1440) {
          allIntervals.push({ from: closeMin, to: 1440, amount: overtimeFeePerHour, isOvertime: true });
        }
      } else {
        // Bãi qua đêm: VD 22:00-06:00
        // Overtime: [closeMin, openMin)
        if (closeMin < openMin) {
          allIntervals.push({ from: closeMin, to: openMin, amount: overtimeFeePerHour, isOvertime: true });
        }
      }
    }

    allIntervals.sort((a, b) => a.from - b.from);

    // ── Bước 2: Duyệt từ checkIn → checkOut theo từng segment ──
    let baseFee = 0;
    let overtimeFee = 0;
    const current = new Date(checkIn);

    while (current < checkOut) {
      const minuteOfDay = current.getHours() * 60 + current.getMinutes();

      // Tìm interval chứa thời điểm hiện tại
      const interval = allIntervals.find(fi => minuteOfDay >= fi.from && minuteOfDay < fi.to);
      if (!interval) {
        // Không tìm thấy khung — skip 1 phút (safety fallback)
        current.setTime(current.getTime() + 60000);
        continue;
      }

      // Xác định thời điểm kết thúc segment: ranh giới interval hoặc checkOut
      const segEndDate = new Date(current);
      if (interval.to === 1440) {
        // Kết thúc lúc nửa đêm → 00:00 ngày hôm sau
        segEndDate.setDate(segEndDate.getDate() + 1);
        segEndDate.setHours(0, 0, 0, 0);
      } else {
        segEndDate.setHours(Math.floor(interval.to / 60), interval.to % 60, 0, 0);
      }
      const segmentEnd = checkOut < segEndDate ? checkOut : segEndDate;

      // Tính số giờ (làm tròn lên) × đơn giá
      const durationMs = segmentEnd.getTime() - current.getTime();
      const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));

      if (interval.isOvertime) {
        overtimeFee += durationHours * interval.amount;
      } else {
        baseFee += durationHours * interval.amount;
      }

      // Chuyển sang segment tiếp theo
      current.setTime(segmentEnd.getTime());
    }

    // ── Bước 3: Áp dụng maxDailyFee (giá trần) chỉ lên baseFee ──
    if (maxDailyFee > 0) {
      const startDay = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
      const endDay = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
      const totalDays = Math.max(1, Math.round((endDay.getTime() - startDay.getTime()) / 86400000) + 1);
      const maxTotal = maxDailyFee * totalDays;
      if (baseFee > maxTotal) {
        baseFee = maxTotal;
      }
    }

    return { baseFee, overtimeFee };
  }

  /**
   * FR-10.3: Thu phí gửi xe và check-out (Tạo Payment tiền mặt tự động)
   */
  static async checkOut(data: { sessionId: string, gateOut: string, staffOutId: string, checkOutImage?: string }): Promise<IParkingSession> {
    const sessionMongoose = await mongoose.startSession();
    sessionMongoose.startTransaction();

    try {
      const session = await ParkingSession.findById(data.sessionId).session(sessionMongoose);
      if (!session) throw new AppError('Session không tồn tại', 404);
      if (session.status === SessionStatus.COMPLETED) {
        throw new AppError('Lượt gửi xe đã kết thúc', 400);
      }
      if (session.status === SessionStatus.EXCEPTION) {
        throw new AppError('Lượt gửi xe đang có ngoại lệ chưa được xử lý. Vui lòng giải quyết ngoại lệ trước khi checkout.', 400);
      }

      // Validate staff được phân công tại facility của session này (FR-18.6)
      const staffUser = await User.findById(data.staffOutId).select('assignedFacilities').session(sessionMongoose);
      if (!staffUser) throw new AppError('Staff user not found', 404);
      const isAssigned = staffUser.assignedFacilities.some(
        (fId) => fId.toString() === session.facilityId.toString()
      );
      if (!isAssigned) {
        throw new AppError('Bạn không được phân công tại bãi xe này', 403);
      }

      const checkOutTime = new Date();
      // Không truyền session vào calculateFee vì nó chỉ đọc dữ liệu
      const feeResult = await this.calculateFee(data.sessionId, checkOutTime);

      // IMPORT ĐỘNG TRÁNH CIRCULAR DEPENDENCY VỚI MODEL/PAYMENT NẾU CẦN
      const { Payment, PaymentMethod, PaymentStatus } = require('../models/payment.model');

      // Tự động tạo một record Payment (CASH)
      const transactionCode = `CASH${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const payment = new Payment({
        sessionId: data.sessionId,
        transactionCode,
        amount: feeResult.totalFee,
        method: PaymentMethod.CASH,
        status: PaymentStatus.COMPLETED,
        staffId: data.staffOutId,
      });
      await payment.save({ session: sessionMongoose });

      session.checkOutTime = checkOutTime;
      session.gateOut = data.gateOut;
      session.staffOutId = new mongoose.Types.ObjectId(data.staffOutId);
      session.totalFee = feeResult.totalFee;
      session.status = SessionStatus.COMPLETED;
      if (data.checkOutImage) {
        session.checkOutImage = data.checkOutImage;
      }

      await session.save({ session: sessionMongoose });

      // Update slot -> Available
      const slot = await ParkingSlot.findById(session.slotId).session(sessionMongoose);
      if (slot) {
        slot.status = SlotStatus.AVAILABLE;
        slot.currentSessionId = null;
        slot.maintenanceReason = '';
        await slot.save({ session: sessionMongoose });
      }

      // Commit Transaction
      await sessionMongoose.commitTransaction();
      sessionMongoose.endSession();

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

      // 🔥 Background Upload: Đẩy cả ảnh checkIn và checkOut lên Cloudinary
      UploadService.processCompletedSessionImages(session._id.toString()).catch(console.error);

      return populatedSession!;
    } catch (error) {
      await sessionMongoose.abortTransaction();
      sessionMongoose.endSession();
      throw error;
    }
  }
}
