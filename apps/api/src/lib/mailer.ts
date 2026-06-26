import nodemailer from 'nodemailer';
import { env } from './env';
import { logger } from './logger';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (env.NODE_ENV !== 'production') {
    logger.info(`[EMAIL SANDBOX] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({ from: env.EMAIL_FROM, to, subject, html });
  } catch (err) {
    logger.error('Email send failed', { err });
  }
}

export function bookingConfirmationEmail(booking: { bookingRef: string; guestName: string; checkIn: Date; checkOut: Date; hotelName: string; grandTotalBdt: number }): string {
  return `
    <h2>Booking Confirmed!</h2>
    <p>Dear ${booking.guestName},</p>
    <p>Your booking at <strong>${booking.hotelName}</strong> has been confirmed.</p>
    <table>
      <tr><td>Booking Ref:</td><td><strong>${booking.bookingRef}</strong></td></tr>
      <tr><td>Check-in:</td><td>${booking.checkIn.toDateString()}</td></tr>
      <tr><td>Check-out:</td><td>${booking.checkOut.toDateString()}</td></tr>
      <tr><td>Total Paid:</td><td>BDT ${booking.grandTotalBdt.toLocaleString()}</td></tr>
    </table>
    <p>Thank you for choosing CoxBeach!</p>
  `;
}
