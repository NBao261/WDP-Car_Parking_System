import mongoose from 'mongoose';
import { ParkingSession, IParkingSession, SessionStatus } from '../models/parkingSession.model';
import { ParkingSlot, SlotStatus } from '../models/parkingSlot.model';
import { ParkingFacility } from '../models/parkingFacility.model';
import { VehicleType } from '../models/vehicleType.model';
import { Floor } from '../models/floor.model';
import { PricingPlan } from '../models/pricingPlan.model';
import { User } from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';
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
  facilityId: string;
  vehicleTypeId: string;
  licensePlate: string;
  gateIn: string;
  staffInId: string;
  floorId?: string;
  slotId?: string;
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
    if (currentTime < facility.openTime || currentTime >= facility.closeTime) {
      return { eligible: false, reason: `Bãi xe đang đóng. Giờ hoạt động: ${facility.openTime} - ${facility.closeTime}`, availableSlotCount: 0 };
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

    // 5. Tìm slot — nếu user chọn cụ thể thì validate, nếu không thì auto-assign
    let slot;

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
   * Tính phí dựa trên bảng giá áp dụng
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
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60)); // làm tròn lên

    let totalFee = 0;
    let baseFee = 0;
    let overnightFee = 0;
    let overtimeFee = 0;

    // Check if overnight (crosses 00:00) - simple calculation: check days diff
    const startDay = new Date(checkInTime.getFullYear(), checkInTime.getMonth(), checkInTime.getDate());
    const endDay = new Date(checkOutTime.getFullYear(), checkOutTime.getMonth(), checkOutTime.getDate());
    const daysDiff = Math.round((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24));
    
    if (pricingPlan.feeType === 'per_turn') {
      baseFee = pricingPlan.rates[0]?.amount || 0;
      if (daysDiff > 0 && pricingPlan.overnightFee > 0) {
        overnightFee = pricingPlan.overnightFee * daysDiff;
      }
    } else if (pricingPlan.feeType === 'hourly') {
      const firstHourRate = pricingPlan.rates.find((r: any) => r.label === 'Giờ đầu' || r.label === 'first_hour')?.amount || pricingPlan.rates[0]?.amount || 0;
      const nextHourRate = pricingPlan.rates.find((r: any) => r.label === 'Giờ tiếp theo' || r.label === 'next_hour')?.amount || pricingPlan.rates[1]?.amount || firstHourRate;
      
      if (durationHours <= 1) {
        baseFee = firstHourRate;
      } else {
        baseFee = firstHourRate + (durationHours - 1) * nextHourRate;
      }
      
      if (daysDiff > 0 && pricingPlan.overnightFee > 0) {
        overnightFee = pricingPlan.overnightFee * daysDiff;
      }
    } else {
      // Default fallback
      baseFee = pricingPlan.rates[0]?.amount || 0;
    }

    // Phí quá giờ (nếu durationHours > 24)
    if (durationHours > 24 && pricingPlan.overtimeFeePerHour > 0) {
      overtimeFee = (durationHours - 24) * pricingPlan.overtimeFeePerHour;
    }

    totalFee = baseFee + overnightFee + overtimeFee;

    return {
      totalFee,
      details: {
        durationHours,
        baseFee,
        overnightFee,
        overtimeFee,
        pricingPlanName: pricingPlan.name,
        daysDiff
      }
    };
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
