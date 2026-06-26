import { Router } from 'express';
import * as ctrl from './review.controller';
import { authenticate, requireAdmin } from '../../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, ctrl.createReview);
router.get('/hotel/:hotelId', ctrl.getHotelReviews);
router.patch('/:id/approve', authenticate, requireAdmin, ctrl.approveReview);
router.patch('/:id/reject', authenticate, requireAdmin, ctrl.rejectReview);
router.get('/pending', authenticate, requireAdmin, ctrl.pendingReviews);

export default router;
