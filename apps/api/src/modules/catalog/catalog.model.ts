import mongoose, { Schema, type Document } from 'mongoose';
import type { BaseDocument } from '../../shared/database/base.repository.js';

export interface ITestCatalogDocument extends BaseDocument, Document {
  tenantId: string;
  code: string;
  name: string;
  category: string;
  specimenType: string;
  containerColor: string;
  fastingHours: number;
  tatHours: number;
  price: number;
  isActive: boolean;
  isDeleted: boolean;
}

const testCatalogSchema = new Schema<ITestCatalogDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    specimenType: { type: String, required: true, trim: true },
    containerColor: { type: String, required: true, trim: true },
    fastingHours: { type: Number, required: true, default: 0 },
    tatHours: { type: Number, required: true, default: 24 },
    price: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  },
);

testCatalogSchema.index({ tenantId: 1, code: 1 }, { unique: true });
testCatalogSchema.index({ tenantId: 1, category: 1 });
testCatalogSchema.index({ tenantId: 1, isActive: 1 });

export const TestCatalogModel = mongoose.model<ITestCatalogDocument>('TestCatalog', testCatalogSchema);

export interface ITestParameterDocument extends BaseDocument, Document {
  tenantId: string;
  testId: mongoose.Types.ObjectId;
  name: string;
  unit: string;
  gender: 'ALL' | 'MALE' | 'FEMALE';
  minAge: number;
  maxAge: number;
  normalMin: number;
  normalMax: number;
  criticalMin?: number;
  criticalMax?: number;
  isDeleted: boolean;
}

const testParameterSchema = new Schema<ITestParameterDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    testId: { type: Schema.Types.ObjectId, ref: 'TestCatalog', required: true, index: true },
    name: { type: String, required: true, trim: true },
    unit: { type: String, required: true, trim: true },
    gender: { type: String, required: true, enum: ['ALL', 'MALE', 'FEMALE'], default: 'ALL' },
    minAge: { type: Number, required: true, default: 0 },
    maxAge: { type: Number, required: true, default: 120 },
    normalMin: { type: Number, required: true },
    normalMax: { type: Number, required: true },
    criticalMin: { type: Number },
    criticalMax: { type: Number },
    isDeleted: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  },
);

testParameterSchema.index({ tenantId: 1, testId: 1 });

export const TestParameterModel = mongoose.model<ITestParameterDocument>('TestParameter', testParameterSchema);
