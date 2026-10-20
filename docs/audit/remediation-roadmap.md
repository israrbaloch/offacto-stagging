# Remediation roadmap

**Date:** 2026-10-20  
**Rule:** Small, independently reviewable batches. Confirmed P0/P1 security, isolation, data-loss, and critical financial first. Not every P1 is ahead of every P2 — exploitability and impact decide. Feature work is separate from optional enhancements.  
**Do not implement until a batch is approved.**

Original `remediation-plan.md` waves are retained as a mapping; this document is the execution plan.

---

## Phase A — Stop active holes (Wave 0)

**Why first:** These are confirmed, exploitable or false-safety issues. All are code-only except secret rotation (ops).

### Batch A1 — Inbound tenant isolation

| | |
|--|--|
| **Finding IDs** | AUD-P0-002 (primary), AUD-P2-002 (same PR if small) |
| **Why** | Shared-secret webhook can attach a message to any ticket whose `TKT-` is known. Highest exploitability of the P0s. |
| **Prerequisites** | None. Do not wait for provider HMAC. |
| **Likely files** | `InboundEmailWebhookController.php`, inbound settings UI copy, `Support/InboundEmailWebhookTest` (new) |
| **Acceptance** | From address must belong to the ticket’s company/owner/customer_user; mismatch creates no message; 4xx. Optional in same PR: reject `?secret=`. |
| **Verify** | Feature tests from `test-matrix.md`; manual POST with mismatched From (staging only). |
| **Rollback** | Revert PR. Re-opens P0; do not leave a “legacy match” flag default-on. |

### Batch A2 — Stop leaking outbound webhook secrets

| | |
|--|--|
| **Finding IDs** | AUD-P1-021 |
| **Why** | Decrypted `signing_secret` in Inertia HTML. Small, high value; independent of A1. |
| **Prerequisites** | None. Ops: rotate secrets after deploy. |
| **Likely files** | `IntegrationWebhook.php` (`$hidden`), `AdminIntegrationController.php` |
| **Acceptance** | Inertia payload has `signing_secret_set`, never plaintext. |
| **Verify** | Feature: admin integrations page JSON. |
| **Rollback** | Revert; rotate again if secrets were exposed in logs. |

### Batch A3 — Legal holds actually hold

| | |
|--|--|
| **Finding IDs** | AUD-P0-003 |
| **Why** | Holds are a compliance control that does nothing on the deletion path that exists today. Must land **before** any deletion worker (Phase F). |
| **Prerequisites** | A1/A2 independent; can parallel. |
| **Likely files** | `AdminCompanyController::updateDeletionRequest`, possibly `AdminComplianceController` |
| **Acceptance** | Active `ComplianceLegalHold` for the company blocks `status=completed` (and any anonymize). Clear operator error. |
| **Verify** | Feature: create hold → complete deletion 422; release hold → complete allowed (current shallow behavior). |
| **Rollback** | Revert. Do not ship a worker in the same PR. |

### Batch A4 — Suspend means the session ends

| | |
|--|--|
| **Finding IDs** | AUD-P1-004 |
| **Why** | Confirmed privilege persistence. Smaller and more exploitable than MFA (P0-001 is a missing control, not a live session bug). |
| **Prerequisites** | None. |
| **Likely files** | `AdminUserController::toggleActive`, middleware on web or admin group |
| **Acceptance** | `is_active=false` revokes sessions; subsequent request cannot use old cookie. |
| **Verify** | `AdminUserSuspendSessionTest`. |
| **Rollback** | Revert. |

### Batch A5 — Unblock the test suite

| | |
|--|--|
| **Finding IDs** | AUD-P2-024 |
| **Why** | Three Feature tests already fail; they will hide regressions from A1–A4. Not cosmetic — it is the only automated net. |
| **Prerequisites** | None. Can parallel all of A. |
| **Likely files** | `tests/Feature/Auth/AuthenticationTest.php`, `ProfileTest.php` (fix **tests** unless a real redirect bug is proven) |
| **Acceptance** | `php artisan test` green on current suite. Document ProfileTest root cause if it is an app bug. |
| **Verify** | Full PHPUnit. |
| **Rollback** | Revert test-only changes. |

