import { Router, Request, Response } from 'express';
import { calculatePrice } from './pricing.service';

const router = Router();

router.get('/quote', async (req: Request, res: Response) => {
  const { basePricePerNight, nights, hasAgent } = req.query;
  if (!basePricePerNight || !nights) {
    return res.status(400).json({ error: 'basePricePerNight and nights required' });
  }
  const breakdown = await calculatePrice(
    Number(basePricePerNight),
    Number(nights),
    hasAgent === 'true'
  );
  return res.json(breakdown);
});

export default router;
