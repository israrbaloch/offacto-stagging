# Master findings register

**Date:** 2026-10-20  
**Purpose:** One unique register for every audit finding, after reading all eight reports under `docs/audit/` and re-checking P0/P1 claims in source.  
**Rules:** No application code was changed. Finding IDs from `findings.md` are preserved. New IDs (`AUD-P1-023` onward, `AUD-P2-025` onward, `AUD-P3-017` onward) are **promoted** from `data-integrity.md` / `security-review.md` where those reports had issues without a register ID.

**Sources:** `README.md`, `findings.md`, `feature-inventory.md`, `security-review.md`, `workflow-coverage.md`, `data-integrity.md`, `remediation-plan.md`, `test-matrix.md`.

**Status values:**

- **Confirmed** — re-verified in source this consolidation, or original High-confidence claim that still matches the files named.
- **Potential** — consistent with code, but exploit/impact depends on deployment, operator behavior, or missing live tests.
- **Unverified** — original audit listed as unverified, or evidence is inventory-only.

---

## Consolidation notes (duplicates, overlaps, contradictions)

| Topic | How it is treated |
|-------|-------------------|
| MFA shell (`AUTH-010/011/012`, `SEC-010`, WF-01) | One finding: **AUD-P0-001**. Inventory rows remain cross-refs. |
| Inbound `TKT-` match vs `?secret=` | **AUD-P0-002** (tenant injection) and **AUD-P2-002** (secret in query) are related, not duplicates. Both stay. |
| Legal holds vs deletion jobs never running | **AUD-P0-003** (holds unused on company deletion) and **AUD-P2-013** (jobs never execute) stay. Completing 003 does not implement 013. |
| `signing_secret` in Inertia (`INT-018`) | Same as **AUD-P1-021**. |
| Suspend without session revoke (`USR-004`, `AUTH-008`) | Same as **AUD-P1-004**. |
| Duplicate Mollie UIs (`INT-004`, `SET-005`) | Same as **AUD-P1-019**. |
| Global flags vs product rollouts | **AUD-P1-002** and **AUD-P1-007** are related (one resolver wanted) but different keys/callers. Both stay. |
| Template library unused (`SET-016`, `COM-011`, `AUD-P3-006`) | **AUD-P1-011** is the functional gap; **AUD-P3-006** is duplicate UI hygiene. |
| Stale Feature tests (`AUD-P2-024`) vs no admin tests (`AUD-P3-015`) | Related; both stay (suite health vs missing coverage). |
| Maintenance windows vs `maintenance_enabled` | **AUD-P2-005** is the finding; `INF-009/010` are inventory. **SET-006** remains Implemented (canonical switch). |
| README “5 workflows pass” vs many fail | Not a contradiction: WF-02/17/23/24/26 pass as coded; others fail. |
| `toUpgradeArray` `'period' => 'month'` | Confirmed `SubscriptionPlan.php` L169. **AUD-P1-010** stands. |
| Service-delete cascade, user→company cascade, float VAT | Present in `data-integrity.md` but **missing from `findings.md`**. Promoted as AUD-P1-023, AUD-P1-024, AUD-P2-025. |
| Platform secrets plaintext in `site_settings` | `security-review.md` §5; promoted **AUD-P2-027**. |
| Feature-override non-unique index | Promoted **AUD-P2-026**. VAT uniqueness / status-event FKs promoted **AUD-P3-017/018**. |

**Findings lacking tests today:** all of them. `test-matrix.md` proposes tests; none exist. Acceptance tests listed below are **required**, not present.

**Domains original audit did not fully review:** exhaustive customer IDOR; live Mollie/Peppol/inbound HMAC contracts; customer rendering of Product CMS/announcements; deployed migration/queue topology; concurrent races beyond static review; staff `/staff` UX; `ProfileTest` redirect root cause.

---

## Counts (this register)

| | Count |
|--|------:|
| Unique findings | **72** |
| Original `findings.md` IDs | 65 |
| Promoted from other reports | 7 |
| P0 / P1 / P2 / P3 | 3 / 24 / 27 / 18 |
| Confirmed | **69** |
| Potential | **3** (AUD-P1-024 latent without admin user-delete; AUD-P2-010 replay harm; AUD-P2-014 legal erasure completeness) |
| Unverified (aspects, not extra IDs) | ProfileTest redirect cause; VAT rounding law; live provider contracts; customer CMS render; export file body; snapshot restore in a live deploy |

Promoted P1s: AUD-P1-023, AUD-P1-024. Promoted P2s: AUD-P2-025, AUD-P2-026, AUD-P2-027. Promoted P3s: AUD-P3-017, AUD-P3-018.

A finding can be **confirmed as code** and still have an unverified legal/ops *impact*. That does not create a second ID.

### Batch 1 implementation (2026-10-20)

Code and automated tests were added for the findings below. Operator actions: `docs/audit/batch-1-operator-actions.md`. Findings are marked **resolved in code** only where tests were executed and passed.

