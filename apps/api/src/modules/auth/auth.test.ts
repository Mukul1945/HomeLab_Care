import { describe, expect, it, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../../app.js';
import { env } from '../../config/env.js';
import { UserModel } from '../users/user.model.js';
import { OtpModel } from './otp.model.js';
import { hashPassword, hashOtp } from './auth.utils.js';

describe('Auth Domain Endpoints Integration', () => {
  const app = createApp();

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGODB_URI || 'mongodb://127.0.0.1:27017/homelab_care_test');
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    if (mongoose.connection.db) {
      await UserModel.deleteMany({});
      await OtpModel.deleteMany({});
    }
  });

  describe('POST /api/v1/auth/staff/login', () => {
    it('authenticates valid staff credentials and sets HTTP-only refresh cookie', async () => {
      const passwordHash = await hashPassword('StaffPass123!');
      await UserModel.create({
        tenantId: 'default_lab_01',
        email: 'labtech@homelab.com',
        passwordHash,
        role: 'LAB_STAFF',
        status: 'ACTIVE',
        isDeleted: false,
      });

      const response = await request(app)
        .post('/api/v1/auth/staff/login')
        .send({
          email: 'labtech@homelab.com',
          password: 'StaffPass123!',
          tenantId: 'default_lab_01',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toEqual(expect.any(String));
      expect(response.body.data.user.role).toBe('LAB_STAFF');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('rejects invalid password with generic INVALID_CREDENTIALS error', async () => {
      const passwordHash = await hashPassword('CorrectPass123!');
      await UserModel.create({
        tenantId: 'default_lab_01',
        email: 'labtech@homelab.com',
        passwordHash,
        role: 'LAB_STAFF',
        status: 'ACTIVE',
      });

      const response = await request(app)
        .post('/api/v1/auth/staff/login')
        .send({
          email: 'labtech@homelab.com',
          password: 'WrongPassword!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('rejects suspended staff account', async () => {
      const passwordHash = await hashPassword('StaffPass123!');
      await UserModel.create({
        tenantId: 'default_lab_01',
        email: 'suspended@homelab.com',
        passwordHash,
        role: 'LAB_STAFF',
        status: 'SUSPENDED',
      });

      const response = await request(app)
        .post('/api/v1/auth/staff/login')
        .send({
          email: 'suspended@homelab.com',
          password: 'StaffPass123!',
        });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('ACCOUNT_SUSPENDED');
    });
  });

  describe('Patient OTP Flow', () => {
    it('creates OTP record on request-otp', async () => {
      const response = await request(app)
        .post('/api/v1/auth/patient/request-otp')
        .send({ phone: '9876543210' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const record = await OtpModel.findOne({ phone: '9876543210', used: false });
      expect(record).not.toBeNull();
      expect(record?.phone).toBe('9876543210');
    });

    it('verifies valid OTP and returns JWT tokens + auto-creates patient account', async () => {
      const otpHash = hashOtp('123456', env.OTP_HASH_SECRET);
      await OtpModel.create({
        tenantId: 'default_lab_01',
        phone: '9876543210',
        otpHash,
        attempts: 0,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        used: false,
      });

      const response = await request(app)
        .post('/api/v1/auth/patient/verify-otp')
        .send({ phone: '9876543210', otp: '123456' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('PATIENT');
      expect(response.body.data.accessToken).toEqual(expect.any(String));

      // Check OTP marked used
      const record = await OtpModel.findOne({ phone: '9876543210' });
      expect(record?.used).toBe(true);
    });

    it('locks out after 3 failed OTP attempts', async () => {
      const otpHash = hashOtp('123456', env.OTP_HASH_SECRET);
      await OtpModel.create({
        tenantId: 'default_lab_01',
        phone: '9876543210',
        otpHash,
        attempts: 3,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        used: false,
      });

      const response = await request(app)
        .post('/api/v1/auth/patient/verify-otp')
        .send({ phone: '9876543210', otp: '123456' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MAX_ATTEMPTS_EXCEEDED');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('returns user context when valid access token provided', async () => {
      const user = await UserModel.create({
        tenantId: 'default_lab_01',
        phone: '9876543210',
        role: 'PATIENT',
        status: 'ACTIVE',
      });

      // Perform login/verify to get token
      const otpHash = hashOtp('654321', env.OTP_HASH_SECRET);
      await OtpModel.create({
        tenantId: 'default_lab_01',
        phone: '9876543210',
        otpHash,
        attempts: 0,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        used: false,
      });

      const loginRes = await request(app)
        .post('/api/v1/auth/patient/verify-otp')
        .send({ phone: '9876543210', otp: '654321' });

      const token = loginRes.body.data.accessToken;

      const meRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.success).toBe(true);
      expect(meRes.body.data.user.role).toBe('PATIENT');
    });
  });
});
