import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../_mock/auth';
import { DEMO_CONFIGS } from '../../../_mock/data';

export async function PATCH(req: Request, { params }: { params: { key: string } }) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { value } = await req.json();
  const config = DEMO_CONFIGS.find((c) => c.key === params.key);
  if (!config) return NextResponse.json({ error: 'Config not found' }, { status: 404 });
  config.value = value;
  return NextResponse.json(config);
}