| ID | Register status after batch 1 |
|----|-------------------------------|
| AUD-P0-001 | Resolved in code when `sec_mfa_required_admin` is on; enrollment/recovery documented. Default remains off so deploy does not lock admins out. |
| AUD-P0-002 | Resolved in code (sender/tenant match). |
| AUD-P0-003 | Resolved in code (active holds block completion). Deletion worker still not implemented (AUD-P2-013). |
| AUD-P2-002 | Resolved in code (headers only). |
| AUD-P1-021 | Resolved in code (secrets not in Inertia). Rotate secrets if the old page was used in a live browser. |
| AUD-P2-027 | Resolved in code (encrypt at rest + dual-read). |
| AUD-P1-022 | Resolved in code (`APP_ENV`). |
| AUD-P2-010 | Resolved in code (unsafe replay denied; production gate). Residual: unknown job classes that do not match the deny-list. |
| AUD-P1-004 | Resolved in code (session delete + active-account middleware). |
| AUD-P1-003 | Resolved in code when the approval setting is on. |
| AUD-P2-004 | Minimum viable permissions on routes/controllers. Existing `admin` role keeps all capabilities. Specialist roles exist but are unassigned. |

---

## P0 — critical

### AUD-P0-001 — Admin MFA is not a security control

| | |
|--|--|
| **Severity** | P0 |
| **Domain / feature** | Auth / Security — `AUTH-010`, `AUTH-011`, `AUTH-012`, `SEC-010`, WF-01 |
| **Status** | **Resolved in code (Batch 1)** — previously confirmed |
| **Evidence** | Originally: no POST verify route, unread `sec_mfa_required_admin`. Now: `AdminMfaController`, `EnsureAdminMfaVerified`, `user_mfa_credentials`, tests in `tests/Feature/Admin/AdminMfaTest.php`. |
| **Impact** | Security: a stolen admin password is enough for full cross-tenant administration. Missing control, not an unauthenticated bypass. |
| **Remediation** | TOTP (minimum): enroll, hashed secret, challenge middleware on `/admin/*`, honor `sec_mfa_required_admin`. Implement or remove `POST /admin/mfa/verify`. |
| **Regression tests** | Characterization: admin routes reachable without MFA; POST verify 404. After fix: challenge required when flag on; wrong code rejected. |
| **Dependencies** | AUD-P1-004 (session revoke). Related: AUD-P1-008, AUD-P2-004. |
| **Reports** | `findings.md`, `security-review.md` §1, `workflow-coverage.md` WF-01, `feature-inventory.md` AUTH-010–012 |

### AUD-P0-002 — Inbound email attaches replies by ticket reference without sender/tenant check

| | |
|--|--|
| **Severity** | P0 |
| **Domain / feature** | Communications, Support, tenant isolation — `COM-010`, WF-18 |
| **Status** | **Resolved in code (Batch 1)** — previously confirmed |
| **Evidence** | Originally matched `TKT-` without sender check. Now `findAuthorizedOpenTicket` requires company/owner/customer email. Tests: `InboundEmailTenantMatchTest`. |
| **Impact** | Privacy/integrity: with the webhook secret, an attacker who knows or guesses a reference can inject a customer-visible message onto another company’s ticket. |
| **Remediation** | Require sender ∈ ticket company email, owner email, or `customer_user` email. Reject mismatch. Do not match reference alone. |
| **Regression tests** | `InboundEmailTenantMatchTest` as in `test-matrix.md`. |
| **Dependencies** | AUD-P2-002 (query secret). Related: AUD-P2-019, Wave 4 HMAC. |
| **Reports** | `findings.md`, `security-review.md` §3, `workflow-coverage.md` WF-18, `data-integrity.md` §2 |

### AUD-P0-003 — Compliance legal holds do not protect deletion

| | |
|--|--|
| **Severity** | P0 |
| **Domain / feature** | Compliance, companies — `CMP-010`, `CO-013`, WF-15 |
| **Status** | **Resolved in code (Batch 1)** — previously confirmed |
| **Evidence** | Originally unused on deletion. Now `CompanyDeletionGuard` is consulted inside a locked transaction. Tests: `LegalHoldDeletionTest`. No purge worker added. |
| **Impact** | Privacy/legal: operators can place a hold then complete company deletion/anonymization. Manual overstates protection. |
| **Remediation** | Before `status=completed` (and any future purge): abort if an active hold exists for that company/scope. |
| **Regression tests** | `LegalHoldDoesNotBlockCompanyDeletionTest` (characterization), then invert after fix. |
| **Dependencies** | AUD-P2-013, AUD-P2-014 (jobs and shallow anonymize). Legal: what “scope” means (open question). |
| **Reports** | `findings.md`, `data-integrity.md` §10, `workflow-coverage.md` WF-15, `security-review.md` §10 |

---

## P1 — high

### AUD-P1-001 — `FinancialPolicy` / `fin_*` stored, never applied

