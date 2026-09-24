import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { AuthTokenPayload, AuthUserContext } from '@homelab/shared-types';

const BCRYPT_SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateNumericOtp(): string {
  const num = crypto.randomInt(100000, 999999);
  return num.toString();
}

export function hashOtp(otp: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(otp).digest('hex');
}

export function signAccessToken(user: AuthUserContext, secret: string): string {
  return jwt.sign(
    {
      userId: user.userId,
      tenantId: user.tenantId,
      role: user.role,
      branchId: user.branchId,
      email: user.email,
      phone: user.phone,
    },
    secret,
    { expiresIn: '15m' },
  );
}

export function signRefreshToken(user: AuthUserContext, secret: string): string {
  return jwt.sign(
    {
      userId: user.userId,
      tenantId: user.tenantId,
      role: user.role,
      branchId: user.branchId,
    },
    secret,
    { expiresIn: '7d' },
  );
}

export function verifyAccessToken(token: string, secret: string): AuthTokenPayload {
  return jwt.verify(token, secret) as AuthTokenPayload;
}

export function verifyRefreshToken(token: string, secret: string): AuthTokenPayload {
  return jwt.verify(token, secret) as AuthTokenPayload;
}
