import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';
import { HotelStatus } from '@prisma/client';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function listHotels(req: Request, res: Response) {
  const { status, city } = req.query;
  const hotels = await prisma.hotel.findMany({
    where: {
      status: (status as HotelStatus) || HotelStatus.ACTIVE,
      city: city ? String(city) : undefined,
    },
    include: {
      _count: { select: { reviews: { where: { status: 'APPROVED' } }, rooms: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(hotels);
}

export async function getHotel(req: Request, res: Response) {
  const hotel = await prisma.hotel.findFirst({
    where: { OR: [{ id: req.params.id }, { slug: req.params.id }] },
    include: {
      rooms: { where: { isActive: true } },
      reviews: {
        where: { status: 'APPROVED' },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: { select: { reviews: { where: { status: 'APPROVED' } } } },
    },
  });
  if (!hotel) return res.status(404).json({ error: 'Hotel not found' });

  const avgRating = await prisma.review.aggregate({
    where: { hotelId: hotel.id, status: 'APPROVED' },
    _avg: { rating: true },
  });

  return res.json({ ...hotel, avgRating: avgRating._avg.rating });
}

export async function createHotel(req: AuthRequest, res: Response) {
  const { name, description, address, city, starRating, amenities, checkInTime, checkOutTime, policies, latitude, longitude } = req.body;
  if (!name || !description || !address || !starRating) {
    return res.status(400).json({ error: 'Required: name, description, address, starRating' });
  }
  let slug = slugify(name);
  const existing = await prisma.hotel.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const hotel = await prisma.hotel.create({
    data: {
      name, slug, description, address,
      city: city || "Cox's Bazar",
      starRating,
      amenities: amenities || [],
      photos: [],
      status: HotelStatus.PENDING_APPROVAL,
      checkInTime: checkInTime || '14:00',
      checkOutTime: checkOutTime || '12:00',
      policies,
      latitude,
      longitude,
      managers: { create: { userId: req.user!.id, isPrimary: true } },
    },
  });

  return res.status(201).json(hotel);
}

export async function updateHotel(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const hotel = await prisma.hotel.findUnique({ where: { id } });
  if (!hotel) return res.status(404).json({ error: 'Hotel not found' });

  const { name, description, address, amenities, checkInTime, checkOutTime, policies } = req.body;
  const updated = await prisma.hotel.update({
    where: { id },
    data: { name, description, address, amenities, checkInTime, checkOutTime, policies },
  });
  return res.json(updated);
}

export async function approveHotel(req: AuthRequest, res: Response) {
  const hotel = await prisma.hotel.update({
    where: { id: req.params.id },
    data: { status: HotelStatus.ACTIVE },
  });
  await prisma.auditLog.create({
    data: { actorId: req.user!.id, actorRole: req.user!.role, action: 'APPROVE_HOTEL', entityType: 'Hotel', entityId: hotel.id },
  });
  return res.json(hotel);
}

export async function suspendHotel(req: AuthRequest, res: Response) {
  const hotel = await prisma.hotel.update({
    where: { id: req.params.id },
    data: { status: HotelStatus.SUSPENDED },
  });
  await prisma.auditLog.create({
    data: { actorId: req.user!.id, actorRole: req.user!.role, action: 'SUSPEND_HOTEL', entityType: 'Hotel', entityId: hotel.id },
  });
  return res.json(hotel);
}

export async function uploadPhotos(req: AuthRequest, res: Response) {
  return res.json({ message: 'Photo upload endpoint - use multipart form data' });
}
