import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from './validate-request.js';
import { AppError } from '../shared/errors/app-error.js';

describe('validateRequest Middleware', () => {
  it('calls next() when validation passes', () => {
    const middleware = validateRequest({
      body: z.object({ email: z.string().email() }),
    });

    const req = { body: { email: 'test@example.com' } } as Request;
    const res = {} as Response;
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('passes AppError to next() when validation fails', () => {
    const middleware = validateRequest({
      body: z.object({ phone: z.string().min(10) }),
    });

    const req = { body: { phone: '123' } } as Request;
    const res = {} as Response;
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const error = next.mock.calls[0]![0] as AppError;
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('INVALID_INPUT');
    expect(error.fields.phone).toBeDefined();
  });
});
