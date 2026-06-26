import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

export async function listRooms(req: Request, res: Response) {
  const rooms = await prisma.room.findMany({
    where: { hotelId: req.params.hotelId, isActive: true },
    include: { _count: { select: { availabilitySlots: true } } },
  });
  return res.json(rooms);
}

export async function getRoom(req: Request, res: Response) {
  const room = await prisma.room.findUnique({
    where: { id: req.params.id },
    include: { hotel: { select: { name: true, slug: true } } },
  });
  if (!room) return res.status(404).json({ error: 'Room not found' });
  return res.json(room);
}

export async function createRoom(req: AuthRequest, res: Response) {
  const { hotelId, name, type, description, basePriceBdt, maxGuests, totalUnits, amenities, floorArea } = req.body;
  if (!hotelId || !name || !type || !basePriceBdt || !maxGuests) {
    return res.status(400).json({ error: 'Required: hotelId, name, type, basePriceBdt, maxGuests' });
  }

  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
  if (!hotel) return res.status(404).json({ error: 'Hotel not found' });

  const room = await prisma.room.create({
    data: {
      hotelId, name, type, description,
      basePriceBdt: Number(basePriceBdt),
      maxGuests: Number(maxGuests),
      totalUnits: Number(totalUnits) || 1,
      amenities: amenities || [],
      floorArea,
      photos: [],
    },
  });

  // Auto-generate availability for next 90 days
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    date.setHours(0, 0, 0, 0);
    await prisma.roomAvailability.create({
      data: { roomId: room.id, date, totalUnits: room.totalUnits, priceBdt: room.basePriceBdt },
    });
  }

  return res.status(201).json(room);
}

export async function updateRoom(req: AuthRequest, res: Response) {
  const { name, description, maxGuests, amenities, floorArea } = req.body;
  const room = await prisma.room.update({
    where: { id: req.params.id },
    data: { name, description, maxGuests, amenities, floorArea },
  });
  return res.json(room);
}

export async function deactivateRoom(req: AuthRequest, res: Response) {
  const room = await prisma.room.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });
  return res.json(room);
}

export async function getRoomAvailability(req: Request, res: Response) {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from and to dates required' });

  const slots = await prisma.roomAvailability.findMany({
    where: {
      roomId: req.params.id,
      date: { gte: new Date(String(from)), lte: new Date(String(to)) },
    },
    orderBy: { date: 'asc' },
  });
  return res.json(slots);
}

export async function updateRoomPrice(req: AuthRequest, res: Response) {
  const { date, priceBdt } = req.body;
  if (!date || !priceBdt) return res.status(400).json({ error: 'date and priceBdt required' });

  const slot = await prisma.roomAvailability.updateMany({
    where: { roomId: req.params.id, date: new Date(date) },
    data: { priceBdt: Number(priceBdt) },
  });
  return res.json(slot);
}
