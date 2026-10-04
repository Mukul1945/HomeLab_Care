import { z } from 'zod';

export const createTestSchema = z.object({
  code: z.string().min(2, 'Code must be at least 2 characters').max(20),
  name: z.string().min(2, 'Test name is required'),
  category: z.string().min(2, 'Category is required'),
  specimenType: z.string().min(2, 'Specimen type is required'),
  containerColor: z.string().min(2, 'Container color is required'),
  fastingHours: z.coerce.number().int().min(0).default(0),
  tatHours: z.coerce.number().int().positive().default(24),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  isActive: z.boolean().optional().default(true),
  tenantId: z.string().optional(),
});

export const updateTestSchema = createTestSchema.partial();

export const createParameterSchema = z.object({
  name: z.string().min(1, 'Parameter name is required'),
  unit: z.string().min(1, 'Unit is required'),
  gender: z.enum(['ALL', 'MALE', 'FEMALE']).default('ALL'),
  minAge: z.coerce.number().min(0).default(0),
  maxAge: z.coerce.number().max(120).default(120),
  normalMin: z.coerce.number(),
  normalMax: z.coerce.number(),
  criticalMin: z.coerce.number().optional(),
  criticalMax: z.coerce.number().optional(),
});

export const catalogQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  tenantId: z.string().optional(),
});
