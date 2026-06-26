import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';
import { PaymentGateway, PaymentStatus, BookingStatus, LedgerAccount, LedgerType } from '@prisma/client';
import { sendEmail, bookingConfirmationEmail } from '../../lib/mailer';
import { getDatesInRange } from '../../lib/cron';

export async function initiatePayment(req: AuthRequest, res: Response) {
  const { bookingId, gateway } = req.body;
  if (!bookingId || !gateway) return res.status(400).json({ error: 'bookingId and gateway required' });

  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { hotel: true } });
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.userId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });
  if (booking.status !== BookingStatus.PENDING_PAYMENT) {
    return res.status(400).json({ error: 'Booking not in pending payment state' });
  }
  if (booking.holdExpiresAt && booking.holdExpiresAt < new Date()) {
    return res.status(400).json({ error: 'Booking hold expired' });
  }

  const sandboxResponse = generateSandboxPayment(gateway as PaymentGateway, booking.grandTotalBdt, bookingId);

  const payment = await prisma.payment.create({
    data: {
      bookingId,
      gateway: gateway as PaymentGateway,
      status: PaymentStatus.PENDING,
      amountBdt: booking.grandTotalBdt,
      gatewayRef: sandboxResponse.ref,
    },
  });

  return res.json({
    paymentId: payment.id,
    gateway,
    amountBdt: booking.grandTotalBdt,
    sandboxInstructions: sandboxResponse,
    redirectUrl: sandboxResponse.redirectUrl,
  });
}

function generateSandboxPayment(gateway: PaymentGateway, amount: number, bookingId: string) {
  const ref = `SANDBOX-${Date.now()}`;
  return {
    ref,
    gateway,
    amount,
    currency: 'BDT',
    redirectUrl: `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/booking/payment-callback?bookingId=${bookingId}&ref=${ref}`,
    instructions: `[SANDBOX MODE] Simulate payment for ${gateway}. Amount: BDT ${amount}. No real money involved.`,
    simulateSuccess: `/api/payments/webhook/${gateway.toLowerCase()}`,
  };
}

async function confirmBookingPayment(bookingId: string, txnId: string, gateway: PaymentGateway) {
  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id: bookingId }, include: { items: true, attribution: true } });
    if (!booking) throw new Error('Booking not found');

    await tx.payment.updateMany({
      where: { bookingId, gatewayRef: { contains: 'SANDBOX' } },
      data: { status: PaymentStatus.SUCCESS, gatewayTxnId: txnId, webhookIdempKey: txnId },
    });

    await tx.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CONFIRMED, holdExpiresAt: null },
    });

    // Convert held units to booked
    const dates = getDatesInRange(booking.checkIn, booking.checkOut);
    for (const item of booking.items) {
      for (const date of dates) {
        await tx.roomAvailability.updateMany({
          where: { roomId: item.roomId, date },
          data: { bookedUnits: { increment: item.units }, heldUnits: { decrement: item.units } },
        });
      }
    }

    // Double-entry ledger entries
    const entries = [
      { account: LedgerAccount.CUSTOMER_PAYMENT, type: LedgerType.DEBIT, amountBdt: booking.grandTotalBdt, description: `Payment received for ${booking.bookingRef}` },
      { account: LedgerAccount.HOTEL_PAYABLE, type: LedgerType.CREDIT, amountBdt: booking.baseTotalBdt, description: `Hotel payable for ${booking.bookingRef}` },
      { account: LedgerAccount.PLATFORM_REVENUE, type: LedgerType.CREDIT, amountBdt: booking.platformFeeBdt, description: `Platform fee for ${booking.bookingRef}` },
      { account: LedgerAccount.VAT_PAYABLE, type: LedgerType.CREDIT, amountBdt: booking.vatBdt, description: `VAT for ${booking.bookingRef}` },
    ];

    if (booking.agentCommBdt > 0 && booking.attribution) {
      entries.push({ account: LedgerAccount.AGENT_COMMISSION, type: LedgerType.CREDIT, amountBdt: booking.agentCommBdt, description: `Agent commission for ${booking.bookingRef}` });
      await tx.agent.update({
        where: { id: booking.attribution.agentId },
        data: { walletBalance: { increment: booking.agentCommBdt } },
      });
    }

    for (const entry of entries) {
      await tx.ledgerEntry.create({ data: { bookingId, ...entry } });
    }
  });

  // Send confirmation email
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { hotel: true },
  });
  if (booking?.guestEmail && booking.hotel) {
    await sendEmail(
      booking.guestEmail,
      `Booking Confirmed — ${booking.bookingRef}`,
      bookingConfirmationEmail({
        bookingRef: booking.bookingRef,
        guestName: booking.guestName,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        hotelName: booking.hotel.name,
        grandTotalBdt: booking.grandTotalBdt,
      })
    );
  }
}

