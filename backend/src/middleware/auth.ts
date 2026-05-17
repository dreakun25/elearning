import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { verifyNextAuthToken } from '../utils/auth';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = header.slice(7);
  const payload = verifyNextAuthToken(token);

  if (!payload.sub) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  req.user = { userId: payload.sub, role: (payload.role as Role) || 'STUDENT' };
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
