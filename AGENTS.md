# Diagnostic Lab SaaS — Cursor Project Instructions

## 1. AUTHORITATIVE PROJECT REFERENCE

The project has one authoritative product/technical reference:

`docs/Diagnostic_Lab_SaaS_Combined_Master_Reference.pdf`

Before implementing or changing a major feature, inspect the relevant parts of this PDF and the existing codebase.

The PDF contains the complete Product, Business, Workflow, UX, Architecture, Database, API, Security, RBAC, Integration, AI, MVP/Roadmap and implementation specifications.

IMPORTANT:
- Do not remove, simplify, reinterpret, or silently replace a requirement from the PDF.
- Do not invent functionality that is not requested by the PDF, the existing codebase, or the user's current instruction.
- Do not assume that a feature is required merely because it is common in SaaS/healthcare software.
- If a requirement is ambiguous, contradictory, or missing, STOP and ask the user before making a product-level decision.
- If two requirements appear to overlap, preserve both unless they are genuinely identical. Remove/merge only true duplicates.
- Treat the PDF as the product specification and the existing repository as the current implementation state.

## 2. FIRST ACTION FOR A NEW SESSION

Before writing code for a substantial task:

1. Inspect the repository structure.
2. Read this `AGENTS.md`.
3. Read/inspect the relevant sections of:
   `docs/Diagnostic_Lab_SaaS_Combined_Master_Reference.pdf`
4. Inspect the existing implementation related to the requested task.
5. Identify what already exists, what is missing, and what must be changed.
6. If the task touches multiple modules/files, create a short implementation plan first.
7. Only then modify code.

Do not immediately start coding just from the user's short request when the task requires understanding existing architecture.

## 3. EXISTING CODE IS NOT TO BE REWRITTEN JUST BECAUSE A DIFFERENT APPROACH LOOKS BETTER

The project is already being built.

Therefore:
- Preserve working functionality.
- Reuse existing components, utilities, services, hooks, schemas, middleware and patterns when appropriate.
- Do not replace working architecture with a different architecture without explicit user approval.
- Do not perform unrelated refactors.
- Do not rename/move large groups of files unless required for the requested feature.
- Do not introduce a new library when an existing project dependency can solve the problem.
- Do not change the database model, API contract, authentication strategy, state machine or architecture merely because another approach is personally preferred.

If the specification and existing implementation conflict, report the conflict and ask for a decision unless the user explicitly asks you to reconcile it.

## 4. PRODUCT SCOPE — DO NOT CREATE EXTRA FEATURES

Only implement functionality supported by one of these sources:

1. The user's current instruction.
2. The Diagnostic Lab SaaS Master Reference PDF.
3. Existing functionality that is required to keep the current application working.

Do NOT add:
- random dashboards
- unnecessary AI features
- unnecessary analytics
- extra roles
- extra payment methods
- extra integrations
- unnecessary notifications
- unnecessary pages
- speculative automation
- fake/demo workflows presented as production functionality
- features merely because they are "best practice"

"Best practice" may be used to improve implementation quality, security or maintainability, but it must not be used as a reason to invent product functionality.

## 5. NO SILENT PRODUCT DECISIONS

Never silently decide:
- business rules
- pricing rules
- medical/reporting rules
- user permissions
- workflow states
- cancellation/refund behavior
- notification behavior
- patient data behavior
- tenant behavior
- integration behavior
- AI behavior
- compliance requirements

If the PDF specifies it, follow it.

If the PDF does not specify it and the decision changes product behavior, ask the user.

If a small technical implementation detail is unspecified and does not change product behavior, choose the simplest maintainable implementation consistent with the existing codebase and document the choice.

## 6. MULTI-TENANCY IS A SECURITY BOUNDARY

Follow the PDF's tenant-isolation rules.

Never trust `tenantId` from the browser/request body for authorization.

Tenant context must come from authenticated server-side session/authentication.

Tenant-owned database operations must remain tenant-scoped.

Never create a tenant-owned `findById(id)` path that bypasses tenant authorization.

Never expose private patient reports through public object-storage URLs.

Never allow frontend route parameters to bypass authorization.

Backend authorization is mandatory; frontend guards are only UX.

## 7. STATE MACHINES ARE NOT FREE-FORM STRINGS

Where the PDF defines lifecycle/state transitions, implement them as controlled domain transitions.

