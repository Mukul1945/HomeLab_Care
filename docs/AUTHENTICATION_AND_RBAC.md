# Authentication & Role-Based Access Control (RBAC) Architecture

## Overview
This document specifies the authentication, authorization, token lifecycle, and multi-tenant security mechanisms implemented in `apps/api` for Phase 1 Step 2.

---

## 1. V1 Roles & Security Boundaries

V1 defines 3 primary operational roles:
1. **`PATIENT`**: End-customer accessing the public website (`web-public`) to book home sample collections and view their own reports.
2. **`PHLEBOTOMIST`**: Field collection agent accessing the mobile collection view (`web-ops/(phlebotomist)`) to execute assigned visits and verify arrival OTPs.
3. **`LAB_STAFF`**: Unified internal laboratory staff role accessing `web-ops/(lab)` to manage bookings, assign phlebotomists, record sample receipt, enter test parameter results, and publish finalized reports.

---

## 2. Authentication Workflows

### A. Staff Authentication (Email & Password)
- **Endpoint**: `POST /api/v1/auth/staff/login`
- **Method**: Email + Password authentication for internal users (`LAB_STAFF`, `PHLEBOTOMIST`).
- **Security**: Passwords are hashed using `bcrypt` (12 salt rounds). Plaintext passwords are never stored or logged, and `passwordHash` is excluded from default database query returns (`select: false`). Account status must be `ACTIVE`.

### B. Patient Authentication (Passwordless Phone OTP)
- **Endpoints**:
  - `POST /api/v1/auth/patient/request-otp`
  - `POST /api/v1/auth/patient/verify-otp`
- **Method**: 6-digit numeric OTP generated via cryptographically secure `crypto.randomInt()`.
- **OTP Security**:
  - OTPs are stored exclusively as HMAC SHA256 hashes (`otpHash`).
  - **Expiration**: 5 minutes (`expiresAt`).
  - **Attempt Limit**: Maximum 3 failed verification attempts before the OTP is locked out (`MAX_ATTEMPTS_EXCEEDED`).
  - **Single Active OTP**: Requesting a new OTP automatically invalidates previous unexpired OTPs for that phone number.
  - **Auto-Registration**: Verifying a valid OTP for a new phone number automatically registers a Patient `User` with role `PATIENT`.

---

## 3. Token Lifecycle & Cookie Strategy

- **Access Token**: Short-lived JWT (15-minute expiration) passed in `Authorization: Bearer <token>` header or `access_token` cookie.
- **Refresh Token**: Long-lived JWT (7-day expiration) stored in an **HTTP-Only, SameSite=Lax** cookie (`lab_refresh_token`).
- **Token Claims Payload**:
  ```json
  {
    "userId": "64f1a2b3c4...",
    "tenantId": "default_lab_01",
    "role": "LAB_STAFF",
    "branchId": "branch_main",
    "email": "staff@homelab.com",
    "phone": "9876543210"
  }
  ```
- **Refresh Endpoint**: `POST /api/v1/auth/refresh` — Verifies refresh token, verifies user status is `ACTIVE`, issues a fresh access token & rotated refresh token.
- **Logout Endpoint**: `POST /api/v1/auth/logout` — Clears HTTP-only refresh cookie.

---

## 4. Tenant Context & Authorization Middleware

- **Authentication Middleware (`authenticateJwt`)**: Located at `apps/api/src/middleware/auth.ts`. Validates incoming JWT access token and populates `req.user` context.
- **Role Guard Middleware (`requireRole`)**: Restricts routes to specified V1 roles (`PATIENT`, `PHLEBOTOMIST`, `LAB_STAFF`). Returns HTTP 403 `FORBIDDEN` if the caller's role is not authorized.
- **Strict Tenant Isolation**: `req.user.tenantId` is strictly derived from the verified server-side JWT. Requests cannot override or bypass `tenantId` via body or query parameters.