| | |
|--|--|
| **Severity / status** | P1 / **Confirmed** |
| **Domain** | Financial documents — `FIN-001/002`, WF-08/09 |
| **Evidence** | `FinancialPolicy.php` L12–45; repo grep `FinancialPolicy::` only in audit docs. Tenant `InvoiceController` does not lock/validate from these keys. |
| **Impact** | Financial: advertised invoice lock, credit-note-only edits, and validation do not run. Issued documents can still be edited per existing tenant rules. |
| **Remediation** | Wire into send/update **or** remove/relabel the Financial configure hub. Needs product/accounting decision (see `open-questions.md`). |
| **Tests** | Characterization: send invoice ignores `fin_invoice_lock_trigger`. |
| **Depends** | Open Q on BE invoice rules. Related AUD-P2-025. |
| **Reports** | `findings.md`, `feature-inventory.md` E, `workflow-coverage.md` WF-08/09 |

### AUD-P1-002 — `global_feature_flags` never enforced

| | |
|--|--|
| **Severity / status** | P1 / **Confirmed** |
| **Domain** | Platform settings — `SET-021` |
| **Evidence** | `PlatformSettingsRegistry.php` flags; no runtime reader. Peppol/Postbode/recurring gated by plan entitlements / controllers, not this toggle. |
| **Impact** | Operational: toggling “off” in Settings does not disable modules. |
| **Remediation** | One resolver: global ∪ plan ∪ company override ∪ rollouts — **or** hide the section. |
| **Depends** | AUD-P1-007. Entitlements already exist (`PlanEntitlements`). |
| **Reports** | `findings.md`, `security-review.md` §9 |

### AUD-P1-003 — Support access approvals are not a gate on workspace entry

| | |
|--|--|
| **Severity / status** | P1 / **Confirmed** |
| **Domain** | Support, tenant isolation — `SUP-009`, `CO-009`, WF-20 |
| **Evidence** | `enterWorkspace` (`AdminCompanyController` L318–327) sets session and redirects; no `SupportAccessRequest` check. `SupportPolicy::accessApprovalRequired` unused. `CompanyAccess` admin bypass L18–20. |
| **Impact** | Security: any admin can open any tenant workspace with write access and no grant/expiry. |
| **Remediation** | When `sup_require_access_approval` is true, require approved unexpired request; log denials. |
| **Tests** | `AdminWorkspaceAccessApprovalTest`. |
| **Depends** | Product: is unaudited admin impersonation acceptable in production? Related AUD-P2-004. |
| **Reports** | `findings.md`, `security-review.md` §3, `workflow-coverage.md` WF-20 |

### AUD-P1-004 — Suspended admin keeps a live session

| | |
|--|--|
| **Severity / status** | P1 / **Confirmed** |
| **Domain** | Users, auth — `USR-004`, `AUTH-008`, WF-04 |
| **Evidence** | `is_active` checked at login (`AuthenticatedSessionController` L45–53). `toggleActive` L146–171 does not call `revokeSessions` (L217–225 exists). No request middleware re-checks `is_active`. |
| **Impact** | Security: suspend does not end an in-progress admin session. |
| **Remediation** | Call `revokeSessions` on suspend; add `is_active` check on web (or admin) group. |
| **Tests** | `AdminUserSuspendSessionTest`. |
| **Depends** | — |
| **Reports** | `findings.md`, `security-review.md` §8, `workflow-coverage.md` WF-04 |

### AUD-P1-005 — Bulk `remind_unverified_users` execute is a no-op

| | |
|--|--|
| **Severity / status** | P1 / **Confirmed** |
| **Domain** | Governance — `GOV-004`, WF-22 |
| **Evidence** | `executeBulk` implements `deactivate_dormant_companies` only, then marks any draft `executed` with `affected=0`. |
| **Impact** | Operational: UI reports success; no emails sent. False audit trail. |
| **Remediation** | Implement send **or** refuse execute. Never mark executed if unimplemented. |
| **Depends** | SMTP (already applied). Related AUD-P1-022. |
| **Reports** | `findings.md`, `workflow-coverage.md` WF-22 |

### AUD-P1-006 — Scheduled configuration changes are never applied

| | |
|--|--|
| **Severity / status** | P1 / **Confirmed** |
| **Domain** | Governance — `GOV-009`, `GOV-010/011` |
| **Evidence** | `storeScheduledChange` persists rows. No scheduler/job reads `effective_at`. UI posts `payload: {}`. `simulateChange` API orphaned from UI. |
| **Impact** | Operational: “schedule” is a ledger. Stale or empty payloads would be dangerous if a worker were added blindly. |
| **Remediation** | Worker with validated payload **or** remove UI. Collect registry/section/payload or drop. |
| **Depends** | Settings service. Related AUD-P2-009. |
| **Reports** | `findings.md`, `data-integrity.md` §9 |

### AUD-P1-007 — Feature rollouts do not gate product behavior

