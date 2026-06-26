import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../_mock/auth';
import { DEMO_HOTELS } from '../../../_mock/data';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const hotel = DEMO_HOTELS.find((h) => h.id === params.id);
  if (!hotel) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  hotel.status = 'REJECTED';
  return NextResponse.json(hotel);
}
