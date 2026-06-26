import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

export async function listEntries(req: Request, res: Response) {
  const { from, to } = req.query;
  const entries = await prisma.ledgerEntry.findMany({
    where: {
      createdAt: {
        gte: from ? new Date(String(from)) : undefined,
        lte: to ? new Date(String(to)) : undefined,
      },
    },
    include: { booking: { select: { bookingRef: true } } },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });
  return res.json(entries);
}

export async function summary(req: Request, res: Response) {
  const results = await prisma.ledgerEntry.groupBy({
    by: ['account', 'type'],
    _sum: { amountBdt: true },
  });
  // Verify zero-sum: total debits should equal total credits
  const totalDebits = results.filter((r) => r.type === 'DEBIT').reduce((s, r) => s + (r._sum.amountBdt || 0), 0);
  const totalCredits = results.filter((r) => r.type === 'CREDIT').reduce((s, r) => s + (r._sum.amountBdt || 0), 0);
  return res.json({ accounts: results, totalDebits, totalCredits, balanced: totalDebits === totalCredits });
}

export async function bookingEntries(req: AuthRequest, res: Response) {
  const booking = await prisma.booking.findUnique({ where: { id: req.params.bookingId } });
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const entries = await prisma.ledgerEntry.findMany({
    where: { bookingId: req.params.bookingId },
    orderBy: { createdAt: 'asc' },
  });
  const totalDebits = entries.filter((e) => e.type === 'DEBIT').reduce((s, e) => s + e.amountBdt, 0);
  const totalCredits = entries.filter((e) => e.type === 'CREDIT').reduce((s, e) => s + e.amountBdt, 0);
  return res.json({ entries, totalDebits, totalCredits, balanced: totalDebits === totalCredits });
}
