# Offacto admin — workflow coverage

The 28 workflows from the audit brief, mapped to **actual routes** in `routes/web.php`. Status: **pass** / **fail** / **missing** / **unverified**.

**pass** = UI + authorized backend + persistence + (where claimed) runtime effect and a failure path exist.  
**fail** = path exists but a required step is broken, unused, or unsafe.  
**missing** = no real route/implementation for a required step.  
**unverified** = code present; not exercised live (payments, mail, queues, deployed env).

No live Mollie, Peppol, customer email, restores, or job replays were executed.

---

## WF-01 — Admin login → MFA → dashboard → logout

| Step | Actual route | Result |
|------|----------------|--------|
| Open admin login | `GET /admin/login` `admin.login` L182 | **pass** |
| Submit credentials | `POST /login` (not an admin-specific POST) | **pass** — `AuthenticatedSessionController::store` L81–85 redirects admins to `admin.dashboard` |
| MFA challenge | `GET /admin/mfa` `admin.mfa` L188 | **fail** — page only; not required |
| MFA verify | *(none)* — UI posts `/admin/mfa/verify` | **missing** |
| Dashboard | `GET /admin` `admin.dashboard` L186 | **pass** |
| Logout | `POST /logout` | **pass** — redirects `/` |

**Verdict: fail** (MFA). See AUD-P0-001.

---

## WF-02 — Unauthorized user → direct admin URL → access denied

| Actor | Expected | Actual |
|-------|----------|--------|
| Guest | Login redirect | `auth` middleware → login. **pass** |
| Authenticated non-admin | 403 | `RoleMiddleware` L17–39 abort 403. Admin users get Inertia `Admin/AccessDenied` (`bootstrap/app.php` L44–59); non-admins get default 403. **pass** |
| Staff | Blocked from `/admin/*` | Staff group is `/staff` and `/reports` only. **pass** |

**Verdict: pass** (coarse RBAC). Fine-grained denial inside admin is **missing** (AUD-P2-004).

---

## WF-03 — Create or approve company → assign users → apply workspace settings

| Step | Route / code | Result |
|------|----------------|--------|
| Admin create company | — | **missing** (self-serve `POST /companies` only) |
| Approvals queue | `GET /admin/companies/approvals` L361 | **pass** |
| Approve / reject | `POST …/approve` `…/reject` L366–367 | **pass** (email via `CompanyAdminWorkflow`) |
| Request info | `POST …/request-info` L368 | **fail** — no outbound email (AUD-P1-020) |
| Assign users / membership | — | **missing** — owner-only `companies.user_id`; no pivot |
| Workspace settings | Company feature overrides L373–374 | **pass** (overrides persist and merge into `PlanEntitlements`) |

**Verdict: fail** (no admin create; no membership assign; request-info silent).

---

## WF-04 — Deactivate user → invalidate access → verify existing sessions

| Step | Route | Result |
|------|-------|--------|
| Suspend | `POST /admin/users/{user}/toggle-active` L349 | **pass** (persist + last-admin / self guards) |
| Block new login | `AuthenticatedSessionController` L45–53 | **pass** |
| Invalidate existing sessions | `POST …/revoke-sessions` L355 exists but **not called** from toggle | **fail** (AUD-P1-004) |
| Mid-session admin requests | No `is_active` middleware | **fail** |

**Verdict: fail.**

---

## WF-05 — Change admin permissions → verify immediate enforcement

| Step | Result |
|------|--------|
| Sync roles | `POST /admin/users/{user}/roles` L350 — **pass** persist + last-admin guard |
| Permission bits on admin routes | **missing** — routes ignore `hasPermission()` |
| Immediate enforcement | Role change affects next `role:admin` check (roles re-queried). **pass** for role; **missing** for permissions |

**Verdict: fail** (no admin permission enforcement to verify).

---

## WF-06 — Update a global setting → persist and runtime effect

| Example | Persist | Runtime |
|---------|---------|---------|
| `allow_user_registration` | `PATCH /admin/settings/{section}` L192 | **pass** — `RegisteredUserController` |
| `maintenance_enabled` | same | **pass** — `EnsurePlatformNotInMaintenance` |
| `default_vat_rate` | same | **pass** — `Invoice::getTaxAmountAttribute` L150–154 |
| `fin_*`, theme, locales, `global_feature_flags`, branding policies | same | **fail** — stored, unread (AUD-P1-001, 002, 018) |

