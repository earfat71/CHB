import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export async function search(req: Request, res: Response) {
  const { checkIn, checkOut, guests, city, minPrice, maxPrice, starRating, sortBy } = req.query;

  if (!checkIn || !checkOut) {
    return res.status(400).json({ error: 'checkIn and checkOut dates required' });
  }

  const checkInDate = new Date(String(checkIn));
  const checkOutDate = new Date(String(checkOut));
  const guestCount = Number(guests) || 1;
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

  if (nights <= 0) return res.status(400).json({ error: 'checkOut must be after checkIn' });

  // Find rooms with sufficient availability across all dates
  const availableRooms = await prisma.$queryRaw<{ roomId: string; minAvail: number; avgPrice: number }[]>`
    SELECT
      ra."roomId",
      MIN(ra."totalUnits" - ra."bookedUnits" - ra."heldUnits") as "minAvail",
      AVG(ra."priceBdt") as "avgPrice"
    FROM room_availability ra
    WHERE ra.date >= ${checkInDate}
      AND ra.date < ${checkOutDate}
    GROUP BY ra."roomId"
    HAVING MIN(ra."totalUnits" - ra."bookedUnits" - ra."heldUnits") > 0
  `;

  const availableRoomIds = availableRooms.map((r) => r.roomId);

  const rooms = await prisma.room.findMany({
    where: {
      id: { in: availableRoomIds },
      isActive: true,
      maxGuests: { gte: guestCount },
      basePriceBdt: {
        gte: minPrice ? Number(minPrice) : undefined,
        lte: maxPrice ? Number(maxPrice) : undefined,
      },
      hotel: {
        status: 'ACTIVE',
        city: city ? String(city) : undefined,
        starRating: starRating ? ({ equals: starRating } as unknown as undefined) : undefined,
      },
    },
    include: {
      hotel: {
        include: {
          _count: { select: { reviews: { where: { status: 'APPROVED' } } } },
        },
      },
    },
  });

  const results = rooms.map((room) => {
    const avail = availableRooms.find((a) => a.roomId === room.id);
    const pricePerNight = avail ? Number(avail.avgPrice) : room.basePriceBdt;
    return {
      ...room,
      pricePerNight,
      totalPrice: pricePerNight * nights,
      nights,
      availableUnits: avail ? Number(avail.minAvail) : 0,
    };
  });

  // Sort
  if (sortBy === 'price_asc') results.sort((a, b) => a.pricePerNight - b.pricePerNight);
  else if (sortBy === 'price_desc') results.sort((a, b) => b.pricePerNight - a.pricePerNight);
  else if (sortBy === 'rating') results.sort((a, b) => (b.hotel._count.reviews) - (a.hotel._count.reviews));

  return res.json({ results, nights, checkIn: checkInDate, checkOut: checkOutDate });
}

export async function checkAvailability(req: Request, res: Response) {
  const { checkIn, checkOut } = req.query;
  if (!checkIn || !checkOut) return res.status(400).json({ error: 'checkIn and checkOut required' });

  const slots = await prisma.roomAvailability.findMany({
    where: {
      roomId: req.params.roomId,
      date: { gte: new Date(String(checkIn)), lt: new Date(String(checkOut)) },
    },
    orderBy: { date: 'asc' },
  });

  const isAvailable = slots.length > 0 && slots.every((s) => s.totalUnits - s.bookedUnits - s.heldUnits > 0);
  return res.json({ isAvailable, slots });
}
