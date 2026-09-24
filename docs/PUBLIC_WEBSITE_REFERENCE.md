# Public Website Reference

Reference website:
https://redcliffelabs.com/

## 1. Purpose

Use Redcliffe Labs as a reference for the public-facing diagnostic website experience.

This document defines how the reference website may be used during product and UI development.

Redcliffe Labs is a reference only. It is NOT the specification for our product.

---

## 2. Authoritative Product Specification

The authoritative source for actual product functionality and technical requirements is:

`docs/Diagnostic_Lab_SaaS_Combined_Master_Reference.pdf`

Do not replace or override the Master Reference requirements using the reference website.

---

## 3. Reference Areas

Use the reference website only to understand public-facing UX/product patterns such as:

- Homepage structure
- Header/navigation
- Test search
- Test/package discovery
- Health packages
- Location/pincode selection
- Home sample collection
- Booking flow
- Offers
- Patient account
- Booking tracking
- Digital reports
- Health content
- Trust/quality sections
- Clear calls to action
- Mobile-friendly patient journeys
- Service discovery
- Consumer healthcare UX

The reference may help determine how an already-approved feature can be presented to patients.

---

## 4. Product-Specific Interpretation

The goal is NOT to make a literal copy of Redcliffe Labs.

Build our own original diagnostic healthcare platform with a professional consumer-facing experience inspired by established diagnostic websites.

Our branding, colors, logo, typography, content, components, layouts, code, data, workflows and business rules must be original.

---

## 5. Important Rules

Redcliffe Labs is a UX/product reference only.

DO NOT:

- copy their branding
- copy their logo
- copy their text
- copy their images
- copy their source code
- copy their exact design
- reproduce proprietary content
- reproduce proprietary assets
- imply affiliation with Redcliffe Labs

Use the reference for ideas and patterns, not duplication.

---

## 6. Feature Approval Rule

The Master Reference PDF is the authoritative functional and technical specification.

If a feature is seen on the reference website but is NOT specified in the Master Reference PDF:

DO NOT implement it automatically.

Instead:

1. Identify the feature.
2. Explain what it does.
3. Explain where it could fit into our product.
4. Ask the product owner for approval.
5. Implement it only after explicit approval.

Example:

If the reference website contains a health calculator that is not defined in our Master Reference, report it as:

`Potential enhancement — requires product approval.`

Do not build it automatically.

---

## 7. Existing Specification Takes Priority

If the Master Reference PDF already defines a feature, implement it according to the PDF even if the reference website presents it differently.

The reference website must NOT change:

- business rules
- database architecture
- API contracts
- user roles
- RBAC
- state machines
- tenant isolation
- report workflow
- payment logic
- security requirements
- clinical workflow
- audit requirements

---

## 8. Public Website vs Internal Platform

Keep the public patient-facing website separate from the internal SaaS platform.

### Public Website

Examples:

- Homepage
- Test discovery
- Package discovery
- Search
- Location/service availability
- Booking
- Home collection
- Offers
- Patient account
- Booking tracking
- Report access
- Approved healthcare content

### Internal Platform

Examples:

- Super Admin
- Lab Admin
- Lab Manager
- Receptionist
- Phlebotomist
- Technician
- Pathologist/Reviewer
- Accountant
- Tenant management
- Staff management
- Sample operations
- Result entry
- Report approval
- Billing
- Audit
- Analytics
- Platform configuration

Do not expose internal administrative functionality to public users unless explicitly required.

---

## 9. UX Guidance

When designing a public feature that already exists in the Master Reference:

1. Understand the user goal.
2. Review the reference website's general approach.
3. Design an original implementation.
4. Follow our project's design system.
5. Keep the journey simple.
6. Make the experience responsive and mobile-friendly.
7. Do not add unrelated functionality.

The reference website should influence UX inspiration, not dictate implementation.

---

## 10. Search and Discovery

Where supported by the Master Reference:

