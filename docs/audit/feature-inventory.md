# Offacto admin — feature inventory

Classification rule: **Implemented** only if persistence, authorization, runtime application (when the feature claims to change behavior), and a failure path exist. A route + React page is not enough.

**AuthZ baseline for every `/admin/*` row:** `auth` + `verified.email` + `role:admin` (`routes/web.php` L185). That gate is real. Fine-grained permissions are not.

Legend: Implemented | Partially implemented | UI only | Backend only | Placeholder-mock | Broken | Not implemented | Unverified

---

## Counts

| Classification | Features |
|----------------|---------:|
| Implemented | 98 |
| Partially implemented | 56 |
| UI only | 26 |
| Not implemented | 12 |
| Placeholder-mock | 9 |
| Broken | 8 |
| Backend only | 5 |
| Unverified | 2 |
| **Total inventoried** | **216** |

Counts are of inventory rows below (settings *sections* and operational capabilities, not every individual `site_settings` key). Stored-but-unread keys are called out in Gaps.

---

## A. Auth, shell, search, dashboard

| ID | Feature | Class | Evidence | Gaps |
|----|---------|-------|----------|------|
| AUTH-001 | Admin route prefix + names | Implemented | `routes/web.php` L185–378 | — |
| AUTH-002 | `role:admin` gate | Implemented | `RoleMiddleware.php` L17–39 | No admin permissions |
| AUTH-003 | Guest admin login page | Implemented | L181–183; `AdminAuthController::login` L12–17 | Shared `POST /login` |
| AUTH-004 | Session login + admin home | Implemented | `AuthenticatedSessionController` L70–85 | — |
| AUTH-005 | Remember-me | Implemented | `Login.jsx`; `LoginRequest` | — |
| AUTH-006 | Logout | Implemented | `AdminTopBar`; `destroy` L91–99 | Redirects `/` |
| AUTH-007 | Email-verified gate | Partially implemented | L185; `EnsureEmailVerifiedForSession` | `MustVerifyEmail` commented on `User` |
| AUTH-008 | Inactive user login block | Implemented | L45–53 | Mid-session not rechecked |
| AUTH-009 | Redirect admins off customer app | Implemented | `RedirectPlatformAdmin`; `web.php` L77–85 | Bypass via workspace session |
| AUTH-010 | Admin MFA page | UI only | `admin.mfa` L188; `MfaVerify.jsx` | Setting unused |
| AUTH-011 | MFA verify | Broken | UI posts `/admin/mfa/verify` | No route |
| AUTH-012 | `sec_mfa_required_admin` | Placeholder-mock | `SecuritySettingsRegistry.php` L74 | Never read |
| AUTH-013 | Admin layout / nav | Implemented | `AdminLayout.jsx` | Static; not permission-filtered |
| AUTH-014 | 403 AccessDenied Inertia | Implemented | `bootstrap/app.php` L44–59 | Admin users only |
| AUTH-015 | AdminPermissionGate | Broken | `AdminPermissionGate.jsx` L11–12 | Compares perms to roles |
| AUTH-016 | Roles/permissions DB | Implemented | seeders `AddRoles`/`AddPermissions`; `User::hasRole` | Unused on admin routes |
| AUTH-017 | Permission middleware | Partially implemented | alias L37; only `/reports` L391 | — |
| AUTH-018 | Staff dashboard | Partially implemented | `web.php` L381–385 | Isolated |
| AUTH-019 | `/reports` | Placeholder-mock | L388–391 returns `'Reports'` | — |
| AUTH-020 | Dashboard KPIs | Implemented | `AdminDashboardController`; `AdminDashboard.php` | — |
| AUTH-021 | Global search | Implemented | `admin.search` L187; `AdminShellInsights` L122–194 | — |
| AUTH-022 | Notifications drawer | Partially implemented | `AdminNotificationService`; `HandleInertiaRequests` | No mark-read API; extras email-only (correct) |
| AUTH-023 | Environment banner | Implemented | Governance `gov_environment_label` in shell | Label ≠ `APP_ENV` |

---

## B. Companies

