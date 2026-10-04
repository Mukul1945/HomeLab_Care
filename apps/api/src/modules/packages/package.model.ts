import mongoose, { Schema, type Document } from 'mongoose';
import type { BaseDocument } from '../../shared/database/base.repository.js';

export interface IHealthPackageDocument extends BaseDocument, Document {
  tenantId: string;
  code: string;
  name: string;
  description: string;
  category: string;
  testIds: mongoose.Types.ObjectId[];
  originalPrice: number;
  discountPrice: number;
  fastingHours: number;
  isActive: boolean;
  isDeleted: boolean;
}

const healthPackageSchema = new Schema<IHealthPackageDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    testIds: [{ type: Schema.Types.ObjectId, ref: 'TestCatalog', required: true }],
    originalPrice: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, required: true, min: 0 },
    fastingHours: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  },
);

healthPackageSchema.index({ tenantId: 1, code: 1 }, { unique: true });
healthPackageSchema.index({ tenantId: 1, category: 1 });
healthPackageSchema.index({ tenantId: 1, isActive: 1 });

export const HealthPackageModel = mongoose.model<IHealthPackageDocument>('HealthPackage', healthPackageSchema);