**Phase A done when:** inbound mismatch cannot write; webhook secrets not in HTML; holds block deletion complete; suspend revokes; existing tests pass.

---

## Phase B — Latent data-loss (migrations)

**Why next:** Confirmed schema hazards. Independent of product questions except P1-024 owner policy (default: restrict, do not cascade).

### Batch B1 — Financial line items must survive service delete

| | |
|--|--|
| **IDs** | AUD-P1-023 |
| **Prerequisites** | DB backup. |
| **Files** | New migration on `invoice_items` / `offer_items` `service_id` |
| **Acceptance** | Hard-deleting a service does not delete invoice/offer rows. |
| **Verify** | Migration test. |
| **Rollback** | Down migration only if no nulls/restrict violations. |

### Batch B2 — User delete must not wipe the company

| | |
|--|--|
| **IDs** | AUD-P1-024 |
| **Prerequisites** | Product default: restrict or null `user_id`. See open Q. |
| **Files** | Migration `companies.user_id`; profile destroy if it hard-deletes |
| **Acceptance** | Destroying a user cannot `cascade` the company and children. |
| **Verify** | Feature around profile destroy. |
| **Rollback** | As B1. |

### Batch B3 — Unique feature overrides

| | |
|--|--|
| **IDs** | AUD-P2-026 |
| **Prerequisites** | Deduplicate existing rows. |
| **Files** | Migration + admin upsert |
| **Acceptance** | Unique `(company_id, capability_key)`. |
| **Verify** | Migration. Can wait until Phase D resolver if no duplicates in prod. |

---

## Phase C — Financial correctness already in code

**Why:** Annual interval is a confirmed billing bug. Dunning/coupons/FinancialPolicy need answers — **honesty cuts** only until then.

### Batch C1 — Honor `billing_interval`

| | |
|--|--|
| **IDs** | AUD-P1-010 |
| **Why** | `applySubscriptionPayment` always `addMonth()`; upgrade array always `'month'`. Exploitability is “wrong money if annual is used,” not a remote hole — still Phase C because it is confirmed financial integrity. |
| **Prerequisites** | Confirm annual plans exist or may exist. If product forbids annual, still stop advertising it in admin plan CRUD. |
| **Files** | `Company.php`, `SubscriptionPlan.php` |
| **Acceptance** | Annual → `addYear()`; `toUpgradeArray` period from interval. |
| **Verify** | `AnnualPlanRenewalTest`. |
| **Rollback** | Revert; existing `current_period_end` rows stay as stored. |

### Batch C2 — Honesty: unread billing/finance controls

| | |
|--|--|
| **IDs** | AUD-P1-001 (relabel/hide), AUD-P1-009 (hide dunning/coupons until policy) |
| **Why** | Implementing lock/dunning/coupons without accounting rules is inventing finance. Hiding is the safe batch. |
| **Prerequisites** | None. |
| **Files** | Admin Financial / Billing hubs, copy in `ADMIN_MANUAL.md` (docs only if approved with batch) |
| **Acceptance** | UI does not claim invoice lock, credit-note-only, dunning, or coupons unless code enforces them. |
| **Verify** | Manual hub review. |
| **Rollback** | Revert copy/UI. |

*Implementing* FinancialPolicy, VAT persistence, dunning jobs, coupon redeem = **Phase G**, after `open-questions.md`.

---

## Phase D — Privilege and workspace isolation

### Batch D1 — Workspace entry honors access approval

