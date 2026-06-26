import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

export async function createReview(req: AuthRequest, res: Response) {
  const { bookingId, rating, title, body } = req.body;
  if (!bookingId || !rating || !body) return res.status(400).json({ error: 'bookingId, rating, body required' });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.userId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });
  if (booking.status !== 'CHECKED_OUT' && booking.status !== 'CONFIRMED') {
    return res.status(400).json({ error: 'Can only review after stay' });
  }

  const existing = await prisma.review.findUnique({ where: { bookingId } });
  if (existing) return res.status(409).json({ error: 'Review already submitted for this booking' });

  const review = await prisma.review.create({
    data: { bookingId, userId: req.user!.id, hotelId: booking.hotelId, rating: Number(rating), title, body },
  });
  return res.status(201).json(review);
}

export async function getHotelReviews(req: Request, res: Response) {
  const reviews = await prisma.review.findMany({
    where: { hotelId: req.params.hotelId, status: 'APPROVED' },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  return res.json({ reviews, avgRating: Math.round(avgRating * 10) / 10, count: reviews.length });
}

export async function approveReview(req: Request, res: Response) {
  const review = await prisma.review.update({ where: { id: req.params.id }, data: { status: 'APPROVED' } });
  return res.json(review);
}

export async function rejectReview(req: Request, res: Response) {
  const review = await prisma.review.update({ where: { id: req.params.id }, data: { status: 'REJECTED' } });
  return res.json(review);
}

export async function pendingReviews(req: Request, res: Response) {
  const reviews = await prisma.review.findMany({
    where: { status: 'PENDING_MODERATION' },
    include: { user: { select: { name: true } }, hotel: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(reviews);
}
