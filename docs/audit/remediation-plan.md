# Offacto admin — remediation plan

Ordered for production readiness. Effort: **XS / S / M / L / XL**. No hour estimates.

Do **not** start here until the audit is accepted. This plan does not implement fixes.

Dependencies are hard: later items assume earlier controls exist.

---

## Wave 0 — stop the bleeding (do first)

| # | Finding | Action | Effort | Depends on |
|---|---------|--------|--------|------------|
| 0.1 | AUD-P0-002 | Require inbound match: `TKT` **and** sender ∈ ticket company emails / customer user email / known From. Reject cross-tenant. Stop accepting `?secret=`. | **S** | — |
| 0.2 | AUD-P0-003 | Before any company deletion “completed” or future purge job: query active `compliance_legal_holds` for that company/scope and abort. Same check on `updateDeletionRequest`. | **S** | — |
| 0.3 | AUD-P1-021 | Hide `signing_secret` (`$hidden` + explicit Inertia map). Rotate any secrets already shown in a browser. | **XS** | — |
| 0.4 | AUD-P1-004 | On user suspend: call existing `revokeSessions`. Add `is_active` check to web middleware (or admin group). | **S** | — |
| 0.5 | Stale tests | Fix `AuthenticationTest` (non-admin user) and `ProfileTest` redirect so the suite is a reliable signal. | **XS** | — |

**Exit:** inbound cannot hijack another ticket; holds actually block the only live deletion path; leaked webhook secrets rotated; suspended admins die with their session.

---

## Wave 1 — privileged access

| # | Finding | Action | Effort | Depends on |
|---|---------|--------|--------|------------|
| 1.1 | AUD-P0-001 | Real admin MFA (TOTP minimum): enroll, challenge middleware on `/admin/*`, persist secrets hashed, honor `sec_mfa_required_admin`. Delete or wire `POST /admin/mfa/verify`. | **L** | Wave 0.4 |
| 1.2 | AUD-P1-003 | `enterWorkspace` requires an approved, unexpired `SupportAccessRequest` when `sup_require_access_approval` is true. Log denials. | **S** | — |
| 1.3 | AUD-P2-004 | Split admin capabilities (support vs billing vs governance vs settings). Policies or permission middleware on mutating routes. Fix `AdminPermissionGate` or remove it. | **L** | 1.1 recommended |
| 1.4 | AUD-P1-008 / restrictions | Enforce `SecurityPolicy` password length, login rate limits, and account restrictions at `LoginRequest` / session. | **M** | 1.3 optional |

**Exit:** MFA is a control; workspace entry is an audited grant; admin is not a single bit.

---

## Wave 2 — settings honesty (runtime or remove)

Pick one strategy per key: **wire it** or **remove it from the admin UI / manual**.

| # | Finding | Action | Effort | Depends on |
|---|---------|--------|--------|------------|
| 2.1 | AUD-P1-001 | Call `FinancialPolicy` from invoice send/update: lock trigger, credit-note-only edits, validation rules. | **L** | Product decision on BE rules |
| 2.2 | AUD-P1-002 / AUD-P1-007 | One feature-flag resolver used by HTTP + jobs: global flags ∪ plan entitlements ∪ company overrides ∪ rollouts. | **L** | Entitlements already exist |
| 2.3 | AUD-P1-017 / 018 | Either apply prefixes/theme/locale/branding/navigation at the documented layer, or mark sections informational in UI (as workflows/forms already are). | **M–L** | Copy/UX |
| 2.4 | AUD-P1-011 / 012 | Drive `InvoiceSent` / `WelcomeEmail` from `email_templates` **or** hide the library. Wire or remove rules/suppression/schedules. | **M** | 2.3 |
| 2.5 | AUD-P1-019 | Single Mollie settings surface. Delete duplicate registry fields or make Integrations read-only alias. Drop unread `int_mollie_webhook_override` or read it in `PlatformMollieService`. | **S** | — |
| 2.6 | Password/secret storage | Encrypt platform Mollie/SMTP/Postmark at rest (parity with `CompanySetting`). | **M** | 2.5 |

**Exit:** no Configure page claims an effect the code does not have. Manual rewritten to match.

---

## Wave 3 — money, billing, subscriptions

