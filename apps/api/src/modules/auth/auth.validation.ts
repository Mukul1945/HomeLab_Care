import { z } from 'zod';

export const staffLoginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  tenantId: z.string().optional(),
});

export const requestOtpSchema = z.object({
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits'),
  tenantId: z.string().optional(),
});

export const verifyOtpSchema = z.object({
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  tenantId: z.string().optional(),
});
