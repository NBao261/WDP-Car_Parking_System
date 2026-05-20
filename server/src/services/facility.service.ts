import { ParkingFacility, IParkingFacility } from '../models/parkingFacility.model';
import { Floor } from '../models/floor.model';
import { ParkingSlot } from '../models/parkingSlot.model';
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
}
