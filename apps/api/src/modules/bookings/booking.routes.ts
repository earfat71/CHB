import { Router } from 'express';
import * as ctrl from './booking.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/hold', authenticate, ctrl.holdBooking);
router.post('/', authenticate, ctrl.createBooking);
router.get('/my', authenticate, ctrl.myBookings);
router.get('/:id', authenticate, ctrl.getBooking);
router.post('/:id/cancel', authenticate, ctrl.cancelBooking);
router.patch('/:id/status', authenticate, ctrl.updateStatus);

export default router;
