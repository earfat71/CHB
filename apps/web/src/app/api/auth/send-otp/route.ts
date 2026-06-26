import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { phone } = await req.json();
  if (!phone?.startsWith('+880')) return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
  // In demo mode, OTP is always 123456
  return NextResponse.json({ message: 'OTP sent (demo: use 123456)' });
}
