# Offacto admin — test matrix

## 1. What was executed this audit

| Command | Environment | Destructive? | Result |
|---------|-------------|--------------|--------|
| `php artisan test --no-ansi` | Local, `phpunit.xml` sqlite `:memory:`, `MAIL_MAILER=array`, `QUEUE_CONNECTION=sync` | No | **3 failed**, 1 skipped, **27 passed** (83 assertions), 10.24s |

No CI config exists (no `.github/workflows`). `composer.json` script `"test"` runs `php artisan test`.

---

## 2. Existing suite (all files)

There are **12** test files. **Zero** reference `/admin`, `Admin*Controller`, or `role:admin` as a subject under test (except AuthenticationTest *accidentally* attaching the admin role).

| File | Intent | Admin coverage | This run |
|------|--------|----------------|----------|
| `tests/Unit/ExampleTest.php` | `true === true` | None | PASS |
| `tests/Feature/ExampleTest.php` | `GET /` → login | None | PASS |
| `tests/Feature/Auth/AuthenticationTest.php` | Login/logout | Accidental: factory user **gets admin role** then expects `/dashboard` | **FAIL** — actual redirect `/admin` (`AuthenticatedSessionController` L81–85 vs test L33) |
| `tests/Feature/Auth/EmailVerificationTest.php` | Signed verify | None | PASS |
| `tests/Feature/Auth/PasswordConfirmationTest.php` | Confirm password | None | PASS |
| `tests/Feature/Auth/PasswordResetTest.php` | OTP reset | None | PASS |
| `tests/Feature/Auth/PasswordUpdateTest.php` | Profile password | None | PASS |
| `tests/Feature/Auth/RegistrationTest.php` | Register screen | None | PASS + 1 skipped (company fields) |
| `tests/Feature/Auth/RegistrationEmailVerificationTest.php` | Register OTP | None | PASS |
| `tests/Feature/EmailVerificationEnforcedTest.php` | Unverified dashboard | None | PASS |
| `tests/Feature/ProfileTest.php` | Profile CRUD | None | **2 FAIL** — update asserts redirect `/profile`, got `/` (`ProfileTest.php` L37, L59) |
| `tests/Feature/BriefingManagementTest.php` | Duplicate briefing | None | PASS |

### Failure notes (not admin features, but suite health)

1. **AuthenticationTest** still seeds `admin` role on a “normal” login test. After admin-shell work, that user is a platform admin and is sent to `admin.dashboard`. The test is stale.
2. **ProfileTest** redirect mismatch to `/` — likely `RedirectPlatformAdmin` or profile update `redirect('/')` / intended URL. Not fully re-traced; treat as **existing test debt**.

---

## 3. Skipped checks (this audit)

| Check | Why skipped |
|-------|-------------|
| Browser E2E of admin UI | No admin tests; no instruction to drive a live staging with credentials |
| Live Mollie webhook / checkout | Real payments forbidden |
| Live Peppol send | External side effects forbidden |
| Live customer SMTP | Side effects forbidden |
| `queue:retry` / snapshot restore | Could mutate local queues/settings |
| `invoices:generate-recurring` / `subscriptions:process` | Not run; scheduled only |
| Penetration / IDOR fuzz of every id | Static spot-check only |
| Staging DB contents | Must not dump PII |

---

## 4. Required additional tests (none exist today)

Prioritized for a later implementation phase. Names are proposed; do not treat as written.

### P0 / authz

| Proposed test | Asserts |
|---------------|---------|
| `AdminMfaNotEnforcedTest` (characterization) | `GET /admin/mfa` 200 for admin; `POST /admin/mfa/verify` 404; admin routes reachable without MFA cookie |
| `AdminRoleGateTest` | Guest → redirect; company owner → 403 on `/admin`; admin → 200 |
| `InboundEmailTenantMatchTest` | Webhook with other company’s `TKT-` ref does **not** append (today this would **fail** and document the bug) |
| `InboundEmailSecretTest` | Missing/wrong secret → 401; disabled flag → 403 |

### Companies / users

| Proposed test | Asserts |
|---------------|---------|
| `AdminCompanyApprovalTest` | Approve pending → status + mail fake |
| `AdminCompanyRequestInfoMailTest` | Today: no mail sent |
| `AdminUserSuspendSessionTest` | After toggle-active, existing session still hits `/admin` (bug) |
| `AdminWorkspaceAccessApprovalTest` | `enterWorkspace` without approved request (today allowed) |
| `AdminNestedExportIdorTest` | Export id + wrong company → 404 |

### Settings / financial / billing

| Proposed test | Asserts |
|---------------|---------|
| `SettingsPasswordRedactionTest` | GET section JSON/Inertia has empty password + `*_set` |
| `FinancialPolicyUnusedCharacterizationTest` | Sending invoice ignores `fin_invoice_lock_trigger` |
| `MaintenanceModeTest` | Flag on → customer 503; admin allowed |
| `AnnualPlanRenewalTest` | `applySubscriptionPayment` period vs `billing_interval` |
| `CouponCheckoutTest` | Upgrade ignores coupons (characterization) |

### Support / comms

| Proposed test | Asserts |
|---------------|---------|
| `SupportInternalNoteHiddenTest` | Customer show payload has no `is_internal=true` |
| `SupportNotificationSplitTest` | Extra emails get mail; no `admin_notifications` row |
| `PlatformMailConfiguratorTest` | `MessageSending` applies `int_smtp_*` |
| `TemplateLibraryNotAppliedTest` | `InvoiceSent` subject ≠ stored template |

### Compliance / governance / integrations

| Proposed test | Asserts |
|---------------|---------|
| `LegalHoldDoesNotBlockCompanyDeletionTest` | Characterization of AUD-P0-003 |
| `GovernanceBulkRemindNoopTest` | Execute remind → affected 0, status executed |
| `GovernanceScheduledChangeNotAppliedTest` | No job after `effective_at` |
| `IntegrationWebhookSecretNotInertiaTest` | Payload must not contain `signing_secret` |
| `IntegrationApiKeyUnusedTest` | HTTP with Bearer key not accepted anywhere |

### CSRF / webhooks

| Proposed test | Asserts |
|---------------|---------|
| `MollieWebhookCsrfExemptTest` | POST without token 200/empty when id missing |
| `AdminPostRequiresCsrfTest` | POST `/admin/settings/general` without token 419 |

---

## 5. Coverage vs domains

| Domain | Existing tests | Gap |
|--------|----------------|-----|
| Admin auth / MFA / shell | 0 (1 stale login) | Total |
| Companies / users / approvals | 0 | Total |
| Platform settings runtime | 0 | Total |
| Financial / billing / plans | 0 | Total |
| Compliance / integrations | 0 | Total |
| Comms / inbound / support | 0 | Total |
| Security / infra / governance / product | 0 | Total |
| Customer auth / profile / briefing | Partial | Failures above |

---

## 6. Recommendation

Do not treat the current 27 passing tests as admin readiness. First fix the two stale Feature tests so CI (once added) is green, then add characterization tests for P0s **before** changing behavior so regressions are visible.
