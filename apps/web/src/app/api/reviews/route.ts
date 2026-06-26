import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../_mock/auth';
import { DEMO_REVIEWS, DEMO_BOOKINGS, DEMO_HOTELS } from '../_mock/data';

export async function POST(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { bookingId, rating, title, body } = await req.json();

  if (!bookingId || !rating || !body?.trim()) {
    return NextResponse.json({ error: 'bookingId, rating and body are required' }, { status: 400 });
  }

  const ratingNum = Number(rating);
  if (ratingNum < 1 || ratingNum > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const booking = (DEMO_BOOKINGS as any[]).find(
    (b) => b.id === bookingId && b.userId === user.id
  );
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  if (!['CONFIRMED', 'CHECKED_OUT'].includes(booking.status)) {
    return NextResponse.json({ error: 'You can only review confirmed or completed bookings' }, { status: 400 });
  }

  if (booking.review) {
    return NextResponse.json({ error: 'You have already reviewed this booking' }, { status: 409 });
  }

  const hotel = DEMO_HOTELS.find((h) => h.id === booking.hotelId);

  const review = {
    id: `rev_${Date.now()}`,
    rating: ratingNum,
    title: title?.trim() || '',
    body: body.trim(),
    status: 'PENDING',
    user: { name: user.name },
    hotel: { name: hotel?.name ?? '' },
    createdAt: new Date().toISOString(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (DEMO_REVIEWS as any[]).push(review);
  booking.review = review;

  return NextResponse.json(review, { status: 201 });
}
