import type { HealthCheck } from '@homelab/shared-types';
import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../shared/logger.js';

export async function connectMongo(): Promise<void> {
  if (!env.MONGODB_URI) {
    if (env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI is required in production');
    }
    logger.warn('MONGODB_URI is not set; API will start with a degraded MongoDB check');
    return;
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI);
  logger.info('MongoDB connected');
}

export async function disconnectMongo(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

export async function mongoHealth(): Promise<HealthCheck> {
  if (!env.MONGODB_URI) {
    return { status: 'degraded', details: 'MONGODB_URI is not configured' };
  }

  if (mongoose.connection.readyState !== 1) {
    return { status: 'unavailable', details: 'MongoDB is not connected' };
  }

  try {
    const db = mongoose.connection.db;
    if (!db) {
      return { status: 'unavailable', details: 'MongoDB database handle is missing' };
    }
    await db.admin().command({ ping: 1 });
    return { status: 'ok' };
  } catch (error) {
    return {
      status: 'unavailable',
      details: error instanceof Error ? error.message : 'MongoDB ping failed',
    };
  }
}
