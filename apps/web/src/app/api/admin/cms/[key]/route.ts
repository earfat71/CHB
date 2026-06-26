import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../_mock/auth';
import { DEMO_CMS } from '../../../_mock/data';

export async function PATCH(req: Request, { params }: { params: { key: string } }) {
  const user = getUserFromRequest(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { content, title } = await req.json();
  const entry = DEMO_CMS.find((c) => c.key === params.key);
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (content !== undefined) entry.content = content;
  if (title !== undefined) entry.title = title;
  entry.updatedAt = new Date().toISOString();

  return NextResponse.json(entry);
}
