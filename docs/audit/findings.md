# Offacto admin — confirmed findings

**Method:** Static code review plus one local `php artisan test` run. No live payments, Peppol, customer email, restores, or job replays.

**Confidence:** High = verified in source this audit; Medium = consistent grep + file reads; Low = depends on deployed env, queue workers, or unexercised HTTP.

Severity:

- **P0** — production blocker or immediately exploitable privileged-path defect
- **P1** — high integrity / security / compliance gap; advertised control does not run
- **P2** — partial, misleading, or operationally unsafe
- **P3** — UX, hygiene, test debt

---

## Summary counts

| Severity | Count |
|----------|------:|
| P0 | 3 |
| P1 | 22 |
| P2 | 24 |
| P3 | 16 |

---

## P0 — production blockers

### AUD-P0-001 — Admin MFA is not a security control

**Confidence:** High  
**Domains:** Auth, Security  

The admin MFA page is a shell. `sec_mfa_required_admin` is stored and never read. Admin routes require only `auth`, `verified.email`, `role:admin`. The verify form posts to a route that does not exist.

**Evidence:**

- `routes/web.php` L185–188 — group middleware; GET `/admin/mfa` only
- `app/Http/Controllers/Admin/AdminAuthController.php` L19–24 — renders `Admin/Auth/MfaVerify`
- `resources/js/Pages/Admin/Auth/MfaVerify.jsx` L7–22 — comment “UI shell”; `post('/admin/mfa/verify')`
- `app/Support/SecuritySettingsRegistry.php` L74 — `sec_mfa_required_admin`
- Repo-wide: no TOTP/WebAuthn models, no MFA middleware, no `POST /admin/mfa/verify`

**Impact:** Any stolen admin password grants full cross-tenant administration.

---

### AUD-P0-002 — Inbound email can attach a reply to any open ticket by reference

**Confidence:** High  
**Domains:** Communications, Support, Tenant isolation  

`findOpenTicket()` matches `TKT-…` in the subject and returns that ticket **without** checking that `$from` belongs to the ticket’s company or customer. Anyone who knows (or guesses) a reference and holds the webhook secret can inject a public customer-visible message onto another tenant’s ticket.

**Evidence:**

- `app/Http/Controllers/InboundEmailWebhookController.php` L108–119
- Webhook is CSRF-exempt (`bootstrap/app.php` L26–28) and unauthenticated except for shared secret (L25–30)
- Secret may be passed as `?secret=` (L28) — leak surface in logs, proxies, Referer

**Impact:** Cross-tenant support-content injection; confidentiality/integrity of ticket threads.

---

### AUD-P0-003 — Compliance legal holds do not protect any deletion path

**Confidence:** High  
**Domains:** Compliance, Companies, Data integrity  

`ComplianceLegalHold` records are created and released in the compliance hub. No deletion, anonymization, or company-archive path reads that table. Company “completed” deletion only checks the **deletion request’s own** `legal_hold` boolean. Compliance deletion jobs can be approved but never execute, so the hold cannot fail-closed on a real purge either.

**Evidence:**

- `app/Http/Controllers/Admin/AdminComplianceController.php` L352–379 (place/release)
- Grep: `ComplianceLegalHold` used only in that controller and `AdminComplianceInsights`
- `AdminCompanyController::updateDeletionRequest` L451–457 — completes if `!$deletionRequest->legal_hold`
- `approveDeletionJob` L403–412 — sets `approved`; `completed_at` never set; no job/command

**Impact:** Operators who place a hold in Compliance and later complete a company deletion will destroy/anonymize data they believed was protected. `ADMIN_MANUAL.md` states holds block deletion.

---

## P1 — high

### AUD-P1-001 — `FinancialPolicy` and all `fin_*` keys are stored but never applied

**Confidence:** High  

`app/Support/FinancialPolicy.php` L12–45 defines invoice lock, credit-note-only corrections, validation rules, quote validity, jurisdiction. **Zero** `FinancialPolicy::` call sites exist in the repo. Tenant invoices ignore invoice locking, fin validation, and rounding settings.

