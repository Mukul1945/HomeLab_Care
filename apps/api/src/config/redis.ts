import type { HealthCheck } from '@homelab/shared-types';
import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from '../shared/logger.js';

let redis: Redis | undefined;

export async function connectRedis(): Promise<void> {
  if (!env.REDIS_URL) {
    if (env.NODE_ENV === 'production') {
      throw new Error('REDIS_URL is required in production');
    }
    logger.warn('REDIS_URL is not set; API will start with a degraded Redis check');
    return;
  }

  redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
  });

  await redis.connect();
  logger.info('Redis connected');
}

export function getRedis(): Redis | undefined {
  return redis;
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = undefined;
  }
}

export async function redisHealth(): Promise<HealthCheck> {
  if (!env.REDIS_URL) {
    return { status: 'degraded', details: 'REDIS_URL is not configured' };
  }

  if (!redis) {
    return { status: 'unavailable', details: 'Redis client is not initialized' };
  }

  try {
    const pong = await redis.ping();
    if (pong !== 'PONG') {
      return { status: 'unavailable', details: 'Redis ping returned an unexpected response' };
    }
    return { status: 'ok' };
  } catch (error) {
    return {
      status: 'unavailable',
      details: error instanceof Error ? error.message : 'Redis ping failed',
    };
  }
}
