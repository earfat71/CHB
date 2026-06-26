import { Router } from 'express';
import * as ctrl from './ledger.controller';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, requireAdmin, ctrl.listEntries);
router.get('/summary', authenticate, requireAdmin, ctrl.summary);
router.get('/booking/:bookingId', authenticate, ctrl.bookingEntries);

export default router;
