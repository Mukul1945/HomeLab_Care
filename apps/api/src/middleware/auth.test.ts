import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { authenticateJwt, requireRole } from './auth.js';
import { env } from '../config/env.js';
import { signAccessToken } from '../modules/auth/auth.utils.js';
import { AppError } from '../shared/errors/app-error.js';
import type { AuthUserContext } from '@homelab/shared-types';

describe('Auth Middleware', () => {
  const mockUser: AuthUserContext = {
    userId: 'user_999',
    tenantId: 'tenant_lab_1',
    role: 'LAB_STAFF',
    email: 'tech@lab.com',
  };

  describe('authenticateJwt', () => {
    it('authenticates valid Bearer token and attaches user context', () => {
      const token = signAccessToken(mockUser, env.AUTH_ACCESS_SECRET);
      const req = {
        headers: { authorization: `Bearer ${token}` },
      } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn();

      authenticateJwt(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user).toBeDefined();
      expect(req.user?.userId).toBe(mockUser.userId);
      expect(req.user?.tenantId).toBe(mockUser.tenantId);
      expect(req.user?.role).toBe(mockUser.role);
    });

    it('authenticates valid cookie token', () => {
      const token = signAccessToken(mockUser, env.AUTH_ACCESS_SECRET);
      const req = {
        headers: {},
        cookies: { access_token: token },
      } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn();

      authenticateJwt(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.user?.userId).toBe(mockUser.userId);
    });

    it('passes 401 AppError when token is missing', () => {
      const req = { headers: {} } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn();

      authenticateJwt(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const err = next.mock.calls[0]![0] as AppError;
      expect(err.statusCode).toBe(401);
      expect(err.code).toBe('UNAUTHORIZED');
    });

    it('passes 401 AppError when token is invalid or expired', () => {
      const req = {
        headers: { authorization: 'Bearer invalid_token_str' },
      } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn();

      authenticateJwt(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const err = next.mock.calls[0]![0] as AppError;
      expect(err.statusCode).toBe(401);
      expect(err.code).toBe('INVALID_TOKEN');
    });
  });

  describe('requireRole RBAC Guard', () => {
    it('calls next() when user has allowed role', () => {
      const guard = requireRole('LAB_STAFF', 'PHLEBOTOMIST');
      const req = { user: mockUser } as unknown as Request;
      const res = {} as Response;
      const next = vi.fn();

      guard(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('passes 403 AppError when user role is not allowed', () => {
      const guard = requireRole('PATIENT');
      const req = { user: mockUser } as unknown as Request; // role is LAB_STAFF
      const res = {} as Response;
      const next = vi.fn();

      guard(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const err = next.mock.calls[0]![0] as AppError;
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe('FORBIDDEN');
    });

    it('passes 401 AppError when req.user is undefined', () => {
      const guard = requireRole('LAB_STAFF');
      const req = {} as unknown as Request;
      const res = {} as Response;
      const next = vi.fn();

      guard(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      const err = next.mock.calls[0]![0] as AppError;
      expect(err.statusCode).toBe(401);
      expect(err.code).toBe('UNAUTHORIZED');
    });
  });
});