Do not allow arbitrary status changes from the frontend.

Validate:
- current state
- requested transition/action
- actor permission
- tenant scope

Record required events/audit information.

Do not add new states or transitions unless required by the specification or explicitly approved.

## 8. CLINICAL REPORTS AND PATIENT DATA

Treat reports as controlled artifacts.

Keep result entry separate from report review/approval/publication.

Do not allow ordinary staff to silently mutate a published/finalized report.

Preserve versioning, auditability and controlled amendment/reissue behavior described in the PDF.

Do not log:
- passwords
- OTPs
- access tokens
- unnecessary patient data
- report contents unless explicitly required and safely handled

Do not invent medical interpretations, diagnoses or clinical recommendations.

## 9. API AND BACKEND RULES

Follow the API contract in the PDF.

Use:
- `/api/v1` base path where applicable
- consistent response envelopes
- validation for externally supplied input
- appropriate HTTP status codes
- thin controllers
- business logic in services/domain layers
- tenant-scoped repositories/data access
- explicit authorization

Do not create duplicate endpoints that already exist.

Before adding an endpoint, search the repository for an existing equivalent.

## 10. DATABASE RULES

Use the database/domain model in the PDF as the baseline.

Before changing a schema:
- inspect the existing schema/model
- check existing relationships
- check existing indexes
- check all code using the model
- consider migration/backward compatibility

Do not delete fields or collections merely because they appear unused without confirming they are not part of the specification or another workflow.

Avoid duplicate representations of the same business entity unless the specification requires them.

## 11. FRONTEND/UI RULES

Before creating a new UI component:
- search for an existing reusable component
- follow the project's existing design system
- reuse existing components and patterns

Do not create duplicate buttons, modals, tables, forms, cards, inputs or layout systems when reusable components already exist.

Keep UI aligned with the product roles and workflows in the PDF.

Do not add UI controls for functionality that does not exist in the backend.

Do not create fake data or fake success states that could be mistaken for real production functionality.

## 12. INTEGRATIONS

External services must follow the architecture in the PDF.

Use provider/adaptor interfaces where the specification calls for replaceable providers.

Do not hard-code secret keys.

Do not commit credentials.

Do not claim an integration is complete unless the real integration works.

If credentials/configuration are missing, implement the correct integration boundary and clearly identify what configuration is required rather than inventing a fake integration.

## 13. DEPENDENCIES

Before installing a package:
1. Check whether the project already has a dependency that solves the problem.
2. Check whether the requested functionality can be implemented using the current stack.
3. Only add a dependency when it provides clear value.

Do not add packages for convenience alone.

## 14. TESTING AND VERIFICATION

After implementing a feature:

1. Run the relevant type checks/lint/tests.
2. Run the relevant build if practical.
3. Verify affected API endpoints and UI flows.
4. Check for regressions in related functionality.
5. Fix errors caused by the change.
6. Do not claim "done" if verification was not performed.

For security-sensitive changes, specifically verify authorization and tenant isolation.

## 15. CHANGE DISCIPLINE

For every task:
- Make the smallest complete change necessary.
- Do not modify unrelated files.
- Do not rewrite working code without a reason.
- Do not remove functionality to make an implementation easier.
- Do not leave temporary debug code, console logs or test credentials.
- Do not silently change product requirements.

If a task is large, implement it in logical phases rather than making an uncontrolled repository-wide rewrite.

## 16. WHEN SOMETHING IS UNCLEAR

Use this decision order:

1. User's current explicit instruction.
2. Master Reference PDF.
3. Existing project architecture and established code patterns.
4. Simplest technically sound implementation that does not change product behavior.
5. Ask the user if a product-level decision is required.

Never use personal assumptions to fill a product requirement.

## 17. BEFORE YOU FINISH A TASK

Report briefly:
- What was changed.
- Which files were changed.
- What requirement/workflow the change implements.
- Tests/build/type-checks performed.
- Any unresolved issue or decision needed from the user.

Do not claim that functionality works unless it was actually verified.

## 18. MOST IMPORTANT RULE

The goal is NOT to build what you think the product should be.

The goal is to build the Diagnostic Lab SaaS exactly according to:
- the user's instructions,
- the Master Reference PDF,
- and the existing project architecture,

while preserving existing functionality and avoiding unnecessary functionality, assumptions, refactors and product decisions.
