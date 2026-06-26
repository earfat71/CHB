import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../_mock/auth';
import { DEMO_HOTELS, DEMO_BOOKINGS, DEMO_USERS, DEMO_AGENTS, DEMO_REVIEWS } from '../../_mock/data';

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const confirmed = DEMO_BOOKINGS.filter((b) => b.status === 'CONFIRMED' || b.status === 'CHECKED_OUT');
  return NextResponse.json({
    totalHotels: DEMO_HOTELS.filter((h) => h.status === 'APPROVED').length,
    totalBookings: DEMO_BOOKINGS.length,
    confirmedBookings: confirmed.length,
    totalRevenueBdt: confirmed.reduce((s, b) => s + b.grandTotalBdt, 0),
    totalUsers: DEMO_USERS.length,
    totalAgents: DEMO_AGENTS.length,
    pendingReviews: DEMO_REVIEWS.filter((r) => r.status === 'PENDING').length,
    pendingHotels: DEMO_HOTELS.filter((h) => h.status === 'PENDING_APPROVAL').length,
  });
}
