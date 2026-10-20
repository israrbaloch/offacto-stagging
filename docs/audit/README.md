# Offacto platform admin — audit

**Date:** 2026-10-20  
**Repository:** `d:\Projects\offacto-stagging`  
**Mode:** Read-only. No application code, migrations, `.env`, or business logic were changed.  
**Manual:** `ADMIN_MANUAL.md` was used as a UI map only, never as proof of implementation.

---

## Executive summary

The admin area is a **large, coherent shell**: 20 controllers under `app/Http/Controllers/Admin/`, ~55 Inertia pages, 10 settings registries, and a full `/admin/*` route group behind `auth` + `verified.email` + `role:admin`. Persistence for settings (`PlatformSettingsService` → `SiteSetting`) and most operational CRUD is real. Activity logging is widespread.

It is **not production-ready as an enterprise control plane**. Many Configure screens save keys that the runtime never reads. Several advertised safety controls (MFA, legal holds, access approval, feature flags, dunning, scheduled config apply, outbound webhooks, API keys) are UI or registers only. Plan entitlements and maintenance mode **are** enforced. SMTP settings **are** applied on send.

**Readiness:** suitable for **internal staging / operator exploration**. Not suitable as the sole control for production privileged access, GDPR deletion, or financial-document policy.

---

## Scope

| In | Out |
|----|-----|
| Admin routes, controllers, React pages, layouts, components | Customer workspace product QA except where admin policy claims to govern it |
| Settings registries, `*Policy` helpers, insights | Live Mollie/Peppol/email/restore/job replay |
| Admin-related migrations/models | Dumping staging PII or secrets |
| Middleware, CSRF exceptions, webhooks, support portal | Implementing fixes |
| Existing PHPUnit suite | New tests (recommended only) |

Domains A–M from the brief were covered: auth/shell, companies, users, settings, financial, billing/subscriptions/plans, compliance, integrations, communications, support, security, infrastructure, product, governance, logs, search, dashboard.

---

## Methodology

1. Mapped `composer.json`, `package.json`, `routes/web.php`, `bootstrap/app.php`, middleware, policies, tests, CI (none).
2. Inventoried every admin route and settings/operation section.
3. Domain audits (auth, companies/users, settings/financial/billing, compliance/integrations, comms/support, security/infra/product/governance) against source, then spot-verified P0 claims.
4. Traced the 28 brief workflows to **actual** routes.
5. Reviewed migrations for FKs, money, cascades, tenant relations.
6. UI dead-ends from React (no screenshot pass required).
7. Ran `php artisan test` locally (sqlite memory).
8. Classified findings P0–P3 with confidence.
9. Wrote this file set.

---

## Limitations

- Static analysis plus one local test run. HTTP status for missing MFA route inferred (no route ⇒ 404), not hit in a browser.
- Not every customer controller was IDOR-fuzzed; isolation is **spot-checked**.
- Deployed env, queue workers, and whether admin migrations have been applied on a given host are **unverified**.
- `ADMIN_MANUAL.md` overstates runtime impact; this audit does not.

---

## Highest-priority findings

| ID | Title |
|----|--------|
| **AUD-P0-001** | Admin MFA is UI-only; `POST /admin/mfa/verify` missing; `sec_mfa_required_admin` unread |
| **AUD-P0-002** | Inbound email attaches replies to any open ticket by `TKT-` reference without sender/tenant check |
| **AUD-P0-003** | Compliance legal holds do not block company deletion (or any purge) |

Then P1: unused `FinancialPolicy` / `fin_*`, unused `global_feature_flags`, workspace entry ignoring access approvals, suspended admin sessions remaining valid, bulk remind no-op, scheduled changes never applied, annual plans billed monthly, template library unused, Peppol config split, outbound webhooks/API keys unused, Mollie UI duplication, inbound signing_secret in Inertia, production bulk gate keyed off an editable label.

---

## Counts

### Features (216 inventoried)

