import { Router } from 'express';
import { authenticateJwt, requireRole } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate-request.js';
import {
  addParameterHandler,
  createTestHandler,
  getTestByIdHandler,
  listTestsHandler,
  updateTestHandler,
} from './catalog.controller.js';
import {
  catalogQuerySchema,
  createParameterSchema,
  createTestSchema,
  updateTestSchema,
} from './catalog.validation.js';

export const catalogRouter = Router();

// Public routes
catalogRouter.get('/catalog/tests', validateRequest({ query: catalogQuerySchema }), (req, res, next) => {
  void listTestsHandler(req, res).catch(next);
});

catalogRouter.get('/catalog/tests/:id', (req, res, next) => {
  void getTestByIdHandler(req, res).catch(next);
});

// Protected Staff routes
catalogRouter.post(
  '/catalog/tests',
  authenticateJwt,
  requireRole('LAB_STAFF'),
  validateRequest({ body: createTestSchema }),
  (req, res, next) => {
    void createTestHandler(req, res).catch(next);
  },
);

catalogRouter.put(
  '/catalog/tests/:id',
  authenticateJwt,
  requireRole('LAB_STAFF'),
  validateRequest({ body: updateTestSchema }),
  (req, res, next) => {
    void updateTestHandler(req, res).catch(next);
  },
);

catalogRouter.post(
  '/catalog/tests/:id/parameters',
  authenticateJwt,
  requireRole('LAB_STAFF'),
  validateRequest({ body: createParameterSchema }),
  (req, res, next) => {
    void addParameterHandler(req, res).catch(next);
  },
);
