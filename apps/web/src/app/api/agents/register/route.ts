import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../_mock/auth';
import { DEMO_AGENTS } from '../../_mock/data';

export async function POST(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const existing = DEMO_AGENTS.find((a) => a.userId === user.id);
  if (existing) return NextResponse.json({ error: 'Already registered as agent' }, { status: 409 });

  const body = await req.json();
  const newAgent = {
    id: `ag_${Date.now()}`,
    userId: user.id,
    agentCode: `AG-${String(DEMO_AGENTS.length + 1).padStart(3, '0')}`,
    name: user.name,
    phone: user.phone,
    nidLast4: `****${String(body.nid || '0000').slice(-4)}`,
    totalBookings: 0,
    totalCommissionBdt: 0,
    pendingCommissionBdt: 0,
    status: 'PENDING',
    joinedAt: new Date().toISOString(),
  };
  DEMO_AGENTS.push(newAgent);
  return NextResponse.json({ success: true, agentCode: newAgent.agentCode });
}