| | |
|--|--|
| **IDs** | AUD-P1-003 |
| **Why** | Any admin already bypasses `CompanyAccess`. The flag exists and is unread. |
| **Prerequisites** | Product: default the flag on or off (open Q). Code can honor the flag either way. |
| **Files** | `AdminCompanyController::enterWorkspace`, `SupportPolicy` |
| **Acceptance** | When flag true, no approved unexpired request → 403 + log. |
| **Verify** | `AdminWorkspaceAccessApprovalTest`. |
| **Rollback** | Revert; impersonation returns. |

### Batch D2 — Approve/reject/role hygiene

| | |
|--|--|
| **IDs** | AUD-P2-017, AUD-P2-016, AUD-P2-015 |
| **Why** | Small isolation/integrity; same company/user controllers as D1. |
| **Prerequisites** | None. |
| **Files** | `AdminCompanyController`, `AdminUserController` |
| **Acceptance** | Non-pending approve/reject 422; roles `min:1`; GET show does not insert verification. |
| **Verify** | Feature. |

### Batch D3 — Admin MFA (optional enhancement vs control)

| | |
|--|--|
| **IDs** | AUD-P0-001 |
| **Why here, not Phase A:** Stolen-password risk is real, but there is no MFA protocol in the repo. Shipping TOTP is an **L** feature, not a one-line fix. Session revoke (A4) reduces dwell time first. |
| **Prerequisites** | A4. Enrollment UX, recovery codes, break-glass. Do not default `sec_mfa_required_admin` on until enroll path is proven. |
| **Files** | New MFA service/models, `AdminAuthController`, `MfaVerify.jsx`, `routes/web.php`, middleware |
| **Acceptance** | POST verify exists; challenge when required; secrets hashed. |
| **Verify** | Feature enroll/verify/reject. |
| **Rollback** | Flag off; middleware skip. Never lock all admins. |

### Batch D4 — Fine-grained admin roles (separate from MFA)

| | |
|--|--|
| **IDs** | AUD-P2-004, AUD-P2-003 |
| **Why** | XL product. Not in the first security batch. |
| **Prerequisites** | Written matrix (`open-questions.md`). |
| **Files** | Policies, `role:admin` group split, `AdminPermissionGate.jsx` |
| **Acceptance** | Support admin cannot snapshot-restore / set password / env settings. |
| **Verify** | Policy tests. |

---

## Phase E — Integrations, jobs, and production gates

### Batch E1 — Production mutations respect `APP_ENV`

| | |
|--|--|
| **IDs** | AUD-P1-022, then AUD-P2-010, AUD-P1-005 |
| **Why** | Editable label must not disable destruction gates. Job retry is P2 but same gate. Bulk remind must not fake success. |
| **Prerequisites** | Know deployed `APP_ENV`. |
| **Files** | `GovernancePolicy`, infra/comms job retry, `executeBulk` |
| **Acceptance** | Relabel to `staging` does not allow prod bulk. Retry dual-confirm. Unimplemented bulk actions 422, not `executed`. |
| **Verify** | Feature with env. |
| **Rollback** | Revert; document residual label bypass. |

### Batch E2 — One Mollie UI; one Peppol resolver; live guards

| | |
|--|--|
| **IDs** | AUD-P1-019, AUD-P1-014, AUD-P2-022 |
| **Prerequisites** | None. Encrypt (P2-027) **after** E2 to migrate fewer keys. |
| **Files** | Settings registries, `AdminIntegrationController`, invoice send, `IntegrationPolicy` |
| **Acceptance** | One Mollie editor. All Peppol paths same configured?. Live flags block test-mode live send. |
| **Verify** | Feature + manual. No live Peppol. |

### Batch E3 — Encrypt platform secrets at rest

| | |
|--|--|
| **IDs** | AUD-P2-027 |
| **Prerequisites** | E2. Dual-read release. |
| **Files** | `PlatformSettingsService` / encrypt cast |
| **Acceptance** | Passwords not plaintext in `site_settings`. |
| **Verify** | Unit round-trip; staging DB sample (no secrets in reports). |
| **Rollback** | Dual-read plaintext. |