**Verdict: fail** as a general workflow (many keys persist only). Selected keys **pass**.

---

## WF-07 — Change a new-workspace default → existing companies unchanged

Platform copy in `ADMIN_MANUAL.md` claims prefixes, regional formats, and tax categories apply to **new** companies.

| Default | Copied on company create? |
|---------|---------------------------|
| `default_vat_rate` | Used **globally** on all invoices (not a new-company copy). **fail** vs brief |
| `invoice_prefix` / `offer_prefix` | **fail** — unused; `NumberingSeriesService` uses company series / hardcoded prefixes |
| `platform_default_currency` | **unverified** / display-only in billing |
| `prod_default_*` via Product registry | Partial via `ProductPolicy` defaults — **unverified** on every create path |

**Verdict: fail** / **unverified** — defaults are not systematically applied at company create, and VAT is global.

---

## WF-08 — Create quotation → approval → acceptance → invoice

Mostly **customer** app, not admin Financial hub.

| Step | Route | Result |
|------|-------|--------|
| Create offer | `offers` resource L151 | **pass** (tenant) |
| Admin fin approval before send | `fin_*` invoice/quote approval | **missing** — `FinancialPolicy` unused |
| Public accept/decline | `POST /q/{token}/accept|decline` L48–49 | **pass** |
| Invoice from offer | `GET invoices/from-offer/{offer}` L162 | **pass** |

**Verdict: fail** for admin approval/lock policy; **pass** for tenant quote→invoice happy path (not re-tested in browser this audit).

---

## WF-09 — Issue invoice → lock → record payment → reconcile

| Step | Result |
|------|--------|
| Issue/send | `POST invoices/{invoice}/send` L164 — **pass** (tenant) |
| Lock per `fin_invoice_lock_trigger` | **missing** (AUD-P1-001) |
| Record payment | `POST invoices/{invoice}/payment` L178 — **pass** |
| Admin reconcile | `GET /admin/financial/operations/reconciliation` L196 — **pass** as read-only insight; does not auto-fix. Loads all invoices in PHP (`AdminFinancialInsights`) |

**Verdict: fail** (no lock). Reconcile is review-only.

---

## WF-10 — Failed payment → retry safely → prevent duplicates

| Step | Result |
|------|--------|
| Platform Mollie webhook sync | `POST /webhooks/mollie` L53 — **pass** with API fetch; **unverified** live |
| Dunning / retry settings | **missing** consumers (AUD-P1-009) |
| Idempotency | `subscription_payments.mollie_payment_id` unique — **pass** for platform payments |
| Billing admin “retry” | **missing** |

**Verdict: fail** (no dunning/retry workflow). Webhook sync **unverified**.

---

## WF-11 — Recurring invoice → scheduler → draft

| Step | Result |
|------|--------|
| Configure recurring | `POST invoices/{invoice}/recurring` L167 — **pass** (tenant) |
| Scheduler | `invoices:generate-recurring` daily (`bootstrap/app.php` L22) — **pass** command scheduled |
| `fin_recurring_*` safeguards | **missing** |
| Job ran in this audit | **unverified** (not executed) |

**Verdict: pass** (core path exists) with **unverified** runtime and unused fin safeguards.

---

## WF-12 — Change subscription plan → entitlements and billing state

| Step | Route | Result |
|------|-------|--------|
| Admin adjust | `POST /admin/subscriptions/companies/{company}/adjust` L330 | **pass** — `SubscriptionAdjustmentService` |
| Plan entitlements on tenant writes | `CompanyAccess` / `PlanEntitlements` | **pass** |
| Annual interval | `applySubscriptionPayment` always +1 month | **fail** (AUD-P1-010) |
| Coupons | `/admin/billing/coupons` | **fail** — no checkout redemption |

**Verdict: fail** for annual/coupons; **pass** for month-oriented plan change + entitlements.

---

## WF-13 — Receive and process a payment-provider webhook

| Step | Result |
|------|--------|
| Route + CSRF exception | **pass** |
| Signature / shared secret | **missing** (AUD-P2-001) |
| Sync via Mollie API | **pass** in code; **unverified** live |

**Verdict: fail** (authn of ingress); processing logic present.

