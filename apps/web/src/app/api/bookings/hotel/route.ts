import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../_mock/auth';
import { DEMO_BOOKINGS, DEMO_HOTELS } from '../../_mock/data';

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const myHotelIds = user.role === 'ADMIN'
    ? DEMO_HOTELS.map((h) => h.id)
    : DEMO_HOTELS.filter(() => true).map((h) => h.id); // manager sees all for demo

  const bookings = DEMO_BOOKINGS.filter((b) => myHotelIds.includes(b.hotelId)).map((b) => ({
    ...b,
    hotel: DEMO_HOTELS.find((h) => h.id === b.hotelId),
  }));

  return NextResponse.json(bookings);
}
