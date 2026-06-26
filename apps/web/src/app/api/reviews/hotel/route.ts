import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../_mock/auth';
import { DEMO_REVIEWS, DEMO_HOTELS } from '../../_mock/data';

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const myHotelNames = DEMO_HOTELS.map((h) => h.name);
  const reviews = DEMO_REVIEWS.filter((r) => myHotelNames.includes(r.hotel.name));

  return NextResponse.json(reviews);
}
