import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../_mock/auth';
import { DEMO_HOTELS } from '../../_mock/data';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const hotel = DEMO_HOTELS.find((h) => h.id === params.id || h.slug === params.id);
  if (!hotel) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });
  return NextResponse.json(hotel);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const hotel = DEMO_HOTELS.find((h) => h.id === params.id);
  if (!hotel) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const body = await req.json();
  if (body.photos !== undefined) hotel.photos = body.photos;
  if (body.name !== undefined) hotel.name = body.name;
  if (body.description !== undefined) hotel.description = body.description;
  if (body.amenities !== undefined) hotel.amenities = body.amenities;
  return NextResponse.json(hotel);
}
