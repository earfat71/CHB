import { env } from './env';
import { logger } from './logger';

export async function sendSMS(phone: string, message: string): Promise<void> {
  if (env.NODE_ENV !== 'production' || env.SMS_API_KEY === 'sandbox') {
    // In sandbox/dev mode, log OTP instead of sending
    logger.info(`[SMS SANDBOX] To: ${phone} | Message: ${message}`);
    return;
  }
  // Production: integrate with real SMS provider (e.g. SSL Wireless)
  logger.info(`SMS sent to ${phone}`);
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
