import { ParkingSlot, IParkingSlot } from '../models/parkingSlot.model';
import { Floor } from '../models/floor.model';
import { AppError } from '../middlewares/error.middleware';

export class SlotService {
  static async createSlot(data: Partial<IParkingSlot>): Promise<IParkingSlot> {
    const existingSlot = await ParkingSlot.findOne({ code: data.code, facilityId: data.facilityId });
    if (existingSlot) {
      throw new AppError('Slot code already exists in this facility', 400);
    }

    const newSlot = new ParkingSlot(data);
    await newSlot.save();

    // Update floor totalSlots
    await Floor.findByIdAndUpdate(data.floorId, { $inc: { totalSlots: 1 } });

    return newSlot;
  }

  static async createBulkSlots(facilityId: string, floorId: string, vehicleType: string, prefix: string, startNumber: number, count: number): Promise<any[]> {
    const slotsToCreate = [];
    for (let i = 0; i < count; i++) {
      const code = `${prefix}${startNumber + i}`;
      slotsToCreate.push({
        code,
        facilityId,
        floorId,
        vehicleTypeId: vehicleType,
        status: 'available',
      });
    }

    // Check for existing codes in the batch
    const existingSlots = await ParkingSlot.find({
      facilityId,
      code: { $in: slotsToCreate.map(s => s.code) }
    });

    if (existingSlots.length > 0) {
      throw new AppError(`Some slot codes already exist: ${existingSlots.map(s => s.code).join(', ')}`, 400);
    }

    const createdSlots = await ParkingSlot.insertMany(slotsToCreate);

    // Update floor totalSlots
    await Floor.findByIdAndUpdate(floorId, { $inc: { totalSlots: count } });

    return createdSlots;
  }

  static async updateSlotStatus(id: string, status: string, reason?: string, userRole?: string): Promise<IParkingSlot | null> {
    const slot = await ParkingSlot.findById(id);
    if (!slot) {
      throw new AppError('Slot not found', 404);
    }

    if (userRole === 'staff') {
      if (status !== 'maintenance' && status !== 'available') {
        throw new AppError('Nhân viên chỉ có quyền cập nhật trạng thái bảo trì hoặc trống', 403);
      }
      if (slot.status === 'occupied') {
        throw new AppError('Không thể thay đổi trạng thái slot đang có xe đỗ', 400);
      }
    }

    // Business Logic: Prevent transition if slot is occupied (unless transitioning to available via checkout)
    // Note: Checkout logic will handle transitioning from occupied to available.
    // Manual updates should be restricted for occupied slots.
    if (slot.status === 'occupied' && ['maintenance', 'locked'].includes(status)) {
      throw new AppError('Cannot set an occupied slot to maintenance or locked', 400);
    }

    slot.status = status as any;
    // We could store the reason in a separate audit/history log in the future
    await slot.save();
    return slot;
  }

  static async deleteSlot(id: string): Promise<void> {
    const slot = await ParkingSlot.findById(id);
    if (!slot) {
      throw new AppError('Slot not found', 404);
    }

    if (slot.status === 'occupied' || slot.status === 'reserved') {
      throw new AppError('Cannot delete a slot that is currently occupied or reserved', 400);
    }

    await ParkingSlot.findByIdAndDelete(id);

    // Update floor totalSlots
    await Floor.findByIdAndUpdate(slot.floorId, { $inc: { totalSlots: -1 } });
  }

  static async getSlotById(id: string): Promise<IParkingSlot | null> {
    const slot = await ParkingSlot.findById(id).populate('vehicleTypeId');
    if (!slot) {
      throw new AppError('Slot not found', 404);
    }
    return slot;
  }

  static async getSlotsByFloor(floorId: string): Promise<IParkingSlot[]> {
    return ParkingSlot.find({ floorId }).populate('vehicleTypeId').sort({ code: 1 });
  }
}
