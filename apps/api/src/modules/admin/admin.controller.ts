import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';
import { UserRole, AccountStatus } from '@prisma/client';

export async function getKPIs(_req: Request, res: Response) {
  const [
    totalHotels,
    totalBookings,
    confirmedBookings,
    totalRevenue,
    totalUsers,
    totalAgents,
    pendingReviews,
    pendingHotels,
  ] = await Promise.all([
    prisma.hotel.count({ where: { status: 'ACTIVE' } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'CONFIRMED' } }),
    prisma.payment.aggregate({ where: { status: 'SUCCESS' }, _sum: { amountBdt: true } }),
    prisma.user.count(),
    prisma.agent.count({ where: { status: 'ACTIVE' } }),
    prisma.review.count({ where: { status: 'PENDING_MODERATION' } }),
    prisma.hotel.count({ where: { status: 'PENDING_APPROVAL' } }),
  ]);

  return res.json({
    totalHotels,
    totalBookings,
    confirmedBookings,
    totalRevenueBdt: totalRevenue._sum.amountBdt || 0,
    totalUsers,
    totalAgents,
    pendingReviews,
    pendingHotels,
  });
}

export async function getConfig(_req: Request, res: Response) {
  const configs = await prisma.platformConfig.findMany({ orderBy: { key: 'asc' } });
  return res.json(configs);
}

export async function updateConfig(req: AuthRequest, res: Response) {
  const { key } = req.params;
  const { value } = req.body;
  if (!value) return res.status(400).json({ error: 'value required' });

  const config = await prisma.platformConfig.upsert({
    where: { key },
    create: { key, value },
    update: { value, updatedByAdminId: req.user!.id },
  });

  await prisma.auditLog.create({
    data: { actorId: req.user!.id, actorRole: 'ADMIN', action: 'UPDATE_CONFIG', entityType: 'PlatformConfig', entityId: key, after: { value } },
  });

  return res.json(config);
}

export async function getAuditLog(req: Request, res: Response) {
  const { from, to, action } = req.query;
  const logs = await prisma.auditLog.findMany({
    where: {
      action: action ? String(action) : undefined,
      createdAt: {
        gte: from ? new Date(String(from)) : undefined,
        lte: to ? new Date(String(to)) : undefined,
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  return res.json(logs);
}

export async function listUsers(req: Request, res: Response) {
  const { role } = req.query;
  const users = await prisma.user.findMany({
    where: { role: role as UserRole | undefined },
    select: { id: true, phone: true, name: true, email: true, role: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  return res.json(users);
}

export async function updateUserRole(req: AuthRequest, res: Response) {
  const { role } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role: role as UserRole },
    select: { id: true, name: true, role: true },
  });
  await prisma.auditLog.create({
    data: { actorId: req.user!.id, actorRole: 'ADMIN', action: 'UPDATE_USER_ROLE', entityType: 'User', entityId: user.id, after: { role } },
  });
  return res.json(user);
}

export async function updateUserStatus(req: AuthRequest, res: Response) {
  const { status } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { status: status as AccountStatus },
    select: { id: true, name: true, status: true },
  });
  return res.json(user);
}

export async function listAllBookings(req: Request, res: Response) {
  const { status, from, to } = req.query;
  const bookings = await prisma.booking.findMany({
    where: {
      status: status ? (status as 'CONFIRMED') : undefined,
      createdAt: {
        gte: from ? new Date(String(from)) : undefined,
        lte: to ? new Date(String(to)) : undefined,
      },
    },
    include: {
      user: { select: { name: true, phone: true } },
      hotel: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });
  return res.json(bookings);
}
