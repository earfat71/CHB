import { calculatePrice } from '../modules/pricing/pricing.service';

jest.mock('../lib/prisma', () => ({
  prisma: {
    platformConfig: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
  },
}));

describe('Pricing Engine', () => {
  test('base 5000/night × 1 night with agent → 6400 total', async () => {
    const breakdown = await calculatePrice(5000, 1, true);
    expect(breakdown.baseTotalBdt).toBe(5000);
    expect(breakdown.vatBdt).toBe(750);       // 15% of 5000
    expect(breakdown.platformFeeBdt).toBe(250); // 5% of 5000
    expect(breakdown.agentCommBdt).toBe(400);   // 8% of 5000
    expect(breakdown.grandTotalBdt).toBe(6400);
  });

  test('without agent no commission charged', async () => {
    const breakdown = await calculatePrice(5000, 1, false);
    expect(breakdown.agentCommBdt).toBe(0);
    expect(breakdown.grandTotalBdt).toBe(6000); // 5000 + 750 + 250
  });

  test('multi-night calculation scales linearly', async () => {
    const breakdown = await calculatePrice(5000, 3, true);
    expect(breakdown.baseTotalBdt).toBe(15000);
    expect(breakdown.grandTotalBdt).toBe(19200); // 15000 × (1 + 0.15 + 0.05 + 0.08)
  });

  test('returns rate breakdown', async () => {
    const breakdown = await calculatePrice(5000, 1, true);
    expect(breakdown.rates.vatRate).toBe(0.15);
    expect(breakdown.rates.platformFeeRate).toBe(0.05);
    expect(breakdown.rates.agentCommRate).toBe(0.08);
  });
});
