import { NextResponse } from 'next/server';
import { DEMO_USERS } from '../../_mock/data';
import { makeToken, userResponse } from '../../_mock/auth';

export async function POST(req: Request) {
  const { phone, name, email } = await req.json();
  const existing = DEMO_USERS.find((u) => u.phone === phone);
  if (existing) return NextResponse.json({ error: 'Phone already registered' }, { status: 409 });
  const user = { id: `usr_${Date.now()}`, phone, name: name || 'New User', email: email || '', role: 'CUSTOMER', password: '', status: 'ACTIVE', createdAt: new Date().toISOString() };
  return NextResponse.json({ token: makeToken(user), user: userResponse(user) });
}
