import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';
import { SettlementStatus } from '@prisma/client';

export async function triggerHotelSettlement(req: AuthRequest, res: Response) {
  const { periodStart, periodEnd } = req.body;
  if (!periodStart || !periodEnd) return res.status(400).json({ error: 'periodStart and periodEnd required' });

  const startDate = new Date(periodStart);
  const endDate = new Date(periodEnd);

  const hotels = await prisma.hotel.findMany({ where: { status: 'ACTIVE' } });
  const settlements = [];

  for (const hotel of hotels) {
    const bookings = await prisma.booking.findMany({
      where: {
        hotelId: hotel.id,
        status: 'CONFIRMED',
        checkOut: { gte: startDate, lte: endDate },
      },
    });

    if (bookings.length === 0) continue;

    const grossBdt = bookings.reduce((s, b) => s + b.baseTotalBdt, 0);
    const feesBdt = bookings.reduce((s, b) => s + b.platformFeeBdt + b.vatBdt, 0);
    const netBdt = grossBdt - 0;

    const settlement = await prisma.hotelSettlement.create({
      data: {
        hotelId: hotel.id,
        periodStart: startDate,
        periodEnd: endDate,
        grossBdt,
        feesBdt,
        netBdt,
        status: SettlementStatus.COMPLETED,
        processedAt: new Date(),
      },
    });
    settlements.push(settlement);
  }

  return res.json({ processed: settlements.length, settlements });
}

export async function triggerAgentSettlement(req: AuthRequest, res: Response) {
  const { periodStart, periodEnd } = req.body;
  if (!periodStart || !periodEnd) return res.status(400).json({ error: 'periodStart and periodEnd required' });

  const startDate = new Date(periodStart);
  const endDate = new Date(periodEnd);

  const agents = await prisma.agent.findMany({ where: { status: 'ACTIVE', walletBalance: { gt: 0 } } });
  const settlements = [];

  for (const agent of agents) {
    const commBdt = agent.walletBalance;
    const settlement = await prisma.agentSettlement.create({
      data: {
        agentId: agent.id,
        periodStart: startDate,
        periodEnd: endDate,
        commBdt,
        status: SettlementStatus.COMPLETED,
        processedAt: new Date(),
      },
    });
    await prisma.agent.update({ where: { id: agent.id }, data: { walletBalance: 0 } });
    settlements.push(settlement);
  }

  return res.json({ processed: settlements.length, settlements });
}

export async function listHotelSettlements(req: Request, res: Response) {
  const settlements = await prisma.hotelSettlement.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return res.json(settlements);
}

export async function listAgentSettlements(req: Request, res: Response) {
  const settlements = await prisma.agentSettlement.findMany({
    include: { agent: { include: { user: { select: { name: true, phone: true } } } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return res.json(settlements);
}

export async function getSettlementReport(req: Request, res: Response) {
  const settlement = await prisma.hotelSettlement.findUnique({ where: { id: req.params.settlementId } });
  if (!settlement) return res.status(404).json({ error: 'Settlement not found' });

  const bookings = await prisma.booking.findMany({
    where: {
      hotelId: settlement.hotelId,
      checkOut: { gte: settlement.periodStart, lte: settlement.periodEnd },
      status: 'CONFIRMED',
    },
    select: { bookingRef: true, grandTotalBdt: true, baseTotalBdt: true, checkIn: true, checkOut: true },
  });

  const csv = [
    'Booking Ref,Check In,Check Out,Base Amount,Total Amount',
    ...bookings.map((b) => `${b.bookingRef},${b.checkIn.toISOString().split('T')[0]},${b.checkOut.toISOString().split('T')[0]},${b.baseTotalBdt},${b.grandTotalBdt}`),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=settlement-${settlement.id}.csv`);
  return res.send(csv);
}
