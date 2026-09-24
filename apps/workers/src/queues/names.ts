/** Queue names from the Master Reference. Processors are added in later sprints. */
export const QUEUE_NAMES = {
  notifications: 'notifications',
  reports: 'reports',
  reminders: 'reminders',
  integrations: 'integrations',
  analytics: 'analytics',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
