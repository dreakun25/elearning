import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 12;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function verifyNextAuthToken(token: string): { sub?: string; role?: string } {
  const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET or JWT_SECRET is not set');
  }
  return jwt.verify(token, secret, { algorithms: ['HS256'] }) as { sub?: string; role?: string };
}
