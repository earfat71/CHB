import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';
import { calculatePrice } from '../pricing/pricing.service';
import { getDatesInRange } from '../../lib/cron';
import { BookingStatus } from '@prisma/client';
import { nanoid } from '../../lib/nanoid';

export async function holdBooking(req: AuthRequest, res: Response) {
  const { roomId, checkIn, checkOut, guestCount, attributionSessionId } = req.body;
  if (!roomId || !checkIn || !checkOut) {
    return res.status(400).json({ error: 'roomId, checkIn, checkOut required' });
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

  if (nights <= 0) return res.status(400).json({ error: 'Invalid dates' });

  const result = await prisma.$transaction(async (tx) => {
    const dates = getDatesInRange(checkInDate, checkOutDate);
    for (const date of dates) {
      const slot = await tx.roomAvailability.findUnique({ where: { roomId_date: { roomId, date } } });
      if (!slot) throw new Error(`No availability record for ${date.toDateString()}`);
      const free = slot.totalUnits - slot.bookedUnits - slot.heldUnits;
      if (free <= 0) throw new Error(`Room not available on ${date.toDateString()}`);
      await tx.roomAvailability.update({
        where: { roomId_date: { roomId, date } },
        data: { heldUnits: { increment: 1 } },
      });
    }

    const holdConfig = await tx.platformConfig.findUnique({ where: { key: 'BOOKING_HOLD_MINUTES' } });
    const holdMinutes = holdConfig ? parseInt(holdConfig.value) : 15;

    return { holdMinutes, nights };
  });

  // Check for agent attribution
  let attributionId: string | null = null;
  if (attributionSessionId) {
    const attribution = await prisma.agentAttribution.findUnique({
      where: { sessionId: attributionSessionId },
    });
    if (attribution && attribution.expiresAt > new Date()) {
      attributionId = attribution.id;
    }
  }

  const room = await prisma.room.findUnique({ where: { id: roomId }, include: { hotel: true } });
  if (!room) return res.status(404).json({ error: 'Room not found' });

  const pricing = await calculatePrice(room.basePriceBdt, result.nights, !!attributionId);

  const holdExpiry = new Date(Date.now() + result.holdMinutes * 60 * 1000);

  const booking = await prisma.booking.create({
    data: {
      bookingRef: `CB-${nanoid(8).toUpperCase()}`,
      userId: req.user!.id,
      hotelId: room.hotelId,
      attributionId: attributionId || undefined,
      status: BookingStatus.PENDING_PAYMENT,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights: result.nights,
      guestCount: Number(guestCount) || 1,
      guestName: req.user!.name,
      guestPhone: req.user!.phone,
      holdExpiresAt: holdExpiry,
      ...pricing,
      items: {
        create: {
          roomId,
          nights: result.nights,
          units: 1,
          pricePerNightBdt: room.basePriceBdt,
          subtotalBdt: pricing.baseTotalBdt,
        },
      },
    },
    include: { items: true, hotel: { select: { name: true } } },
  });

  return res.status(201).json({ booking, pricing, holdExpiresAt: holdExpiry });
}

export async function createBooking(req: AuthRequest, res: Response) {
  const { bookingId, guestName, guestEmail, specialRequests } = req.body;
  if (!bookingId) return res.status(400).json({ error: 'bookingId required' });

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.userId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });
  if (booking.status !== BookingStatus.PENDING_PAYMENT) {
    return res.status(400).json({ error: 'Booking is not in pending state' });
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { guestName: guestName || booking.guestName, guestEmail, specialRequests },
  });
  return res.json(updated);
}

export async function myBookings(req: AuthRequest, res: Response) {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.user!.id },
    include: {
      hotel: { select: { name: true, city: true } },
      items: { include: { room: { select: { name: true, type: true } } } },
      payments: { select: { status: true, gateway: true, amountBdt: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(bookings);
}

export async function getBooking(req: AuthRequest, res: Response) {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: {
      hotel: true,
      items: { include: { room: true } },
      payments: true,
      attribution: { include: { agent: { select: { agentCode: true } } } },
      review: true,
    },
  });
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return res.json(booking);
}

export async function cancelBooking(req: AuthRequest, res: Response) {
  const { reason } = req.body;
  const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.userId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });

  const cancellableStatuses = [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED];
  if (!cancellableStatuses.includes(booking.status)) {
    return res.status(400).json({ error: 'Cannot cancel booking in current status' });
  }

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.CANCELLED, cancelledAt: new Date(), cancelReason: reason },
    });
    // Release inventory
    const items = await tx.bookingItem.findMany({ where: { bookingId: booking.id } });
    const dates = getDatesInRange(booking.checkIn, booking.checkOut);
    for (const item of items) {
      for (const date of dates) {
        await tx.roomAvailability.updateMany({
          where: { roomId: item.roomId, date },
          data: { bookedUnits: { decrement: item.units } },
        });
      }
    }
  });

  return res.json({ message: 'Booking cancelled' });
}

export async function updateStatus(req: AuthRequest, res: Response) {
  const { status } = req.body;
  if (req.user!.role !== 'ADMIN' && req.user!.role !== 'HOTEL_MANAGER') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const booking = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status },
  });
  return res.json(booking);
}
