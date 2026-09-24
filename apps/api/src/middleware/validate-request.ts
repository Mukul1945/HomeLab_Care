import type { NextFunction, Request, Response } from 'express';
import type { z } from 'zod';
import { validateData } from '@homelab/validation';
import { AppError } from '../shared/errors/app-error.js';

export interface RequestValidationSchemas {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}

export function validateRequest(schemas: RequestValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const fields: Record<string, string> = {};

    if (schemas.body) {
      const result = validateData(schemas.body, req.body);
      if (!result.success) {
        Object.assign(fields, result.errors);
      } else {
        req.body = result.data;
      }
    }

    if (schemas.query) {
      const result = validateData(schemas.query, req.query);
      if (!result.success) {
        Object.assign(fields, result.errors);
      } else {
        req.query = result.data as unknown as Request['query'];
      }
    }

    if (schemas.params) {
      const result = validateData(schemas.params, req.params);
      if (!result.success) {
        Object.assign(fields, result.errors);
      } else {
        req.params = result.data as Record<string, string>;
      }
    }

    if (Object.keys(fields).length > 0) {
      next(
        new AppError({
          statusCode: 400,
          code: 'INVALID_INPUT',
          message: 'Request validation failed',
          fields,
          expose: true,
        }),
      );
      return;
    }

    next();
  };
}