| ID | Feature | Class | Evidence | Gaps |
|----|---------|-------|----------|------|
| CO-001 | Directory search/filter | Implemented | `AdminCompanyController::index` L31–149; `admin.companies.index` L360 | No `AdminEmpty` |
| CO-002 | Approvals queue | Implemented | `approvals` L152–167; L361 | — |
| CO-003 | Company show | Implemented | `show` L170–242; L364 | GET creates verification (side effect) |
| CO-004 | Edit company | Implemented | `update` L257–279; L363/365 | VAT not unique |
| CO-005 | Approve | Implemented | L282–287; `CompanyAdminWorkflow` | No pending-state guard |
| CO-006 | Reject | Implemented | L290–295 | Same |
| CO-007 | Request more info | Partially implemented | L298–303; workflow L49–56 | No email |
| CO-008 | Status activate/suspend/restrict/deactivate | Implemented | `applyStatus` L306–315 | Weak UI confirm |
| CO-009 | Enter/exit workspace | Implemented | L318–338; L362/370 | Not tied to access requests |
| CO-010 | Data export + download | Implemented | L341–354; `CompanyDataExportService` | Unverified file contents |
| CO-011 | Feature overrides | Implemented | L356–387; merged in `PlanEntitlements` | Non-unique capability index |
| CO-012 | Verification record | Implemented | L389–410 | Created on GET show |
| CO-013 | Deletion/retention requests | Partially implemented | L413–462 | Shallow anonymize; ignores compliance holds |
| CO-014 | Admin create company | Not implemented | — | User self-serve only |
| CO-015 | Approve/reject on Show page | Not implemented | Actions only on `Approvals.jsx` | — |

---

## C. Users

| ID | Feature | Class | Evidence | Gaps |
|----|---------|-------|----------|------|
| USR-001 | Directory | Implemented | `AdminUserController::index` L23–76; L345 | No empty state |
| USR-002 | Profile show | Implemented | L78–116; L347 | — |
| USR-003 | Edit profile | Implemented | L129–144; L346/348 | — |
| USR-004 | Suspend/reactivate | Implemented | L146–171; L349 | No session revoke |
| USR-005 | Role sync + last-admin | Implemented | L241–270; L350 | Empty role set allowed |
| USR-006 | Send password reset OTP | Implemented | L173–179; L351 | Deliverability unverified |
| USR-007 | Verify/unverify email | Implemented | L182–201; L352–353 | — |
| USR-008 | Admin set password | Implemented | L204–214; L354 | No step-up |
| USR-009 | Revoke sessions | Implemented | L217–225; L355 | Not chained from suspend |
| USR-010 | Billing reminders toggle | Implemented | L228–238; L356 | — |
| USR-011 | Admin create user | Not implemented | — | — |
| USR-012 | Impersonate user | Not implemented | Support copy discourages it | Workspace enter is the substitute |

---

## D. Platform settings (`/admin/settings`)

Persistence via `AdminPlatformSettingsController` + `PlatformSettingsService` is real. Classification is **runtime apply**.

| ID | Section / keys | Class | Runtime evidence | Gaps |
|----|----------------|-------|------------------|------|
| SET-001 | Settings hub CRUD + reset confirm | Implemented | Controller L16–65; `SettingsForm.jsx` L204–212 | — |
| SET-002 | `site_name`, `admin_email` | Implemented | Mail/controllers | — |
| SET-003 | Registration / welcome / approval flags | Implemented | `RegisteredUserController`, `UserCompanyController`, `ServiceController` | — |
| SET-004 | `default_vat_rate` | Implemented | `Invoice.php` L152 | Global, not per-company copy |
| SET-005 | Payment gateway / Mollie keys | Implemented | `PlatformMollieService` L14–27 | Duplicate UI |
| SET-006 | Maintenance | Implemented | `EnsurePlatformNotInMaintenance` L19–38 | — |
| SET-007 | Logo upload | Partially implemented | Persist + preview | No consistent public/tenant render |
| SET-008 | Favicon | UI only | Persist | Unread |
| SET-009 | Tagline, timezone, default locale/currency | Partially implemented | Currency display-only | Locale unread (`SetLocale`) |
| SET-010 | Theme section | UI only | — | Company theme used instead |
| SET-011 | Branding policies | UI only | `branding_*` | No readers |
| SET-012 | Languages / translation overrides | UI only | — | Hardcoded en/fr/nl |
| SET-013 | Regional formats | UI only | — | — |
| SET-014 | Tax categories | UI only | — | Only integer VAT used |
| SET-015 | Document / PDF templates | UI only | — | — |
| SET-016 | Email templates (settings copy) | Partially implemented | Same key as comms; admin tooling | Not applied on send |
| SET-017 | Numbering prefixes / defaults | UI only | — | `NumberingSeriesService` ignores |
| SET-018 | Payment terms | UI only | — | Product `prod_*` used instead |
| SET-019 | Copyright / legal library | UI only | — | Tenant `company_legal_documents` |
| SET-020 | Navigation | UI only | — | — |
| SET-021 | `global_feature_flags` | Not implemented | Defined L229–231 | Zero readers |
| SET-022 | Custom fields / workflows / forms | Placeholder-mock | Registry hints L249, L259 | — |
| SET-023 | Dashboard widgets / notification defaults / public pages | UI only | — | — |
| SET-024 | Password redaction on read | Implemented | `PlatformSettingsService` L53–70 | — |
| SET-025 | Legacy `PlatformSettingsController` | Not implemented | No routes | Dead code |

