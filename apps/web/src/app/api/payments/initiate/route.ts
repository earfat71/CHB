import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../_mock/auth';
import { DEMO_BOOKINGS } from '../../_mock/data';

const GATEWAY_NUMBERS: Record<string, string> = {
  BKASH: '01700-000001',
  NAGAD: '01700-000002',
  ROCKET: '01700-000003',
};

export async function POST(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { bookingId, gateway } = await req.json();
  if (!bookingId || !gateway) {
    return NextResponse.json({ error: 'bookingId and gateway are required' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const booking = (DEMO_BOOKINGS as any[]).find((b) => b.id === bookingId);
  if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

  if (booking.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (booking.status !== 'PENDING_PAYMENT') {
    return NextResponse.json({ error: 'Booking is not pending payment' }, { status: 400 });
  }

  const paymentId = `pay_${Date.now()}`;
  const txnRef = `SANDBOX-${gateway.substring(0, 3)}-${paymentId.slice(-8)}`;

  let instructions: string;
  if (gateway === 'SSLCOMMERZ') {
    instructions = `Test card: 4111 1111 1111 1111 | Expiry: 12/25 | CVV: 123 | Name: Test User`;
  } else {
    const num = GATEWAY_NUMBERS[gateway] ?? '01700-000000';
    instructions = `Open ${gateway} app → Send Money → Number: ${num} → Amount: ৳${booking.grandTotalBdt.toLocaleString()} → Reference: ${txnRef}`;
  }

  return NextResponse.json({
    paymentId,
    gateway,
    amountBdt: booking.grandTotalBdt,
    redirectUrl: `/booking/checkout?bookingId=${bookingId}`,
    instructions,
    sandboxInstructions: { ref: txnRef },
  });
}
