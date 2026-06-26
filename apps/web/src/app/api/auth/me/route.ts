import { NextResponse } from 'next/server';
import { getUserFromRequest, userResponse } from '../../_mock/auth';

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(userResponse(user));
}

export async function PATCH(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, email } = await req.json();
  if (name && typeof name === 'string') user.name = name.trim();
  if (typeof email === 'string') user.email = email.trim();

  return NextResponse.json(userResponse(user));
}
