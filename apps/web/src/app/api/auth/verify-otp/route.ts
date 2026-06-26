import { NextResponse } from 'next/server';
import { DEMO_USERS } from '../../_mock/data';
import { makeToken, userResponse } from '../../_mock/auth';

export async function POST(req: Request) {
  const { phone, otp } = await req.json();
  if (otp !== '123456') return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
  let user = DEMO_USERS.find((u) => u.phone === phone);
  if (!user) {
    // Auto-create customer for new phones in demo
    user = { id: `usr_${Date.now()}`, phone, name: 'Demo User', email: '', role: 'CUSTOMER', password: '' };
  }
  return NextResponse.json({ token: makeToken(user), user: userResponse(user) });
}
