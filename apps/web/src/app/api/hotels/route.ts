import { NextResponse } from 'next/server';
import { DEMO_HOTELS } from '../_mock/data';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  if (status) return NextResponse.json(DEMO_HOTELS.filter((h) => h.status === status));
  return NextResponse.json(DEMO_HOTELS.filter((h) => h.status === 'APPROVED'));
}
