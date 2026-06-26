import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from './auth.middleware';

export function auditLog(action: string, entityType: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      if (res.statusCode < 400) {
        prisma.auditLog.create({
          data: {
            actorId: req.user?.id,
            actorRole: req.user?.role,
            action,
            entityType,
            entityId: req.params.id || body?.id,
            after: body,
            ipAddress: req.ip,
          },
        }).catch(() => {});
      }
      return originalJson(body);
    };
    next();
  };
}
