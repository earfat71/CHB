import cron from 'node-cron';
import { prisma } from './prisma';
import { logger } from './logger';
import { BookingStatus } from '@prisma/client';

export async function startCronJobs() {
  // Expire stale booking holds every 2 minutes
  cron.schedule('*/2 * * * *', async () => {
    try {
      const result = await prisma.booking.updateMany({
        where: {
          status: BookingStatus.PENDING_PAYMENT,
          holdExpiresAt: { lt: new Date() },
        },
        data: { status: BookingStatus.EXPIRED },
      });
      if (result.count > 0) {
        logger.info(`Expired ${result.count} stale booking holds`);
        // Release held inventory
        const expiredBookings = await prisma.booking.findMany({
          where: { status: BookingStatus.EXPIRED },
          include: { items: true },
        });
        for (const booking of expiredBookings) {
          for (const item of booking.items) {
            const dates = getDatesInRange(booking.checkIn, booking.checkOut);
            for (const date of dates) {
              await prisma.roomAvailability.updateMany({
                where: { roomId: item.roomId, date },
                data: { heldUnits: { decrement: item.units } },
              });
            }
          }
        }
      }
    } catch (err) {
      logger.error('Cron: expire holds error', { err });
    }
  });

  // Weekly settlement processing (Monday 9am)
  cron.schedule('0 9 * * 1', async () => {
    logger.info('Cron: triggering weekly settlement');
    // Settlement logic is in the settlements module
  });

  logger.info('Cron jobs started');
}

export function getDatesInRange(checkIn: Date, checkOut: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(checkIn);
  current.setHours(0, 0, 0, 0);
  const end = new Date(checkOut);
  end.setHours(0, 0, 0, 0);
  while (current < end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}
