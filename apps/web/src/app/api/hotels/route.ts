import { NextResponse } from 'next/server';
import { DEMO_HOTELS } from '../_mock/data';

export async function GET() {
  return NextResponse.json(DEMO_HOTELS.filter((h) => h.status === 'APPROVED'));
}
