import type { Request, Response } from 'express';
import { env } from '../../config/env.js';
import { success } from '../../shared/http/envelope.js';
import * as authService from './auth.service.js';

function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(env.SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth',
  });
}

function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(env.SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/v1/auth',
  });
}

export async function staffLoginHandler(req: Request, res: Response): Promise<void> {
  const tenantId = (req.body.tenantId as string) || 'default_lab_01';
  const result = await authService.staffLogin({
    tenantId,
    email: req.body.email,
    password: req.body.password,
  });

  setRefreshTokenCookie(res, result.refreshToken);
  res.status(200).json(
    success(
      {
        accessToken: result.accessToken,
        user: result.user,
      },
      req.requestId,
    ),
  );
}

export async function requestPatientOtpHandler(req: Request, res: Response): Promise<void> {
  const tenantId = (req.body.tenantId as string) || 'default_lab_01';
  const result = await authService.requestPatientOtp({
    tenantId,
    phone: req.body.phone,
  });

  res.status(200).json(success(result, req.requestId));
}

export async function verifyPatientOtpHandler(req: Request, res: Response): Promise<void> {
  const tenantId = (req.body.tenantId as string) || 'default_lab_01';
  const result = await authService.verifyPatientOtp({
    tenantId,
    phone: req.body.phone,
    otp: req.body.otp,
  });

  setRefreshTokenCookie(res, result.refreshToken);
  res.status(200).json(
    success(
      {
        accessToken: result.accessToken,
        user: result.user,
      },
      req.requestId,
    ),
  );
}

export async function refreshHandler(req: Request, res: Response): Promise<void> {
  const refreshToken =
    req.cookies?.[env.SESSION_COOKIE_NAME] || req.body?.refreshToken || req.headers['x-refresh-token'];

  const result = await authService.refreshTokens(refreshToken);

  setRefreshTokenCookie(res, result.refreshToken);
  res.status(200).json(
    success(
      {
        accessToken: result.accessToken,
        user: result.user,
      },
      req.requestId,
    ),
  );
}

export async function logoutHandler(req: Request, res: Response): Promise<void> {
  clearRefreshTokenCookie(res);
  res.status(200).json(success({ message: 'Logged out successfully' }, req.requestId));
}

export async function meHandler(req: Request, res: Response): Promise<void> {
  res.status(200).json(success({ user: req.user }, req.requestId));
}