---

## WF-14 — DSAR → review → execute → record completion

| Step | Route | Result |
|------|-------|--------|
| Create | `POST /admin/compliance/dsar` L206 | **pass** |
| Progress | `PATCH …/dsar/{dsar}` L207 | **pass** (status) |
| UI complete/reject | Only “Verify & progress” on Operation page | **fail** (partial UI) |
| Automated export/erasure | **missing** |

**Verdict: fail** (register only).

---

## WF-15 — Place legal hold → attempt deletion → verify protection

| Step | Result |
|------|--------|
| Place/release hold | `POST /admin/compliance/legal-holds` L212–213 — **pass** persist |
| Company deletion respects **compliance** hold | **fail** (AUD-P0-003) |
| Company deletion respects **its own** `legal_hold` flag | **pass** L451 |
| Deletion job execute | **missing** |

**Verdict: fail.**

---

## WF-16 — Authority request → review → disclose

| Step | Route | Result |
|------|-------|--------|
| Register | `POST /admin/compliance/authority-requests` L208 | **pass** |
| Advance | `PATCH …/advance` L209 | **pass** |
| Controlled disclosure | `POST …/disclosures` L210 | **pass** (manual scope text) |
| Data export attachment | **missing** |
| Emergency min-approvers setting | **fail** — unread |

**Verdict: pass** as a paper register; **fail** vs “authorized data release” automation.

---

## WF-17 — Email test → delivery result and history

| Step | Route | Result |
|------|-------|--------|
| Outbound test | `POST /admin/communications/outbound-test` L238 | **pass** (confirm required) |
| Test send | `POST /admin/communications/test-send` L237 | **pass** |
| Configurator applied | `PlatformMailConfigurator` on boot + `MessageSending` | **pass** |
| History | `AdminCommunicationInsights` + `CommunicationDeliveryLogger` | **partial** — many mailables never log |
| Live SMTP | **unverified** (not sent) |

**Verdict: pass** for the admin test path; history incomplete.

---

## WF-18 — Inbound support email → match ticket or create

| Step | Result |
|------|--------|
| Webhook | `POST /webhooks/inbound-email` L54 — **pass** routed |
| Auth | Shared secret fail-closed — **pass** with query-string weakness |
| Match by `TKT-` | **fail** — no sender/tenant check (AUD-P0-002) |
| Match by `companies.email` | **pass** / limited (not user emails) |
| Create ticket | `comm_inbound_create_tickets` — **pass** |
| Provider HMAC | **missing** |

**Verdict: fail.**

---

## WF-19 — Support ticket → internal note → public reply → customer visibility

| Step | Route | Result |
|------|-------|--------|
| Customer create | `POST /support/tickets` L97 | **pass** if portal enabled |
| Admin reply + internal | `POST /admin/support/tickets/{ticket}/messages` L249 | **pass** |
| Customer cannot see internal | `SupportTicketController::show` L107 | **pass** |
| Customer cannot set internal | L140 | **pass** |
| Customer email on public staff reply | **missing** (AUD-P1-013) |
| Notification split admin vs extra emails | `SupportTicketNotifier` + `SupportNotificationSettings` | **pass** |

**Verdict: pass** for visibility; **fail** for customer email.

---

## WF-20 — Approve support workspace access → scope, expiry, audit

| Step | Route | Result |
|------|-------|--------|
| Request / approve | `POST /admin/support/access-requests` L251–252 | **pass** persist + activity |
| Enforce before `enterWorkspace` | **missing** (AUD-P1-003) |
| Scope / expiry on customer UI | **missing** |

**Verdict: fail.**

---

## WF-21 — Configure integration → test → failure → retry

| Step | Result |
|------|--------|
| Save Mollie/Peppol settings | `PATCH /admin/integrations/{section}` L232 — **pass** persist |
| Health check | `POST /admin/integrations/health-checks/run` L223 — **pass** (Mollie real HTTP; Peppol credential presence only) |
| Failure queue write | **missing** (AUD-P1-016) |
| Retry | `resolveFailure` has **no UI**; retries don’t exist |
| Outbound webhooks | **missing** dispatch |

**Verdict: fail.**

---

## WF-22 — Bulk operation → preview → approval → execute → audit