---

## E. Financial

| ID | Feature | Class | Evidence | Gaps |
|----|---------|-------|----------|------|
| FIN-001 | Financial hub + 14 config sections persist | Partially implemented | `AdminFinancialDocumentController` L58–67 | `FinancialPolicy` unused |
| FIN-002 | `fin_*` runtime policy | Not implemented | `FinancialPolicy.php` L12–45; zero callers | Invoice lock/validation |
| FIN-003 | Version / reconcile / exceptions / delivery | Implemented | Insights + `operation()` L87–94 | Reconcile scales poorly; Peppol ref uses `mollie_payment_id` |
| FIN-004 | Audit export CSV | Implemented | L104–123 | — |
| FIN-005 | Tenant invoices/quotes/credit notes | Implemented | Customer controllers (context) | Outside admin policy |
| FIN-006 | Tenant Mollie invoice checkout | Implemented | `MolliePaymentService` | Company keys |

---

## F. Billing, subscriptions, plans

| ID | Feature | Class | Evidence | Gaps |
|----|---------|-------|----------|------|
| BIL-001 | Billing settings persist | Partially implemented | `AdminBillingController` L19–44 | — |
| BIL-002 | `trial_duration_days` | Implemented | `Company::startTrial` | — |
| BIL-003 | `subscription_reminder_days` | Implemented | `SubscriptionReminder`; `ProcessSubscriptionBilling` | — |
| BIL-004 | Dunning keys | UI only | Persist only | No job |
| BIL-005 | `billing_notify_*` | UI only | Persist only | Sends ignore flags |
| BIL-006 | Coupons CRUD | Backend only | L47–107 | No checkout |
| BIL-007 | Payments list | Implemented | L109–145 | — |
| BIL-008 | Reports | Partially implemented | L148–165 | Refunds = 0 |
| BIL-009 | Platform Mollie checkout + webhook | Implemented | `UpgradeController`, `PlatformMollieService`, L53 | No ingress signature |
| BIL-010 | Subscription dashboard/directory/show | Implemented | `AdminSubscriptionController`; L327–329 | — |
| BIL-011 | Adjust subscription | Implemented | L330; `SubscriptionAdjustmentService` | Annual broken |
| BIL-012 | Plan CRUD + entitlements editor | Implemented | `AdminSubscriptionPlanController` L332–336 | — |
| BIL-013 | Plan entitlements on tenant API | Implemented | `PlanEntitlements`, `CompanyAccess` | Admin bypass |
| BIL-014 | Annual billing interval | Broken | `Company.php` L406–407 | Always `addMonth()` |

---

## G. Compliance

| ID | Feature | Class | Evidence | Gaps |
|----|---------|-------|----------|------|
| CMP-001 | Hub + settings persist | Partially implemented | L202–219; registries | Most keys unread |
| CMP-002 | Jurisdiction / tax / e-invoice / peppol policy | UI only | Registry sections | Not used by `PeppolSendService` / `Invoice` |
| CMP-003 | Retention settings | Partially implemented | Metric only `AdminComplianceInsights` L56–63 | No purge |
| CMP-004 | Residency / RoPA / disclosure defaults | UI only | — | — |
| CMP-005 | Export security policy | Partially implemented | `CompliancePolicy` unused; hardcoded confirm L439 | — |
| CMP-006 | Emergency disclosure settings | Partially implemented | Checkbox; min approvers unread | — |
| CMP-007 | Legal notices CRUD | Partially implemented | `storeLegalNotice` L135–169 | No public consumer |
| CMP-008 | Consent records | Backend only | Schema + read table | No writer |
| CMP-009 | DSAR register | Partially implemented | L172–214 | No auto export; thin UI |
| CMP-010 | Legal holds CRUD | Partially implemented | L352–379 | **No enforcement** |
| CMP-011 | Deletion jobs create/approve | Partially implemented | L382–412 | Never execute |
| CMP-012 | Privacy access signals | Implemented | Insights L165–202 | Read-only |
| CMP-013 | Breach log | Partially implemented | L415–434 | No close lifecycle |
| CMP-014 | Authority request workflow | Implemented | L216–294 | Manual; no attachment |
| CMP-015 | Evidence metadata | Partially implemented | L332–349 | No blob store |
| CMP-016 | Controlled disclosure | Implemented | L297–329 | Manual scope |
| CMP-017 | Compliance cases | Partially implemented | Created with authority req | No edit UI |
| CMP-018 | Peppol monitoring | Implemented | Insights L208–220 | Global, not per-company |
| CMP-019 | Compliance CSV | Implemented | L437–461 | — |
| CMP-020 | KYC/AML in this hub | Not implemented | — | Fraud is under Security |