### Batch E4 — SES mapping or drop; inbound field honesty

| | |
|--|--|
| **IDs** | AUD-P2-018, AUD-P2-019 |
| **Prerequisites** | A1. |
| **Files** | `PlatformMailConfigurator`, inbound settings UI |
| **Acceptance** | SES works or is not listed; inbound UI matches runtime. |

### Batch E5 — Outbound webhooks / API keys — **feature, not default**

| | |
|--|--|
| **IDs** | AUD-P1-015, AUD-P1-016 |
| **Prerequisites** | Product: public API wanted? If no: **honesty cut** (remove issue UI). If yes: XL. |
| **Do not** start E5 in the same sprint as A–D.

---

## Phase F — Compliance workers (blocked on questions)

Only after **A3** and written purge/consent answers.

| Batch | IDs | Note |
|-------|-----|------|
| F1 honesty | AUD-P2-011, AUD-P2-012, AUD-P2-007/008 | Relabel consent/notices/export as non-legal until writers exist |
| F2 deletion worker | AUD-P2-013 | After spec; holds already bound |
| F3 erasure depth | AUD-P2-014 | Legal review of what remains |
| F4 suppressions | AUD-P1-012 | After marketing vs transactional |

---

## Phase G — Product features (after honesty or a decision)

| Batch | IDs | Feature vs optional |
|-------|-----|---------------------|
| G1 customer ticket-reply email | AUD-P1-013 | Feature (ops gap); SMTP already applied |
| G2 request-info email | AUD-P1-020 + AUD-P3-011 | Feature |
| G3 template-driven mail **or** hide library | AUD-P1-011, AUD-P3-006 | Feature vs honesty |
| G4 feature resolver **or** hide flags/rollouts | AUD-P1-002, AUD-P1-007 | Feature vs honesty |
| G5 security policy enforce **or** relabel | AUD-P1-008 | After D3 or honesty |
| G6 numbering/payment defaults | AUD-P1-017 | After copy-on-create Q |
| G7 branding/locale/nav | AUD-P1-018 | Optional enhancement |
| G8 FinancialPolicy + VAT persist | AUD-P1-001 implement, AUD-P2-025 | Feature; blocked on accounting |
| G9 dunning + coupons | AUD-P1-009 implement | Feature; blocked on billing policy |
| G10 scheduled-change worker **or** remove | AUD-P1-006, AUD-P2-009 | Do not add a worker with empty payloads |
| G11 Postbode/WhatsApp honesty | AUD-P2-020, AUD-P2-021 | Optional |
| G12 notification mark-read | AUD-P2-023 | Optional |
| G13 maintenance window copy | AUD-P2-005 | Optional |

---

## Phase H — UX, reporting, test debt (last)

AUD-P3-003 through P3-016, P3-018, empty states, confirms, duplicate audit UIs, `/reports` stub, dead code, CI (AUD-P3-015).  
**Exception:** empty state / confirm may ride along a related P1 PR.

Characterization tests from `test-matrix.md` should be added **with** the batch they protect (A1, A3, A4, C1), not dumped into H.

---

## First recommended batch (ask approval for this only)

**Approve Phase A, starting with Batch A1.**

Scope: AUD-P0-002 tenant-match inbound email (include AUD-P2-002 query-secret drop if the PR stays reviewable).  
Do not include MFA, deletion workers, FinancialPolicy, or template rewrites in that PR.

---

## Mapping to original remediation-plan waves

| Original wave | This roadmap |
|---------------|--------------|
| Wave 0 | Phase A |
| Wave 1 | Phase D (D1, D3) + C1 |
| Wave 2 | Phase G honesty/features for flags, finance, billing |
| Wave 3 | Phase G mail/templates + G1/G2 |
| Wave 4 | Phase E + inbound HMAC (ops) |
| Wave 5 | Phase F |
| Wave 6 | Phase G remaining + H |
| Wave 7 | Characterization with each batch; CI in H |
