import { Request, Response } from 'express';
import QRCode from 'qrcode';
import { prisma } from '../../lib/prisma';
import { AuthRequest } from '../../middleware/auth.middleware';
import { encryptNID, maskNID } from '../../lib/encryption';
import { AgentStatus } from '@prisma/client';
import { nanoid } from '../../lib/nanoid';

const ATTRIBUTION_HOURS = 72;

export async function registerAgent(req: AuthRequest, res: Response) {
  const { nid } = req.body;
  if (!nid) return res.status(400).json({ error: 'NID required' });

  const existing = await prisma.agent.findUnique({ where: { userId: req.user!.id } });
  if (existing) return res.status(409).json({ error: 'Already registered as agent' });

  const agentCode = `AGT-${nanoid(8).toUpperCase()}`;
  const nidEncrypted = encryptNID(nid);
  const nidLastFour = maskNID(nid);

  const qrData = `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/agent/${agentCode}`;
  const qrCodeUrl = await QRCode.toDataURL(qrData);

  const agent = await prisma.agent.create({
    data: {
      userId: req.user!.id,
      agentCode,
      nidEncrypted,
      nidLastFour,
      qrCodeUrl,
      status: AgentStatus.PENDING_VERIFICATION,
    },
  });

  await prisma.user.update({ where: { id: req.user!.id }, data: { role: 'AGENT' } });

  return res.status(201).json({
    agentCode: agent.agentCode,
    status: agent.status,
    qrCodeUrl: agent.qrCodeUrl,
    nidLastFour: agent.nidLastFour,
  });
}

export async function getAgentQR(req: Request, res: Response) {
  const agent = await prisma.agent.findUnique({
    where: { agentCode: req.params.agentCode },
    include: { user: { select: { name: true } } },
  });
  if (!agent || agent.status !== AgentStatus.ACTIVE) {
    return res.status(404).json({ error: 'Agent not found or inactive' });
  }
  return res.json({ agentCode: agent.agentCode, agentName: agent.user.name, qrCodeUrl: agent.qrCodeUrl });
}

export async function createAttribution(req: Request, res: Response) {
  const { agentCode } = req.body;
  if (!agentCode) return res.status(400).json({ error: 'agentCode required' });

  const agent = await prisma.agent.findUnique({ where: { agentCode } });
  if (!agent || agent.status !== AgentStatus.ACTIVE) {
    return res.status(404).json({ error: 'Agent not found or inactive' });
  }

  const sessionId = nanoid(16);
  const expiresAt = new Date(Date.now() + ATTRIBUTION_HOURS * 60 * 60 * 1000);

  const attribution = await prisma.agentAttribution.create({
    data: { agentId: agent.id, sessionId, expiresAt },
  });

  return res.status(201).json({ sessionId: attribution.sessionId, agentCode, expiresAt });
}

export async function trackAttribution(req: Request, res: Response) {
  const attribution = await prisma.agentAttribution.findUnique({
    where: { sessionId: req.params.sessionId },
    include: { agent: { select: { agentCode: true, commissionRate: true } } },
  });
  if (!attribution || attribution.expiresAt < new Date()) {
    return res.status(404).json({ error: 'Attribution expired or not found' });
  }
  return res.json({ valid: true, agentCode: attribution.agent.agentCode });
}

export async function myAgentProfile(req: AuthRequest, res: Response) {
  const agent = await prisma.agent.findUnique({
    where: { userId: req.user!.id },
    include: { user: { select: { name: true, phone: true } } },
  });
  if (!agent) return res.status(404).json({ error: 'Agent profile not found' });
  return res.json({ ...agent, nidEncrypted: undefined });
}

export async function myEarnings(req: AuthRequest, res: Response) {
  const agent = await prisma.agent.findUnique({ where: { userId: req.user!.id } });
  if (!agent) return res.status(404).json({ error: 'Agent not found' });

  const attributions = await prisma.agentAttribution.findMany({
    where: { agentId: agent.id },
    include: {
      booking: {
        select: { bookingRef: true, grandTotalBdt: true, agentCommBdt: true, status: true, createdAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalEarned = attributions.reduce((sum, a) => sum + (a.booking?.agentCommBdt || 0), 0);

  return res.json({
    agentCode: agent.agentCode,
    walletBalance: agent.walletBalance,
    totalEarned,
    commissionRate: agent.commissionRate,
    attributions: attributions.map((a) => ({
      sessionId: a.sessionId,
      booking: a.booking,
    })),
  });
}

export async function listAgents(req: Request, res: Response) {
  const agents = await prisma.agent.findMany({
    include: { user: { select: { name: true, phone: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(agents.map((a) => ({ ...a, nidEncrypted: undefined })));
}

export async function approveAgent(req: Request, res: Response) {
  const agent = await prisma.agent.update({
    where: { id: req.params.id },
    data: { status: AgentStatus.ACTIVE },
  });
  return res.json(agent);
}

export async function suspendAgent(req: Request, res: Response) {
  const agent = await prisma.agent.update({
    where: { id: req.params.id },
    data: { status: AgentStatus.SUSPENDED },
  });
  return res.json(agent);
}
