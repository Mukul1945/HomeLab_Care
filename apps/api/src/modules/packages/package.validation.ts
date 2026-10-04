import { z } from 'zod';

export const createPackageSchema = z.object({
  code: z.string().min(2, 'Code must be at least 2 characters').max(20),
  name: z.string().min(2, 'Package name is required'),
  description: z.string().min(5, 'Description is required'),
  category: z.string().min(2, 'Category is required'),
  testIds: z.array(z.string().length(24, 'Invalid Test ID format')).min(1, 'At least one test must be included in the package'),
  originalPrice: z.coerce.number().min(0, 'Original price must be non-negative'),
  discountPrice: z.coerce.number().min(0, 'Discount price must be non-negative'),
  fastingHours: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional().default(true),
  tenantId: z.string().optional(),
});

export const updatePackageSchema = createPackageSchema.partial();

export const packageQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  tenantId: z.string().optional(),
});
