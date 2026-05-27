import { ParkingFacility, IParkingFacility } from '../models/parkingFacility.model';
import { Floor } from '../models/floor.model';
import { ParkingSlot } from '../models/parkingSlot.model';
import { VehicleType, IVehicleType } from '../models/vehicleType.model';
import { User } from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';

export class FacilityService {
  static async createFacility(data: Partial<IParkingFacility>): Promise<IParkingFacility> {
    const existingFacility = await ParkingFacility.findOne({ name: data.name });
    if (existingFacility) {
      throw new AppError('Facility name already exists', 400);
    }

    const newFacility = new ParkingFacility(data);
    await newFacility.save();
    return newFacility;
  }

  static async updateFacility(id: string, data: Partial<IParkingFacility>): Promise<IParkingFacility | null> {
    const facility = await ParkingFacility.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!facility) {
      throw new AppError('Facility not found', 404);
    }
    return facility;
  }

  static async deactivateFacility(id: string): Promise<IParkingFacility | null> {
    // Check if there are active occupied or reserved slots before deactivating
    const activeSlots = await ParkingSlot.countDocuments({
      facilityId: id,
      status: { $in: ['occupied', 'reserved'] },
    });

    if (activeSlots > 0) {
      throw new AppError('Cannot deactivate facility with active parking sessions', 400);
    }

    const facility = await ParkingFacility.findByIdAndUpdate(
      id,
      { status: 'inactive' },
      { new: true }
    );

    if (!facility) {
      throw new AppError('Facility not found', 404);
    }

    // Optional: Cascade deactivate floors and slots
    await Floor.updateMany({ facilityId: id }, { status: 'inactive' });
    await ParkingSlot.updateMany({ facilityId: id, status: 'available' }, { status: 'maintenance' });

    // Two-way sync: xóa facility._id khỏi User.assignedFacilities[] cho tất cả user liên quan
    if (facility.assignedUsers && facility.assignedUsers.length > 0) {
      await User.updateMany(
        { _id: { $in: facility.assignedUsers } },
        { $pull: { assignedFacilities: facility._id } }
      );

      // Xóa assignedUsers của facility
      facility.assignedUsers = [];
      await facility.save();
    }

    return facility;
  }

  static async getFacilityById(id: string): Promise<IParkingFacility | null> {
    const facility = await ParkingFacility.findById(id);
    if (!facility) {
      throw new AppError('Facility not found', 404);
    }
    return facility;
  }

  static async getAllFacilities(filters: any = {}, skip = 0, limit = 10): Promise<{ facilities: IParkingFacility[]; total: number }> {
    const facilities = await ParkingFacility.find(filters).skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await ParkingFacility.countDocuments(filters);
    return { facilities, total };
  }

  /**
   * Operational Config cho Staff (BFF pattern)
   * Tổng hợp cấu hình vận hành: loại xe được phép trong toà nhà dựa vào Floor.allowedVehicleTypes
   * API này an toàn với Staff (FACILITY_READ) mà không cần mở Floor API
   */
  static async getOperationsConfig(facilityId: string): Promise<{ facilityId: string; allowedVehicleTypes: IVehicleType[] }> {
    const facility = await ParkingFacility.findById(facilityId);
    if (!facility) {
      throw new AppError('Facility not found', 404);
    }

    // Lấy tất cả Floor active của Facility này
    const floors = await Floor.find({
      facilityId,
      status: 'active',
      isDeleted: false,
    }).select('allowedVehicleTypes');

    // Gộp unique VehicleType IDs từ tất cả các tầng
    const vehicleTypeIdSet = new Set<string>();
    for (const floor of floors) {
      for (const vtId of floor.allowedVehicleTypes) {
        vehicleTypeIdSet.add(vtId.toString());
      }
    }

    // Query Vehicle Types theo IDs đã gộp, loại bỏ các loại đã bị xóa
    const allowedVehicleTypes = await VehicleType.find({
      _id: { $in: Array.from(vehicleTypeIdSet) },
      isDeleted: false,
    }).sort({ name: 1 });

    return { facilityId, allowedVehicleTypes };
  }
}
