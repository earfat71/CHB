import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../_mock/auth';
import { DEMO_HOTELS } from '../../_mock/data';

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const hotels = status ? DEMO_HOTELS.filter((h) => h.status === status) : DEMO_HOTELS;
  return NextResponse.json(hotels);
}
