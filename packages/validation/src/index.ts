import { z } from 'zod';

export const envNameSchema = z.enum(['development', 'test', 'production']);

export const nodeEnvSchema = z
  .string()
  .optional()
  .transform((value) => value ?? 'development')
  .pipe(envNameSchema);

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationSchema>;

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const pathKey = issue.path.join('.') || 'root';
    errors[pathKey] = issue.message;
  }

  return { success: false, errors };
}

