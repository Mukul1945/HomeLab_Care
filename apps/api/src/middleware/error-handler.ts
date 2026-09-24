import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../shared/errors/app-error.js';
import { failure } from '../shared/http/envelope.js';
import { logger } from '../shared/logger.js';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json(
    failure(req.requestId, {
      code: 'NOT_FOUND',
      message: `No route for ${req.method} ${req.path}`,
    }),
  );
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    if (!err.expose) {
      logger.error({ err, requestId: req.requestId }, err.message);
    }

    res.status(err.statusCode).json(
      failure(req.requestId, {
        code: err.code,
        message: err.expose ? err.message : 'Unexpected server error',
        fields: err.fields,
      }),
    );
    return;
  }

  logger.error({ err, requestId: req.requestId }, 'Unhandled error');
  res.status(500).json(
    failure(req.requestId, {
      code: 'INTERNAL_ERROR',
      message: 'Unexpected server error',
    }),
  );
}
