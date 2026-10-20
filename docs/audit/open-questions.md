# Open questions

**Date:** 2026-10-20  
**Rule:** These cannot be answered from source code. Do not invent legal, accounting, or subscription requirements. Each question names the implementation it blocks.

“Honesty cut” (hide or relabel a control) is always available without an answer. **Implementing** the control is not.

---

## Legal / privacy / jurisdiction

### Q-LEG-001 — Which law governs tenant data?

**Unknown:** GDPR (EU), UK GDPR, Belgian DPA specifics, or another regime. `ADMIN_MANUAL.md` and compliance screens use GDPR-flavored language; no jurisdiction setting is enforced.

**Blocks:** Retention periods, DPA content, breach-notification clocks, legal-notice publishing (AUD-P2-012), consent register (AUD-P2-011).

### Q-LEG-002 — What does “erasure” mean for a company?

**Code today:** Completing a deletion request rewrites name/email and sets `is_active=false`. Invoices, customers, documents, Peppol logs remain (`AUD-P2-014`). `permanently_deleted_at` is unused.

**Need:** Which tables must be deleted, anonymized, or retained for tax? How long after “approve”? Are issued invoices inalienable?

**Blocks:** AUD-P2-013 (worker), AUD-P2-014 (depth). **Do not** write a purge job until this is written down.

### Q-LEG-003 — Legal-hold scope

**Code:** `ComplianceLegalHold` has a free-text `scope`. Deletion uses a **boolean** on the deletion request, not this table (AUD-P0-003).

**Need:** Does a hold on “mailboxes” block company anonymize? Who can release? Is a hold company-wide by default?

**Blocks:** Exact abort conditions beyond “any active hold for this `company_id`” (safe default for Batch A3).

### Q-LEG-004 — Marketing vs transactional mail and consent

**Code:** `communication_suppressions` has no writers; `CommunicationPolicy::isMarketingSuppressed` unused (AUD-P1-012). Consent table is read-only (AUD-P2-011).

**Need:** Is Offacto sending marketing? Which events are transactional (invoice, ticket, security) and exempt? Double opt-in?

**Blocks:** Implementing suppressions and the consent register as a **legal** control. Honesty cut does not need this.

### Q-LEG-005 — Export / import PII

**Need:** May operators download all companies/users to the browser? Retention of export blobs? Who may import users?

**Blocks:** Real export artifacts (AUD-P2-007) and import apply (AUD-P2-008). Relabel as dry-run does not.

### Q-LEG-006 — Admin impersonation / workspace entry

**Need:** Is unaudited admin access to any tenant acceptable? Must it be ticket-scoped? Customer-visible? Expiry?

**Blocks:** Default of `sup_require_access_approval` (AUD-P1-003). Honoring the flag can ship; turning it **default on** is a product/legal call.

### Q-LEG-007 — Unique VAT numbers

**Need:** Are duplicate `companies.vat_number` allowed (groups, placeholders)?

**Blocks:** AUD-P3-017 unique index. Do not add the index until data and policy are known.

---

## Accounting / money

### Q-FIN-001 — Invoice immutability

**Need:** After send/pay, are invoices locked? Credit-note-only? Which Belgian/EU invoice rules apply?

**Blocks:** **Implementing** `FinancialPolicy` (AUD-P1-001). The keys exist; no callers. Honesty cut: stop claiming lock in the hub.

### Q-FIN-002 — VAT rounding and per-line tax

**Need:** Statutory rounding (per line vs document), allowed rates, inclusive vs exclusive.

**Blocks:** AUD-P2-025 persistence redesign. Do not guess a rounding table.

### Q-FIN-003 — Numbering and payment terms

**Need:** Global default copied onto new companies, or a live global that changes existing drafts?

**Blocks:** AUD-P1-017 behavior (not the honesty cut).

### Q-FIN-004 — Refunds in billing reports

**Need:** Is there a refund object besides Mollie payment status? Should the column exist?

**Blocks:** AUD-P3-004 (compute vs hide).

---

## Subscriptions / billing operations

### Q-BIL-001 — Are annual plans sold?

**Code:** Admin stores `billing_interval` monthly/annual; `applySubscriptionPayment` always `addMonth()`; upgrade array `period: month` (AUD-P1-010).

