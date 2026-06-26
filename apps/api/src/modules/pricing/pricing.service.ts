import { prisma } from '../../lib/prisma';

export interface PriceBreakdown {
  baseTotalBdt: number;
  platformFeeBdt: number;
  agentCommBdt: number;
  vatBdt: number;
  grandTotalBdt: number;
  nights: number;
  pricePerNight: number;
  rates: {
    vatRate: number;
    platformFeeRate: number;
    agentCommRate: number;
  };
}

async function getRate(key: string, defaultVal: number): Promise<number> {
  const config = await prisma.platformConfig.findUnique({ where: { key } });
  return config ? parseFloat(config.value) : defaultVal;
}

export async function calculatePrice(
  basePricePerNight: number,
  nights: number,
  hasAgent = false
): Promise<PriceBreakdown> {
  const vatRate = await getRate('VAT_RATE', 0.15);
  const platformFeeRate = await getRate('PLATFORM_FEE_RATE', 0.05);
  const agentCommRate = hasAgent ? await getRate('AGENT_COMMISSION_RATE', 0.08) : 0;

  const baseTotal = basePricePerNight * nights;
  const platformFee = Math.round(baseTotal * platformFeeRate);
  const agentComm = Math.round(baseTotal * agentCommRate);
  const vat = Math.round(baseTotal * vatRate);
  const grandTotal = baseTotal + platformFee + agentComm + vat;

  return {
    baseTotalBdt: baseTotal,
    platformFeeBdt: platformFee,
    agentCommBdt: agentComm,
    vatBdt: vat,
    grandTotalBdt: grandTotal,
    nights,
    pricePerNight: basePricePerNight,
    rates: { vatRate, platformFeeRate, agentCommRate },
  };
}

// Example from plan: base 5000/night × 1 night → 6400 total
// 5000 + 750 (VAT 15%) + 250 (platform 5%) + 400 (agent 8%) = 6400
