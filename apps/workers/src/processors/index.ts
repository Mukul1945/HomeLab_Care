/**
 * Worker Processors Boundary
 * Materialized placeholder for BullMQ job queue processors (notifications, pdf-generation, audit).
 */
export const PROCESSOR_NAMES = ['notifications', 'pdf-generation', 'audit-export'] as const;
