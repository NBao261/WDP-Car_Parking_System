import { VehicleType, IVehicleType } from '../models/vehicleType.model';
import { Floor } from '../models/floor.model';
import { AppError } from '../middlewares/error.middleware';

export class VehicleTypeService {
  static async createVehicleType(data: Partial<IVehicleType>): Promise<IVehicleType> {
    const existingType = await VehicleType.findOne({ code: data.code });
    if (existingType) {
      throw new AppError('Vehicle type code already exists', 400);
    }

    const newType = new VehicleType(data);
    await newType.save();
    return newType;
  }

  static async updateVehicleType(id: string, data: Partial<IVehicleType>): Promise<IVehicleType | null> {
    const vehicleType = await VehicleType.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!vehicleType) {
      throw new AppError('Vehicle type not found', 404);
    }
    return vehicleType;
  }

  static async softDeleteVehicleType(id: string): Promise<IVehicleType | null> {
    // Check if this vehicle type is assigned to any floor
    const floorsWithThisType = await Floor.countDocuments({
      allowedVehicleTypes: id,
      isDeleted: false,
    });

    if (floorsWithThisType > 0) {
      throw new AppError('Cannot delete vehicle type that is currently assigned to floors', 400);
    }

    const vehicleType = await VehicleType.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    if (!vehicleType) {
      throw new AppError('Vehicle type not found', 404);
    }
    return vehicleType;
  }

  static async getVehicleTypeById(id: string): Promise<IVehicleType | null> {
    const vehicleType = await VehicleType.findById(id);
    if (!vehicleType) {
      throw new AppError('Vehicle type not found', 404);
    }
    return vehicleType;
  }

  static async getAllVehicleTypes(filters: any = {}, skip = 0, limit = 10): Promise<{ vehicleTypes: IVehicleType[]; total: number }> {
    const query = { isDeleted: false, ...filters };
    const vehicleTypes = await VehicleType.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await VehicleType.countDocuments(query);
    return { vehicleTypes, total };
  }
}
