import { Request } from 'express';
import { Role } from '@prisma/client';

export interface NextAuthJwtPayload {
  sub?: string;
  role?: Role;
  iat?: number;
  exp?: number;
  jti?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: Role;
      };
    }
  }
}
