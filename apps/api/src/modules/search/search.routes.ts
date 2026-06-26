import { Router } from 'express';
import * as ctrl from './search.controller';

const router = Router();

router.get('/', ctrl.search);
router.get('/availability/:roomId', ctrl.checkAvailability);

export default router;
