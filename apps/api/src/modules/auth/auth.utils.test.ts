import { describe, expect, it } from 'vitest';
import {
  generateNumericOtp,
  hashOtp,
  hashPassword,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyPassword,
  verifyRefreshToken,
} from './auth.utils.js';
import type { AuthUserContext } from '@homelab/shared-types';

describe('Auth Utilities', () => {
  const secret = 'test_secret_key_32_characters_long_0123';

  describe('Password Hashing', () => {
    it('hashes passwords using bcrypt and verifies correctly', async () => {
      const password = 'SecurePassword123!';
      const hash = await hashPassword(password);

      expect(hash).not.toEqual(password);
      expect(await verifyPassword(password, hash)).toBe(true);
      expect(await verifyPassword('WrongPassword', hash)).toBe(false);
    });
  });

  describe('OTP Generation & Hashing', () => {
    it('generates 6-digit numeric OTP strings', () => {
      const otp = generateNumericOtp();
      expect(otp).toMatch(/^\d{6}$/);
    });

    it('generates consistent HMAC SHA256 hash for OTP', () => {
      const otp = '123456';
      const hash1 = hashOtp(otp, secret);
      const hash2 = hashOtp(otp, secret);

      expect(hash1).toEqual(hash2);
      expect(hash1).not.toEqual(otp);
    });
  });

  describe('JWT Signing & Verification', () => {
    const mockUser: AuthUserContext = {
      userId: 'user_123',
      tenantId: 'tenant_abc',
      role: 'LAB_STAFF',
      email: 'staff@lab.com',
      branchId: 'branch_1',
    };

    it('signs and verifies access token with correct claims', () => {
      const token = signAccessToken(mockUser, secret);
      const payload = verifyAccessToken(token, secret);

      expect(payload.userId).toBe(mockUser.userId);
      expect(payload.tenantId).toBe(mockUser.tenantId);
      expect(payload.role).toBe(mockUser.role);
      expect(payload.email).toBe(mockUser.email);
    });

    it('signs and verifies refresh token with correct claims', () => {
      const token = signRefreshToken(mockUser, secret);
      const payload = verifyRefreshToken(token, secret);

      expect(payload.userId).toBe(mockUser.userId);
      expect(payload.tenantId).toBe(mockUser.tenantId);
      expect(payload.role).toBe(mockUser.role);
    });

    it('throws error when verifying with wrong secret', () => {
      const token = signAccessToken(mockUser, secret);
      expect(() => verifyAccessToken(token, 'wrong_secret_key')).toThrow();
    });
  });
});
