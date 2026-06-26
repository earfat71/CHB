import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../_mock/auth';
import { DEMO_HOTELS } from '../../_mock/data';

function findRoom(roomId: string) {
  for (const hotel of DEMO_HOTELS) {
    const room = hotel.rooms?.find((r) => r.id === roomId);
    if (room) return { hotel, room };
  }
  return null;
}

export async function PATCH(req: Request, { params }: { params: { roomId: string } }) {
  const user = getUserFromRequest(req);
  if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const found = findRoom(params.roomId);
  if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const room = found.room as Record<string, unknown>;
  if (body.name !== undefined) room.name = body.name;
  if (body.type !== undefined) room.type = body.type;
  if (body.description !== undefined) room.description = body.description;
  if (body.basePriceBdt !== undefined) room.basePriceBdt = Number(body.basePriceBdt);
  if (body.maxGuests !== undefined) room.maxGuests = Number(body.maxGuests);
  if (body.totalUnits !== undefined) room.totalUnits = Number(body.totalUnits);
  if (body.amenities !== undefined) room.amenities = body.amenities;
  if (body.photos !== undefined) room.photos = body.photos;
  if (body.isActive !== undefined) room.isActive = body.isActive;
  if (body.discountType !== undefined) room.discountType = body.discountType;
  if (body.discountValue !== undefined) room.discountValue = Number(body.discountValue);
  if (body.discountLabel !== undefined) room.discountLabel = body.discountLabel;

  return NextResponse.json(found.room);
}

export async function DELETE(req: Request, { params }: { params: { roomId: string } }) {
  const user = getUserFromRequest(req);
  if (!user || !['ADMIN', 'MANAGER'].includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const found = findRoom(params.roomId);
  if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  found.hotel.rooms = found.hotel.rooms!.filter((r) => r.id !== params.roomId) as typeof found.hotel.rooms;
  if (found.hotel._count) found.hotel._count.rooms = found.hotel.rooms!.length;

  return NextResponse.json({ success: true });
}
