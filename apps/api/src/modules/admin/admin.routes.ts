import { Router } from 'express';
import * as ctrl from './admin.controller';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/kpis', ctrl.getKPIs);
router.get('/config', ctrl.getConfig);
router.patch('/config/:key', ctrl.updateConfig);
router.get('/audit-log', ctrl.getAuditLog);
router.get('/users', ctrl.listUsers);
router.patch('/users/:id/role', ctrl.updateUserRole);
router.patch('/users/:id/status', ctrl.updateUserStatus);
router.get('/bookings', ctrl.listAllBookings);

export default router;
