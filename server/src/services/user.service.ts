import bcrypt from 'bcryptjs';
import { User, IUser, UserStatus } from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';

export class UserService {
  static async createUser(data: Partial<IUser>): Promise<IUser> {
    const existingUser = await User.findOne({ $or: [{ email: data.email }, { phone: data.phone }] });
    if (existingUser) {
      throw new AppError('Email or phone already in use', 400);
    }

    let password = data.password;
    if (!password) {
      // Generate a temporary password if not provided
      password = Math.random().toString(36).slice(-8);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password as string, salt);

    const newUser = new User({
      ...data,
      password: hashedPassword,
    });

    await newUser.save();
    return newUser;
  }

  static async updateUser(userId: string, data: Partial<IUser>): Promise<IUser | null> {
    // Prevent updating critical fields directly
    delete data.password;
    delete data.role;
    delete data.status;

    const updatedUser = await User.findByIdAndUpdate(userId, data, { new: true, runValidators: true });
    if (!updatedUser) {
      throw new AppError('User not found', 404);
    }
    return updatedUser;
  }

  static async getUserById(userId: string): Promise<IUser | null> {
    const user = await User.findById(userId)
      .populate('assignedFacilities', 'name address status openTime closeTime');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  /** GET /users/me — Lấy profile của chính mình (Staff dùng để lấy danh sách facility) */
  static async getMe(userId: string): Promise<IUser | null> {
    const user = await User.findById(userId)
      .select('-password -customPermissions -failedLoginAttempts -lockedUntil')
      .populate('assignedFacilities', 'name address status openTime closeTime');
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  /** PATCH /users/:id/assign-facilities — Manager phân công tòa nhà cho Staff */
  static async assignFacilities(targetUserId: string, facilityIds: string[]): Promise<IUser | null> {
    const user = await User.findById(targetUserId);
    if (!user) throw new AppError('User not found', 404);
    if (user.isDeleted) throw new AppError('User has been deleted', 400);

    const updated = await User.findByIdAndUpdate(
      targetUserId,
      { assignedFacilities: facilityIds },
      { new: true, runValidators: true }
    ).populate('assignedFacilities', 'name address status openTime closeTime');

    return updated;
  }

  static async getAllUsers(filters: any = {}, skip = 0, limit = 10): Promise<{ users: IUser[]; total: number }> {
    const query = { isDeleted: false, ...filters };
    const users = await User.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await User.countDocuments(query);
    return { users, total };
  }

  static async lockUser(userId: string): Promise<IUser | null> {
    const user = await User.findByIdAndUpdate(userId, { status: UserStatus.LOCKED }, { new: true });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  static async unlockUser(userId: string): Promise<IUser | null> {
    const user = await User.findByIdAndUpdate(userId, { status: UserStatus.ACTIVE, failedLoginAttempts: 0, lockedUntil: null }, { new: true });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  static async softDeleteUser(userId: string): Promise<IUser | null> {
    const user = await User.findByIdAndUpdate(userId, { isDeleted: true, status: UserStatus.INACTIVE }, { new: true });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  static async resetPassword(userId: string, newPassword: string): Promise<IUser | null> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    const user = await User.findByIdAndUpdate(userId, { 
      password: hashedPassword,
      mustChangePassword: true,
      failedLoginAttempts: 0,
      lockedUntil: null
    }, { new: true });

    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
}