| | |
|--|--|
| **Severity / status** | P1 / **Confirmed** |
| **Domain** | Product — `PRD-004` |
| **Evidence** | `ProductPolicy::featureEnabledForCompany` only referenced from admin insights, not HTTP/jobs. |
| **Impact** | Rollout percentages do not hide/show features. |
| **Remediation** | Same resolver as AUD-P1-002 **or** mark UI informational. |
| **Depends** | AUD-P1-002 |
| **Reports** | `findings.md`, `feature-inventory.md` M |

### AUD-P1-008 — Security policy settings are decorative

| | |
|--|--|
| **Severity / status** | P1 / **Confirmed** |
| **Domain** | Security — `SEC-002/004/009` |
| **Evidence** | `SecurityPolicy` (`passwordMinLength`, `rateLimitFor`, `hasActiveException`) has no callers. Account restrictions / exceptions CRUD only. |
| **Impact** | Login is not tightened by these screens. |
| **Remediation** | Enforce at `LoginRequest` / session **or** relabel as documentation. |
| **Depends** | AUD-P0-001 (MFA). Related AUD-P2-004. |
| **Reports** | `findings.md`, `security-review.md` §8 |

### AUD-P1-009 — Dunning / notify toggles unused; coupons unused at checkout

| | |
|--|--|
| **Severity / status** | P1 / **Confirmed** |
| **Domain** | Billing — `BIL-004/005/006`, WF-10/12 |
| **Evidence** | Keys persist via `AdminBillingController`. `ProcessSubscriptionBilling` sends without flags. `DiscountCoupon` only referenced from admin billing. |
| **Impact** | Financial: grace/retry/coupon screens do not change money or mail. |
| **Remediation** | Implement dunning job and checkout redeem **or** hide settings/UI. |
| **Depends** | Scheduler; AUD-P1-010. Open Q on dunning policy. |
| **Reports** | `findings.md`, `workflow-coverage.md` WF-10/12 |

### AUD-P1-010 — Annual plans billed as monthly

| | |
|--|--|
| **Severity / status** | P1 / **Confirmed** |
| **Domain** | Billing / subscriptions — `BIL-014`, WF-12 |
| **Evidence** | `Company::applySubscriptionPayment` L406 always `addMonth()`. `SubscriptionPlan::toUpgradeArray` L169 `'period' => 'month'`. Admin stores `billing_interval` monthly/annual. |
| **Impact** | Financial: annual subscribers would be charged/renewed monthly if that path is used. |
| **Remediation** | Honor `billing_interval` in apply + upgrade array. |
| **Tests** | `AnnualPlanRenewalTest`. |
| **Depends** | Open Q: is annual sold today? |
| **Reports** | `findings.md`, `workflow-coverage.md` WF-12 |

### AUD-P1-011 — Email template library does not drive transactional mail

| | |
|--|--|
| **Severity / status** | P1 / **Confirmed** |
| **Domain** | Communications — `COM-011`, `SET-016` |
| **Evidence** | Templates persist + merge-code validation. `InvoiceSent`, `OfferSent`, `WelcomeEmail` use hardcoded subjects/views. |
| **Impact** | Operators edit templates that customers never receive. |
| **Remediation** | Drive mailables from stored templates **or** hide library. |
| **Depends** | AUD-P3-006 (duplicate editors). |
| **Reports** | `findings.md`, `workflow-coverage.md` WF-17 |

### AUD-P1-012 — Notification rules, suppression, scheduled-notification settings unused

| | |
|--|--|
| **Severity / status** | P1 / **Confirmed** |
| **Domain** | Communications — `COM-014/015/016` |
| **Evidence** | Rules counted for metrics. `CommunicationPolicy::isMarketingSuppressed` unused; no writes to `communication_suppressions`. `comm_scheduled_*` unused. |
| **Impact** | Privacy: unsubscribe/consent screens do not suppress mail. |
| **Remediation** | Wire or remove. Billing reminders already use other keys (`BIL-003`). |
| **Depends** | AUD-P1-011. Legal: marketing vs transactional (open Q). |
| **Reports** | `findings.md`, `data-integrity.md` §9 |

### AUD-P1-013 — Customer not emailed on agent public reply

| | |
|--|--|
| **Severity / status** | P1 / **Confirmed** |
| **Domain** | Support — `SUP-011`, WF-19 |
| **Evidence** | `AdminSupportController::storeMessage` notifies staff via `SupportTicketNotifier` only. Internal notes correctly hidden (`SupportTicketController` L107). |
| **Impact** | Operational: customers must poll `/support`. Visibility isolation **works**. |
| **Remediation** | Customer mailable on public (non-internal) staff reply. |
| **Depends** | SMTP already applied (COM-002). |
| **Reports** | `findings.md`, `workflow-coverage.md` WF-19 |

### AUD-P1-014 — Peppol “configured” split (env vs SiteSetting)

