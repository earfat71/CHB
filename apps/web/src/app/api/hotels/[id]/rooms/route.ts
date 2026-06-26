import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../_mock/auth';
import { DEMO_HOTELS } from '../../../_mock/data';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const hotel = DEMO_HOTELS.find((h) => h.id === params.id);
  if (!hotel) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(hotel.rooms ?? []);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const hotel = DEMO_HOTELS.find((h) => h.id === params.id);
  if (!hotel) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const newRoom = {
    id: `room_${Date.now()}`,
    hotelId: hotel.id,
    name: body.name,
    type: body.type ?? 'STANDARD',
    description: body.description ?? '',
    basePriceBdt: Number(body.basePriceBdt),
    maxGuests: Number(body.maxGuests ?? 2),
    totalUnits: Number(body.totalUnits ?? 1),
    photos: Array.isArray(body.photos) ? body.photos : [],
    amenities: Array.isArray(body.amenities) ? body.amenities : [],
    isActive: true,
    discountType: body.discountType ?? 'NONE',
    discountValue: Number(body.discountValue ?? 0),
    discountLabel: body.discountLabel ?? '',
  };

  if (!hotel.rooms) (hotel as unknown as { rooms: typeof newRoom[] }).rooms = [];
  (hotel.rooms as typeof newRoom[]).push(newRoom);
  if (hotel._count) hotel._count.rooms = hotel.rooms!.length;

  return NextResponse.json(newRoom, { status: 201 });
}
