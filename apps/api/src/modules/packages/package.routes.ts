import { Router } from 'express';
import { authenticateJwt, requireRole } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate-request.js';
import {
  createPackageHandler,
  getPackageByIdHandler,
  listPackagesHandler,
  updatePackageHandler,
} from './package.controller.js';
import { createPackageSchema, packageQuerySchema, updatePackageSchema } from './package.validation.js';

export const packageRouter = Router();

// Public routes
packageRouter.get('/packages', validateRequest({ query: packageQuerySchema }), (req, res, next) => {
  void listPackagesHandler(req, res).catch(next);
});

packageRouter.get('/packages/:id', (req, res, next) => {
  void getPackageByIdHandler(req, res).catch(next);
});

// Protected Staff routes
packageRouter.post(
  '/packages',
  authenticateJwt,
  requireRole('LAB_STAFF'),
  validateRequest({ body: createPackageSchema }),
  (req, res, next) => {
    void createPackageHandler(req, res).catch(next);
  },
);

packageRouter.put(
  '/packages/:id',
  authenticateJwt,
  requireRole('LAB_STAFF'),
  validateRequest({ body: updatePackageSchema }),
  (req, res, next) => {
    void updatePackageHandler(req, res).catch(next);
  },
);
