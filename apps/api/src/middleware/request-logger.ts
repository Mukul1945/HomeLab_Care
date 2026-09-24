import type { Request } from 'express';
import { pinoHttp } from 'pino-http';
import { logger } from '../shared/logger.js';

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req: Request) => req.requestId,
  customProps: (req: Request) => ({ requestId: req.requestId }),
});
