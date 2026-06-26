import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../_mock/auth';
import { DEMO_CONFIGS } from '../../_mock/data';

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json(DEMO_CONFIGS);
}
