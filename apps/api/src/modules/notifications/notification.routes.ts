import { Router } from 'express';
import * as ctrl from './notification.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.get('/my', authenticate, ctrl.myNotifications);
router.patch('/:id/read', authenticate, ctrl.markRead);

export default router;