**Need:** If annual is sold, C1 is mandatory. If annual is forbidden, remove the enum option as well as fixing `addMonth()`.

**Does not block:** Stopping the hardcoded `'month'` string in `toUpgradeArray` (that is a lie either way).

### Q-BIL-002 — Dunning policy

**Need:** Grace days, retry count, pause vs cancel, who is emailed.

**Blocks:** Implementing AUD-P1-009. Toggles today are unread.

### Q-BIL-003 — Coupons

**Need:** Stacking, duration, currency, who may redeem, audit.

**Blocks:** Checkout redeem (AUD-P1-009). Table can stay unused until then.

### Q-BIL-004 — Who is billed, Mollie customer vs company

**Need:** One Mollie customer per user vs per company; what happens on workspace switch.

**Blocks:** Future billing refactors; not Wave 0.

---

## Authorization

### Q-AUTH-001 — Admin capability matrix

**Need:** Which of support, billing, compliance, settings, governance, snapshots, password-set, job-retry, workspace-enter may a non-super-admin perform?

**Blocks:** AUD-P2-004. Today `role:admin` is all-or-nothing. Do not invent a matrix.

### Q-AUTH-002 — MFA requirement and break-glass

**Need:** Mandatory for all admins? Phased enroll? Recovery if TOTP device lost?

**Blocks:** Default-on `sec_mfa_required_admin` (AUD-P0-001). Building TOTP can start after Phase A; turning it on cannot.

### Q-AUTH-003 — Company membership model

**Code:** `companies.user_id` owner only; no `company_user` pivot (`data-integrity.md`).

**Need:** Multi-user companies? What happens when the owner user is deleted (AUD-P1-024)?

**Blocks:** Restrict vs null vs reassign on user delete.

---

## Product / settings honesty

### Q-PRD-001 — One feature resolver?

**Need:** Should `global_feature_flags`, plan entitlements, company overrides, and rollouts compose, or are flags/rollouts documentation?

**Blocks:** Implementing AUD-P1-002 + AUD-P1-007. Hide is available.

### Q-PRD-002 — Email template library source of truth?

**Need:** Should `InvoiceSent` / welcome mail use stored templates?

**Blocks:** AUD-P1-011 implement vs hide.

### Q-PRD-003 — Public API and outbound webhooks

**Need:** Is a partner API in scope?

**Blocks:** AUD-P1-015/016 implement vs remove key-issue UI.

### Q-PRD-004 — Product CMS and announcements

**Need:** Should they appear on customer Inertia? Inventory `X-008/X-009` unused outside admin.

**Blocks:** Customer rendering work (out of Wave 0).

### Q-PRD-005 — Branding / locale / navigation settings

**Need:** Which layer (login, PDF, app chrome) should consume `branding_*` and `platform_enabled_locales`?

**Blocks:** AUD-P1-018 implement vs informational.

---

## Operations / providers

### Q-OPS-001 — Who owns backups?

**Need:** Host snapshots vs in-app dumps vs object storage. Infra “backup” UI is a log (AUD-P2-006).

**Blocks:** Building a dump pipeline vs relabeling the log.

### Q-OPS-002 — Queue and scheduler in deployment

**Need:** Are workers and `schedule:run` actually running in staging/production?

**Blocks:** Confidence that billing command, dunning, and any future deletion/scheduled-change jobs will fire. Code review cannot prove this.

### Q-OPS-003 — Inbound email provider contract

**Need:** Which provider (Postmark/Mailgun/etc.), HMAC vs shared secret, required headers.

**Blocks:** Replacing shared secret with HMAC (after AUD-P0-002). Current secret-in-query is a code fix (AUD-P2-002) and does not need the vendor name.

### Q-OPS-004 — Peppol / Postbode / Mollie environments

**Need:** Test vs live identifiers; whether `int_prevent_peppol_live_in_local` should default on.

**Blocks:** Enforcing AUD-P2-022 defaults; live contract tests (out of policy until explicitly allowed).

### Q-OPS-005 — SES as a mail driver

**Need:** Will production use SES? If yes, map credentials in `PlatformMailConfigurator` (AUD-P2-018). If no, drop the option.

### Q-OPS-006 — `APP_ENV` vs environment label

