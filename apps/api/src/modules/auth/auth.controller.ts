import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { signToken } from '../../lib/jwt';
import { sendSMS, generateOTP } from '../../lib/sms';
import { AuthRequest } from '../../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const OTP_EXPIRY_MINUTES = 5;
const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MINUTES = 30;

export async function sendOtp(req: Request, res: Response) {
  const { phone } = req.body;
  if (!phone || !/^\+8801[3-9]\d{8}$/.test(phone)) {
    return res.status(400).json({ error: 'Valid Bangladeshi phone number required (+8801XXXXXXXXX)' });
  }

  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({
      data: { phone, name: 'New User', role: UserRole.CUSTOMER },
    });
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.otpToken.create({ data: { userId: user.id, phone, otp, expiresAt } });
  await sendSMS(phone, `Your CoxBeach OTP: ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`);

  return res.json({ message: 'OTP sent', expiresInMinutes: OTP_EXPIRY_MINUTES });
}

export async function verifyOtp(req: Request, res: Response) {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' });

  const token = await prisma.otpToken.findFirst({
    where: { phone, otp, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });

  if (!token) return res.status(400).json({ error: 'Invalid or expired OTP' });

  await prisma.otpToken.update({ where: { id: token.id }, data: { used: true } });

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const jwtToken = signToken({ userId: user.id, role: user.role });
  return res.json({ token: jwtToken, user: { id: user.id, name: user.name, phone: user.phone, role: user.role } });
}

export async function register(req: Request, res: Response) {
  const { phone, name, email, password } = req.body;
  if (!phone || !name) return res.status(400).json({ error: 'Phone and name required' });

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing && existing.name !== 'New User') {
    return res.status(409).json({ error: 'Phone already registered' });
  }

  const passwordHash = password ? await bcrypt.hash(password, 12) : undefined;
  const user = await prisma.user.upsert({
    where: { phone },
    create: { phone, name, email, passwordHash, role: UserRole.CUSTOMER },
    update: { name, email, passwordHash },
  });

  const token = signToken({ userId: user.id, role: user.role });
  return res.status(201).json({ token, user: { id: user.id, name: user.name, phone: user.phone, role: user.role } });
}

export async function login(req: Request, res: Response) {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: 'Phone and password required' });

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return res.status(423).json({ error: `Account locked. Try again in ${minutesLeft} minutes.` });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const failedLogins = user.failedLogins + 1;
    const updates: Record<string, unknown> = { failedLogins };
    if (failedLogins >= MAX_FAILED_LOGINS) {
      updates.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
    }
    await prisma.user.update({ where: { id: user.id }, data: updates });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  await prisma.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null } });
  const token = signToken({ userId: user.id, role: user.role });
  return res.json({ token, user: { id: user.id, name: user.name, phone: user.phone, role: user.role } });
}

export async function logout(_req: Request, res: Response) {
  return res.json({ message: 'Logged out' });
}

export async function me(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, phone: true, name: true, email: true, role: true, createdAt: true },
  });
  return res.json(user);
}

export async function updateProfile(req: AuthRequest, res: Response) {
  const { name, email } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { name, email },
    select: { id: true, phone: true, name: true, email: true, role: true },
  });
  return res.json(user);
}