---

## H. Integrations

| ID | Feature | Class | Evidence | Gaps |
|----|---------|-------|----------|------|
| INT-001 | Hub + settings persist | Partially implemented | L221–233 | Many unused keys |
| INT-002 | Credentials policy | UI only | `int_credentials_*` | Not enforced |
| INT-003 | Env management / live guards | Partially implemented | Mode stored | Guards unused |
| INT-004 | Mollie admin (same keys as settings) | Implemented | `PlatformMollieService` | Duplicate UX |
| INT-005 | Peppol admin credentials | Implemented | `IntegrationPolicy` + `PeppolSendService` | Bulk-send env-only check |
| INT-006 | Postbode admin defaults | UI only | — | Company tokens + config |
| INT-007 | Email provider pointer | Placeholder-mock | Nav to Communications | — |
| INT-008 | WhatsApp policies | Partially implemented | Setting stored | Invoice text hardcoded |
| INT-009 | API rate limits | UI only | `IntegrationPolicy::apiRatePerMinute` unused | — |
| INT-010 | Retry policies | UI only | — | — |
| INT-011 | Outbound webhook registry | Partially implemented | L128–156 | Never dispatched |
| INT-012 | Platform API keys | Partially implemented | issue/revoke | `findValid` unused |
| INT-013 | Health checks | Partially implemented | L119–125; real Mollie GET | Peppol = config presence |
| INT-014 | Failure queue | Broken | Read/synthetic only | No `create` |
| INT-015 | Provider registry | Partially implemented | seed + store | `updateProvider` no UI |
| INT-016 | `int_mollie_webhook_override` | UI only | — | Config/route used |
| INT-017 | Company integration secret isolation | Implemented | Admin sees counts only | — |
| INT-018 | Webhook secret in Inertia | Broken | `operation` L98; no `$hidden` | Leak |

---

## I. Communications / SMTP / inbound

| ID | Feature | Class | Evidence | Gaps |
|----|---------|-------|----------|------|
| COM-001 | Hub + outbound settings persist | Implemented | L235–242; registry L62–79 | — |
| COM-002 | `PlatformMailConfigurator` on send | Implemented | `AppServiceProvider` L30–34; configurator L13–78 | — |
| COM-003 | SMTP / from / reply-to / Postmark / Resend | Implemented | Configurator L28–77 | — |
| COM-004 | SES as selectable driver | Partially implemented | Registry option | No SiteSetting SES map |
| COM-005 | Env fallback flag | Implemented | L43, L52–57 | — |
| COM-006 | Outbound connection test | Implemented | L178–195 | — |
| COM-007 | Incoming settings persist | Partially implemented | Registry L81–93 | Most keys unread |
| COM-008 | Inbound webhook + secret | Partially implemented | L53–54; controller L21–31 | Query secret; no HMAC |
| COM-009 | Inbound create ticket | Implemented | L56–81 | Company-less possible |
| COM-010 | Inbound match by reference | Broken | L115–118 | No sender check |
| COM-011 | Template library | Partially implemented | Validate on save | Unused by mailables |
| COM-012 | Preview + test send | Implemented | L114–118, L140–176 | — |
| COM-013 | Delivery analytics | Partially implemented | Insights L16–110 | Sparse logging |
| COM-014 | Notification rules engine | UI only | Counted only | — |
| COM-015 | Scheduled notifications settings | UI only | Policy unused | Billing uses other keys |
| COM-016 | Suppression list | Placeholder-mock | Table + unused policy | No writes |

---

## J. Support and admin notifications