**Evidence:** `FinancialDocumentSettingsRegistry.php`; `InvoiceController` / `Invoice` model; grep `FinancialPolicy::` → no matches.

---

### AUD-P1-002 — `global_feature_flags` never enforced

**Confidence:** High  

Defined in `PlatformSettingsRegistry.php` L229–231. No runtime reader. Peppol/Postbode/recurring remain gated only by plan entitlements / controller checks, not this toggle.

---

### AUD-P1-003 — Support access approvals are records, not a gate

**Confidence:** High  

`enterWorkspace` (`AdminCompanyController.php` L318–327) only requires `role:admin`. `SupportAccessRequest` approve (`AdminSupportController.php` L294–312) never consulted. `SupportPolicy::accessApprovalRequired` unused. Combined with `CompanyAccess` admin bypass (L18–20) this is unaudited cross-tenant write.

---

### AUD-P1-004 — Suspended admin keeps a live session

**Confidence:** High  

`is_active` checked only at login (`AuthenticatedSessionController.php` L45–53). `toggleActive` (L146–171) does not call `revokeSessions`. No request middleware re-checks `is_active` on `/admin/*`.

---

### AUD-P1-005 — Governance bulk `remind_unverified_users` execute is a no-op

**Confidence:** High  

Preview exists (`AdminGovernanceController::previewBulk` L208–226). `executeBulk` L243–260 only implements `deactivate_dormant_companies`, then marks **any** draft bulk `executed` with `affected=0`.

---

### AUD-P1-006 — Scheduled configuration changes are never applied

**Confidence:** High  

`GovScheduledConfigChange` rows persist (`storeScheduledChange` L397–422). No scheduler/job reads `effective_at`. UI submits `payload: {}` and first registry section (`Governance/Operation.jsx` L50, L279–308).

---

### AUD-P1-007 — Feature rollouts do not gate product behavior

**Confidence:** High  

`ProductPolicy::featureEnabledForCompany` (`ProductPolicy.php` L43–68) is only referenced from `AdminProductInsights`. Plan entitlements **are** enforced via `CompanyAccess` / `PlanEntitlements`.

---

### AUD-P1-008 — Security policy settings are decorative

**Confidence:** High  

`SecurityPolicy` (`passwordMinLength`, `rateLimitFor`, `hasActiveException`) has no callers. Account restrictions and policy exceptions do not affect login.

---

### AUD-P1-009 — Billing dunning and notify toggles unused; coupons unused at checkout

**Confidence:** High  

`dunning_grace_days`, `dunning_max_retries`, `billing_notify_*` persist via `AdminBillingController` L19–44. `ProcessSubscriptionBilling` sends mail without those flags. `DiscountCoupon` referenced only from `AdminBillingController`.

---

### AUD-P1-010 — Annual subscription interval is billed as monthly

**Confidence:** High  

`Company::applySubscriptionPayment` always `addMonth()` (`Company.php` L406–407). `SubscriptionPlan::toUpgradeArray` hardcodes `'period' => 'month'` (L169). Admin can store `billing_interval` on the plan.

---

### AUD-P1-011 — Email template library does not drive transactional mail

**Confidence:** High  

Templates persist and validate merge codes (`AdminCommunicationController` L88–90, L213–227). `InvoiceSent`, `OfferSent`, `WelcomeEmail` use hardcoded subjects/views.

---

### AUD-P1-012 — Communication rules, suppression, and scheduled-notification settings unused

**Confidence:** High  

`comm_notification_rules` counted for metrics only. `CommunicationPolicy::isMarketingSuppressed` never called; no writes to `communication_suppressions`. `comm_scheduled_*` unused; `CommunicationPolicy::scheduledJobsEnabled` unused.

---

### AUD-P1-013 — Customer is not emailed on agent public reply

**Confidence:** High  

`AdminSupportController::storeMessage` L171–175 notifies **staff** via `SupportTicketNotifier` only. Customers must poll the portal.

---

### AUD-P1-014 — Peppol “configured” check split (env vs SiteSetting)

**Confidence:** High  

