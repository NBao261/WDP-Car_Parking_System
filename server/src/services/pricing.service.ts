import { PricingPlan, IPricingPlan } from '../models/pricingPlan.model';
import { AppError } from '../middlewares/error.middleware';

export class PricingService {
  static async createPricingPlan(data: Partial<IPricingPlan>): Promise<IPricingPlan> {
    // If the new plan is set to active, deactivate existing active plans for the same facility and vehicle type
    if (data.status === 'active') {
      await PricingPlan.updateMany(
        { facilityId: data.facilityId, vehicleTypeId: data.vehicleTypeId, status: 'active' },
        { status: 'inactive' }
      );
    }

    const newPlan = new PricingPlan(data);
    await newPlan.save();
    return newPlan;
  }

  static async updatePricingPlan(id: string, data: Partial<IPricingPlan>): Promise<IPricingPlan | null> {
    // If the plan is being set to active, deactivate others
    if (data.status === 'active') {
      const planToUpdate = await PricingPlan.findById(id);
      if (planToUpdate) {
        await PricingPlan.updateMany(
          { facilityId: planToUpdate.facilityId, vehicleTypeId: planToUpdate.vehicleTypeId, _id: { $ne: id }, status: 'active' },
          { status: 'inactive' }
        );
      }
    }

    const updatedPlan = await PricingPlan.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!updatedPlan) {
      throw new AppError('Pricing plan not found', 404);
    }
    return updatedPlan;
  }

  static async deactivatePricingPlan(id: string): Promise<IPricingPlan | null> {
    const plan = await PricingPlan.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
    if (!plan) {
      throw new AppError('Pricing plan not found', 404);
    }
    return plan;
  }

  static async getPricingPlanById(id: string): Promise<IPricingPlan | null> {
    const plan = await PricingPlan.findById(id).populate('vehicleTypeId facilityId');
    if (!plan) {
      throw new AppError('Pricing plan not found', 404);
    }
    return plan;
  }

  static async getAllPricingPlans(filters: any = {}, skip = 0, limit = 10): Promise<{ pricingPlans: IPricingPlan[]; total: number }> {
    const pricingPlans = await PricingPlan.find(filters)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('vehicleTypeId facilityId');
    const total = await PricingPlan.countDocuments(filters);
    return { pricingPlans, total };
  }
}
