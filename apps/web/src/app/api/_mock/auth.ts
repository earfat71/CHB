import { DEMO_USERS } from './data';

type DemoUser = typeof DEMO_USERS[number];

export function makeToken(user: DemoUser): string {
  const payload = { userId: user.id, phone: user.phone, role: user.role };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function parseToken(token: string): { userId: string; phone: string; role: string } | null {
  try {
    return JSON.parse(Buffer.from(token, 'base64url').toString('utf-8'));
  } catch {
    return null;
  }
}

export function getUserFromRequest(req: Request): DemoUser | null {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const payload = parseToken(auth.slice(7));
  if (!payload) return null;
  return DEMO_USERS.find((u) => u.id === payload.userId) ?? null;
}

export function userResponse(user: DemoUser) {
  const { password: _, ...safe } = user;
  return safe;
}
