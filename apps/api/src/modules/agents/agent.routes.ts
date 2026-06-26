import { Router } from 'express';
import * as ctrl from './agent.controller';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';

const router = Router();

router.post('/register', authenticate, ctrl.registerAgent);
router.get('/qr/:agentCode', ctrl.getAgentQR);
router.get('/track/:sessionId', ctrl.trackAttribution);
router.post('/attribute', ctrl.createAttribution);
router.get('/my', authenticate, ctrl.myAgentProfile);
router.get('/my/earnings', authenticate, ctrl.myEarnings);
router.get('/', authenticate, requireAdmin, ctrl.listAgents);
router.patch('/:id/approve', authenticate, requireAdmin, ctrl.approveAgent);
router.patch('/:id/suspend', authenticate, requireAdmin, ctrl.suspendAgent);

export default router;
