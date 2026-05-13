import { ParkingFacility } from '../models/parkingFacility.model';
import { PricingPlan } from '../models/pricingPlan.model';
import { ParkingSlot } from '../models/parkingSlot.model';
import { AppError } from '../middlewares/error.middleware';

export class PublicService {
  static async getPublicFacilities(filters: any = {}, skip = 0, limit = 10) {
    const query = { status: 'active', ...filters };
    const facilities = await ParkingFacility.find(query).skip(skip).limit(limit).select('-createdAt -updatedAt');
    const total = await ParkingFacility.countDocuments(query);
    return { facilities, total };
  }

  static async getPublicPricing(facilityId: string) {
    const pricingPlans = await PricingPlan.find({ facilityId, status: 'active' }).populate('vehicleType', 'name code slotSize icon');
    return pricingPlans;
  }

  static async getAvailableSlots(facilityId: string) {
    // Aggregation to count available slots by vehicle type
    const availableSlots = await ParkingSlot.aggregate([
      { $match: { facilityId: facilityId, status: 'available' } },
      {
        $group: {
          _id: '$vehicleType',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'vehicletypes', // check MongoDB collection name, typically lowercased + 's'
          localField: '_id',
          foreignField: '_id',
          as: 'vehicleTypeInfo'
        }
      },
      { $unwind: '$vehicleTypeInfo' },
      {
        $project: {
          _id: 0,
          vehicleTypeId: '$_id',
          vehicleTypeCode: '$vehicleTypeInfo.code',
          vehicleTypeName: '$vehicleTypeInfo.name',
          availableCount: '$count',
        }
      }
    ]);
    return availableSlots;
  }
}
