export type HealthStatus = 'ok' | 'degraded' | 'unavailable';

export type HealthCheck = {
  status: HealthStatus;
  details?: string;
};

export type HealthResponse = {
  status: HealthStatus;
  service: string;
  checks: {
    api: HealthCheck;
    mongodb: HealthCheck;
    redis: HealthCheck;
  };
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta: {
    requestId: string;
    page?: number;
    limit?: number;
    total?: number;
  };
};

export type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
  meta: {
    requestId: string;
  };
};

export type V1UserRole = 'PATIENT' | 'PHLEBOTOMIST' | 'LAB_STAFF';

export type V1BookingStatus =
  | 'DRAFT'
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'ASSIGNED'
  | 'EN_ROUTE'
  | 'SAMPLE_COLLECTED'
  | 'SAMPLE_RECEIVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';
export type AuthUserContext = {
  userId: string;
  tenantId: string;
  role: V1UserRole;
  branchId?: string;
  email?: string;
  phone?: string;
};

export type AuthTokenPayload = AuthUserContext & {
  iat?: number;
  exp?: number;
};