| | |
|--|--|
| **Severity / status** | P1 / **Confirmed** |
| **Domain** | Integrations — `INT-005`, `CMP-002` |
| **Evidence** | Multi-channel invoice send checks `config('services.peppol.*')`. Dedicated send uses `IntegrationPolicy` (SiteSetting or config). |
| **Impact** | Operational: Integrations UI can show configured while bulk send fails (or the reverse). |
| **Remediation** | One resolver on all send paths. |
| **Depends** | AUD-P2-022 live guards. |
| **Reports** | `findings.md`, `workflow-coverage.md` WF-21 |

### AUD-P1-015 — Outbound webhooks never fire; API keys never authenticated

| | |
|--|--|
| **Severity / status** | P1 / **Confirmed** |
| **Domain** | Integrations — `INT-011/012`, `GOV-016`, WF-27 |
| **Evidence** | Webhook CRUD only. `IntegrationApiKey::findValid` unused. Gov automation keys have issue/revoke, no middleware. |
| **Impact** | Security/ops: keys can be issued that never authenticate; revoke cannot “reject” unused paths. |
| **Remediation** | Dispatch + authenticate **or** remove issue UIs. Product: public API wanted? |
| **Depends** | AUD-P1-016, AUD-P1-021, AUD-P2-004. |
| **Reports** | `findings.md`, `workflow-coverage.md` WF-27, `security-review.md` §5 |

### AUD-P1-016 — `integration_failures` queue never written

| | |
|--|--|
| **Severity / status** | P1 / **Confirmed** |
| **Domain** | Integrations — `INT-014` |
| **Evidence** | No `IntegrationFailure::create` in app. UI mixes synthetic insight rows. |
| **Impact** | Operators triage fake or empty queues. |
| **Remediation** | Write on real failures **or** remove queue UI. |
| **Depends** | AUD-P1-015 |
| **Reports** | `findings.md`, `data-integrity.md` §9 |

### AUD-P1-017 — Numbering prefixes and payment-term site settings unused

| | |
|--|--|
| **Severity / status** | P1 / **Confirmed** |
| **Domain** | Platform settings — `SET-017/018`, WF-07 |
| **Evidence** | `NumberingSeriesService` uses company series or hardcoded `INV-`/`OFF-`. `payment_terms_days` unused; product `prod_default_payment_terms_days` used instead. |
| **Impact** | New-company defaults in the manual do not apply. |
| **Remediation** | Apply at company create **or** mark informational. |
| **Depends** | AUD-P1-018; open Q on copy-on-create vs global. |
| **Reports** | `findings.md`, `workflow-coverage.md` WF-07 |

### AUD-P1-018 — Theme, locale, branding, navigation, public-page settings unread

| | |
|--|--|
| **Severity / status** | P1 / **Confirmed** |
| **Domain** | Platform settings — `SET-008–015`, `SET-019/020/023` |
| **Evidence** | `SetLocale` session + hardcoded `en/fr/nl`. Workspace theme from `companySetting.theme`. No readers for `branding_*`, `navigation_config`, `platform_enabled_locales`. |
| **Impact** | Settings honesty: screens look live. |
| **Remediation** | Wire documented layer **or** informational UI (as workflows/forms already are). |
| **Depends** | AUD-P1-017. Related SET-007 logo render partial. |
| **Reports** | `findings.md`, `feature-inventory.md` D |

### AUD-P1-019 — Duplicate Mollie UIs write the same keys

| | |
|--|--|
| **Severity / status** | P1 / **Confirmed** |
| **Domain** | Settings + Integrations — `SET-005`, `INT-004/016` |
| **Evidence** | `payment_mollie_*` in platform payment-gateway, integrations mollie-administration, mode again in environment-management. Last save wins. `int_mollie_webhook_override` unread (`PlatformMollieService` uses config/route). |
| **Impact** | Operational: silent overwrite of live keys. |
| **Remediation** | Single surface; alias or delete duplicate. Read override or drop field. |
| **Depends** | AUD-P2-027 (encrypt at rest). |
| **Reports** | `findings.md`, `data-integrity.md` §5 |

### AUD-P1-020 — Company request-info does not email the customer

| | |
|--|--|
| **Severity / status** | P1 / **Confirmed** |
| **Domain** | Companies — `CO-007`, WF-03 |
| **Evidence** | `CompanyAdminWorkflow::requestInfo` writes status event + activity; no `Mail::`. |
| **Impact** | Approvals stall; customer never notified. |
| **Remediation** | Send mail (pattern exists for approve/reject). |
| **Depends** | SMTP (COM-002). |
| **Reports** | `findings.md`, `workflow-coverage.md` WF-03 |

### AUD-P1-021 — Outbound webhook `signing_secret` serialized to admin Inertia

| | |
|--|--|
| **Severity / status** | P1 / **Confirmed** |
| **Domain** | Integrations, secrets — `INT-018` |
| **Evidence** | `AdminIntegrationController::operation` L98 `IntegrationWebhook::…->get()`. Model encrypts `signing_secret`, **no** `$hidden` (`IntegrationWebhook.php` L8–23). |
| **Impact** | Security: decrypted secret in HTML/Inertia JSON; browser, logs, extensions. Raises AUD-P0-002 if inbound secret similarly leaked (inbound is a different key). |
| **Remediation** | `$hidden` + explicit Inertia map (`*_set` only). Rotate secrets already displayed. |
| **Tests** | `IntegrationWebhookSecretNotInertiaTest`. |
| **Depends** | Rotate after deploy. Related AUD-P2-027. |
| **Reports** | `findings.md`, `security-review.md` §5 |

