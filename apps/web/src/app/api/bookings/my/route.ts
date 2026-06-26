import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../_mock/auth';
import { DEMO_BOOKINGS, DEMO_HOTELS } from '../../_mock/data';

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const bookings = DEMO_BOOKINGS
    .filter((b) => b.userId === user.id)
    .map((b) => ({
      ...b,
      hotel: DEMO_HOTELS.find((h) => h.id === b.hotelId),
    }));

  return NextResponse.json(bookings);
}