| Step | Route | Result |
|------|-------|--------|
| Preview | `POST /admin/governance/bulk/preview` L276 | **pass** |
| Dual confirm | `executeBulk` L231–235 + `GovernancePolicy` | **pass** |
| Production block | L237 — **pass** but label-based (AUD-P1-022) |
| Execute deactivate dormant | L244–252 — **pass** (`is_active=false` only; no status events) |
| Execute remind users | **fail** no-op (AUD-P1-005) |
| Audit | `ActivityLog` L262 — **pass** |

**Verdict: fail** (one of two operations is a lie-on-execute).

---

## WF-23 — Configuration snapshot → modify → restore

| Step | Route | Result |
|------|-------|--------|
| Snapshot | `POST /admin/governance/snapshots` L281 | **pass** |
| Restore | `POST …/snapshots/{snapshot}/restore` L282 | **pass** + prod gate L374 |
| Live restore this audit | **unverified** (not run) |

**Verdict: pass** in code; **unverified** operationally.

---

## WF-24 — Failed background job → inspect → retry

| Step | Route | Result |
|------|-------|--------|
| Inspect | Infra/comms operation pages + insights | **pass** (counts / lists) |
| Retry | `POST /admin/infrastructure/failed-jobs/retry` L269; comms L239 | **pass** (`queue:retry`) |
| Production / confirm discipline | Weak UI confirm; **no** governance prod gate (AUD-P2-010) |
| This audit did not retry jobs | **unverified** |

**Verdict: pass** with safety gaps.

---

## WF-25 — Generate export → auth, scope, expiry, audit

| Export | Result |
|--------|--------|
| Company data export | `POST /admin/companies/{id}/exports` L371 + download L372 — **pass** persist + `abort_if` company; **unverified** file contents |
| Financial audit CSV | `POST /admin/financial/audit-export` L197 — **pass** + confirm |
| Compliance report CSV | L204 — **pass** + confirm (does **not** use `CompliancePolicy::exportRequiresDualConfirm`) |
| Governance export job | **fail** — no file (AUD-P2-007) |
| Expiry enforcement | Company exports: **unverified**; gov expiry setting unused on missing files |

**Verdict: fail** as a single platform export story; some exports **pass**.

---

## WF-26 — Enable maintenance → customers blocked, admins allowed

| Step | Result |
|------|--------|
| Toggle | `PATCH /admin/settings/maintenance` — keys `maintenance_*` |
| Middleware | `EnsurePlatformNotInMaintenance` L19–38 — **pass** |
| Webhooks exempt | L15–16 — **pass** |
| Infra window | Does **not** enable this flag — not a second live switch |

**Verdict: pass.**

---

## WF-27 — Revoke API key → immediate rejection

| Key type | Issue | Revoke | Runtime auth |
|----------|-------|--------|----------------|
| Integration API keys | `POST /admin/integrations/api-keys` L226 | revoke L227 | **missing** `findValid` unused |
| Gov automation keys | L286–287 | revoke | **missing** no middleware |

**Verdict: missing** (cannot reject requests that are never authenticated).

---

## WF-28 — Change environment / integration mode → live-action safeguards

| Control | Result |
|---------|--------|
| `payment_mollie_mode` | **pass** stored; used by `PlatformMollieService` |
| `int_block_live_*` / `blockLiveCompanyInTest` | **fail** unused (AUD-P2-022) |
| `gov_environment_label` + `gov_block_destructive_in_production` | **pass** when label is `production`; **fail** if operator relabels (AUD-P1-022) |
| Peppol local-live prevent | **fail** unused |

**Verdict: fail.**

---

## Scoreboard

| Result | Workflows |
|--------|-----------|
| **pass** | WF-02, WF-17 (test path), WF-23 (code), WF-24 (code), WF-26 |
| **fail** | WF-01, WF-03, WF-04, WF-05, WF-06, WF-07, WF-08, WF-09, WF-10, WF-12, WF-13, WF-14, WF-15, WF-16, WF-18, WF-20, WF-21, WF-22, WF-25, WF-28 |
| **missing** | WF-27 (and MFA step of WF-01) |
| **unverified** (also listed fail/pass) | Live webhook, SMTP, snapshot restore, recurring job, company export bytes |

Honest production read: **5 workflows pass** as implemented controls. The rest fail, are missing a required step, or only pass a subset.
