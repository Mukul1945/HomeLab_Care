import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { QUEUE_NAMES } from './names.js';

export function createQueueRegistry(connection: Redis) {
  return {
    notifications: new Queue(QUEUE_NAMES.notifications, { connection }),
    reports: new Queue(QUEUE_NAMES.reports, { connection }),
    reminders: new Queue(QUEUE_NAMES.reminders, { connection }),
    integrations: new Queue(QUEUE_NAMES.integrations, { connection }),
    analytics: new Queue(QUEUE_NAMES.analytics, { connection }),
  };
}
