import { Router } from 'express';
import * as ctrl from './settlement.controller';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';

const router = Router();

router.post('/hotels/trigger', authenticate, requireAdmin, ctrl.triggerHotelSettlement);
router.post('/agents/trigger', authenticate, requireAdmin, ctrl.triggerAgentSettlement);
router.get('/hotels', authenticate, requireAdmin, ctrl.listHotelSettlements);
router.get('/agents', authenticate, requireAdmin, ctrl.listAgentSettlements);
router.get('/report/:settlementId', authenticate, requireAdmin, ctrl.getSettlementReport);

export default router;
