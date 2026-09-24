import { Redis } from 'ioredis';
import { env } from './config/env.js';
import { createQueueRegistry } from './queues/index.js';
import { logger } from './shared/logger.js';

async function start(): Promise<void> {
  if (!env.REDIS_URL && env.NODE_ENV === 'production') {
    throw new Error('REDIS_URL is required in production');
  }

  if (!env.REDIS_URL) {
    logger.warn('REDIS_URL is not set; worker process is idle (Sprint 0 scaffold)');
    process.on('SIGINT', () => process.exit(0));
    process.on('SIGTERM', () => process.exit(0));
    await new Promise<void>(() => {
      /* keep the process alive until SIGINT/SIGTERM */
    });
    return;
  }

  const connection = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
  });

  await connection.connect();
  const queues = createQueueRegistry(connection);
  logger.info({ queues: Object.keys(queues) }, 'Worker connected; job processors not registered yet');

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Worker shutting down');
    await Promise.all(Object.values(queues).map((queue) => queue.close()));
    await connection.quit();
    process.exit(0);
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
}

start().catch((error: unknown) => {
  logger.fatal({ err: error }, 'Worker failed to start');
  process.exit(1);
});
