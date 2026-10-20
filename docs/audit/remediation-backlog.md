# Remediation backlog

**Date:** 2026-10-20  
**Source of truth for IDs:** `master-findings-register.md`.  
**Rule:** Cosmetic work is not above confirmed security or financial risk. Effort is relative (XS/S/M/L/XL), not calendar days.  
**Constraint:** No application code is changed until a batch is approved. Acceptance criteria below are the bar for that future work.

**Effort scale:** XS ≤ 1 file/half-day · S 1–2 days · M several days · L a week · XL multi-week / product + legal.

---

## 1. Critical security and data-loss risks

| ID | Item | Pri | Effort | Depends | Acceptance | Testing |
|----|------|-----|--------|---------|------------|---------|
| AUD-P0-002 | Tenant-match inbound replies; reject unknown sender | P0 | S | None (do before HMAC) | `TKT-` match only if From is company/owner/customer_user; mismatch 4xx; no message created | `InboundEmailTenantMatchTest`; golden: same-company From succeeds |
| AUD-P2-002 | Drop `?secret=` for inbound webhook | P1 | XS | After or with P0-002 | Header-only; query 401; UI copy updated | Same test; assert query rejected |
| AUD-P1-021 | Hide `signing_secret` from Inertia | P1 | XS | Rotate secrets after deploy | Inertia JSON has `signing_secret_set` not plaintext | `IntegrationWebhookSecretNotInertiaTest` |
| AUD-P0-003 | Bind `ComplianceLegalHold` on company deletion | P0 | S | Before any deletion worker | Active hold → cannot complete deletion | Characterization then invert |
| AUD-P1-023 | Stop cascade of invoice/offer items on service delete | P1 | S | Migration | FK `nullOnDelete` or restrict; historical lines survive | Migration test + Feature |
| AUD-P1-024 | Stop user-delete cascading companies | P1 | S | Open Q membership | User destroy cannot wipe tenant | Feature: profile destroy does not drop company |
| AUD-P2-027 | Encrypt platform secrets in `site_settings` | P1 | M | AUD-P1-019 (single Mollie UI reduces keys) | Mollie/SMTP/Postmark passwords encrypted at rest; settings UI still works | Unit: round-trip encrypt; no plaintext in DB fixture |
| AUD-P2-010 | Gate failed-job retry in production | P1 | S | AUD-P1-022 preferred first | Prod: dual confirm + env gate; replay audited | Feature: retry blocked when APP_ENV=production without confirm |
| AUD-P1-004 | Revoke sessions on suspend + `is_active` middleware | P1 | S | None | Suspended admin cannot keep using session | `AdminUserSuspendSessionTest` |

**Do not start:** snapshot restore against live data, deletion workers, or job replay in production until P0-003 and P1-022/P2-010 land.

---

## 2. Authorization and tenant-isolation defects

| ID | Item | Pri | Effort | Depends | Acceptance | Testing |
|----|------|-----|--------|---------|------------|---------|
| AUD-P1-003 | Honor `sup_require_access_approval` on `enterWorkspace` | P1 | S | Product Q: always-on vs flag | Flag on → no approved request → 403; expiry enforced | `AdminWorkspaceAccessApprovalTest` |
| AUD-P0-001 | Real admin MFA | P0 | L | Session revoke (P1-004) | TOTP enroll + challenge; `sec_mfa_required_admin` honored; POST `/admin/mfa/verify` exists | Characterization (404) then challenge tests |
| AUD-P2-004 | Fine-grained admin capabilities | P2 | XL | Role matrix (open Q) | Support cannot restore snapshots / set passwords | Policy Feature tests |
| AUD-P2-003 | Fix or remove `AdminPermissionGate` | P2 | XS | Can ship with P2-004 | No false “has permission” from role name | Component/unit |
| AUD-P2-016 | `syncRoles` min 1 role | P2 | XS | — | Empty array 422 | Feature |
| AUD-P2-015 | Stop GET company-show creating verification | P2 | XS | — | GET idempotent | Feature |

MFA is P0 missing-control, not an unauthenticated hole. Sequence after inbound/holds/session revoke so privileged sessions are shorter-lived first.

---

## 3. Financial and subscription integrity