| # | Finding | Action | Effort | Depends on |
|---|---------|--------|--------|------------|
| 3.1 | AUD-P1-010 | Honor `billing_interval` in `applySubscriptionPayment` and `toUpgradeArray`. | **S** | — |
| 3.2 | AUD-P1-009 | Implement dunning job **or** remove settings. Honor `billing_notify_*`. | **M** | Scheduler |
| 3.3 | Coupons | Redeem on `UpgradeController` with uniqueness/expiry **or** hide coupons UI. | **M** | 3.1 |
| 3.4 | Money | Persist invoice tax/total as `decimal` (or cents). Per-line VAT. Stop float accessors for reconciliation. | **L** | 2.1 if lock depends on totals |
| 3.5 | Service FK cascade | Change `invoice_items.service_id` / `offer_items.service_id` to `nullOnDelete` or restrict. | **S** | Migration |
| 3.6 | Mollie webhook | Optional shared-secret header; keep API fetch. Rate-limit. | **S** | — |

---

## Wave 4 — support and communications completeness

| # | Finding | Action | Effort | Depends on |
|---|---------|--------|--------|------------|
| 4.1 | AUD-P1-013 | Customer mailable on public staff reply (not internal). | **S** | SMTP already applied |
| 4.2 | AUD-P1-020 | Mail on `request-info`. | **XS** | 4.1 pattern |
| 4.3 | AUD-P2-019 / SES | Read inbound provider settings or remove. Map SES credentials or drop the option. | **S** | — |
| 4.4 | Notification drawer | Mark-read / dismiss API. | **S** | — |
| 4.5 | Inbound HMAC | Postmark/Mailgun signatures in addition to shared secret. | **M** | Wave 0.1 |

---

## Wave 5 — compliance and integrations truth

| # | Finding | Action | Effort | Depends on |
|---|---------|--------|--------|------------|
| 5.1 | AUD-P2-013 | Worker that executes **approved** deletion jobs only after hold checks (Wave 0.2). Or remove the job UI. | **L** | 0.2 |
| 5.2 | AUD-P1-014 | One Peppol config resolver (`IntegrationPolicy`) for all send paths. | **S** | — |
| 5.3 | AUD-P1-015 / 016 | Dispatch outbound webhooks **or** remove registry. Write `IntegrationFailure` on real failures. Authenticate API keys **or** remove issue UI. | **L** | Product: do you want a public API? |
| 5.4 | Consent / legal notices | Writers + customer acceptance, or mark admin-only scratchpad. | **M** | — |
| 5.5 | AUD-P2-022 / WF-28 | Enforce `int_block_live_*` and peppol-local guards in send/checkout. | **S** | 5.2 |

---

## Wave 6 — governance and infrastructure honesty

| # | Finding | Action | Effort | Depends on |
|---|---------|--------|--------|------------|
| 6.1 | AUD-P1-005 | Implement remind-unverified execute **or** disable that operation on execute. Never mark executed with 0 if unimplemented. | **S** | — |
| 6.2 | AUD-P1-006 | Job: apply `payload` at `effective_at` **or** remove scheduling. UI must collect registry/section/payload (not `{}`). Delete or expose `simulateChange`. | **M** | Settings service |
| 6.3 | AUD-P1-022 | Production gate uses `APP_ENV` **and/or** a non-UI file flag, not only `gov_environment_label`. | **XS** | — |
| 6.4 | AUD-P2-006/007/008 | Real backup, export blob, import apply — or relabel as “ledger / dry-run”. | **XL** if real; **XS** if relabel | Infra decision |
| 6.5 | AUD-P2-010 | Same dual-confirm + prod gate on `queue:retry`. | **XS** | 6.3 |
| 6.6 | GOV automation keys | Middleware or delete issue UI. | **S** | 1.3 |

---

## Wave 7 — tests and CI

| # | Action | Effort | Depends on |
|---|--------|--------|------------|
| 7.1 | Add Feature tests listed in `test-matrix.md` (P0 characterization first). | **M** | Wave 0–1 |
| 7.2 | GitHub Actions (or other CI): `php artisan test` + lint on PR. | **S** | 7.1 starting |
| 7.3 | Rewrite `ADMIN_MANUAL.md` so “Impact” matches runtime. | **M** | Waves 2–6 |

---

## Explicitly out of scope until asked

- Building a full DPO/RoPA product
- Live Peppol access-point certification
- Multi-user company membership (not modeled)
- Customer-facing CMS/announcement polish (unverified)
- Spatie migration (custom roles already work)

---

## Suggested sequencing

```
Wave 0 (S) → Wave 1 MFA+workspace (L) → Wave 2 settings honesty (L)
     ↘ Wave 3 money (parallel after 0)
     ↘ Wave 4 support mail (parallel)
→ Wave 5/6 (after product decisions: keep vs delete unused UIs)
→ Wave 7 continuous
```

**Highest leverage if engineering time is scarce:** Wave 0 + 6.1/6.3 + hide unread settings sections + fix stale tests. That reduces false confidence faster than implementing every registry key.