### AUD-P1-022 — Production bulk-safety uses editable label, not `APP_ENV`

| | |
|--|--|
| **Severity / status** | P1 / **Confirmed** |
| **Domain** | Governance — `GOV-001`, WF-22/28 |
| **Evidence** | `GovernancePolicy::isProductionEnvironment()` compares `gov_environment_label` to `'production'`. Relabel to `staging` disables `assertOperationalMutationAllowed` on `executeBulk`. |
| **Impact** | Security/ops: an admin can weaken the production destruction gate from the same UI it protects. |
| **Remediation** | Gate on `APP_ENV` and/or a non-UI flag **and** the label. |
| **Depends** | AUD-P2-010 (job retry). Related AUD-P1-005. |
| **Reports** | `findings.md`, `workflow-coverage.md` WF-28 |

### AUD-P1-023 — Invoice/offer line items cascade-delete with catalog service *(promoted)*

| | |
|--|--|
| **Severity / status** | P1 / **Confirmed** |
| **Domain** | Data integrity, financial |
| **Evidence** | `database/migrations/2026_01_23_045045_create_invoice_items.php` L20–23 `service_id` `onDelete('cascade')`. Same on offer items `2026_01_23_044546`. Services have `deleted_at` (soft delete reduces accident rate). |
| **Impact** | Financial: a hard delete of a service can erase historical invoice/offer lines. |
| **Remediation** | `nullOnDelete` or restrict. Do not cascade historical documents. |
| **Depends** | Migration. Related AUD-P2-025. |
| **Reports** | `data-integrity.md` §2 only (was missing from `findings.md`) |

### AUD-P1-024 — Deleting a user cascades the owned company *(promoted)*

| | |
|--|--|
| **Severity / status** | P1 / **Potential** (no admin destroy-user UI; profile self-delete exists) |
| **Domain** | Data integrity, companies |
| **Evidence** | `companies.user_id` `onDelete('cascade')` (`2026_01_09_024345_create_companies.php`). Admin user tools do not delete users; customer profile destroy can. |
| **Impact** | Data loss of a tenant if the owner user row is destroyed. |
| **Remediation** | Restrict/null user_id; never cascade wipe tenant from user delete. |
| **Depends** | Membership model (open Q). |
| **Reports** | `data-integrity.md` §1–2 |

---

## P2 — medium

### AUD-P2-001 — Mollie webhook CSRF-exempt, no ingress signature

**Confirmed.** `routes/web.php` L53; `MollieWebhookController` fetches payment by id from Mollie API (mitigates spoofed payloads). Unauthenticated sync/spam remains. **Impact:** operational abuse, not silently inventing paid state without Mollie. **Fix:** optional shared-secret header + rate-limit; keep API fetch. **Related:** unique `mollie_payment_id`. **Reports:** `findings.md`, `security-review.md` §4, WF-13.

### AUD-P2-002 — Inbound webhook secret accepted in query string

**Confirmed.** `InboundEmailWebhookController` L28; UI documents `?secret=`. **Impact:** secret in access logs, proxies, Referer. **Fix:** headers only after AUD-P0-002. **Related:** AUD-P0-002. **Reports:** `findings.md`, `security-review.md` §4.

### AUD-P2-003 — `AdminPermissionGate` compares permission names to role names

**Confirmed.** `AdminPermissionGate.jsx` L11–12. Inertia does not share a permissions array. **Must not** be treated as security. **Fix:** compare real permissions or remove. **Depends:** AUD-P2-004.

### AUD-P2-004 — No fine-grained admin authorization

**Confirmed.** Entire `/admin/*` is `role:admin`. Only policy: `SupportTicketPolicy`. No `$this->authorize()` in Admin controllers. **Impact:** any admin can restore snapshots, set passwords, enter workspaces, retry jobs. **Fix:** capability split (support vs billing vs governance vs settings). **Related:** AUD-P0-001, AUD-P1-003. **Open Q:** role matrix.

### AUD-P2-005 — Maintenance windows do not toggle `maintenance_enabled`

**Confirmed.** Canonical switch: `EnsurePlatformNotInMaintenance` + platform settings (**SET-006 Implemented**). Infra windows are a ledger. **Fix:** relabel windows as planning **or** optionally set the flag. **Reports:** `findings.md`, WF-26.

### AUD-P2-006 — Infrastructure backups are a manual log

**Confirmed.** `storeBackupRun` records a run; no dump/upload. **Fix:** real backup **or** relabel “evidence log”. **Effort XL vs XS.** **Open Q:** who owns backups (host vs app).

### AUD-P2-007 — Governance exports have no file artifact

