# Offacto admin — security review

Read-only review of authorization, tenant isolation, secrets, CSRF, uploads, logging, and privacy. Complements `findings.md`. No secrets, tokens, or customer data are reproduced here.

---

## 1. Authentication

| Control | Status | Evidence |
|---------|--------|----------|
| Session login | **Implemented** | Shared `POST /login` → `AuthenticatedSessionController::store` (`app/Http/Controllers/Auth/AuthenticatedSessionController.php` L32–85) |
| Admin login skin | **Implemented** (GET) | `GET /admin/login` `AdminAuthController::login` L12–17; form posts to `/login` (`Admin/Auth/Login.jsx`) |
| Inactive user block | **Implemented** at login only | L45–53 |
| Email verification gate on admin | **Partially implemented** | Group uses `verified.email` (`routes/web.php` L185); `User` does not implement `MustVerifyEmail` (commented in `User.php`); custom OTP + `hasVerifiedEmail()` |
| Remember-me | **Implemented** | `LoginRequest::authenticate` |
| Logout | **Implemented** | `POST /logout`; redirects `/` not `/admin/login` |
| Admin MFA | **Not implemented** as a control | See AUD-P0-001 |
| Step-up for password set / role change / workspace entry | **Not implemented** | `role:admin` only |

Admin and customer share one session guard. After admin login, `active_company_id` is forgotten (L70–72) unless the admin later enters a workspace.

---

## 2. Authorization model

**Not Spatie at runtime.** `composer.json` has no `spatie/laravel-permission`. Roles/permissions are custom Eloquent (`roles`, `permissions`, `role_user`, `permission_role`). `config/permission.php` still mentions Spatie classes (orphaned).

| Layer | Mechanism | Scope |
|-------|-----------|--------|
| Admin HTTP | `middleware(['auth','verified.email','role:admin'])` `routes/web.php` L185 | All `/admin/*` |
| Role check | `RoleMiddleware` L17–39 | 403 if missing role |
| Permission middleware | `PermissionMiddleware` | Used only on `/reports` L388–391 |
| Policies | `SupportTicketPolicy` only (`AppServiceProvider` L28) | Customer support tickets |
| Admin policies | **None** | Any admin can mutate any admin resource |
| Staff | Isolated `/staff`; `/reports` with `admin\|staff` + `view-reports` | Minimal |

`AdminPermissionGate.jsx` L11–12 compares permission keys to **role names** and is not a security control (AUD-P2-003).

**Privileged operations with no step-up:** set user password (`AdminUserController::resetPassword` L204–214), sync roles (L241–270), enter any company workspace (L318–327), restore config snapshots, retry failed jobs.

---

## 3. Tenant isolation and IDOR

### Customer routes (spot-check: **Implemented** pattern)

Queries typically include `where('company_id', $activeCompany->id)`:

- `InvoiceController::show` ~L372–375
- `CustomerController` update ~L148–151
- Company switch denied without membership (`CompanyController::switchCompany` L24–31)
- Support tickets: `$this->authorize('view'|'reply')` (`SupportTicketController` L105, L130)

`User::setActiveCompanyId` L243–253 rejects companies the user cannot access **unless** the user is an admin.

### Admin routes (cross-tenant **by design**)

Implicit model binding on `Company`, `User`, `SupportTicket` with no extra company scope. Nested company resources check parent id:

- `downloadExport` / `destroyOverride` / `updateDeletionRequest` use `abort_if` company mismatch (`AdminCompanyController` L351, L381, L439)

### High-risk admin→tenant path

1. `POST /admin/companies/{company}/workspace` sets `admin_workspace_company_id` and `active_company_id` (L318–322).
2. `RedirectPlatformAdmin` then allows the admin into the customer app (middleware L16–17).
3. `CompanyAccess::writeBlockReason` returns `null` for admins (L18–20). `PlanEntitlements::blockCreateReason` same bypass (~L143–145).
4. Support access-request approval is **not** consulted (AUD-P1-003).

### Inbound email (critical)

Reference match without sender/company check — AUD-P0-002 (`InboundEmailWebhookController` L115–118).

### Unverified

Not every customer controller was line-audited. Pattern is consistent on invoices, customers, offers, support. Residual IDOR risk: any new endpoint that binds a model by id without `company_id`.

---

## 4. CSRF and webhook exceptions

```26:29:bootstrap/app.php
        $middleware->validateCsrfTokens(except: [
            'webhooks/mollie',
            'webhooks/inbound-email',
        ]);
```