- Users should be able to discover tests.
- Users should be able to discover packages.
- Test details should be understandable.
- Pricing should be clearly presented where applicable.
- Home collection availability should be clear.
- Booking should have a clear next step.

Do not invent additional search/filter/business rules without approval.

---

## 11. Location and Service Availability

Location/pincode functionality may be used as a public UX reference.

Actual service-area logic must follow the product specification and backend implementation.

Never assume that a location is serviceable merely because it appears on the reference website.

The backend is the source of truth for actual availability.

---

## 12. Booking Experience

The public booking journey should remain consistent with the Master Reference.

Where applicable:

Test/package selection
→ collection option
→ date/time slot
→ patient information
→ address
→ payment
→ booking confirmation
→ collection workflow
→ report delivery

Do not bypass backend validation, authorization or business rules for UI convenience.

---

## 13. Patient Account

Patient-facing account functionality must follow the Master Reference.

Potential public areas include:

- Profile
- Family members
- Addresses
- Bookings
- Collection tracking
- Reports
- Notification preferences

Do not create additional account functionality solely because another diagnostic website provides it.

---

## 14. Reports

Report access is a controlled workflow.

The public website may provide an appropriate patient-facing report experience, but:

- Reports must remain authorized.
- Private reports must not become public.
- The frontend must not bypass backend authorization.
- Report versions and approval workflows must remain controlled.
- Do not expose storage credentials or unrestricted report URLs.

The Master Reference remains authoritative for report security and lifecycle.

---

## 15. Health Content and Marketing Sections

Healthcare content may be useful on the public website for education and search visibility.

However:

- Do not invent medical claims.
- Do not generate unsupported clinical recommendations.
- Do not present AI-generated information as medical diagnosis.
- Do not add a large content/SEO system unless approved.
- Follow the Master Reference and actual operating requirements.

Content should remain separate from clinical workflows.

---

## 16. AI Features

The Master Reference contains an AI roadmap.

AI must not be added merely because the reference website contains AI functionality.

If an AI feature is approved:

- Keep it within the approved scope.
- Do not allow AI to silently modify clinical results.
- Do not allow AI to bypass report approval.
- Clearly distinguish explanation from diagnosis.
- Use authorized tenant data only.
- Preserve auditability where required.

Clinical result entry, review and publication remain controlled workflows.

---

## 17. No Unnecessary Features

Do not add features simply because:

- Redcliffe has them.
- Another diagnostic website has them.
- They are common in healthcare SaaS.
- They seem useful.
- They are technically easy to implement.
- An AI assistant thinks the product should have them.

Every product feature must come from:

1. The user's explicit instruction, OR
2. The Master Reference PDF, OR
3. An explicitly approved enhancement.

---

## 18. When the Reference Website and PDF Differ

### Case A — PDF specifies the feature
Implement according to the PDF.

### Case B — Reference website has the feature, PDF does not
Do not implement automatically. Ask for approval.

### Case C — PDF specifies a feature differently from the reference website
Follow the PDF.

### Case D — User explicitly requests a feature
Follow the user's current explicit instruction while preserving architecture and security requirements.

### Case E — Both are silent
Do not invent a product feature. Ask the product owner if a product decision is required.

---

## 19. Cursor Implementation Rule

Before implementing any public-facing feature:

1. Read this document.
2. Read the relevant part of the Master Reference PDF.
3. Inspect the existing codebase.
4. Identify reusable components.
5. Identify existing API/backend support.
6. Plan the smallest complete implementation.
7. Implement only the approved functionality.
8. Test the implementation.
9. Report what changed.

Do not build a large collection of pages merely because they exist on the reference website.

---

## 20. Final Principle

The product we are building is our own Diagnostic Lab SaaS.

The Master Reference PDF defines WHAT the product is.

This document defines HOW the public-facing experience may use Redcliffe Labs as a reference.

AGENTS.md defines HOW Cursor must behave while building it.

The reference website is inspiration and comparison material — not a second product specification.

When in doubt, stop and ask the product owner rather than inventing functionality.
