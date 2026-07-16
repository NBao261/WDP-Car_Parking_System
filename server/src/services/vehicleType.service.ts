import { VehicleType, IVehicleType } from '../models/vehicleType.model';
import { Floor } from '../models/floor.model';
import { ParkingSession, SessionStatus } from '../models/parkingSession.model';
import { Reservation, ReservationStatus } from '../models/reservation.model';
import { AppError } from '../middlewares/error.middleware';
import { delPattern } from '../config/redis';

/**
 * Chuẩn hóa tên: bỏ dấu tiếng Việt, lowercase, trim khoảng trắng thừa.
 * VD: "Xe Máy" → "xe may", "  ô   tô  " → "o to"
 */
function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export class VehicleTypeService {
  /**
   * Kiểm tra tên loại xe trùng lặp (bỏ dấu tiếng Việt).
   * @param name Tên cần kiểm tra
   * @param excludeId ID loại xe cần loại trừ (khi cập nhật)
   */
  private static async checkDuplicateName(name: string, excludeId?: string): Promise<void> {
    const normalized = normalizeName(name);
    const allTypes = await VehicleType.find({ isDeleted: false });
    const duplicate = allTypes.find(vt => {
      if (excludeId && vt._id.toString() === excludeId) return false;
      return normalizeName(vt.name) === normalized;
    });
    if (duplicate) {
      throw new AppError(
        `Tên loại xe "${name}" đã tồn tại (trùng với "${duplicate.name}"). Vui lòng chọn tên khác.`,
        400
      );
    }
  }

  static async createVehicleType(data: Partial<IVehicleType>): Promise<IVehicleType> {
    const existingType = await VehicleType.findOne({ code: data.code });
    if (existingType) {
      throw new AppError('Vehicle type code already exists', 400);
    }

    // Kiểm tra tên trùng (bỏ dấu)
    if (data.name) {
      await this.checkDuplicateName(data.name);
    }

    const newType = new VehicleType(data);
    await newType.save();

    if (data.floors && data.floors.length > 0) {
      await Floor.updateMany(
        { _id: { $in: data.floors } },
        { $addToSet: { allowedVehicleTypes: newType._id } }
      );
    }

    // Invalidate OperationsConfig Cache
    await delPattern('cache:operationsConfig:*');
    await delPattern('cache:public:available-slots:*');

    return newType;
  }

  static async updateVehicleType(id: string, data: Partial<IVehicleType>): Promise<IVehicleType | null> {
    const oldVehicleType = await VehicleType.findById(id);
    if (!oldVehicleType) {
      throw new AppError('Vehicle type not found', 404);
    }

    if (data.code && data.code.toUpperCase() !== oldVehicleType.code.toUpperCase()) {
      const existingType = await VehicleType.findOne({ code: data.code.toUpperCase() });
      if (existingType) {
        throw new AppError('Vehicle type code already exists', 400);
      }
    }

    // Kiểm tra tên trùng (bỏ dấu), loại trừ chính nó
    if (data.name && data.name !== oldVehicleType.name) {
      await this.checkDuplicateName(data.name, id);
    }

    const vehicleType = await VehicleType.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!vehicleType) return null;

    if (data.floors) {
      const oldFloorIds = oldVehicleType.floors.map((f: any) => f.toString());
      const newFloorIds = data.floors.map((f: any) => f.toString());

      const addedFloors = newFloorIds.filter(f => !oldFloorIds.includes(f));
      const removedFloors = oldFloorIds.filter(f => !newFloorIds.includes(f));

      if (addedFloors.length > 0) {
        await Floor.updateMany(
          { _id: { $in: addedFloors } },
          { $addToSet: { allowedVehicleTypes: vehicleType._id } }
        );
      }
      if (removedFloors.length > 0) {
        await Floor.updateMany(
          { _id: { $in: removedFloors } },
          { $pull: { allowedVehicleTypes: vehicleType._id } }
        );
      }
    }

    // Invalidate OperationsConfig Cache
    await delPattern('cache:operationsConfig:*');
    await delPattern('cache:public:available-slots:*');

    return vehicleType;
  }

  static async softDeleteVehicleType(id: string): Promise<IVehicleType | null> {
    // Check if this vehicle type is assigned to any floor
    const floorsWithThisType = await Floor.countDocuments({
      allowedVehicleTypes: id,
      isDeleted: false,
    });

    if (floorsWithThisType > 0) {
      throw new AppError('Không thể xoá loại xe này do đang được gán cho các tầng', 400);
    }

    // Check if there are active sessions
    const activeSessions = await ParkingSession.countDocuments({
      vehicleTypeId: id,
      status: SessionStatus.ACTIVE,
    });
    if (activeSessions > 0) {
      throw new AppError('Không thể xoá loại xe này do đang có lượt gửi xe hoạt động', 400);
    }

    // Check if there are active reservations
    const activeReservations = await Reservation.countDocuments({
      vehicleTypeId: id,
      status: { $in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
    });
    if (activeReservations > 0) {
      throw new AppError('Không thể xoá loại xe này do đang có đặt chỗ đang hoạt động', 400);
    }

    const vehicleType = await VehicleType.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!vehicleType) {
      throw new AppError('Vehicle type not found', 404);
    }

    await Floor.updateMany(
      { allowedVehicleTypes: id },
      { $pull: { allowedVehicleTypes: vehicleType._id } }
    );

    vehicleType.floors = [];
    await vehicleType.save();

    // Invalidate OperationsConfig Cache
    await delPattern('cache:operationsConfig:*');
    await delPattern('cache:public:available-slots:*');

    return vehicleType;
  }

  static async getVehicleTypeById(id: string): Promise<IVehicleType | null> {
    const vehicleType = await VehicleType.findById(id).populate({
      path: 'floors',
      select: 'name facilityId',
      populate: { path: 'facilityId', select: 'name' }
    });
    if (!vehicleType) {
      throw new AppError('Vehicle type not found', 404);
    }
    return vehicleType;
  }

  static async getAllVehicleTypes(filters: any = {}, skip = 0, limit = 10): Promise<{ vehicleTypes: IVehicleType[]; total: number }> {
    const query = { isDeleted: false, ...filters };
    const vehicleTypes = await VehicleType.find(query)
      .populate({
        path: 'floors',
        select: 'name facilityId',
        populate: { path: 'facilityId', select: 'name' }
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const total = await VehicleType.countDocuments(query);
    return { vehicleTypes, total };
  }
}
