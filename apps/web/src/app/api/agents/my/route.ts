import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../_mock/auth';
import { DEMO_AGENTS, DEMO_BOOKINGS } from '../../_mock/data';

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const agent = DEMO_AGENTS.find((a) => a.userId === user.id);
  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const myBookings = DEMO_BOOKINGS.filter((b) => b.agentCommBdt > 0);
  const qrUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/t/${agent.agentCode}`;

  return NextResponse.json({
    agentCode: agent.agentCode,
    status: agent.status,
    walletBalance: agent.pendingCommissionBdt,
    availableBalance: agent.totalCommissionBdt - agent.pendingCommissionBdt,
    pendingBalance: agent.pendingCommissionBdt,
    commissionRate: 0.05,
    totalEarned: agent.totalCommissionBdt,
    totalBookings: agent.totalBookings,
    qrCodeUrl: null,
    qrToken: agent.agentCode,
    attributionWindowHours: 24,
    attributions: myBookings.map((b) => ({
      sessionId: `sess_${b.id}`,
      booking: {
        bookingRef: b.bookingRef,
        grandTotalBdt: b.grandTotalBdt,
        agentCommBdt: b.agentCommBdt,
        status: b.status,
        createdAt: b.createdAt,
        hotel: b.hotel,
      },
    })),
  });
}
