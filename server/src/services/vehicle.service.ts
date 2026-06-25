import mongoose from 'mongoose';
import { Vehicle, IVehicle } from '../models/vehicle.model';
import { VehicleType } from '../models/vehicleType.model';
import { AppError } from '../middlewares/error.middleware';

interface AddVehicleDto {
  userId: string;
  vehicleTypeId: string;
  licensePlate: string;
  nickname?: string;
  image?: string;
  isDefault?: boolean;
}

interface UpdateVehicleDto {
  vehicleTypeId?: string;
  licensePlate?: string;
  nickname?: string;
  image?: string;
  isDefault?: boolean;
}

export class VehicleService {
  /**
   * Thêm xe mới cho Driver
   */
  static async addVehicle(data: AddVehicleDto): Promise<IVehicle> {
    // Validate vehicleTypeId tồn tại
    const vehicleType = await VehicleType.findById(data.vehicleTypeId);
    if (!vehicleType || vehicleType.isDeleted) {
      throw new AppError('Loại xe không tồn tại hoặc đã bị xoá', 400);
    }

    // Kiểm tra trùng biển số per user
    const existing = await Vehicle.findOne({
      userId: data.userId,
      licensePlate: data.licensePlate.toUpperCase(),
      isDeleted: false,
    });
    if (existing) {
      throw new AppError('Bạn đã đăng ký xe với biển số này rồi', 400);
    }

    const vehicle = new Vehicle({
      userId: new mongoose.Types.ObjectId(data.userId),
      vehicleTypeId: new mongoose.Types.ObjectId(data.vehicleTypeId),
      licensePlate: data.licensePlate.toUpperCase(),
      nickname: data.nickname || '',
      image: data.image || '',
    });

    if (data.isDefault === true) {
      // Bỏ default các xe khác
      await Vehicle.updateMany(
        { userId: data.userId, isDeleted: false },
        { isDefault: false }
      );
      vehicle.isDefault = true;
    } else {
      vehicle.isDefault = false;
    }

    await vehicle.save();

    return vehicle.populate('vehicleTypeId', 'name code icon');
  }

  /**
   * Lấy danh sách xe của Driver
   */
  static async getMyVehicles(userId: string): Promise<IVehicle[]> {
    return Vehicle.find({ userId, isDeleted: false })
      .sort({ isDefault: -1, createdAt: -1 })
      .populate('vehicleTypeId', 'name code icon');
  }

  /**
   * Lấy chi tiết 1 xe
   */
  static async getVehicleById(userId: string, vehicleId: string): Promise<IVehicle> {
    const vehicle = await Vehicle.findOne({ _id: vehicleId, userId, isDeleted: false })
      .populate('vehicleTypeId', 'name code icon');
    if (!vehicle) {
      throw new AppError('Xe không tồn tại hoặc không thuộc về bạn', 404);
    }
    return vehicle;
  }

  /**
   * Cập nhật xe (vehicleTypeId, licensePlate, nickname, image, isDefault)
   */
  static async updateVehicle(userId: string, vehicleId: string, data: UpdateVehicleDto): Promise<IVehicle> {
    const vehicle = await Vehicle.findOne({ _id: vehicleId, userId, isDeleted: false });
    if (!vehicle) {
      throw new AppError('Xe không tồn tại hoặc không thuộc về bạn', 404);
    }

    // Cập nhật loại xe
    if (data.vehicleTypeId) {
      const vt = await VehicleType.findById(data.vehicleTypeId);
      if (!vt || vt.isDeleted) {
        throw new AppError('Loại xe không tồn tại hoặc đã bị xoá', 400);
      }
      vehicle.vehicleTypeId = new mongoose.Types.ObjectId(data.vehicleTypeId);
    }

    // Cập nhật biển số (check trùng)
    if (data.licensePlate) {
      const plate = data.licensePlate.toUpperCase();
      const dup = await Vehicle.findOne({
        userId, licensePlate: plate, isDeleted: false,
        _id: { $ne: vehicleId },
      });
      if (dup) {
        throw new AppError('Bạn đã đăng ký xe với biển số này rồi', 400);
      }
      vehicle.licensePlate = plate;
    }

    if (data.nickname !== undefined) vehicle.nickname = data.nickname;
    if (data.image !== undefined) vehicle.image = data.image;

    // Nếu set default → bỏ default của các xe khác
    if (data.isDefault === true) {
      await Vehicle.updateMany(
        { userId, isDeleted: false, _id: { $ne: vehicleId } },
        { isDefault: false }
      );
      vehicle.isDefault = true;
    } else if (data.isDefault === false) {
      vehicle.isDefault = false;
    }

    await vehicle.save();
    return vehicle.populate('vehicleTypeId', 'name code icon');
  }

  /**
   * Xoá xe (soft delete)
   */
  static async deleteVehicle(userId: string, vehicleId: string): Promise<void> {
    const vehicle = await Vehicle.findOne({ _id: vehicleId, userId, isDeleted: false });
    if (!vehicle) {
      throw new AppError('Xe không tồn tại hoặc không thuộc về bạn', 404);
    }

    vehicle.isDeleted = true;
    vehicle.isDefault = false;
    await vehicle.save();
  }
}
