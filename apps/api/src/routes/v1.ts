import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes.js';
import { healthRouter } from '../modules/health/health.routes.js';

export const v1Router = Router();

// Mount core modules on /api/v1
v1Router.use(healthRouter);
v1Router.use(authRouter);
