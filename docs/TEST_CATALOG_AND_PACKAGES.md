# Test Catalog & Health Packages Architecture

## Overview
This document specifies the architecture, data models, validation schemas, and REST endpoints for the **Test Catalog & Health Packages Module** (`apps/api/src/modules/catalog` and `apps/api/src/modules/packages`) implemented in Phase 1 Step 3.

---

## 1. Domain Entities & Schemas

### A. Test Catalog (`TestCatalogModel`)
- **Collection**: `TestCatalog`
- **Fields**:
  - `tenantId`: Multi-tenant isolation key (Indexed)
  - `code`: Unique uppercase test code (e.g. `CBC`, `LFT`, `TSH`, `FBS`, `HbA1c`)
  - `name`: Display name (e.g. "Complete Blood Count")
  - `category`: Category grouping (e.g. "Hematology", "Biochemistry", "Diabetology")
  - `specimenType`: Specimen type (e.g. "Whole Blood EDTA", "Serum", "Fluoride Plasma")
  - `containerColor`: Tube color code (e.g. "Purple", "Yellow", "Gray")
  - `fastingHours`: Required fasting duration in hours (e.g. 0, 8, 12)
  - `tatHours`: Expected turnaround time in hours (default: 24)
  - `price`: Standalone test price in local currency
  - `isActive`: Flag indicating catalog availability (default: `true`)
  - `isDeleted`: Soft-delete flag (default: `false`)
- **Indexes**: `{ tenantId: 1, code: 1 }` (Unique), `{ tenantId: 1, category: 1 }`, `{ tenantId: 1, isActive: 1 }`.

### B. Test Parameter (`TestParameterModel`)
- **Collection**: `TestParameters`
- **Fields**:
  - `tenantId`: Multi-tenant key
  - `testId`: Mongoose ObjectId reference to `TestCatalog`
  - `name`: Parameter name (e.g. "Hemoglobin", "Platelet Count")
  - `unit`: Unit of measure (e.g. "g/dL", "mg/dL")
  - `gender`: Target gender (`ALL`, `MALE`, `FEMALE`)
  - `minAge` / `maxAge`: Target age range (years)
  - `normalMin` / `normalMax`: Expected reference range for healthy results
  - `criticalMin` / `criticalMax`: Alert thresholds for critical medical values
- **Indexes**: `{ tenantId: 1, testId: 1 }`.

### C. Health Package (`HealthPackageModel`)
- **Collection**: `HealthPackages`
- **Fields**:
  - `tenantId`: Multi-tenant key
  - `code`: Unique package code (e.g. `PKG_FULL_BODY_01`)
  - `name`: Package title (e.g. "Basic Full Body Checkup")
  - `description`: Detailed description of included health screenings
  - `category`: Package grouping (e.g. "Full Body Checkup", "Diabetes Care")
  - `testIds`: Array of Mongoose ObjectId references to `TestCatalog`
  - `originalPrice`: Sum of standalone test prices
  - `discountPrice`: Special offer bundle price
  - `fastingHours`: Fasting requirement (auto-calculated as max fasting requirement among bundled tests)
  - `isActive`: Availability flag (default: `true`)
- **Indexes**: `{ tenantId: 1, code: 1 }` (Unique), `{ tenantId: 1, category: 1 }`.

---

## 2. API Endpoint Inventory

### Public / Patient Endpoints (Unauthenticated or Patient)
- `GET /api/v1/catalog/tests` — Search & list active tests (Query params: `search`, `category`, `page`, `limit`).
- `GET /api/v1/catalog/tests/:id` — Get test details & parameter reference ranges.
- `GET /api/v1/packages` — Search & list active health packages (Query params: `search`, `category`, `page`, `limit`).
- `GET /api/v1/packages/:id` — Get package details with populated bundled tests.

### Staff Endpoints (Protected by `authenticateJwt` & `requireRole('LAB_STAFF')`)
- `POST /api/v1/catalog/tests` — Create new catalog test.
- `PUT /api/v1/catalog/tests/:id` — Update test details.
- `POST /api/v1/catalog/tests/:id/parameters` — Add parameter reference range.
- `POST /api/v1/packages` — Create new health package.
- `PUT /api/v1/packages/:id` — Update health package.
