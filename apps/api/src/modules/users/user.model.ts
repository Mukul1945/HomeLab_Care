import mongoose, { Schema, type Document } from 'mongoose';
import type { BaseDocument } from '../../shared/database/base.repository.js';
import type { V1UserRole } from '@homelab/shared-types';

export interface IUserDocument extends BaseDocument, Document {
  tenantId: string;
  email?: string;
  phone?: string;
  passwordHash?: string;
  role: V1UserRole;
  branchId?: string;
  status: 'ACTIVE' | 'SUSPENDED';
  isDeleted: boolean;
}

const userSchema = new Schema<IUserDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, select: false },
    role: { type: String, required: true, enum: ['PATIENT', 'PHLEBOTOMIST', 'LAB_STAFF'] },
    branchId: { type: String },
    status: { type: String, required: true, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
    isDeleted: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ tenantId: 1, email: 1 });
userSchema.index({ tenantId: 1, phone: 1 });

export const UserModel = mongoose.model<IUserDocument>('User', userSchema);
