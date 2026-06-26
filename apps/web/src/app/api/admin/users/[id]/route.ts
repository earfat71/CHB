import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../_mock/auth';
import { DEMO_USERS } from '../../../_mock/data';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = getUserFromRequest(req);
  if (!admin || admin.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const user = DEMO_USERS.find((u) => u.id === params.id);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (body.status) user.status = body.status;
  const { password: _pw, ...safe } = user;
  return NextResponse.json(safe);
}
