import { Router } from 'express';
import * as ctrl from './room.controller';
import { authenticate, requireManager } from '../../middleware/auth.middleware';

const router = Router();

router.get('/hotel/:hotelId', ctrl.listRooms);
router.get('/:id', ctrl.getRoom);
router.post('/', authenticate, requireManager, ctrl.createRoom);
router.patch('/:id', authenticate, requireManager, ctrl.updateRoom);
router.delete('/:id', authenticate, requireManager, ctrl.deactivateRoom);
router.get('/:id/availability', ctrl.getRoomAvailability);
router.patch('/:id/price', authenticate, requireManager, ctrl.updateRoomPrice);

export default router;
