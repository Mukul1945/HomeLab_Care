import { describe, expect, it, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../../app.js';
import { env } from '../../config/env.js';
import { TestCatalogModel, TestParameterModel } from './catalog.model.js';
import { signAccessToken } from '../auth/auth.utils.js';

describe('Catalog Domain Endpoints Integration', () => {
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
      await TestCatalogModel.deleteMany({});
      await TestParameterModel.deleteMany({});
    }
  });

  describe('POST /api/v1/catalog/tests', () => {
    it('allows LAB_STAFF to create a new test catalog entry', async () => {
      const response = await request(app)
        .post('/api/v1/catalog/tests')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          code: 'CBC',
          name: 'Complete Blood Count',
          category: 'Hematology',
          specimenType: 'Whole Blood EDTA',
          containerColor: 'Purple',
          fastingHours: 0,
          tatHours: 12,
          price: 499,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.code).toBe('CBC');
      expect(response.body.data.name).toBe('Complete Blood Count');
    });

    it('rejects duplicate test code for the same tenant', async () => {
      await TestCatalogModel.create({
        tenantId: 'default_lab_01',
        code: 'CBC',
        name: 'Complete Blood Count',
        category: 'Hematology',
        specimenType: 'Whole Blood EDTA',
        containerColor: 'Purple',
        fastingHours: 0,
        tatHours: 12,
        price: 499,
      });

      const response = await request(app)
        .post('/api/v1/catalog/tests')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          code: 'cbc',
          name: 'Complete Blood Count Duplicate',
          category: 'Hematology',
          specimenType: 'Whole Blood EDTA',
          containerColor: 'Purple',
          price: 550,
        });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('DUPLICATE_TEST_CODE');
    });

    it('denies PATIENT role from creating tests', async () => {
      const response = await request(app)
        .post('/api/v1/catalog/tests')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          code: 'TSH',
          name: 'Thyroid Stimulating Hormone',
          category: 'Immunology',
          specimenType: 'Serum',
          containerColor: 'Yellow',
          price: 299,
        });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('POST /api/v1/catalog/tests/:id/parameters', () => {
    it('allows LAB_STAFF to add a parameter to an existing test', async () => {
      const testDoc = await TestCatalogModel.create({
        tenantId: 'default_lab_01',
        code: 'CBC',
        name: 'Complete Blood Count',
        category: 'Hematology',
        specimenType: 'Whole Blood EDTA',
        containerColor: 'Purple',
        price: 499,
      });

      const response = await request(app)
        .post(`/api/v1/catalog/tests/${testDoc._id}/parameters`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          name: 'Hemoglobin',
          unit: 'g/dL',
          gender: 'ALL',
          minAge: 0,
          maxAge: 120,
          normalMin: 13.0,
          normalMax: 17.0,
          criticalMin: 7.0,
          criticalMax: 20.0,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Hemoglobin');
      expect(response.body.data.unit).toBe('g/dL');
    });
  });

  describe('GET /api/v1/catalog/tests', () => {
    it('allows public users to search and list active catalog tests', async () => {
      await TestCatalogModel.create([
        {
          tenantId: 'default_lab_01',
          code: 'CBC',
          name: 'Complete Blood Count',
          category: 'Hematology',
          specimenType: 'Whole Blood EDTA',
          containerColor: 'Purple',
          price: 499,
          isActive: true,
        },
        {
          tenantId: 'default_lab_01',
          code: 'LFT',
          name: 'Liver Function Test',
          category: 'Biochemistry',
          specimenType: 'Serum',
          containerColor: 'Yellow',
          price: 799,
          isActive: true,
        },
      ]);

      const response = await request(app).get('/api/v1/catalog/tests?search=Liver');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].code).toBe('LFT');
    });

    it('returns test details with parameter list on GET /api/v1/catalog/tests/:id', async () => {
      const testDoc = await TestCatalogModel.create({
        tenantId: 'default_lab_01',
        code: 'CBC',
        name: 'Complete Blood Count',
        category: 'Hematology',
        specimenType: 'Whole Blood EDTA',
        containerColor: 'Purple',
        price: 499,
      });

      await TestParameterModel.create({
        tenantId: 'default_lab_01',
        testId: testDoc._id,
        name: 'Hemoglobin',
        unit: 'g/dL',
        gender: 'ALL',
        minAge: 0,
        maxAge: 120,
        normalMin: 13.0,
        normalMax: 17.0,
      });

      const response = await request(app).get(`/api/v1/catalog/tests/${testDoc._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Complete Blood Count');
      expect(response.body.data.parameters).toHaveLength(1);
      expect(response.body.data.parameters[0].name).toBe('Hemoglobin');
    });
  });
});
