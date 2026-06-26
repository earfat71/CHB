import { NextResponse } from 'next/server';
import { calcPricing } from '../../_mock/data';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const base = Number(searchParams.get('basePricePerNight') || 5000);
  const nights = Number(searchParams.get('nights') || 1);
  const hasAgent = searchParams.get('hasAgent') === 'true';
  return NextResponse.json(calcPricing(base, nights, hasAgent));
}
