import { NextResponse } from 'next/server';
import { DEMO_AGENTS } from '../../_mock/data';

export async function POST(req: Request) {
  const body = await req.json();
  const { agentCode } = body;

  const agent = DEMO_AGENTS.find((a) => a.agentCode === agentCode);
  if (!agent) {
    return NextResponse.json({ error: 'Invalid or expired agent link' }, { status: 404 });
  }

  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  return NextResponse.json({ sessionId, agentName: agent.name });
}
