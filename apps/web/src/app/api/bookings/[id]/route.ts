import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../_mock/auth';
import { DEMO_BOOKINGS, DEMO_HOTELS } from '../../_mock/data';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const booking = (DEMO_BOOKINGS as any[]).find((b) => b.id === params.id);
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  if (booking.userId !== user.id && !['ADMIN', 'MANAGER'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const hotel = (DEMO_HOTELS as any[]).find((h: any) => h.id === booking.hotelId);
  return NextResponse.json({ ...booking, hotel });
}
