import { Role, IRole } from '../models/role.model';
import { User } from '../models/user.model';
import { AppError } from '../middlewares/error.middleware';

export class RoleService {
  static async getAllRoles(): Promise<IRole[]> {
    return await Role.find();
  }

  static async createRole(data: Partial<IRole>): Promise<IRole> {
    const role = new Role(data);
    await role.save();
    return role;
  }

  static async updatePermissions(id: string, permissions: string[]): Promise<IRole | null> {
    const role = await Role.findByIdAndUpdate(id, { permissions }, { new: true });
    if (!role) throw new AppError('Role not found', 404);
    return role;
  }

  static async assignRole(userId: string, roleCode: string, customPermissions?: string[]) {
    const role = await Role.findOne({ code: roleCode });
    if (!role) throw new AppError('Role not found', 404);

    const updateData: any = { role: roleCode };
    if (customPermissions !== undefined) {
      updateData.customPermissions = customPermissions;
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
    if (!user) throw new AppError('User not found', 404);

    return user;
  }
}
