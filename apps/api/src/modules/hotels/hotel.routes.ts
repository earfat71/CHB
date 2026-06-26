import { Router } from 'express';
import * as ctrl from './hotel.controller';
import { authenticate, requireAdmin, requireManager } from '../../middleware/auth.middleware';

const router = Router();

router.get('/', ctrl.listHotels);
router.get('/:id', ctrl.getHotel);
router.post('/', authenticate, requireManager, ctrl.createHotel);
router.patch('/:id', authenticate, requireManager, ctrl.updateHotel);
router.post('/:id/approve', authenticate, requireAdmin, ctrl.approveHotel);
router.post('/:id/suspend', authenticate, requireAdmin, ctrl.suspendHotel);
router.post('/:id/photos', authenticate, requireManager, ctrl.uploadPhotos);

export default router;