| ID | Item | Pri | Effort | Depends | Acceptance | Testing |
|----|------|-----|--------|---------|------------|---------|
| AUD-P1-010 | Honor annual `billing_interval` | P1 | S | Confirm annual is sold | `addYear()` for annual; upgrade array `period` not hardcoded month | `AnnualPlanRenewalTest` |
| AUD-P1-001 | Apply `FinancialPolicy` **or** relabel hub | P1 | M | Accounting Q | Chosen behavior matches UI copy | Characterization then lock tests |
| AUD-P1-009 | Dunning flags + coupon redeem **or** hide | P1 | L | Scheduler; coupon Q | Toggles change mail/state **or** UI gone | Job + checkout Feature |
| AUD-P2-025 | Decimal VAT/totals (or cents) | P2 | L | Rounding Q | Stored totals match computed; no float in money path | Unit rounding table |
| AUD-P2-026 | Unique company feature-override index | P2 | S | Migration | Duplicate insert fails; upsert in admin | Migration |
| AUD-P3-004 | Billing refunds metric | P3 | S | Refund data model | Number from payments **or** column removed | Insights assertion |
| AUD-P3-005 | SQL aggregates for reconciliation | P3 | M | — | No N invoices in PHP | Performance smoke |

**Do not** implement dunning or coupon math until billing rules are written in `open-questions.md`.

---

## 4. Compliance, privacy, and legal safeguards

| ID | Item | Pri | Effort | Depends | Acceptance | Testing |
|----|------|-----|--------|---------|------------|---------|
| AUD-P2-013 | Deletion jobs actually run | P2 | L | **P0-003 first**; legal purge spec | Approve → worker → `completed_at`; hold blocks | Queue fake + hold test |
| AUD-P2-014 | Define and implement erasure depth | P2 | XL | Legal Q | Documented fields removed vs retained | Golden + legal review |
| AUD-P1-012 | Wire suppressions **or** remove | P1 | M | Marketing vs transactional Q | Suppressed address not mailed for that category | Mail fake |
| AUD-P2-011 | Consent writers **or** scratchpad label | P2 | M | Lawful-basis Q | Writes exist **or** UI says not a legal register | Feature |
| AUD-P2-012 | Publish legal notices **or** scratchpad | P2 | M | Audience Q | Customer-visible **or** labeled admin-only | Inertia prop |
| AUD-P2-001 | Optional Mollie ingress secret + rate limit | P2 | S | — | Unsigned POSTs rejected if secret configured | Feature |
| AUD-P3-017 | Unique VAT if required | P3 | S | Business Q | Unique constraint **or** documented duplicates OK | Migration |

---

## 5. Broken integrations and background jobs

| ID | Item | Pri | Effort | Depends | Acceptance | Testing |
|----|------|-----|--------|---------|------------|---------|
| AUD-P1-014 | One Peppol “configured?” resolver | P1 | S | — | Multi-channel and dedicated send agree | Feature with config vs SiteSetting |
| AUD-P2-022 | Enforce live-action guards | P1 | S | P1-014 | Test mode cannot Peppol-live / checkout-live per flags | Feature |
| AUD-P1-005 | Implement or refuse bulk remind-unverified | P1 | S | SMTP | Execute sends **or** 422 unimplemented; never fake `executed` | Feature |
| AUD-P1-022 | Production bulk gate uses `APP_ENV` | P1 | S | Before P2-010 | Relabeling `gov_environment_label` cannot disable gate | Feature |
| AUD-P1-006 | Scheduled-change worker **or** remove UI | P2 | M | Payload schema | Applied at `effective_at` **or** UI gone | Queue |
| AUD-P2-009 | Restore simulate UI or delete API | P3 | XS | P1-006 | No orphan POST | Route test |
| AUD-P1-015 | Outbound webhooks + API keys **or** remove issue UI | P2 | XL | Public-API Q | Signed POST on events **or** no key issue | HTTP fake |
| AUD-P1-016 | Write real `integration_failures` **or** remove queue | P2 | M | P1-015 | Rows from real errors | Feature |
| AUD-P2-018 | SES mapping or drop option | P2 | S | — | SES works **or** not listed | Configurator unit |
| AUD-P2-019 | Read inbound extras or remove | P2 | S | P0-002 | UI matches runtime | — |
| AUD-P2-020 | Postbode defaults or hide | P3 | S | — | New company inherits **or** section gone | — |
| AUD-P2-021 | WhatsApp templates or hide | P3 | S | — | Invoice uses template **or** UI gone | — |
| AUD-P2-006 | Real backups vs evidence log | P3 | XL vs XS | Ops Q | Dump exists **or** copy says log | Manual |
| AUD-P3-008 | Scheduled-task UI vs `schedule()` | P3 | S | — | UI lists artisan schedule | — |

