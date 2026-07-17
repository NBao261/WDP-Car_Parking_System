import { SystemConfig, ISystemConfig } from '../models/systemConfig.model';
import { AuditLog } from '../models/auditLog.model';
import { AppError } from '../middlewares/error.middleware';

export class ConfigService {
  static async getConfig(key: string): Promise<ISystemConfig | null> {
    const config = await SystemConfig.findOne({ key }).lean() as ISystemConfig | null;
    if (!config) {
      throw new AppError('Config not found', 404);
    }
    return config;
  }

  static async getAllConfigs(): Promise<ISystemConfig[]> {
    return SystemConfig.find().lean() as any;
  }

  static async updateConfig(key: string, value: any, userId: string): Promise<ISystemConfig | null> {
    const config = await SystemConfig.findOneAndUpdate(
      { key },
      { value, updatedBy: userId },
      { new: true, upsert: true, runValidators: true }
    );
    return config;
  }

  static async getAuditLogs(filters: any = {}, skip = 0, limit = 50) {
    const logs = await AuditLog.find(filters)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email role')
      .lean();
    const total = await AuditLog.countDocuments(filters);
    return { logs, total };
  }
}