| ID | Feature | Class | Evidence | Gaps |
|----|---------|-------|----------|------|
| SUP-001 | Support hub + settings | Implemented | L244–262 | Some keys unread |
| SUP-002 | Admin ticket CRUD/reply | Implemented | L51–177 | Priority field unused in form |
| SUP-003 | Customer portal | Implemented | `SupportTicketController` L23–151; flag `SupportSettings` | — |
| SUP-004 | Disabled / no-company pages | Implemented | `Support/Disabled.jsx`, `NoCompany.jsx` | — |
| SUP-005 | Internal notes hidden | Implemented | L107 customer; admin L153–165 | — |
| SUP-006 | SLA hours | Partially implemented | `SupportPolicy::slaHoursForPriority` | Working hours unused |
| SUP-007 | Staff notify toggles | Implemented | `SupportNotificationSettings`; notifier L80–88 | — |
| SUP-008 | Admin in-app + email; extras email-only | Implemented | `SupportTicketNotifier` L18–48 | — |
| SUP-009 | Access approval workflow | Partially implemented | L251–252 | Not enforced |
| SUP-010 | Macros / KB / feedback / escalations | Partially implemented | store methods L355–419 | No customer KB |
| SUP-011 | Customer email on staff reply | Not implemented | Notifier staff-only | — |
| SUP-012 | Mark ticket notifications read | Partially implemented | `ticketShow` L64–68 | Drawer has no API |
| SUP-013 | Recovery requests | Partially implemented | L253–254 | Manual register |

---

## K. Security

| ID | Feature | Class | Evidence | Gaps |
|----|---------|-------|----------|------|
| SEC-001 | Hub + metrics | Implemented | `AdminSecurityController` L30–43 | — |
| SEC-002 | Policy / rate-limit / upload settings | Partially implemented | Persist | `SecurityPolicy` unused |
| SEC-003 | Suspicious activity monitor | Implemented | Insights L59–117 | — |
| SEC-004 | Account restrictions | Partially implemented | CRUD L137–161 | Not enforced at login |
| SEC-005 | Fraud queue | Partially implemented | L164–190 | Heuristic suggestions |
| SEC-006 | Secret rotation tasks | Partially implemented | Manual complete L193–203 | Ledger |
| SEC-007 | Security audit (ops + `/admin/logs/security`) | Implemented | L267–312; `AdminSecurityLogController` | — |
| SEC-008 | Vulnerability scan | Partially implemented | `composer audit` | Host-dependent |
| SEC-009 | Incidents / exceptions | Partially implemented | L215–261 | Exceptions unused |
| SEC-010 | Admin MFA | Broken | See AUTH-010/011 | — |

---

## L. Infrastructure

| ID | Feature | Class | Evidence | Gaps |
|----|---------|-------|----------|------|
| INF-001 | Hub metrics | Implemented | Insights L20–33 | — |
| INF-002 | DB health | Partially implemented | MySQL table stats | — |
| INF-003 | Queue counts | Implemented | Insights L85–92 | — |
| INF-004 | Scheduled tasks list | Placeholder-mock | Static array L98–103 | Real schedule L21–23 bootstrap |
| INF-005 | Backup management | Placeholder-mock | Manual log L125–145 | No backup |
| INF-006 | Restore DR test record | Partially implemented | L148–166 | Record only |
| INF-007 | Storage / integrity / log tail | Implemented | Insights read-only | — |
| INF-008 | Failed job retry | Implemented | L190–201 | No prod gate |
| INF-009 | Maintenance windows | Partially implemented | L169–187 | Does not set `maintenance_enabled` |
| INF-010 | Maintenance-controls widget | UI only | Pointer to settings | Intentional de-dupe |
| INF-011 | Backup/DR/attachment settings | Partially implemented | Registry | Cleanup job missing |

---

## M. Product

| ID | Feature | Class | Evidence | Gaps |
|----|---------|-------|----------|------|
| PRD-001 | Hub + metrics | Implemented | `AdminProductInsights` | — |
| PRD-002 | Product settings / defaults | Partially implemented | `ProductPolicy` L12–40 | Not all keys |
| PRD-003 | Public CMS / announcements / testimonials / help / release notes | Partially implemented | CRUD L143–290 | Customer surfacing unverified |
| PRD-004 | Feature rollouts | Backend only | L292–325; `featureEnabledForCompany` unused in HTTP | — |
| PRD-005 | A/B experiments | Placeholder-mock | Metadata L328–373 | No assignment |
| PRD-006 | Feedback & roadmap | Partially implemented | L376–435 | Admin-facing |

---

## N. Governance

