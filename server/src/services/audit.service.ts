import { AuditLog } from '../models/auditLog.model';
import { logger } from '../config/logger';

export class AuditService {
  static async log(data: {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    changes?: any;
    ipAddress?: string;
  }) {
    try {
      await AuditLog.create({
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        changes: data.changes || {},
        ipAddress: data.ipAddress || '',
        result: 'success'
      });
    } catch (error) {
      logger.error('Failed to create audit log', error);
    }
  }
}