---

## 6. Incomplete admin features

| ID | Item | Pri | Effort | Depends | Acceptance | Testing |
|----|------|-----|--------|---------|------------|---------|
| AUD-P1-002 + AUD-P1-007 | One feature resolver (global ∪ plan ∪ override ∪ rollout) **or** hide | P1 | M | Product Q | Toggle/rollout changes HTTP/jobs | Entitlement Feature |
| AUD-P1-008 | Enforce security policy **or** relabel | P1 | M | P0-001 overlap | Password min / lockout honored | Login Feature |
| AUD-P1-011 | Drive mailables from template library **or** hide | P1 | L | Merge-code inventory | Invoice mail subject = stored template | Mail fake |
| AUD-P1-017 | Numbering/payment-term defaults on new company **or** informational | P2 | S | Copy-on-create Q | New company series prefix matches setting | Feature |
| AUD-P1-018 | Theme/locale/branding/nav **or** informational | P2 | L | Branding Q | Documented layer applied | Browser |
| AUD-P1-019 | Single Mollie surface | P1 | S | — | One editor; last-write conflict gone | Manual + Feature |
| AUD-P1-013 | Email customer on public staff reply | P1 | S | SMTP | Customer receives; extra staff emails unchanged | Mail fake |
| AUD-P1-020 | Email customer on request-info | P1 | S | SMTP | Mail sent; Approvals shows errors (P3-011) | Mail fake |
| AUD-P2-007/008 | Export artifact / import apply **or** relabel | P2 | L | PII Q | File exists **or** “dry-run” copy | Feature |
| AUD-P2-005 | Relabel maintenance windows | P3 | XS | — | Copy does not claim auto-toggle | Manual |
| AUD-P2-023 | Mark-read admin notifications | P3 | S | — | Drawer dismiss persists | Feature |
| AUD-P2-017 | Pending-only approve/reject | P2 | XS | — | Non-pending 422 | Feature |
| AUD-P3-003 | `/reports` stub | P3 | XS | — | Real page or 404 | Route |
| AUD-P3-016 | Delete dead settings controller/page | P3 | XS | — | Files gone; no route | — |
| AUD-P3-001/002 | Dead Spatie config / unused alias | P3 | XS | — | Removed | — |

---

## 7. UX, reporting, and operational improvements

Do **not** schedule these before groups 1–3 unless they ride along a related P1 (e.g. Approvals error display with P1-020).

| ID | Item | Pri | Effort | Notes |
|----|------|-----|--------|-------|
| AUD-P3-006 | One email-template editor | P3 | S | After P1-011 |
| AUD-P3-007 | One audit log surface | P3 | S | IA |
| AUD-P3-009 | Empty states | P3 | S | `AdminEmpty` |
| AUD-P3-010 | Shared confirm for destructive actions | P3 | S | Pairs with P2-010 |
| AUD-P3-011 | Approvals `requestInfo` errors | P3 | XS | With P1-020 |
| AUD-P3-012 | Use or drop `plans` on company index | P3 | XS | |
| AUD-P3-013 | Document composer-audit host dependency | P3 | XS | Docs |
| AUD-P3-014 | Peppol monitoring copy | P3 | XS | |
| AUD-P2-024 | Fix stale Feature tests | P1 | S | Wave 0 — unblocks CI |
| AUD-P3-015 | Admin Feature tests + CI | P2 | L | After characterization suite |
| AUD-P3-018 | Status-event FKs | P3 | S | Migration |

---

## Explicitly deferred (no backlog sprint until questions close)

- Live Mollie/Peppol contract tests against vendor sandbox (needs credentials, out of “no live contact” policy).
- Full customer-controller IDOR audit.
- Concurrent edit / optimistic locking.
- Staff `/staff` UX (out of admin-area audit).
- Product CMS / announcements on customer Inertia (`X-008/X-009`) until product confirms they should render.

---

## Priority reminder

If capacity is one engineer: **group 1 → group 2 (P1-003, P1-004) → group 3 (P1-010) → customer-facing mail (P1-013/020) → honesty cuts (hide unread settings)**. Do not spend XL on MFA, public API, or GDPR purge until the first reviewable batch is approved.
