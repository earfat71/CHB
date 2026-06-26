import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../_mock/auth';

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json({
    totalHotels: 3, totalBookings: 247, confirmedBookings: 198,
    totalRevenueBdt: 1587400, totalUsers: 412, totalAgents: 28,
    pendingReviews: 5, pendingHotels: 2,
  });
}
