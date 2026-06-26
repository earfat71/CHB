import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../_mock/auth';
import { DEMO_BOOKINGS } from '../../../_mock/data';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const booking = (DEMO_BOOKINGS as any[]).find((b) => b.id === params.id);
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  if (booking.userId !== user.id && !['ADMIN', 'MANAGER'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!['PENDING_PAYMENT', 'CONFIRMED'].includes(booking.status)) {
    return NextResponse.json({ error: 'Only pending or confirmed bookings can be cancelled' }, { status: 400 });
  }

  booking.status = 'CANCELLED';

  return NextResponse.json({ success: true, booking });
}
