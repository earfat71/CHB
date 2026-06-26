import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import * as ctrl from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many attempts' } });

router.post('/send-otp', authLimiter, ctrl.sendOtp);
router.post('/verify-otp', authLimiter, ctrl.verifyOtp);
router.post('/register', ctrl.register);
router.post('/login', authLimiter, ctrl.login);
router.post('/logout', authenticate, ctrl.logout);
router.get('/me', authenticate, ctrl.me);
router.patch('/me', authenticate, ctrl.updateProfile);

export default router;
