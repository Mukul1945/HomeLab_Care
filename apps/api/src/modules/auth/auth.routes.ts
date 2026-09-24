import { Router } from 'express';
import { authenticateJwt } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate-request.js';
import {
  logoutHandler,
  meHandler,
  refreshHandler,
  requestPatientOtpHandler,
  staffLoginHandler,
  verifyPatientOtpHandler,
} from './auth.controller.js';
import { requestOtpSchema, staffLoginSchema, verifyOtpSchema } from './auth.validation.js';

export const authRouter = Router();

authRouter.post('/auth/staff/login', validateRequest({ body: staffLoginSchema }), (req, res, next) => {
  void staffLoginHandler(req, res).catch(next);
});

authRouter.post('/auth/patient/request-otp', validateRequest({ body: requestOtpSchema }), (req, res, next) => {
  void requestPatientOtpHandler(req, res).catch(next);
});

authRouter.post('/auth/patient/verify-otp', validateRequest({ body: verifyOtpSchema }), (req, res, next) => {
  void verifyPatientOtpHandler(req, res).catch(next);
});

authRouter.post('/auth/refresh', (req, res, next) => {
  void refreshHandler(req, res).catch(next);
});

authRouter.post('/auth/logout', (req, res, next) => {
  void logoutHandler(req, res).catch(next);
});

authRouter.get('/auth/me', authenticateJwt, (req, res, next) => {
  void meHandler(req, res).catch(next);
});
