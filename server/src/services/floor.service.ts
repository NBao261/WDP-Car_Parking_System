import { Floor, IFloor } from '../models/floor.model';
import { ParkingSlot } from '../models/parkingSlot.model';
import { AppError } from '../middlewares/error.middleware';

export class FloorService {
  static async createFloor(data: Partial<IFloor>): Promise<IFloor> {
    // Check if floor with same name exists in the same facility
    const existingFloor = await Floor.findOne({ 
      name: data.name, 
      facilityId: data.facilityId,
      isDeleted: false 
    });

    if (existingFloor) {
      throw new AppError('Floor name already exists in this facility', 400);
    }

    const newFloor = new Floor(data);
    await newFloor.save();
    return newFloor;
  }

  static async updateFloor(id: string, data: Partial<IFloor>): Promise<IFloor | null> {
    const floor = await Floor.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!floor) {
      throw new AppError('Floor not found', 404);
    }
    return floor;
  }

  static async assignVehicleTypes(id: string, vehicleTypeIds: string[]): Promise<IFloor | null> {
    const floor = await Floor.findByIdAndUpdate(
      id,
      { $set: { allowedVehicleTypes: vehicleTypeIds } },
      { new: true, runValidators: true }
    );
    if (!floor) {
      throw new AppError('Floor not found', 404);
    }
    return floor;
  }

  static async softDeleteFloor(id: string): Promise<IFloor | null> {
    // Check if there are active occupied or reserved slots before deleting
    const activeSlots = await ParkingSlot.countDocuments({
      floorId: id,
      status: { $in: ['occupied', 'reserved'] },
    });

    if (activeSlots > 0) {
      throw new AppError('Cannot delete floor with active parking sessions', 400);
    }

    const floor = await Floor.findByIdAndUpdate(id, { isDeleted: true, status: 'inactive' }, { new: true });
    if (!floor) {
      throw new AppError('Floor not found', 404);
    }

    // Cascade delete/deactivate slots
    await ParkingSlot.updateMany({ floorId: id }, { status: 'maintenance' });

    return floor;
  }

  static async getFloorById(id: string): Promise<IFloor | null> {
    const floor = await Floor.findById(id).populate('allowedVehicleTypes');
    if (!floor) {
      throw new AppError('Floor not found', 404);
    }
    return floor;
  }

  static async getAllFloors(filters: any = {}, skip = 0, limit = 10): Promise<{ floors: IFloor[]; total: number }> {
    const query = { isDeleted: false, ...filters };
    const floors = await Floor.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).populate('allowedVehicleTypes');
    const total = await Floor.countDocuments(query);
    return { floors, total };
  }
}