**Need:** Confirm production hosts use `APP_ENV=production`. AUD-P1-022 should gate on that **and** the label.

---

## Decisions that do **not** need an answer to start Phase A

| Finding | Safe default without a meeting |
|---------|--------------------------------|
| AUD-P0-002 | Require sender ∈ ticket company/owner/customer_user |
| AUD-P2-002 | Headers only |
| AUD-P1-021 | `$hidden` + boolean |
| AUD-P0-003 | Any active hold for `company_id` blocks complete |
| AUD-P1-004 | Revoke sessions; reject inactive users on each request |
| AUD-P2-024 | Fix tests to match intended redirects |

---

## Completeness validation

### Original eight reports vs this consolidation

| Report | In register? | Gaps |
|--------|--------------|------|
| `findings.md` (65 IDs) | All 65 | — |
| `feature-inventory.md` | Cross-referenced | Inventory rows are features, not extra findings. Unread keys mapped. |
| `security-review.md` | Yes | Promoted plaintext `site_settings` as AUD-P2-027 |
| `workflow-coverage.md` | WF ids on findings | Pass/fail unchanged; no new IDs |
| `data-integrity.md` | Partial in original findings | Promoted AUD-P1-023/024, AUD-P2-025/026, AUD-P3-017/018 |
| `remediation-plan.md` | Superseded by roadmap | Wave 0 still the first batch |
| `test-matrix.md` | Tests columns | **Zero of these tests exist** |
| `README.md` | Counts updated here | Original “65 findings” is now **72 unique** |

### Findings with weak or missing source evidence

| ID / item | Issue |
|-----------|--------|
| AUD-P2-024 ProfileTest got `/` | Confirmed failure; **root cause unverified** |
| Live Mollie unsigned-POST impact | Mitigated by API fetch; residual spam **potential** |
| AUD-P3-009 empty states | Static UI review, not a full page click-through of every table |
| Product CMS customer render | Unused helper; **unverified** on customer Inertia |
| Company export file body | Download exists; contents **unverified** |
| Concurrent admin edits | Residual; not reproduced |
| Exhaustive customer IDOR | Spot-check only (`security-review.md` §3) |

No finding was invented in consolidation. Promoted IDs cite `data-integrity.md` / `security-review.md` file evidence.

### Findings lacking tests **today** (all of them)

Every ID lists **required** tests; none are implemented. Highest-priority missing tests (must ship with the first code batches): inbound tenant match, legal-hold block, webhook secret not in Inertia, suspend session revoke, annual interval, characterization of MFA POST 404.

### Findings with acceptance criteria vs honesty-only

Clear code acceptance: all P0s, AUD-P1-003/004/010/013/020/021/022/023, AUD-P2-002/016/017/015.  
**Honesty-or-implement** (need Q or a hide): AUD-P1-001/002/007/008/009/011/012/015/016/017/018, AUD-P2-006/007/008/011/012/013/014.  
Priority is justified in the register; P0-001 is P0 as missing privileged MFA but is **not** Batch A1 (see roadmap).

### Domains the original audit did not fully review

- Customer-area IDOR beyond invoices, customers, offers, support tickets.
- Staff `/staff` shell (only noted as sibling of admin).
- Live provider contracts (Mollie, Peppol, Postbode, inbound HMAC) — policy: no live calls.
- Deployed topology: queue workers, scheduler, `APP_ENV`, backup jobs.
- Race conditions / optimistic locking.
- `ProfileTest` redirect chain.
- Customer rendering of Product CMS, announcements, legal notices.
- End-to-end restore of a governance snapshot (code path only).
- Accessibility and i18n completeness of admin (French/Dutch strings).
- Mobile admin layout beyond inventory notes.

**Do not claim complete platform coverage.** This consolidation covers the **admin control-plane audit** as documented, plus promoted data-integrity items that the findings register had missed.

### Contradictions resolved

1. README “plan entitlements enforced” vs unused global flags — both true (`PlanEntitlements` vs `global_feature_flags`).
2. SET-006 maintenance Implemented vs INF windows unused — both true; AUD-P2-005 is windows-only.
3. Five workflows “pass” vs many fail — scoreboard is mixed; not a conflict.
4. `toUpgradeArray` period month vs `billing_interval` on the model — confirmed L169 vs L189; AUD-P1-010 stands.
