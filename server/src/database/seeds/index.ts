import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDatabase } from '../connection';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

// Import Models
import { User, UserRole, UserStatus } from '../../models/user.model';
import { ParkingFacility, FacilityStatus } from '../../models/parkingFacility.model';
import { VehicleType, SlotSize } from '../../models/vehicleType.model';
import { Floor } from '../../models/floor.model';
import { ParkingSlot, SlotStatus } from '../../models/parkingSlot.model';
import { Role } from '../../models/role.model';
import { DEFAULT_PERMISSIONS } from '../../config/permissions';

const seed = async () => {
  try {
    await connectDatabase();
    logger.info('🌱 Starting database seeding...');

    // 1. Clear existing base data
    logger.info('🧹 Clearing old data...');
    await Promise.all([
      User.deleteMany({ email: 'admin@smartparking.com' }),
      ParkingFacility.deleteMany({ name: 'Central Hub Parking' }),
      VehicleType.deleteMany({ code: { $in: ['MOTO', 'CAR4', 'CAR7'] } }),
      Role.deleteMany({ code: { $in: Object.values(UserRole) } }),
    ]);

    // 2. Seed Default Roles (FR-19.1)
    logger.info('🔑 Seeding default roles...');
    const roleDefs = [
      {
        code: UserRole.ADMIN,
        name: 'System Administrator',
        description: 'Quản trị viên hệ thống: quản lý tài khoản, phân quyền, cấu hình hệ thống',
        permissions: DEFAULT_PERMISSIONS[UserRole.ADMIN],
        isDefault: true,
      },
      {
        code: UserRole.MANAGER,
        name: 'Parking Facility Manager',
        description: 'Quản lý toàn bộ hoạt động vận hành bãi đỗ xe: tòa nhà, tầng, slot, bảng giá, báo cáo',
        permissions: DEFAULT_PERMISSIONS[UserRole.MANAGER],
        isDefault: true,
      },
      {
        code: UserRole.STAFF,
        name: 'Parking Staff',
        description: 'Nhân viên trực tiếp vận hành tại bãi xe: xử lý xe vào/ra, thu phí, xử lý ngoại lệ',
        permissions: DEFAULT_PERMISSIONS[UserRole.STAFF],
        isDefault: true,
      },
      {
        code: UserRole.DRIVER,
        name: 'Parking User / Driver',
        description: 'Người sử dụng dịch vụ gửi xe: xem thông tin, gửi xe, đặt chỗ, thanh toán',
        permissions: DEFAULT_PERMISSIONS[UserRole.DRIVER],
        isDefault: true,
      },
    ];

    await Role.insertMany(roleDefs);
    logger.info(`✅ ${roleDefs.length} default roles created with permissions`);

    // 3. Seed Admin User
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@smartparking.com',
      phone: '0900000000',
      password: hashedPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      mustChangePassword: false,
    });
    logger.info(`✅ Admin created: ${admin.email}`);

    // 4. Seed Vehicle Types
    const motoType = await VehicleType.create({
      name: 'Xe Máy',
      code: 'MOTO',
      slotSize: SlotSize.SMALL,
      description: 'Xe máy, xe máy điện 2 bánh',
    });
    
    const car4Type = await VehicleType.create({
      name: 'Ô tô 4-5 chỗ',
      code: 'CAR4',
      slotSize: SlotSize.MEDIUM,
      description: 'Xe con 4 đến 5 chỗ',
    });

    logger.info('✅ Vehicle types created');

    // 5. Seed Parking Facility
    const facility = await ParkingFacility.create({
      name: 'Central Hub Parking',
      address: '123 Main Street, District 1, HCMC',
      totalFloors: 2,
      openTime: '00:00',
      closeTime: '23:59',
      status: FacilityStatus.ACTIVE,
    });
    logger.info(`✅ Facility created: ${facility.name}`);

    // 6. Seed Floors
    const floor1 = await Floor.create({
      facilityId: facility._id,
      name: 'Tầng 1 (Ô tô)',
      allowedVehicleTypes: [car4Type._id],
      totalSlots: 50,
    });

    const floor2 = await Floor.create({
      facilityId: facility._id,
      name: 'Tầng 2 (Xe máy)',
      allowedVehicleTypes: [motoType._id],
      totalSlots: 200,
    });
    logger.info('✅ Floors created');

    // 7. Seed Sample Slots for Floor 1 (Car)
    const carSlots = [];
    for (let i = 1; i <= 5; i++) {
      carSlots.push({
        code: `A1-${i.toString().padStart(3, '0')}`,
        floorId: floor1._id,
        facilityId: facility._id,
        vehicleTypeId: car4Type._id,
        status: SlotStatus.AVAILABLE,
      });
    }
    await ParkingSlot.insertMany(carSlots);
    logger.info('✅ Sample parking slots created');

    logger.info('🎉 Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
