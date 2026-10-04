import { describe, expect, it, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../../app.js';
import { env } from '../../config/env.js';
import { HealthPackageModel } from './package.model.js';
import { TestCatalogModel } from '../catalog/catalog.model.js';
import { signAccessToken } from '../auth/auth.utils.js';

describe('Health Packages Domain Endpoints Integration', () => {
  const app = createApp();
  let staffToken: string;
  let patientToken: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGODB_URI || 'mongodb://127.0.0.1:27017/homelab_care_test');
    }

    staffToken = signAccessToken(
      { userId: 'staff_1', tenantId: 'default_lab_01', role: 'LAB_STAFF', email: 'staff@lab.com' },
      env.AUTH_ACCESS_SECRET,
    );

    patientToken = signAccessToken(
      { userId: 'patient_1', tenantId: 'default_lab_01', role: 'PATIENT', phone: '9876543210' },
      env.AUTH_ACCESS_SECRET,
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    if (mongoose.connection.db) {
      await HealthPackageModel.deleteMany({});
      await TestCatalogModel.deleteMany({});
    }
  });

  describe('POST /api/v1/packages', () => {
    it('allows LAB_STAFF to create a health package bundling valid tests', async () => {
      const test1 = await TestCatalogModel.create({
        tenantId: 'default_lab_01',
        code: 'CBC',
        name: 'Complete Blood Count',
        category: 'Hematology',
        specimenType: 'Whole Blood EDTA',
        containerColor: 'Purple',
        fastingHours: 0,
        price: 499,
      });

      const test2 = await TestCatalogModel.create({
        tenantId: 'default_lab_01',
        code: 'FBS',
        name: 'Fasting Blood Sugar',
        category: 'Diabetology',
        specimenType: 'Fluoride Plasma',
        containerColor: 'Gray',
        fastingHours: 8,
        price: 199,
      });

      const response = await request(app)
        .post('/api/v1/packages')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          code: 'FULL_BODY_01',
          name: 'Basic Health Checkup',
          description: 'Comprehensive health package covering CBC and Fasting Blood Sugar',
          category: 'Full Body Checkup',
          testIds: [test1._id.toString(), test2._id.toString()],
          originalPrice: 698,
          discountPrice: 499,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.code).toBe('FULL_BODY_01');
      expect(response.body.data.fastingHours).toBe(8); // Auto-calculated max fasting requirement
      expect(response.body.data.tests).toHaveLength(2);
    });

    it('rejects creation when bundled test ID does not exist in catalog', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .post('/api/v1/packages')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          code: 'INVALID_PKG',
          name: 'Invalid Package',
          description: 'Package with invalid test id',
          category: 'General',
          testIds: [nonExistentId],
          originalPrice: 500,
          discountPrice: 400,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_TEST_ID');
    });

    it('denies PATIENT role from creating packages', async () => {
      const response = await request(app)
        .post('/api/v1/packages')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          code: 'PKG_PATIENT',
          name: 'Patient Package',
          description: 'Package attempt by patient',
          category: 'General',
          testIds: [new mongoose.Types.ObjectId().toString()],
          originalPrice: 500,
          discountPrice: 400,
        });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('GET /api/v1/packages', () => {
    it('allows public users to list active health packages with populated tests', async () => {
      const test1 = await TestCatalogModel.create({
        tenantId: 'default_lab_01',
        code: 'CBC',
        name: 'Complete Blood Count',
        category: 'Hematology',
        specimenType: 'Whole Blood EDTA',
        containerColor: 'Purple',
        price: 499,
      });

      await HealthPackageModel.create({
        tenantId: 'default_lab_01',
        code: 'PKG_CHECKUP',
        name: 'Full Body Checkup',
        description: 'Comprehensive checkup',
        category: 'Full Body Checkup',
        testIds: [test1._id],
        originalPrice: 499,
        discountPrice: 399,
        fastingHours: 0,
        isActive: true,
      });

      const response = await request(app).get('/api/v1/packages?search=Full');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].code).toBe('PKG_CHECKUP');
      expect(response.body.data[0].tests[0].code).toBe('CBC');
    });
  });
});