| ID | Feature | Class | Evidence | Gaps |
|----|---------|-------|----------|------|
| GOV-001 | Env + bulk/export policy settings | Implemented | Registry L71–99; `GovernancePolicy` | Label ≠ APP_ENV |
| GOV-002 | Bulk preview | Implemented | L208–226 | — |
| GOV-003 | Bulk execute deactivate dormant | Partially implemented | L244–252 | No status events |
| GOV-004 | Bulk execute remind users | Broken | L243–260 | affected=0, marked executed |
| GOV-005 | Import center | Partially implemented | L267–305 | No apply |
| GOV-006 | Export jobs | Placeholder-mock | L308–341 | No file |
| GOV-007 | Config history | Implemented | `GovernanceConfigLogger` | — |
| GOV-008 | Snapshots + restore | Implemented | L344–394 | Unverified live restore |
| GOV-009 | Scheduled changes | Partially implemented | L397–422 | Never applied; empty payload UI |
| GOV-010 | Action simulation UI | UI only | Operation.jsx L323–364 | — |
| GOV-011 | `simulateChange` API | Backend only | L425–446; route L284 | Orphan |
| GOV-012 | Approval queue aggregator | Implemented | Insights L44–72 | — |
| GOV-013 | Global audit search | Implemented | Insights L123–142 | — |
| GOV-014 | Reconciliation (shared integrity) | Implemented | Reuses infra insights | — |
| GOV-015 | Runbooks | Implemented | CRUD L449–460 | — |
| GOV-016 | Automation keys | Backend only | L463–481 | No authn path |

---

## O. Logs

| ID | Feature | Class | Evidence | Gaps |
|----|---------|-------|----------|------|
| LOG-001 | Activity log | Implemented | `AdminActivityLogController`; L357 | — |
| LOG-002 | Security log | Implemented | `AdminSecurityLogController`; L358 | — |

---

## P. Cross-cutting runtime (non-page)

| ID | Feature | Class | Evidence | Gaps |
|----|---------|-------|----------|------|
| X-001 | CSRF exceptions for two webhooks | Implemented | `bootstrap/app.php` L26–28 | — |
| X-002 | Recurring invoice command scheduled | Implemented | L22 | Not tied to `fin_*` |
| X-003 | Subscription process scheduled | Implemented | L23 | Ignores billing notify/dunning |
| X-004 | Admin Feature tests | Not implemented | `tests/` grep | — |
| X-005 | CI | Not implemented | No `.github/workflows` | — |
| X-006 | Spatie package | Not implemented | `composer.json` L8–14 | Orphan config |
| X-007 | Customer tenant `company_id` scoping | Implemented | Invoice/customer/support spot-check | Residual unverified controllers |
| X-008 | Announcements on customer Inertia | Unverified | `ProductPolicy::activeAnnouncements` unused outside admin insights | — |
| X-009 | Public CMS pages rendered | Unverified | Product CRUD exists | Need route consumers |

---

## Stored-but-unread (settings keys, condensed)

Not each key is its own inventory row. Treat the following as **UI only / Not implemented** unless listed Implemented above:

- Platform: `platform_tagline`, `platform_default_timezone`, `platform_default_locale`, theme.*, branding.*, `platform_enabled_locales`, `translation_overrides`, regional.*, `tax_categories`, document/pdf/numbering/payment-term keys, copyright/legal/navigation/widgets/notification_defaults/public_pages, `global_feature_flags`
- Financial: **all** `fin_*`
- Billing: `dunning_*`, `billing_notify_*`
- Integrations: `int_mollie_webhook_override`, `int_mollie_auto_reconcile`, `int_block_live_*`, `int_prevent_peppol_*`, `int_whatsapp_*` (enforcement), `int_api_rate_*`, `int_retry_*`, `int_postbode_*`, `int_credentials_*`
- Comms: `comm_notification_rules`, `comm_scheduled_*`, inbound provider/mode/address/forward, suppression
- Support: working hours, escalation paths, `sup_require_access_approval`
- Security: `sec_mfa_required_admin`, password/rate-limit/privileged-confirm keys
- Infra: attachment cleanup, backup policy (no job)
- Product rollouts / experiments
- Compliance: tax/e-invoice/peppol-policy/residency/export-policy/emergency min-approvers

---

## Notes

- `ADMIN_MANUAL.md` describes impact as if Configure pages change runtime. Many do not. Manual is **not** evidence.
- Customer-app capabilities (invoices, offers) are inventoried only where admin policy claims to govern them.
