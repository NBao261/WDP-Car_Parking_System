import bcrypt from 'bcryptjs';
import { connectDatabase } from '../connection';
import { logger } from '../../config/logger';

// Import Models
import { User, UserRole, UserStatus } from '../../models/user.model';
import { ParkingFacility, FacilityStatus } from '../../models/parkingFacility.model';
import { VehicleType, SlotSize } from '../../models/vehicleType.model';
import { Floor } from '../../models/floor.model';
import { ParkingSlot, SlotStatus } from '../../models/parkingSlot.model';
import { PricingPlan, FeeType } from '../../models/pricingPlan.model';
import { Role } from '../../models/role.model';
import { DEFAULT_PERMISSIONS } from '../../config/permissions';

const seed = async () => {
  try {
    await connectDatabase();
    logger.info('🌱 Starting database seeding...');

    // ═══════════════════════════════════════════════════
    // 1. Clear existing seed data
    // ═══════════════════════════════════════════════════
    logger.info('🧹 Clearing old seed data...');
    await Promise.all([
      User.deleteMany({
        email: {
          $in: [
            'admin@smartparking.com',
            'manager@smartparking.com',
            'staff1@smartparking.com',
            'staff2@smartparking.com',
          ],
        },
      }),
      ParkingFacility.deleteMany({
        name: { $in: ['Central Hub Parking', 'Sunrise Tower Parking'] },
      }),
      VehicleType.deleteMany({
        code: { $in: ['MOTO', 'CAR4', 'CAR7', 'BIKE', 'TRUCK'] },
      }),
      PricingPlan.deleteMany({
        name: {
          $in: [
            'Xe Máy - Theo giờ',
            'Xe Máy - Theo lượt',
            'Ô tô 4 chỗ - Theo giờ',
            'Ô tô 7 chỗ - Theo giờ',
            'Xe Đạp - Theo lượt',
          ],
        },
      }),
      Role.deleteMany({ code: { $in: Object.values(UserRole) } }),
    ]);

    // ═══════════════════════════════════════════════════
    // 2. Seed Default Roles (FR-19.1)
    // ═══════════════════════════════════════════════════
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

    ];

    await Role.insertMany(roleDefs);
    logger.info(`✅ ${roleDefs.length} default roles created`);

    // ═══════════════════════════════════════════════════
    // 3. Seed Users (4 users: 1 admin, 1 manager, 2 staff)
    // ═══════════════════════════════════════════════════
    logger.info('👤 Seeding users...');
    const defaultPassword = process.env.SEED_DEFAULT_PASSWORD || 'smartparking123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const users = await User.insertMany([
      {
        name: 'System Admin',
        email: 'admin@smartparking.com',
        phone: '0900000000',
        password: hashedPassword,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        mustChangePassword: false,
      },
      {
        name: 'Trần Văn Quản Lý',
        email: 'manager@smartparking.com',
        phone: '0900000001',
        password: hashedPassword,
        role: UserRole.MANAGER,
        status: UserStatus.ACTIVE,
        mustChangePassword: false,
      },
      {
        name: 'Nguyễn Văn Staff A',
        email: 'staff1@smartparking.com',
        phone: '0900000002',
        password: hashedPassword,
        role: UserRole.STAFF,
        status: UserStatus.ACTIVE,
        mustChangePassword: false,
      },
      {
        name: 'Lê Thị Staff B',
        email: 'staff2@smartparking.com',
        phone: '0900000003',
        password: hashedPassword,
        role: UserRole.STAFF,
        status: UserStatus.ACTIVE,
        mustChangePassword: false,
      },
    ]);
    logger.info(`✅ ${users.length} users created (password: ${defaultPassword})`);

    // ═══════════════════════════════════════════════════
    // 4. Seed Vehicle Types (5 loại)
    // ═══════════════════════════════════════════════════
    logger.info('🏍️ Seeding vehicle types...');
    const [motoType, car4Type, car7Type, bikeType, truckType] = await VehicleType.insertMany([
      {
        name: 'Xe Máy',
        code: 'MOTO',
        slotSize: SlotSize.SMALL,
        description: 'Xe máy, xe máy điện 2 bánh',
        icon: '🏍️',
      },
      {
        name: 'Ô tô 4-5 chỗ',
        code: 'CAR4',
        slotSize: SlotSize.MEDIUM,
        description: 'Xe con 4 đến 5 chỗ (sedan, hatchback, SUV nhỏ)',
        icon: '🚗',
      },
      {
        name: 'Ô tô 7+ chỗ',
        code: 'CAR7',
        slotSize: SlotSize.LARGE,
        description: 'Xe 7 chỗ trở lên (MPV, SUV lớn, pickup)',
        icon: '🚙',
      },
      {
        name: 'Xe Đạp',
        code: 'BIKE',
        slotSize: SlotSize.SMALL,
        description: 'Xe đạp, xe đạp điện',
        icon: '🚲',
      },
      {
        name: 'Xe Tải nhẹ',
        code: 'TRUCK',
        slotSize: SlotSize.LARGE,
        description: 'Xe tải nhẹ dưới 2.5 tấn',
        icon: '🚛',
      },
    ]);
    logger.info(`✅ 5 vehicle types created`);

    // ═══════════════════════════════════════════════════
    // 5. Seed Parking Facilities (2 bãi xe)
    // ═══════════════════════════════════════════════════
    logger.info('🏢 Seeding facilities...');
    const facility1 = await ParkingFacility.create({
      name: 'Central Hub Parking',
      address: '123 Main Street, District 1, HCMC',
      totalFloors: 3,
      openTime: '00:00',
      closeTime: '23:59',
      description: 'Bãi xe trung tâm thương mại, 3 tầng, phục vụ xe máy + ô tô',
      status: FacilityStatus.ACTIVE,
    });

    const facility2 = await ParkingFacility.create({
      name: 'Sunrise Tower Parking',
      address: '456 Sunrise Avenue, District 2, HCMC',
      totalFloors: 2,
      openTime: '06:00',
      closeTime: '22:00',
      description: 'Bãi xe tòa nhà văn phòng, 2 tầng',
      status: FacilityStatus.ACTIVE,
    });
    logger.info(`✅ 2 facilities created`);

    // ═══════════════════════════════════════════════════
    // 6. Seed Floors (5 tầng)
    // ═══════════════════════════════════════════════════
    logger.info('🏗️ Seeding floors...');
    const floor1 = await Floor.create({
      facilityId: facility1._id,
      name: 'Tầng B1 (Ô tô 4 chỗ)',
      allowedVehicleTypes: [car4Type._id],
      totalSlots: 0,
    });

    const floor2 = await Floor.create({
      facilityId: facility1._id,
      name: 'Tầng B2 (Ô tô 7 chỗ)',
      allowedVehicleTypes: [car7Type._id],
      totalSlots: 0,
    });

    const floor3 = await Floor.create({
      facilityId: facility1._id,
      name: 'Tầng 1 (Xe máy)',
      allowedVehicleTypes: [motoType._id, bikeType._id],
      totalSlots: 0,
    });

    const floor4 = await Floor.create({
      facilityId: facility2._id,
      name: 'Tầng 1 (Xe máy + Xe đạp)',
      allowedVehicleTypes: [motoType._id, bikeType._id],
      totalSlots: 0,
    });

    const floor5 = await Floor.create({
      facilityId: facility2._id,
      name: 'Tầng 2 (Ô tô)',
      allowedVehicleTypes: [car4Type._id, car7Type._id],
      totalSlots: 0,
    });
    logger.info(`✅ 5 floors created`);

    // ═══════════════════════════════════════════════════
    // 7. Seed Parking Slots (5 slot mỗi tầng = 25 tổng)
    // ═══════════════════════════════════════════════════
    logger.info('🅿️ Seeding parking slots...');

    const slotConfigs = [
      { floor: floor1, prefix: 'B1', vehicleTypeId: car4Type._id, facilityId: facility1._id },
      { floor: floor2, prefix: 'B2', vehicleTypeId: car7Type._id, facilityId: facility1._id },
      { floor: floor3, prefix: 'M1', vehicleTypeId: motoType._id, facilityId: facility1._id },
      { floor: floor4, prefix: 'S1', vehicleTypeId: motoType._id, facilityId: facility2._id },
      { floor: floor5, prefix: 'S2', vehicleTypeId: car4Type._id, facilityId: facility2._id },
    ];

    for (const config of slotConfigs) {
      const slots = [];
      for (let i = 1; i <= 5; i++) {
        slots.push({
          code: `${config.prefix}-${i.toString().padStart(3, '0')}`,
          floorId: config.floor._id,
          facilityId: config.facilityId,
          vehicleTypeId: config.vehicleTypeId,
          status: SlotStatus.AVAILABLE,
        });
      }
      await ParkingSlot.insertMany(slots);

      // Update floor totalSlots
      await Floor.findByIdAndUpdate(config.floor._id, { totalSlots: 5 });
    }
    logger.info(`✅ 25 parking slots created (5 per floor)`);

    // ═══════════════════════════════════════════════════
    // 8. Seed Pricing Plans (5 bảng giá)
    // ═══════════════════════════════════════════════════
    logger.info('💰 Seeding pricing plans...');
    await PricingPlan.insertMany([
      {
        name: 'Xe Máy - Theo giờ',
        vehicleTypeId: motoType._id,
        facilityId: facility1._id,
        feeType: FeeType.HOURLY,
        rates: [
          { label: 'Giờ đầu', amount: 5000, unit: 'VND' },
          { label: 'Giờ tiếp theo', amount: 3000, unit: 'VND/giờ' },
        ],
        overnightFee: 10000,
        overtimeFeePerHour: 5000,
        lostCardFee: 50000,
        status: 'active',
      },
      {
        name: 'Xe Máy - Theo lượt',
        vehicleTypeId: motoType._id,
        facilityId: facility2._id,
        feeType: FeeType.PER_TURN,
        rates: [{ label: 'Phí lượt', amount: 5000, unit: 'VND/lượt' }],
        overnightFee: 10000,
        overtimeFeePerHour: 0,
        lostCardFee: 50000,
        status: 'active',
      },
      {
        name: 'Ô tô 4 chỗ - Theo giờ',
        vehicleTypeId: car4Type._id,
        facilityId: facility1._id,
        feeType: FeeType.HOURLY,
        rates: [
          { label: 'Giờ đầu', amount: 20000, unit: 'VND' },
          { label: 'Giờ tiếp theo', amount: 10000, unit: 'VND/giờ' },
        ],
        overnightFee: 50000,
        overtimeFeePerHour: 15000,
        lostCardFee: 200000,
        status: 'active',
      },
      {
        name: 'Ô tô 7 chỗ - Theo giờ',
        vehicleTypeId: car7Type._id,
        facilityId: facility1._id,
        feeType: FeeType.HOURLY,
        rates: [
          { label: 'Giờ đầu', amount: 30000, unit: 'VND' },
          { label: 'Giờ tiếp theo', amount: 15000, unit: 'VND/giờ' },
        ],
        overnightFee: 80000,
        overtimeFeePerHour: 20000,
        lostCardFee: 300000,
        status: 'active',
      },
      {
        name: 'Xe Đạp - Theo lượt',
        vehicleTypeId: bikeType._id,
        facilityId: facility1._id,
        feeType: FeeType.PER_TURN,
        rates: [{ label: 'Phí lượt', amount: 2000, unit: 'VND/lượt' }],
        overnightFee: 5000,
        overtimeFeePerHour: 0,
        lostCardFee: 20000,
        status: 'active',
      },
    ]);
    logger.info(`✅ 5 pricing plans created`);

    // ═══════════════════════════════════════════════════
    // Done
    // ═══════════════════════════════════════════════════
    logger.info('');
    logger.info('🎉 Database seeding completed successfully!');
    logger.info('────────────────────────────────────────');
    logger.info('📊 Summary:');
    logger.info('  • 3 Roles (admin, manager, staff)');
    logger.info('  • 4 Users (admin, manager, 2 staff)');
    logger.info('  • 5 Vehicle Types (moto, car4, car7, bike, truck)');
    logger.info('  • 2 Facilities');
    logger.info('  • 5 Floors');
    logger.info('  • 25 Slots (5 per floor)');
    logger.info('  • 5 Pricing Plans');
    logger.info('────────────────────────────────────────');
    logger.info(`🔐 Login credentials: any email / ${defaultPassword}`);
    logger.info('');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
