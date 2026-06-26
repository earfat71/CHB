import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';

export async function myNotifications(req: AuthRequest, res: Response) {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return res.json(notifications);
}

export async function markRead(_req: Request, res: Response) {
  return res.json({ message: 'Marked as read' });
}

export async function queueNotification(
  userId: string,
  channel: 'SMS' | 'EMAIL' | 'IN_APP',
  subject: string,
  body: string
): Promise<void> {
  await prisma.notification.create({ data: { userId, channel, subject, body } });
}
