import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../_mock/auth';
import { DEMO_HOTELS, DEMO_BOOKINGS, DEMO_CONFIGS, calcPricing } from '../../_mock/data';

export async function POST(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { roomId, checkIn, checkOut, guestCount = 2, attributionSessionId } = await req.json();

  if (!roomId || !checkIn || !checkOut) {
    return NextResponse.json({ error: 'roomId, checkIn and checkOut are required' }, { status: 400 });
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || checkOutDate <= checkInDate) {
    return NextResponse.json({ error: 'Invalid dates' }, { status: 400 });
  }

  const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / 86400000));

  let foundRoom = null;
  let foundHotel = null;
  for (const hotel of DEMO_HOTELS) {
    const room = hotel.rooms?.find((r) => r.id === roomId && r.isActive !== false);
    if (room) { foundRoom = room; foundHotel = hotel; break; }
  }

  if (!foundRoom || !foundHotel) {
    return NextResponse.json({ error: 'Room not found or unavailable' }, { status: 404 });
  }

  const hasAgent = !!attributionSessionId;
  const pricing = calcPricing(foundRoom.basePriceBdt, nights, hasAgent);

  const holdMinutes = parseInt(DEMO_CONFIGS.find((c) => c.key === 'BOOKING_HOLD_MINUTES')?.value ?? '10');
  const holdExpiresAt = new Date(Date.now() + holdMinutes * 60 * 1000).toISOString();

  const bookingNum = DEMO_BOOKINGS.length + 1;
  const booking = {
    id: `bk_${Date.now()}`,
    bookingRef: `CBZ-2026-${String(bookingNum + 100).padStart(3, '0')}`,
    userId: user.id,
    hotelId: foundHotel.id,
    status: 'PENDING_PAYMENT',
    checkIn,
    checkOut,
    nights,
    guestCount: Number(guestCount),
    guestName: user.name,
    guestPhone: user.phone,
    guestEmail: user.email || '',
    baseTotalBdt: pricing.baseTotalBdt,
    platformFeeBdt: pricing.platformFeeBdt,
    agentCommBdt: pricing.agentCommBdt,
    vatBdt: pricing.vatBdt,
    grandTotalBdt: pricing.grandTotalBdt,
    holdExpiresAt,
    attributionSessionId: attributionSessionId || null,
    user: { name: user.name },
    hotel: { name: foundHotel.name },
    createdAt: new Date().toISOString(),
    review: null,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (DEMO_BOOKINGS as any[]).push(booking);

  return NextResponse.json({ booking, pricing, holdExpiresAt }, { status: 201 });
}