**Confirmed.** `storeExport` `status: ready`; UI “Log download” only. **Fix:** blob + expiry **or** relabel dry-run. **Related:** WF-25.

### AUD-P2-008 — Governance import validates CSV only; no apply

**Confirmed.** `storeImport` L267–305. **Fix:** apply with mapping **or** relabel validation-only.

### AUD-P2-009 — `simulateChange` backend remains; UI is navigation-only

**Confirmed.** Route `admin.governance.simulate`; UI dropped JSON payload. **Fix:** expose or delete API. **Depends:** AUD-P1-006.

### AUD-P2-010 — Failed job retry has no production governance gate

**Potential** (missing gate is confirmed in code; harm depends on which failed jobs exist in a deploy). Infra + comms retry any failed job UUID. Weak confirm. **Impact:** replay can re-send mail or re-attempt payments. **Fix:** dual-confirm + same prod gate as bulk (after AUD-P1-022).

### AUD-P2-011 — Consent register has no writer

**Confirmed.** Schema + read UI; no `create`. **Fix:** writers + customer acceptance **or** scratchpad label. **Open Q:** consent lawful basis.

### AUD-P2-012 — Legal notices unpublished to the product

**Confirmed.** `PlatformLegalNotice` admin-only. Tenant uses `company_legal_documents`. **Fix:** public consumer **or** admin scratchpad.

### AUD-P2-013 — Deletion jobs never execute after approve

**Confirmed.** Approve sets `approved`; `completed_at` never set; no job. **Depends:** AUD-P0-003 must bind holds **before** any worker. **Open Q:** what purge means (AUD-P2-014).

### AUD-P2-014 — Company deletion “completed” is shallow anonymization

**Potential** (shallow rewrite is confirmed; whether that fails a specific legal duty is unverified). Name/email rewrite + `is_active=false`; `permanently_deleted_at` unused; invoices/customers remain. **Open Q:** legal erasure standard.

### AUD-P2-015 — GET company show creates a verification row

**Confirmed.** `AdminCompanyController::show` L174–177. Unique `company_id` reduces duplicate rows. Side effect on read. **Fix:** create only on explicit verify action.

### AUD-P2-016 — `syncRoles` allows empty role set

**Confirmed.** `role_ids` required array, no `min:1`. Last-admin guard exists when removing admin. **Fix:** `min:1` or default role.

### AUD-P2-017 — Approve/reject lack pending-state guards

**Confirmed.** Can re-approve/reject non-pending companies. **Fix:** abort unless pending.

### AUD-P2-018 — SES selectable without SiteSetting credential mapping

**Confirmed.** `PlatformMailConfigurator` maps SMTP/Postmark/Resend only. **Fix:** map SES **or** drop option.

### AUD-P2-019 — Inbound provider/mode/address/forward settings unread

**Confirmed.** Only enable + secret + create-ticket flag matter. **Fix:** read or remove. **Depends:** AUD-P0-002.

### AUD-P2-020 — Postbode admin defaults unread

**Confirmed.** Company tokens + `config/services.php`. **Fix:** apply defaults on new company **or** hide.

### AUD-P2-021 — WhatsApp admin templates unused

**Confirmed.** Invoice WhatsApp text hardcoded in `Invoices/Show.jsx`. **Fix:** read templates **or** hide.

### AUD-P2-022 — Environment live-action guards unused

**Confirmed.** `IntegrationPolicy::blockLiveCompanyInTest`, `int_prevent_peppol_live_in_local` unused. **Fix:** enforce on send/checkout. **Depends:** AUD-P1-014. WF-28.

### AUD-P2-023 — Admin in-app notifications cannot be marked read from the drawer

**Confirmed.** Only `ticketShow` marks related rows. Synthetic shell alerts never clear. **Fix:** mark-read/dismiss API. `SUP-012`.

### AUD-P2-024 — Feature tests disagree with admin login redirect

**Confirmed** (test run). `AuthenticationTest` admin user expects `/dashboard`, gets `/admin`. `ProfileTest` ×2 expect `/profile`, got `/`. **Fix:** stale tests (Wave 0). **Unverified:** ProfileTest exact cause.

### AUD-P2-025 — Mixed money types and float VAT on tenant invoices *(promoted)*

| | |
|--|--|
| **Status** | **Confirmed** storage/runtime; statutory rounding **unverified** (legal) |
| **Evidence** | Plans/payments integer cents; invoice items `decimal(15,2)`; `Invoice` accessors float `subtotal * taxRate`; global `default_vat_rate` only. |
| **Impact** | Financial: reconciliation drift vs PDF/export. |
| **Remediation** | Persist tax/total decimal or cents; per-line VAT if required. |
| **Depends** | AUD-P1-001, open Q on rounding law. |
| **Reports** | `data-integrity.md` §4 |

### AUD-P2-026 — Company feature overrides index is not unique *(promoted)*

**Confirmed.** Index `(company_id, capability_key)` not unique. Duplicate overrides possible. **Fix:** unique index + upsert. **Reports:** `data-integrity.md` §2.

