import { NextResponse } from 'next/server';
import { DEMO_HOTELS } from '../../_mock/data';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const hotel = DEMO_HOTELS.find((h) => h.id === params.id || h.slug === params.id);
  if (!hotel) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
  return NextResponse.json(hotel);
}
