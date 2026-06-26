import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../_mock/auth';
import { DEMO_AGENTS } from '../../../_mock/data';

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const agent = DEMO_AGENTS.find((a) => a.userId === user.id);
  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    totalEarned: agent.totalCommissionBdt,
    pendingCommissionBdt: agent.pendingCommissionBdt,
    totalBookings: agent.totalBookings,
  });
}
