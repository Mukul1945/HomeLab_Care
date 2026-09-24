import type { NextFunction, Request, Response } from 'express';
import type { V1UserRole } from '@homelab/shared-types';
import { env } from '../config/env.js';
import { verifyAccessToken } from '../modules/auth/auth.utils.js';
import { AppError } from '../shared/errors/app-error.js';

export function authenticateJwt(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    next(
      new AppError({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Authentication token required',
        expose: true,
      }),
    );
    return;
  }

  try {
    const payload = verifyAccessToken(token, env.AUTH_ACCESS_SECRET);
    req.user = {
      userId: payload.userId,
      tenantId: payload.tenantId,
      role: payload.role,
      branchId: payload.branchId,
      email: payload.email,
      phone: payload.phone,
    };
    next();
  } catch (err) {
    next(
      new AppError({
        statusCode: 401,
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired authentication token',
        expose: true,
      }),
    );
  }
}

export function requireRole(...allowedRoles: V1UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(
        new AppError({
          statusCode: 401,
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          expose: true,
        }),
      );
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        new AppError({
          statusCode: 403,
          code: 'FORBIDDEN',
          message: 'Permission denied for this action',
          expose: true,
        }),
      );
      return;
    }

    next();
  };
}
