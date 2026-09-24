import type { Request, Response } from 'express';
import { success } from '../../shared/http/envelope.js';
import { getHealth } from './health.service.js';

export async function healthController(req: Request, res: Response): Promise<void> {
  const data = await getHealth();
  const httpStatus = data.status === 'unavailable' ? 503 : 200;
  res.status(httpStatus).json(success(data, req.requestId));
}