`InvoiceController` multi-channel send (~L740–744) checks `config('services.peppol.*')` only. Dedicated `sendPeppol` uses `IntegrationPolicy` (SiteSetting **or** config). Admin-stored Peppol keys can look “configured” in Integrations and fail in bulk send.

---

### AUD-P1-015 — Outbound integration webhooks never fire; API keys never authenticated

**Confidence:** High  

`IntegrationWebhook` CRUD only. `IntegrationApiKey::findValid` unused. `IntegrationPolicy::apiRatePerMinute` unused.

---

### AUD-P1-016 — `integration_failures` queue is never written

**Confidence:** High  

No `IntegrationFailure::create` in app code. UI mixes synthetic rows (`AdminIntegrationInsights::failureQueue`).

---

### AUD-P1-017 — Numbering prefixes and payment-term site settings unused

**Confidence:** High  

`invoice_prefix` / `offer_prefix` not used by `NumberingSeriesService` (company series or hardcoded `INV-`/`OFF-`). `payment_terms_days` unused; product defaults use `prod_default_payment_terms_days`.

---

### AUD-P1-018 — Theme, locale, branding-policy, navigation, public-page settings unread

**Confidence:** High  

`SetLocale` uses session + hardcoded `en/fr/nl`. Workspace theme is company `companySetting.theme` (`HandleInertiaRequests`). `branding_*`, `navigation_config`, `platform_enabled_locales` have no app readers.

---

### AUD-P1-019 — Duplicate Mollie configuration UIs write the same keys

**Confidence:** High  

`payment_mollie_*` in Platform `payment-gateway`, Integrations `mollie-administration`, and `payment_mollie_mode` again in `environment-management`. Last save wins. `int_mollie_webhook_override` unread (`PlatformMollieService` L145–159 uses config/route).

---

### AUD-P1-020 — Company `request-info` does not email the customer

**Confidence:** High  

`CompanyAdminWorkflow::requestInfo` writes status event + activity log only (no `Mail::`).

---

### AUD-P1-021 — Integration outbound `signing_secret` serialized to admin Inertia

**Confidence:** High  

`AdminIntegrationController::operation` L98: `IntegrationWebhook::query()->…->get()`. Model has encrypted cast, **no** `$hidden` (`IntegrationWebhook.php` L8–23). Browser/network can see decrypted secret.

---

### AUD-P1-022 — Production bulk-safety depends on an admin-editable label, not `APP_ENV`

**Confidence:** High  

`GovernancePolicy::isProductionEnvironment()` L14–16 compares `gov_environment_label` to `'production'`. Relabel to `staging` and `assertOperationalMutationAllowed` no longer blocks company deactivation (`executeBulk` L237, L244–252).

---

## P2 — medium

### AUD-P2-001 — Mollie webhook is CSRF-exempt and has no shared-secret/signature

`routes/web.php` L53; `MollieWebhookController.php` L11–18. Mitigated by fetching payment from Mollie API. Still allows unauthenticated sync/spam.

### AUD-P2-002 — Inbound webhook secret accepted in query string

`InboundEmailWebhookController.php` L28; UI documents it.

### AUD-P2-003 — `AdminPermissionGate` compares permission names to role names

`AdminPermissionGate.jsx` L11–12. `HandleInertiaShares` does not share a permissions array. Must not be treated as a security control.

### AUD-P2-004 — No fine-grained admin authorization

Entire `/admin/*` surface is `role:admin`. Only registered policy: `SupportTicketPolicy`. No `$this->authorize()` in Admin controllers.

### AUD-P2-005 — Maintenance windows do not toggle `maintenance_enabled`

Canonical switch: `EnsurePlatformNotInMaintenance` + platform settings. Infra windows are a ledger (`storeMaintenanceWindow` L169–185).

### AUD-P2-006 — Infrastructure backups are a manual log, not a backup

`storeBackupRun` records a run; no dump/upload.

### AUD-P2-007 — Governance exports have no file artifact

`storeExport` sets `status: ready`; UI “Log download” only.

### AUD-P2-008 — Governance import validates CSV only; no apply

`storeImport` L267–305.

