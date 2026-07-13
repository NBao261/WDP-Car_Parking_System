import { ParkingFacility } from '../models/parkingFacility.model';
import { PricingPlan } from '../models/pricingPlan.model';
import { ParkingSlot } from '../models/parkingSlot.model';
import { AppError } from '../middlewares/error.middleware';
import mongoose from 'mongoose';

export class PublicService {
  static async getPublicFacilities(filters: any = {}, skip = 0, limit = 10) {
    const query: any = { isDeleted: false, ...filters };
    if (!query.status && query.status !== 'all') {
      query.status = 'active';
    } else if (query.status === 'all') {
      delete query.status;
    }
    
    if (query.vehicleTypeId) {
      const plans = await PricingPlan.find({ vehicleTypeId: query.vehicleTypeId, status: 'active' }).select('facilityId');
      const facilityIds = plans.map(p => p.facilityId);
      query._id = { $in: facilityIds };
      delete query.vehicleTypeId;
    }
    
    const facilities = await ParkingFacility.find(query).skip(skip).limit(limit).select('-createdAt -updatedAt');
    const total = await ParkingFacility.countDocuments(query);
    return { facilities, total };
  }

  static async getPublicPricing(facilityId: string) {
    const pricingPlans = await PricingPlan.find({ facilityId, status: 'active' }).populate('vehicleTypeId', 'name code icon');
    return pricingPlans;
  }

  static async getAvailableSlots(facilityId: string) {
    // Aggregation to count available slots by vehicle type
    const availableSlots = await ParkingSlot.aggregate([
      { $match: { facilityId: new mongoose.Types.ObjectId(facilityId), status: 'available' } },
      {
        $group: {
          _id: '$vehicleTypeId',
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
