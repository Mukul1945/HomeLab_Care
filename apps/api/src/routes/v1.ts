import { Router } from 'express';
import { authRouter } from '../modules/auth/auth.routes.js';
import { catalogRouter } from '../modules/catalog/catalog.routes.js';
import { healthRouter } from '../modules/health/health.routes.js';
import { packageRouter } from '../modules/packages/package.routes.js';

export const v1Router = Router();

// Mount core modules on /api/v1
v1Router.use(healthRouter);
v1Router.use(authRouter);
v1Router.use(catalogRouter);
v1Router.use(packageRouter);
