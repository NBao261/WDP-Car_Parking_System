import { Router } from 'express';
import { ConfigController } from '../controllers/config.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';
import { validate } from '../middlewares/validate.middleware';
import { updateConfigSchema, getConfigSchema, getAuditLogsSchema } from '../validations/config.validation';

const router = Router();

router.use(verifyToken);
router.use(checkRole([UserRole.ADMIN]));

router.get('/', ConfigController.getAllConfigs);
router.get('/logs', validate(getAuditLogsSchema), ConfigController.getAuditLogs);
router.get('/:key', validate(getConfigSchema), ConfigController.getConfig);
router.put('/:key', validate(updateConfigSchema), ConfigController.updateConfig);

export default router;
