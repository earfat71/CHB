import { NextResponse } from 'next/server';
import { DEMO_USERS } from '../../_mock/data';
import { makeToken, userResponse } from '../../_mock/auth';

export async function POST(req: Request) {
  const { phone, password } = await req.json();
  const user = DEMO_USERS.find((u) => u.phone === phone && u.password === password);
  if (!user) return NextResponse.json({ error: 'Invalid phone or password' }, { status: 401 });
  return NextResponse.json({ token: makeToken(user), user: userResponse(user) });
}
