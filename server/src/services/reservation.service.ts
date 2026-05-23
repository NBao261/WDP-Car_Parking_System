import { Reservation, IReservation, ReservationStatus } from '../models/reservation.model';
import { ParkingSlot, SlotStatus } from '../models/parkingSlot.model';
import { ParkingFacility } from '../models/parkingFacility.model';
import { VehicleType } from '../models/vehicleType.model';
import { AppError } from '../middlewares/error.middleware';
import { logger } from '../config/logger';

export class ReservationService {
  /**
   * FR-14.1: Tạo đặt chỗ trước
   * BR-6.1: Chỉ đặt chỗ khi còn slot
   * BR-6.2: Phải đặt trước ít nhất 30 phút
   * BR-6.3: Tối đa 2 reservation active / user
   */
  static async createReservation(userId: string, data: {
    facilityId: string;
    vehicleTypeId: string;
    startTime: string;
    endTime: string;
  }): Promise<IReservation> {
    const { facilityId, vehicleTypeId, startTime, endTime } = data;
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    // Validate facility exists
    const facility = await ParkingFacility.findById(facilityId);
    if (!facility) throw new AppError('Bãi xe không tồn tại', 404);

    // Validate vehicle type exists
    const vehicleType = await VehicleType.findById(vehicleTypeId);
    if (!vehicleType) throw new AppError('Loại xe không tồn tại', 404);

    // BR-6.2: Phải đặt trước ít nhất 30 phút
    const minAdvanceMs = 30 * 60 * 1000;
    if (start.getTime() - now.getTime() < minAdvanceMs) {
      throw new AppError('Phải đặt trước ít nhất 30 phút so với thời gian bắt đầu', 400);
    }

    // Validate endTime > startTime
    if (end <= start) {
      throw new AppError('Thời gian kết thúc phải sau thời gian bắt đầu', 400);
    }

    // BR-6.3: Tối đa 2 reservation active / user
    const activeCount = await Reservation.countDocuments({
      userId,
      status: { $in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
    });
    if (activeCount >= 2) {
      throw new AppError('Bạn chỉ có thể có tối đa 2 đặt chỗ đang hoạt động', 400);
    }

    // BR-6.1: Tìm slot trống cho loại xe tại facility
    const availableSlot = await ParkingSlot.findOne({
      facilityId,
      vehicleTypeId,
      status: SlotStatus.AVAILABLE,
      isDeleted: false,
    });

    if (!availableSlot) {
      throw new AppError('Không còn slot trống cho loại xe này trong khung giờ yêu cầu', 400);
    }

    // Tạo reservation + lock slot
    const reservation = await Reservation.create({
      userId,
      facilityId,
      vehicleTypeId,
      slotId: availableSlot._id,
      startTime: start,
      endTime: end,
      status: ReservationStatus.CONFIRMED,
    });

    // Chuyển slot sang Reserved
    await ParkingSlot.findByIdAndUpdate(availableSlot._id, {
      status: SlotStatus.RESERVED,
    });

    logger.info(`Reservation created: ${reservation._id} by user ${userId}, slot ${availableSlot.code}`);

    return reservation.populate([
      { path: 'facilityId', select: 'name address' },
      { path: 'vehicleTypeId', select: 'name' },
      { path: 'slotId', select: 'code floorId' },
    ]);
  }

  /**
   * FR-14.2: Hủy đặt chỗ
   * BR-6.5: Chính sách hủy — hủy trước ≥2h: miễn phí, trong 2h: có phí
   */
  static async cancelReservation(reservationId: string, userId: string): Promise<IReservation> {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) throw new AppError('Đặt chỗ không tồn tại', 404);

    // Chỉ user tạo mới được hủy
    if (reservation.userId.toString() !== userId) {
      throw new AppError('Bạn không có quyền hủy đặt chỗ này', 403);
    }

    // Chỉ hủy được reservation chưa sử dụng
    if (![ReservationStatus.PENDING, ReservationStatus.CONFIRMED].includes(reservation.status)) {
      throw new AppError('Không thể hủy đặt chỗ đã sử dụng hoặc đã hủy', 400);
    }

    // BR-6.5: Tính phí hủy
    const now = new Date();
    const hoursUntilStart = (reservation.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    let cancellationFee = 0;

    if (hoursUntilStart < 2) {
      // Hủy trong vòng 2 giờ: phí cố định 10,000 VND (có thể cấu hình qua SystemConfig)
      cancellationFee = 10000;
    }

    // Cập nhật reservation
    reservation.status = ReservationStatus.CANCELLED;
    reservation.cancellationFee = cancellationFee;
    await reservation.save();

    // Trả lại slot → Available
    if (reservation.slotId) {
      await ParkingSlot.findByIdAndUpdate(reservation.slotId, {
        status: SlotStatus.AVAILABLE,
      });
    }

    logger.info(`Reservation cancelled: ${reservationId} by user ${userId}, fee: ${cancellationFee}`);

    return reservation;
  }

  /**
   * FR-14.2: Xem danh sách đặt chỗ
   * Driver: chỉ xem của mình
   * Manager/Admin: xem tất cả (filter theo facility)
   */
  static async getReservations(
    userId: string,
    role: string,
    query: any
  ): Promise<{ data: IReservation[]; total: number; page: number; totalPages: number }> {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Driver chỉ xem của mình
    if (role === 'driver') {
      filter.userId = userId;
    }

    if (query?.status) filter.status = query.status;
    if (query?.facilityId) filter.facilityId = query.facilityId;

    const sortBy = query?.sortBy || 'createdAt';
    const sortOrder = query?.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      Reservation.find(filter)
        .populate('facilityId', 'name address')
        .populate('vehicleTypeId', 'name')
        .populate('slotId', 'code floorId')
        .populate('userId', 'fullName email phone')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      Reservation.countDocuments(filter),
    ]);

