import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../_mock/auth';

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Return empty bookings list in demo mode
  return NextResponse.json([]);
}
