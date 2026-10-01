import { env } from '../../config/env.js';
import { AppError } from '../../shared/errors/app-error.js';
import { UserModel } from '../users/user.model.js';
import { OtpModel } from './otp.model.js';
import {
  generateNumericOtp,
  hashOtp,
  hashPassword,
  signAccessToken,
  signRefreshToken,
  verifyPassword,
  verifyRefreshToken,
} from './auth.utils.js';
import type { AuthUserContext } from '@homelab/shared-types';

const MAX_OTP_ATTEMPTS = 3;
const OTP_EXPIRY_MINUTES = 5;

export async function staffLogin(options: {
  tenantId: string;
  email: string;
  password: string;
}): Promise<{ accessToken: string; refreshToken: string; user: AuthUserContext }> {
  const user = await UserModel.findOne({
    tenantId: options.tenantId,
    email: options.email.toLowerCase().trim(),
    isDeleted: false,
  }).select('+passwordHash');

  if (!user || !user.passwordHash) {
    throw new AppError({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password',
      expose: true,
    });
  }

  if (user.status !== 'ACTIVE') {
    throw new AppError({
      statusCode: 403,
      code: 'ACCOUNT_SUSPENDED',
      message: 'Account is suspended',
      expose: true,
    });
  }

  const isValid = await verifyPassword(options.password, user.passwordHash);
  if (!isValid) {
    throw new AppError({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password',
      expose: true,
    });
  }

  const userContext: AuthUserContext = {
    userId: user._id.toString(),
    tenantId: user.tenantId,
    role: user.role,
    branchId: user.branchId,
    email: user.email,
    phone: user.phone,
  };

  const accessToken = signAccessToken(userContext, env.AUTH_ACCESS_SECRET);
  const refreshToken = signRefreshToken(userContext, env.AUTH_REFRESH_SECRET);

  return { accessToken, refreshToken, user: userContext };
}

export async function requestPatientOtp(options: {
  tenantId: string;
  phone: string;
}): Promise<{ message: string; devOtp?: string }> {
  const cleanPhone = options.phone.trim();
  const rawOtp = generateNumericOtp();
  const hashedOtp = hashOtp(rawOtp, env.OTP_HASH_SECRET);

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Invalidate previous unexpired OTPs for this phone
  await OtpModel.updateMany(
    { tenantId: options.tenantId, phone: cleanPhone, used: false },
    { $set: { used: true } },
  );

  await OtpModel.create({
    tenantId: options.tenantId,
    phone: cleanPhone,
    otpHash: hashedOtp,
    attempts: 0,
    expiresAt,
    used: false,
  });

  // Return devOtp in development mode for easy testing
  const devOtp = env.NODE_ENV !== 'production' ? rawOtp : undefined;

  return {
    message: 'OTP sent successfully',
    devOtp,
  };
}

export async function verifyPatientOtp(options: {
  tenantId: string;
  phone: string;
  otp: string;
}): Promise<{ accessToken: string; refreshToken: string; user: AuthUserContext }> {
  const cleanPhone = options.phone.trim();

  const otpRecord = await OtpModel.findOne({
    tenantId: options.tenantId,
    phone: cleanPhone,
    used: false,
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new AppError({
      statusCode: 400,
      code: 'INVALID_OTP',
      message: 'Invalid or expired OTP',
      expose: true,
    });
  }

  if (otpRecord.expiresAt < new Date()) {
    otpRecord.used = true;
    await otpRecord.save();
    throw new AppError({
      statusCode: 400,
      code: 'EXPIRED_OTP',
      message: 'OTP has expired. Please request a new one.',
      expose: true,
    });
  }

  if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
    otpRecord.used = true;
    await otpRecord.save();
    throw new AppError({
      statusCode: 400,
      code: 'MAX_ATTEMPTS_EXCEEDED',
      message: 'Too many failed OTP attempts. Please request a new OTP.',
      expose: true,
    });
  }

  const expectedHash = hashOtp(options.otp.trim(), env.OTP_HASH_SECRET);
  if (otpRecord.otpHash !== expectedHash) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new AppError({
      statusCode: 400,
      code: 'INVALID_OTP',
      message: 'Invalid or incorrect OTP',
      expose: true,
    });
  }

  otpRecord.used = true;
  await otpRecord.save();

  // Find or auto-create patient User
  let user = await UserModel.findOne({
    tenantId: options.tenantId,
    phone: cleanPhone,
    isDeleted: false,
  });

  if (!user) {
    user = await UserModel.create({
      tenantId: options.tenantId,
      phone: cleanPhone,
      role: 'PATIENT',
      status: 'ACTIVE',
      isDeleted: false,
    });
  }

  const userContext: AuthUserContext = {
    userId: user._id.toString(),
    tenantId: user.tenantId,
    role: user.role,
    phone: user.phone,
  };

  const accessToken = signAccessToken(userContext, env.AUTH_ACCESS_SECRET);
  const refreshToken = signRefreshToken(userContext, env.AUTH_REFRESH_SECRET);

  return { accessToken, refreshToken, user: userContext };
}

export async function refreshTokens(
  token: string,
): Promise<{ accessToken: string; refreshToken: string; user: AuthUserContext }> {
  try {
    const payload = verifyRefreshToken(token, env.AUTH_REFRESH_SECRET);

    const user = await UserModel.findOne({
      _id: payload.userId,
      tenantId: payload.tenantId,
      isDeleted: false,
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new AppError({
        statusCode: 401,
        code: 'INVALID_TOKEN',
        message: 'Invalid session or user account suspended',
        expose: true,
      });
    }

    const userContext: AuthUserContext = {
      userId: user._id.toString(),
      tenantId: user.tenantId,
      role: user.role,
      branchId: user.branchId,
      email: user.email,
      phone: user.phone,
    };

    const newAccessToken = signAccessToken(userContext, env.AUTH_ACCESS_SECRET);
    const newRefreshToken = signRefreshToken(userContext, env.AUTH_REFRESH_SECRET);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken, user: userContext };
  } catch (err) {
    throw new AppError({
      statusCode: 401,
      code: 'INVALID_TOKEN',
      message: 'Invalid or expired refresh token',
      expose: true,
    });
  }
}
