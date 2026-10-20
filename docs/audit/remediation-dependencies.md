# Remediation dependencies

**Date:** 2026-10-20  
**Goal:** A safe order that avoids implementing a worker on top of a hole, or rewriting the same settings resolver twice.

---

## Shared services (change once)

| Service / area | Findings that need it | Risk if each finding patches independently |
|----------------|----------------------|--------------------------------------------|
| `InboundEmailWebhookController` + inbound settings | AUD-P0-002, AUD-P2-002, AUD-P2-019 | Tenant match then HMAC then drop query-secret can fight if three PRs rewrite auth |
| `IntegrationWebhook` serialization | AUD-P1-021 | Any later webhook UI will re-leak if `$hidden` is skipped |
| `site_settings` secret storage | AUD-P1-019, AUD-P2-027, COM-002 already applied | Encrypt-then-split-Mollie-UI vs split-then-encrypt = two migrations |
| Feature resolver (global ∪ plan ∪ override ∪ rollout) | AUD-P1-002, AUD-P1-007, AUD-P2-026 | Two flags, two UIs, one boolean needed at call sites |
| Production mutation gate | AUD-P1-022, AUD-P2-010, AUD-P1-005 | Job retry and bulk execute must share `APP_ENV` (not the editable label) |
| `FinancialPolicy` + money types | AUD-P1-001, AUD-P2-025 | Locking invoices on float VAT cements bad totals |
| Company deletion / holds / purge | AUD-P0-003, AUD-P2-013, AUD-P2-014 | A deletion worker without holds is a P0 regression |
| Admin session lifecycle | AUD-P1-004, AUD-P0-001, AUD-P1-008 | MFA on a session that survive suspend is weaker than revoke-first |
| `PlatformMailConfigurator` | AUD-P2-018, AUD-P1-011, AUD-P1-013/020 | SES mapping is independent of templates; do not mix PRs |
| Peppol “configured?” | AUD-P1-014, AUD-P2-022 | Live guards need the same resolver as send |

---

## Finding → finding edges

```
AUD-P0-002 ──► AUD-P2-002 (drop query secret after/with tenant match)
         └──► AUD-P2-019 (trim unread inbound fields on same controller)

AUD-P0-003 ──► AUD-P2-013 (never add a deletion worker first)
         └──► AUD-P2-014 (erasure depth is a later spec)

AUD-P1-021 ──► rotate secrets (ops, not code)
         └──► AUD-P1-015 (do not ship new webhook payloads with secrets)

AUD-P1-004 ──► AUD-P0-001 (MFA) ──► AUD-P1-008 (password/lockout policy)

AUD-P1-003 ──► AUD-P2-004 (capabilities) ──► AUD-P2-003 (PermissionGate)

AUD-P1-022 ──► AUD-P2-010 (job retry) and AUD-P1-005 (bulk execute honesty)

AUD-P1-002 ◄──► AUD-P1-007 (one resolver) ──► AUD-P2-026 (unique override index)

AUD-P1-019 ──► AUD-P2-027 (encrypt fewer keys)

AUD-P1-001 ──► AUD-P2-025 (money types) ── needs legal rounding Q

AUD-P1-010 ── independent of dunning (AUD-P1-009); do interval first

AUD-P1-011 ──► AUD-P3-006 (one editor after templates actually send)

AUD-P1-015 ──► AUD-P1-016 (failure queue)

AUD-P1-014 ──► AUD-P2-022 (live guards)

AUD-P1-023, AUD-P1-024 ── migrations; no code-feature dep; do early to stop latent loss

AUD-P2-024 ── no product dep; unblocks CI; do in Wave 0
```

---

## Database / migration dependencies

| Change | Findings | Caution |
|--------|----------|---------|
| Invoice/offer `service_id` FK: cascade → null/restrict | AUD-P1-023 | Existing orphaned items after historical cascades cannot be reconstructed |
| `companies.user_id` cascade → restrict/null | AUD-P1-024 | Need a policy for “owner deleted” |
| Unique `(company_id, capability_key)` | AUD-P2-026 | Deduplicate rows **before** unique index |
| Encrypt `site_settings` secret values | AUD-P2-027 | Dual-read plaintext+cipher during rollout; backup restore of old dumps |
| Unique `companies.vat_number` | AUD-P3-017 | **Blocked** until business says duplicates are forbidden; data may already duplicate |
| Status-event FKs | AUD-P3-018 | Backfill invalid ids |
| MFA tables (TOTP secrets, recovery) | AUD-P0-001 | Secrets hashed/encrypted; recovery codes hashed |
| Deletion job / purge tables | AUD-P2-013/014 | **Blocked** on legal spec and P0-003 |
| Consent write timestamps | AUD-P2-011 | **Blocked** on lawful-basis Q |

