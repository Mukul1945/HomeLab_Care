import mongoose, { Schema, type Document } from 'mongoose';
import type { BaseDocument } from '../../shared/database/base.repository.js';

export interface IOtpDocument extends BaseDocument, Document {
  tenantId: string;
  phone: string;
  otpHash: string;
  attempts: number;
  expiresAt: Date;
  used: boolean;
}

const otpSchema = new Schema<IOtpDocument>(
  {
    tenantId: { type: String, required: true, index: true },
    phone: { type: String, required: true, trim: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, required: true, default: 0 },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, required: true, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

otpSchema.index({ tenantId: 1, phone: 1, used: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpModel = mongoose.model<IOtpDocument>('AuthOtp', otpSchema);
