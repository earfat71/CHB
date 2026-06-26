import { NextResponse } from 'next/server';
import { DEMO_BOOKINGS, DEMO_HOTELS } from '../../../_mock/data';

export async function POST(req: Request, { params }: { params: { gateway: string } }) {
  const body = await req.json();
  const { bookingId } = body;

  if (!bookingId) {
    return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const booking = (DEMO_BOOKINGS as any[]).find((b) => b.id === bookingId);
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  if (booking.status !== 'PENDING_PAYMENT') {
    return NextResponse.json({ error: 'Booking is not in PENDING_PAYMENT status' }, { status: 400 });
  }

  // Simulate payment confirmation — update booking to CONFIRMED
  booking.status = 'CONFIRMED';
  delete booking.holdExpiresAt;

  const hotel = (DEMO_HOTELS as any[]).find((h: any) => h.id === booking.hotelId);

  return NextResponse.json({
    success: true,
    gateway: params.gateway,
    booking: { ...booking, hotel },
  });
}
