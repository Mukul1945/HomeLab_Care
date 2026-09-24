import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectMongo, disconnectMongo } from './config/mongo.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import { logger } from './shared/logger.js';

const app = createApp();

async function start(): Promise<void> {
  await connectMongo();
  await connectRedis();

  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'API listening');
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'API shutting down');
    server.close();
    await disconnectRedis();
    await disconnectMongo();
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
  logger.fatal({ err: error }, 'API failed to start');
  process.exit(1);
});
