import { Router } from 'express';
import * as ctrl from './payment.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/initiate', authenticate, ctrl.initiatePayment);
router.post('/webhook/bkash', ctrl.bkashWebhook);
router.post('/webhook/nagad', ctrl.nagadWebhook);
router.post('/webhook/sslcommerz', ctrl.sslcommerzWebhook);
router.get('/status/:bookingId', authenticate, ctrl.getPaymentStatus);
router.post('/refund/:bookingId', authenticate, ctrl.refundPayment);

export default router;
