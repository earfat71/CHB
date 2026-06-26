import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../_mock/auth';
import { DEMO_HOTELS } from '../_mock/data';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  if (status) return NextResponse.json(DEMO_HOTELS.filter((h) => h.status === status));
  return NextResponse.json(DEMO_HOTELS.filter((h) => h.status === 'APPROVED'));
}

export async function POST(req: Request) {
  const user = getUserFromRequest(req);
  if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json();
  const newHotel = {
    id: `hotel_${Date.now()}`,
    slug: (body.name as string).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    name: body.name,
    description: body.description,
    address: body.address,
    city: "Cox's Bazar",
    starRating: body.starRating ? `${body.starRating}_STAR` : 'THREE_STAR',
    amenities: Array.isArray(body.amenities) ? body.amenities : [],
    photos: [],
    status: 'PENDING_APPROVAL',
    checkInTime: body.checkInTime || '14:00',
    checkOutTime: body.checkOutTime || '12:00',
    avgRating: 0,
    _count: { reviews: 0, rooms: 0 },
    reviews: [],
    rooms: [],
  };
  DEMO_HOTELS.push(newHotel as typeof DEMO_HOTELS[0]);
  return NextResponse.json(newHotel, { status: 201 });
}