| Status | Count |
|--------|------:|
| Implemented | 98 |
| Partially implemented | 56 |
| UI only | 26 |
| Not implemented | 12 |
| Placeholder-mock | 9 |
| Broken | 8 |
| Backend only | 5 |
| Unverified | 2 |

### Findings (65)

| Severity | Count |
|----------|------:|
| P0 | 3 |
| P1 | 22 |
| P2 | 24 |
| P3 | 16 |

### Workflows (28)

5 **pass** (unauthorized admin URL, email test path, snapshot restore *in code*, failed-job retry *in code*, maintenance mode). The rest **fail** or have a **missing** required step. See `workflow-coverage.md`.

### Tests

`php artisan test --no-ansi`: **3 failed**, 1 skipped, **27 passed**. **Zero** admin Feature tests. No CI.

---

## Architecture snapshot

| Item | Fact |
|------|------|
| Stack | Laravel 12, PHP 8.2, Inertia 3, React 19 JSX, Vite 7, Tailwind 4 |
| Authz | Custom `Role`/`Permission` Eloquent — **not** Spatie at runtime |
| Admin gate | `routes/web.php` L185 |
| Policies | `SupportTicketPolicy` only |
| Settings | 10 `*SettingsRegistry.php` + `PlatformSettingsService` |
| Schedule | `invoices:generate-recurring`, `subscriptions:process` daily |
| Jobs dir | Empty — no `app/Jobs` |
| CSRF except | `webhooks/mollie`, `webhooks/inbound-email` |
| Tenant | Owner `companies.user_id`; session `active_company_id`; no membership pivot |
| Confirmed runtime | Maintenance middleware, Mollie platform keys, SMTP configurator, plan entitlements, VAT default, registration/approval flags |

---

## Domains not fully audited

- Exhaustive IDOR on **every** customer resource controller (pattern checked, not proven complete)
- Live provider contracts (Mollie, Peppol, Postmark/Mailgun inbound payloads)
- Customer-facing Product CMS/announcement rendering (CRUD exists; surfacing **unverified**)
- Deployed migration state / queue worker topology
- Concurrent edit races beyond static review
- Staff `/staff` UX beyond route existence
- `ProfileTest` redirect root cause (suite failure only)

---

## Tests executed vs skipped

**Ran:** `php artisan test --no-ansi` (local, non-destructive). Failures: `AuthenticationTest` (admin user expected `/dashboard`, got `/admin`); `ProfileTest` ×2 (expected `/profile`, got `/`).

**Skipped:** live payments, live Peppol, live customer email, snapshot restore, `queue:retry`, scheduled commands, browser E2E, staging DB inspection.

---

## Generated reports

| File | Contents |
|------|----------|
| [docs/audit/README.md](README.md) | This summary |
| [docs/audit/feature-inventory.md](feature-inventory.md) | 216 features, classification, evidence |
| [docs/audit/findings.md](findings.md) | P0–P3 with IDs and line evidence |
| [docs/audit/security-review.md](security-review.md) | Authz, isolation, secrets, CSRF, uploads, logging |
| [docs/audit/workflow-coverage.md](workflow-coverage.md) | 28 brief workflows vs real routes |
| [docs/audit/data-integrity.md](data-integrity.md) | FKs, money, cascades, tenant relations |
| [docs/audit/remediation-plan.md](remediation-plan.md) | Waves 0–7, XS–XL, dependencies |
| [docs/audit/test-matrix.md](test-matrix.md) | Existing vs missing tests, run results |

---

## Recommended next action

**Do not implement product features until Wave 0 is accepted and scheduled.**

1. Review P0s in `findings.md` with security + compliance owners.
2. Execute remediation Wave 0 only when asked: inbound tenant match, legal-hold bind, hide webhook secrets, revoke sessions on suspend, fix stale tests.
3. Decide keep-vs-delete for unread settings (Wave 2) before wiring every registry key.
4. Add characterization tests from `test-matrix.md` before changing behavior.

No code fixes were made in this phase.
