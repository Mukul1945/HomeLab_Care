import type { HealthResponse, HealthStatus } from '@homelab/shared-types';
import { mongoHealth } from '../../config/mongo.js';
import { redisHealth } from '../../config/redis.js';

function rollup(statuses: HealthStatus[]): HealthStatus {
  if (statuses.includes('unavailable')) {
    return 'unavailable';
  }
  if (statuses.includes('degraded')) {
    return 'degraded';
  }
  return 'ok';
}

export async function getHealth(): Promise<HealthResponse> {
  const [mongodb, redis] = await Promise.all([mongoHealth(), redisHealth()]);
  const api = { status: 'ok' as const };

  return {
    status: rollup([api.status, mongodb.status, redis.status]),
    service: 'api',
    checks: {
      api,
      mongodb,
      redis,
    },
  };
}
