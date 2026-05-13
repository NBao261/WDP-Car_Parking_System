import { Router } from 'express';
import { ConfigController } from '../controllers/config.controller';
import { verifyToken, checkRole } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

router.use(verifyToken);
router.use(checkRole([UserRole.ADMIN]));

router.get('/', ConfigController.getAllConfigs);
router.get('/logs', ConfigController.getAuditLogs);
router.get('/:key', ConfigController.getConfig);
router.put('/:key', ConfigController.updateConfig);

export default router;
