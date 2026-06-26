import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../_mock/auth';
import { DEMO_REVIEWS } from '../../../_mock/data';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const review = DEMO_REVIEWS.find((r) => r.id === params.id);
  if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  review.status = 'REJECTED';
  return NextResponse.json(review);
}