| Endpoint | CSRF | Auth | Notes |
|----------|------|------|-------|
| `POST /webhooks/mollie` L53 | Exempt (correct) | None | Fetches payment from Mollie by `id` (`MollieWebhookController` L11–18; `MolliePaymentService::handleWebhook`) — AUD-P2-001 |
| `POST /webhooks/inbound-email` L54 | Exempt (correct) | Shared secret, fail-closed if unset | Headers or `?secret=` — AUD-P2-002, AUD-P0-002 |
| All admin POST/PATCH/DELETE | Laravel CSRF | Session + role | Standard Inertia |

No other CSRF exceptions found.

---

## 5. Secrets and password fields

### Cleared on read (**Implemented** for settings forms)

`PlatformSettingsService::valuesForSection` L53–70:

- Mollie test/live keys blanked; `*_set` flags
- Peppol token blanked; `*_set`
- Every `type=password` field blanked; `*_set`

Empty password on update is skipped (L115–118) so blank save does not wipe.

### Storage

| Secret | Storage | Notes |
|--------|---------|-------|
| Platform Mollie / SMTP / Postmark / Resend | `site_settings.value` **plaintext** | Contrast: company Mollie/Postbode on `CompanySetting` encrypted casts |
| Outbound webhook `signing_secret` | Encrypted cast | **Leaked to Inertia** (AUD-P1-021) |
| Integration API keys | SHA-256 hash + prefix | Plaintext shown once via session flash |
| Gov automation keys | Hash | **No request middleware validates them** |
| Inbound webhook secret | `site_settings` | Query-string acceptance |

Governance config logger redacts password-typed keys (`PlatformSettingsService` L127–131, `sensitive=true`).

---

## 6. Uploads

Settings uploads go through `PlatformSettingsService::handleUploads` (logo/favicon). Company data exports write local files (`CompanyDataExportService`). Governance import accepts CSV `max:5120` (`storeImport` L273).

**Gaps:** No systematic review of MIME/content sniffing beyond field `accept` hints. Infra attachment-lifecycle settings (`infra_attach_*`) have **no cleanup job**. Offer/invoice attachments live on the customer app (out of admin-scope except policy claims).

---

## 7. Logging, privacy, audit

| Signal | Status | Evidence |
|--------|--------|----------|
| Activity log | **Implemented** | `ActivityLog::record` on most admin mutations; UI `AdminActivityLogController` |
| Security events | **Implemented** | Login success/blocked; `AdminSecurityLogController` |
| Config change log | **Implemented** | `GovernanceConfigLogger` on settings persist |
| Support in-app notifications | **Implemented** | `AdminNotificationService`; mark-read on ticket show only |
| Admin password in logs | **Mitigated** for settings passwords | Sensitive flag |
| Inbound `from` in activity metadata | Stored | `InboundEmailWebhookController` L50, L78 — operational PII |
| Privacy access review | Read-only insights | `AdminComplianceInsights::privacyAccessSignals` |
| Consent register | **No writers** | AUD-P2-011 |
| Legal hold enforcement | **Missing** | AUD-P0-003 |

**Logging risk:** Query-string webhook secrets and inbound From addresses can land in access logs / activity metadata.

---

## 8. Session and account restrictions

| Control | Status |
|---------|--------|
| Revoke sessions (admin user tool) | **Implemented** — deletes `sessions` rows (`AdminUserController::revokeSessions` L217–225) |
| Suspend user | **Implemented** persist; **does not** revoke sessions (AUD-P1-004) |
| Security “account restrictions” | CRUD only; **not** consulted at login |
| Rate-limit settings | Stored; `SecurityPolicy::rateLimitFor` unused |

---

## 9. Feature flags and entitlements (security-relevant)

- **Plan entitlements:** enforced on selected tenant writes via `CompanyAccess` + `PlanEntitlements`. Admins bypass.
- **Company feature overrides:** merged in `PlanEntitlements::applyCompanyOverrides`.
- **Global feature flags / product rollouts / security MFA flag:** **not enforced**.

---

## 10. Privacy and data subject paths

DSAR, authority requests, and controlled disclosures are **manual registers** (`AdminComplianceController`). They do not export or redact tenant data automatically. Company deletion is shallow anonymization (AUD-P2-014). Compliance deletion jobs do not run (AUD-P2-013).

Internal support notes **are** hidden from the customer portal (`SupportTicketController::show` L107; customer cannot set `is_internal` L140). Admin can post internal notes (`AdminSupportController::storeMessage` L153–165).

---

## 11. Residual risk statement

The strongest implemented controls are: session auth, coarse `role:admin`, customer `company_id` scoping, CSRF on session routes, inbound webhook fail-closed secret, settings password redaction on read, and activity logging.

The weakest: **no MFA**, **flat admin**, **workspace entry without access-approval**, **inbound ticket matching**, **legal holds that do not bind**, and **a large surface of settings that look like controls but are not read**.