    return {
      data: data as any[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * BR-6.4: Tự động hủy reservation quá hạn
   * Gọi bởi cron job — chạy mỗi 5 phút
   */
  static async autoExpireReservations(): Promise<number> {
    const now = new Date();
    const graceMs = 30 * 60 * 1000; // 30 phút

    // Tìm reservation đã quá hạn 30 phút mà chưa đến
    const expiredReservations = await Reservation.find({
      status: { $in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
      startTime: { $lte: new Date(now.getTime() - graceMs) },
    });

    let count = 0;
    for (const reservation of expiredReservations) {
      reservation.status = ReservationStatus.EXPIRED;
      await reservation.save();

      // Trả lại slot → Available
      if (reservation.slotId) {
        await ParkingSlot.findByIdAndUpdate(reservation.slotId, {
          status: SlotStatus.AVAILABLE,
        });
      }

      count++;
    }

    if (count > 0) {
      logger.info(`Auto-expired ${count} reservations`);
    }

    return count;
  }

  /**
   * BR-6.6: Chuyển reservation → session
   * Gọi khi Staff check-in xe có reservation
   */
  static async convertToUsed(reservationId: string): Promise<IReservation> {
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) throw new AppError('Đặt chỗ không tồn tại', 404);

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new AppError('Đặt chỗ không ở trạng thái có thể sử dụng', 400);
    }

    reservation.status = ReservationStatus.USED;
    await reservation.save();

    logger.info(`Reservation converted to used: ${reservationId}`);
    return reservation;
  }

  /**
   * Lấy chi tiết reservation theo ID
   */
  static async getReservationById(reservationId: string): Promise<IReservation> {
    const reservation = await Reservation.findById(reservationId)
      .populate('facilityId', 'name address')
      .populate('vehicleTypeId', 'name')
      .populate('slotId', 'code floorId')
      .populate('userId', 'fullName email phone');

    if (!reservation) throw new AppError('Đặt chỗ không tồn tại', 404);
    return reservation;
  }
}
