import { nodeEnvSchema } from '@homelab/validation';
import { z } from 'zod';

const runtimeEnvSchema = z.object({
  NODE_ENV: nodeEnvSchema,
  PORT: z.coerce.number().int().positive().default(5000),
  PUBLIC_WEB_URL: z.string().url().default('http://localhost:3000'),
  OPS_WEB_URL: z.string().url().default('http://localhost:3001'),
  API_URL: z.string().url().default('http://localhost:5000'),
  MONGODB_URI: z.string().min(1).optional(),
  REDIS_URL: z.string().min(1).optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  AUTH_ACCESS_SECRET: z.string().min(16).default('dev_access_secret_min_32_characters_long'),
  AUTH_REFRESH_SECRET: z.string().min(16).default('dev_refresh_secret_min_32_characters_long'),
  SESSION_COOKIE_NAME: z.string().default('lab_refresh_token'),
  OTP_HASH_SECRET: z.string().default('dev_otp_hash_secret_key'),
});

const productionRequired = runtimeEnvSchema.superRefine((value, ctx) => {
  if (value.NODE_ENV !== 'production') {
    return;
  }

  if (!value.MONGODB_URI) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['MONGODB_URI'],
      message: 'MONGODB_URI is required in production',
    });
  }

  if (!value.REDIS_URL) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['REDIS_URL'],
      message: 'REDIS_URL is required in production',
    });
  }
});

export type AppEnv = z.infer<typeof runtimeEnvSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  const parsed = productionRequired.safeParse(source);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  return parsed.data;
}

export const corsOrigins = (env: AppEnv): string[] => [env.PUBLIC_WEB_URL, env.OPS_WEB_URL];
