# Backend Foundation & Database Architecture

## Overview
This document describes the foundational backend architecture implemented in `apps/api` for Homelab Care Phase 1 Step 1.

---

## 1. Environment & Configuration
- **Validation**: Runtime environment variables are parsed and validated using Zod (`@homelab/config`).
- **Secrets Management**: Credentials (e.g. `MONGODB_URI`, `REDIS_URL`, `JWT_SECRET`) reside exclusively in `.env` and `.env.example`.
- **Defaults**: Local defaults are provided for `development` mode (`mongodb://127.0.0.1:27017/homelab_care`, `redis://127.0.0.1:6379`).

---

## 2. Database & Redis Connections
- **MongoDB (`apps/api/src/config/mongo.ts`)**: Managed via Mongoose 8. Includes `strictQuery: true`, connection error event handlers, and `disconnectMongo()` graceful shutdown.
- **Redis (`apps/api/src/config/redis.ts`)**: Managed via `ioredis`. Includes lazy connection, ping health checks, and `getRedis()` getter for background queues and caching.

---

## 3. API Routing & Versioning Boundary
- **Base Path**: `/api/v1`
- **Master Router**: `apps/api/src/routes/v1.ts` mounts all domain module routes under `/api/v1`.
- **Health & Readiness Endpoints**:
  - `GET /health` & `GET /api/v1/health` (Liveness)
  - `GET /ready` & `GET /api/v1/ready` (Readiness check returning HTTP 200 OK or HTTP 503 Service Unavailable based on MongoDB/Redis status)

---

## 4. Response Envelopes & Error Handling
- **Success Envelope**: `ApiSuccess<T>` with standard `meta: { requestId, page, limit, total }`.
- **Error Envelope**: `ApiErrorBody` with standard `error: { code, message, fields }`.
- **Centralized Error Handler (`apps/api/src/middleware/error-handler.ts`)**:
  - Exposes operational client errors (`statusCode < 500`).
  - Hides internal stack traces in production (returns `INTERNAL_ERROR` 500 without leaking sensitive trace details).

---

## 5. Tenant Isolation & Base Repository Pattern
- **Tenant Scope (`BaseRepository<T>`)**: Located at `apps/api/src/shared/database/base.repository.ts`.
- **Enforcement**: All database queries automatically append `{ tenantId, isDeleted: { $ne: true } }` to ensure mandatory multi-tenant isolation.
