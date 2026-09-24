import type { ApiErrorBody, ApiSuccess } from '@homelab/shared-types';

export function success<T>(data: T, requestId: string, extraMeta: Partial<ApiSuccess<T>['meta']> = {}): ApiSuccess<T> {
  return {
    success: true,
    data,
    meta: { requestId, ...extraMeta },
  };
}

export function failure(
  requestId: string,
  error: { code: string; message: string; fields?: Record<string, string> },
): ApiErrorBody {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      fields: error.fields ?? {},
    },
    meta: { requestId },
  };
}