### AUD-P2-009 — `simulateChange` backend remains; UI removed JSON simulation

Route `admin.governance.simulate` (`web.php` L284); UI is navigation/flash only.

### AUD-P2-010 — Failed job retry (infra + comms) has no production governance gate

`AdminInfrastructureController::retryFailedJob` L190–201; comms retry can retry **any** failed job UUID.

### AUD-P2-011 — Consent register has no writer

`ComplianceConsentRecord` schema + read UI; no `create`.

### AUD-P2-012 — Legal notices unpublished to the product

`PlatformLegalNotice` admin-only.

### AUD-P2-013 — Deletion jobs never execute after approve

See P0-003. Approve is a status flip.

### AUD-P2-014 — Company deletion “completed” is shallow anonymization

Name/email rewrite + `is_active=false`; `permanently_deleted_at` never set; related invoices/customers remain.

### AUD-P2-015 — GET company show creates a verification row

`AdminCompanyController::show` L174–177.

### AUD-P2-016 — `syncRoles` allows empty role set

`role_ids` required array, no `min:1`.

### AUD-P2-017 — Approve/reject lack pending-state guards

Can re-approve/reject non-pending companies.

### AUD-P2-018 — SES selectable as mail driver without SiteSetting credential mapping

`PlatformMailConfigurator` maps SMTP/Postmark/Resend only.

### AUD-P2-019 — Inbound provider/mode/address/forward settings unread

`comm_inbound_provider`, `comm_inbound_mode`, `comm_inbound_address`, `comm_inbound_forward_emails`.

### AUD-P2-020 — Postbode admin defaults unread

Company Postbode uses company tokens + `config/services.php`.

### AUD-P2-021 — WhatsApp admin templates unused

Invoice WhatsApp text hardcoded in `Invoices/Show.jsx`.

### AUD-P2-022 — Environment guards unused

`IntegrationPolicy::blockLiveCompanyInTest`, `int_prevent_peppol_live_in_local` unused.

### AUD-P2-023 — Admin in-app notifications cannot be marked read from the drawer

Only `ticketShow` marks related rows read. Synthetic shell alerts never clear.

### AUD-P2-024 — Existing Feature tests disagree with current admin login redirect

`AuthenticationTest` attaches `admin` role then expects `/dashboard`; runtime redirects to `/admin` (`AuthenticatedSessionController` L81–85). See `test-matrix.md`.

---

## P3 — low

### AUD-P3-001 — Orphan `config/permission.php` (Spatie) vs custom Role/Permission models

### AUD-P3-002 — `auth.check` middleware alias unused

### AUD-P3-003 — `/reports` is a plain-string stub

### AUD-P3-004 — Billing reports `refunds` hardcoded `0`

### AUD-P3-005 — Financial reconciliation loads all invoices into PHP

### AUD-P3-006 — Duplicate email-template editors (Settings + Communications)

### AUD-P3-007 — Duplicate audit surfaces (logs, security op, governance)

### AUD-P3-008 — Scheduled-tasks infra UI is a static array vs `bootstrap/app.php` L21–23

### AUD-P3-009 — Empty states missing on several admin tables (companies, users, tickets)

### AUD-P3-010 — Weak confirmations (`window.confirm` / auto-acked flags)

### AUD-P3-011 — Approvals request-info errors not shown

### AUD-P3-012 — `plans` prop unused on company index

### AUD-P3-013 — Vulnerability scan depends on host `composer` CLI

### AUD-P3-014 — Peppol monitoring copy says “per company”; query is global

### AUD-P3-015 — No admin Feature tests at all

### AUD-P3-016 — `PlatformSettingsController` + `Pages/Settings/Index.jsx` have no routes (dead)

---

## Findings deferred / unverified

- Live Mollie/Peppol HTTP contracts in the deployed environment
- Whether Inertia middleware strips `signing_secret` (not observed in `HandleInertiaRequests`)
- Concurrent admin edits (no optimistic locking) — residual race risk
- Full IDOR sweep of every customer controller (spot-checks used `activeCompany` consistently)
- Password-OTP and approval-email deliverability