### AUD-P2-027 — Platform Mollie/SMTP/Postmark secrets stored plaintext in `site_settings` *(promoted)*

**Confirmed.** Contrast: company integration casts encrypted. Settings passwords redacted on **read** (SET-024). **Impact:** DB dump / backup exposure. **Fix:** encrypt at rest (parity with `CompanySetting`). **Depends:** AUD-P1-019, AUD-P1-021. **Reports:** `security-review.md` §5.

---

## P3 — low

| ID | Title | Status | Evidence / notes | Remediation | Related |
|----|-------|--------|------------------|-------------|---------|
| AUD-P3-001 | Orphan `config/permission.php` (Spatie) vs custom Role/Permission | Confirmed | `composer.json` no Spatie package | Delete or ignore config | AUTH-016 |
| AUD-P3-002 | `auth.check` middleware alias unused | Confirmed | `bootstrap/app.php` alias | Remove alias | — |
| AUD-P3-003 | `/reports` plain-string stub | Confirmed | `web.php` | Real report or 404 | AUTH-019 |
| AUD-P3-004 | Billing reports `refunds` hardcoded `0` | Confirmed | `AdminBillingController` | Compute or hide | BIL-008 |
| AUD-P3-005 | Financial reconciliation loads all invoices in PHP | Confirmed | `AdminFinancialInsights` | SQL aggregates | FIN-003 |
| AUD-P3-006 | Duplicate email-template editors | Confirmed | Settings + Communications | One editor | AUD-P1-011 |
| AUD-P3-007 | Duplicate audit surfaces | Confirmed | logs, security op, governance | IA cleanup | — |
| AUD-P3-008 | Scheduled-tasks infra UI static vs real schedule | Confirmed | insights array vs `bootstrap/app.php` L21–23 | Read scheduler | INF-004 |
| AUD-P3-009 | Missing empty states on some admin tables | Confirmed (static UI) | companies, users, tickets | `AdminEmpty` | — |
| AUD-P3-010 | Weak confirmations | Confirmed | `window.confirm` / auto-acked flags | Shared confirm dialog | AUD-P2-010 |
| AUD-P3-011 | Approvals request-info errors not shown | Confirmed (UI) | Approvals page | Flash errors | AUD-P1-020 |
| AUD-P3-012 | `plans` prop unused on company index | Confirmed | React page | Use or drop | — |
| AUD-P3-013 | Vulnerability scan depends on host `composer` CLI | Confirmed | insights | Document limitation | SEC-008 |
| AUD-P3-014 | Peppol monitoring copy vs global query | Confirmed | insights | Fix copy or filter | CMP-018 |
| AUD-P3-015 | No admin Feature tests; no CI | Confirmed | 12 test files, 0 admin; no `.github/workflows` | Wave 7 | AUD-P2-024, X-004/005 |
| AUD-P3-016 | Dead `PlatformSettingsController` + `Pages/Settings/Index.jsx` | Confirmed | no routes | Delete dead code | SET-025 |
| AUD-P3-017 | `companies.vat_number` not unique *(promoted)* | Confirmed | migration | Unique if business requires | Open Q |
| AUD-P3-018 | `company_status_events` status ids have no FK *(promoted)* | Confirmed | `data-integrity.md` | Add FK or store codes | — |

---

## Deferred / unverified (not given P0–P3 IDs)

From original `findings.md` “deferred” plus inventory `X-008/X-009`:

| Item | Why unresolved |
|------|----------------|
| Live Mollie/Peppol HTTP in deployed env | Not executed (policy). |
| Inertia stripping `signing_secret` | `HandleInertiaRequests` does not strip; **AUD-P1-021 confirmed leak**. |
| Concurrent admin edits | No optimistic locking; residual race. |
| Full customer-controller IDOR | Spot-check invoices/customers/offers/support only. |
| Password-OTP / approval-email deliverability | Mail faked in tests; live SMTP unverified. |
| Product CMS / announcements on customer Inertia | CRUD exists; `ProductPolicy::activeAnnouncements` unused outside admin insights (`X-008/X-009`). |
| Company export file contents | Download authorized; payload **unverified**. |
| Snapshot restore operational | Code path present (WF-23); not run. |

---

## Completeness vs original eight reports

| Original file | Coverage in this register |
|---------------|---------------------------|
| `findings.md` | All 65 IDs carried. |
| `feature-inventory.md` | Cross-refs; unread-key list mapped to P1-002/011/012/017/018 and inventory Gaps. |
| `security-review.md` | P0s + P1-003/004/021 + P2-001/003/004 + promoted P2-027. |
| `workflow-coverage.md` | WF ids on findings; scoreboard unchanged. |
| `data-integrity.md` | Promoted 023–026, 017–018; money/cascade/holds. |
| `remediation-plan.md` | Superseded for sequencing by `remediation-roadmap.md`; waves still valid. |
| `test-matrix.md` | Tests column; none exist yet. |
| `README.md` | Counts updated (72 unique vs original 65). |