export async function bkashWebhook(req: Request, res: Response) {
  const { bookingId, txnId } = req.body;
  if (!bookingId || !txnId) return res.status(400).json({ error: 'bookingId and txnId required' });

  const existing = await prisma.payment.findFirst({ where: { webhookIdempKey: txnId } });
  if (existing) return res.json({ message: 'Already processed (idempotent)' });

  await confirmBookingPayment(bookingId, txnId, PaymentGateway.BKASH);
  return res.json({ success: true });
}

export async function nagadWebhook(req: Request, res: Response) {
  const { bookingId, txnId } = req.body;
  if (!bookingId || !txnId) return res.status(400).json({ error: 'bookingId and txnId required' });

  const existing = await prisma.payment.findFirst({ where: { webhookIdempKey: txnId } });
  if (existing) return res.json({ message: 'Already processed (idempotent)' });

  await confirmBookingPayment(bookingId, txnId, PaymentGateway.NAGAD);
  return res.json({ success: true });
}

export async function sslcommerzWebhook(req: Request, res: Response) {
  const { bookingId, val_id } = req.body;
  if (!bookingId || !val_id) return res.status(400).json({ error: 'bookingId and val_id required' });

  const existing = await prisma.payment.findFirst({ where: { webhookIdempKey: val_id } });
  if (existing) return res.json({ message: 'Already processed (idempotent)' });

  await confirmBookingPayment(bookingId, val_id, PaymentGateway.SSLCOMMERZ);
  return res.json({ success: true });
}

export async function getPaymentStatus(req: AuthRequest, res: Response) {
  const payments = await prisma.payment.findMany({ where: { bookingId: req.params.bookingId } });
  const booking = await prisma.booking.findUnique({ where: { id: req.params.bookingId } });
  if (!booking || booking.userId !== req.user!.id) return res.status(403).json({ error: 'Forbidden' });
  return res.json({ booking: { status: booking.status }, payments });
}

export async function refundPayment(req: AuthRequest, res: Response) {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.bookingId },
    include: { payments: true },
  });
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (req.user!.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

  const successPayment = booking.payments.find((p) => p.status === PaymentStatus.SUCCESS);
  if (!successPayment) return res.status(400).json({ error: 'No successful payment to refund' });

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: successPayment.id },
      data: { status: PaymentStatus.REFUNDED, refundedAt: new Date(), refundRef: `REFUND-${Date.now()}` },
    });
    await tx.booking.update({
      where: { id: booking.id },
      data: { status: BookingStatus.REFUNDED },
    });
    await tx.ledgerEntry.create({
      data: {
        bookingId: booking.id,
        account: LedgerAccount.REFUND_EXPENSE,
        type: LedgerType.DEBIT,
        amountBdt: successPayment.amountBdt,
        description: `Refund for ${booking.bookingRef}`,
      },
    });
  });

  return res.json({ message: 'Refund processed', refundRef: `REFUND-${Date.now()}` });
}