No migration is required for Wave 0 except none: inbound match, holds check, `$hidden`, `revokeSessions`, test fixes are code-only.

---

## External configuration (not inventable from repo)

| Config | Blocks |
|--------|--------|
| Inbound provider HMAC vs shared secret | Hardening after P0-002 (Wave 4 in original plan) |
| Rotate inbound + Mollie + webhook signing secrets | After P1-021 / P2-002 |
| `APP_ENV=production` vs `gov_environment_label` | AUD-P1-022 |
| Peppol / Postbode / Mollie live credentials | Contract tests; AUD-P1-014 verification in a **sandbox** only |
| Queue worker + scheduler actually running in deploy | AUD-P1-006, AUD-P1-009, AUD-P2-013, billing command |
| Backup destination | AUD-P2-006 |

Do not contact live vendor APIs from this planning work.

---

## Unresolved requirements that block implementation (not just order)

These are **not** coding dependencies; they are “do not guess” gates. Detail in `open-questions.md`.

| Question theme | Blocked findings |
|----------------|------------------|
| Accounting: invoice lock / credit-note-only | AUD-P1-001 |
| VAT rounding / per-line tax | AUD-P2-025 |
| Annual billing sold? | AUD-P1-010 (code is still wrong if annual exists) |
| Dunning / coupon policy | AUD-P1-009 |
| Admin permission matrix | AUD-P2-004 |
| Workspace impersonation always require ticket? | AUD-P1-003 (flag already exists; product must say default-on) |
| GDPR erasure vs anonymize vs retain financials | AUD-P2-013, AUD-P2-014 |
| Marketing vs transactional consent | AUD-P1-012, AUD-P2-011 |
| Public API wanted? | AUD-P1-015 |
| Who owns backups? | AUD-P2-006 |
| Copy-on-create vs global numbering | AUD-P1-017 |
| Template library is source of truth? | AUD-P1-011 |

For blocked items, the **safe** implementation is **honesty cut**: hide or relabel the UI so operators are not told a control exists. That does not need the legal answer.

---

## Recommended implementation order (minimize rework)

1. **Stop active holes and false safety (code-only)**  
   P0-002 inbound match → P2-002 query secret → P1-021 hide signing_secret → P0-003 holds on deletion → P1-004 session revoke → P2-024 stale tests.

2. **Stop latent data-loss (migrations)**  
   P1-023 service cascade → P1-024 user→company cascade → P2-026 unique overrides (after duplicate cleanup).

3. **Stop financial wrongness that is already in code**  
   P1-010 annual interval (even if annual is unused, stop lying in `toUpgradeArray`).  
   Honesty: hide unread dunning/coupons until policy exists (P1-009).

4. **Single sources of truth**  
   P1-019 one Mollie UI → P2-027 encrypt settings secrets.  
   P1-014 Peppol resolver → P2-022 live guards.  
   P1-022 APP_ENV gate → P2-010 job retry → P1-005 bulk honesty.

5. **Tenant / admin privilege**  
   P1-003 workspace approval (honor existing flag).  
   P0-001 MFA.  
   P2-004 capabilities only after a written matrix.

6. **Mail honesty and customer-visible gaps**  
   P1-013 customer ticket reply mail, P1-020 request-info mail.  
   P1-011 templates **or** hide library. P2-018 SES.

7. **Feature flags / security policy / branding**  
   One resolver (P1-002+007) or hide. P1-008 or relabel. P1-017/018 informational vs wire.

8. **Legal/ops XL**  
   Deletion worker, consent register, public API, real backups, Product CMS on customer — only after `open-questions.md` answers.

9. **UX/IA P3** last, except empty states/confirms that ride along a P1 PR.

---

## What not to do in parallel

| Parallel pair | Why not |
|---------------|---------|
| Deletion worker + legal-hold bind | Race: worker ships first, holds still unused |
| Encrypt site_settings + split Mollie UIs | Two writers during dual-read window |
| Feature resolver + random entitlement edits | Call sites will be rewritten twice |
| MFA + password policy in one XL PR | Hard to review; revoke sessions first as a small PR |
| Template library rewrite + SES + inbound HMAC | Three mail subsystems; regressions compound |
| Honesty-hide of Financial hub + implementing FinancialPolicy | Product must pick one |

---

## Rollback notes (shared)

- Inbound tenant-match: rollback re-opens P0; keep behind a SiteSetting only if default is **secure**.
- FK cascade changes: rollback migration may fail if nulls exist; take DB backup first.
- Encrypt-at-rest: keep decrypt-plaintext fallback for one release.
- APP_ENV production gate: rollback re-enables label bypass; document.
- MFA: rollback must not lock admins out; recovery codes and a break-glass documented **before** `sec_mfa_required_admin` default-on.
