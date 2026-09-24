import { Router } from 'express';
import { healthController } from './health.controller.js';

export const healthRouter = Router();

healthRouter.get('/health', (req, res, next) => {
  void healthController(req, res).catch(next);
});

healthRouter.get('/ready', (req, res, next) => {
  void healthController(req, res).catch(next);
});

healthRouter.get('/api/v1/health', (req, res, next) => {
  void healthController(req, res).catch(next);
});

healthRouter.get('/api/v1/ready', (req, res, next) => {
  void healthController(req, res).catch(next);
});

