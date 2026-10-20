# Offacto admin — data integrity

Review of migrations, models, FKs, uniqueness, cascades, money precision, concurrency, and tenant relations. 64 migrations under `database/migrations/`.

---

## 1. Tenant / ownership model

| Relation | Implementation | Integrity notes |
|----------|----------------|-----------------|
| Company owner | `companies.user_id` → `users.id` `onDelete('cascade')` (`2026_01_09_024345_create_companies.php` L16–31) | Deleting a user **cascades the company** and, via later FKs, many child rows. No soft-delete on companies. |
| Membership | **None** — `User::companies()` is `hasMany` on `user_id` | No `company_user` pivot. “Assign users” is not representable. |
| Active workspace | Session `active_company_id` | Admins may set any existing company (`User::setActiveCompanyId` L251–253). |
| Invoices / offers / customers / services | `company_id` FKs (varies by table) | Customer controllers typically filter by `activeCompany`. |

---

## 2. Foreign keys and cascades (admin-relevant)

### Generally sound

Admin extension tables cascade on `company_id`:

`2026_10_19_140000_company_administration.php`

- `company_status_events` — cascade company; user nullOnDelete
- `company_verifications` — unique `company_id`, cascade
- `company_feature_overrides` — cascade
- `company_data_exports` — cascade
- `company_deletion_requests` — cascade

Support (`2026_10_19_210000_support_admin.php`):

- `support_tickets.reference` **unique**
- `company_id` / user FKs **nullOnDelete** (ticket can become company-less)
- messages cascade with ticket
- access requests cascade with company

Subscriptions:

- `subscription_payments.company_id` cascade; `mollie_payment_id` unique (`2026_10_02_000001_subscription_plans_and_payments.php` L23–32)

Roles:

- `roles.name` unique; `role_user` composite PK, cascade both (`create_role_user_table.php`)

Site settings:

- `site_settings.key` unique (`2026_01_25_103141_create_site_settings_table.php` L16)

### Dangerous cascades

**Invoice/offer line items delete when a service is deleted:**

```20:23:database/migrations/2026_01_23_045045_create_invoice_items.php
            $table->decimal('price', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);
            $table->foreign('invoice_id')->references('id')->on('invoices')->onDelete('cascade');
            $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
```

Same pattern: `2026_01_23_044546_create_offer_items_table.php` L23.

Deleting a catalog service can **erase historical invoice/offer lines**. Soft-deletes exist on services (`deleted_at`) which reduces accidental hard-delete risk, but a hard delete is catastrophic.

**User delete → company cascade** can wipe a tenant if an owner user is destroyed (`users` delete not exposed in admin UI except account self-delete on profile).

### Missing / weak constraints

| Item | Gap |
|------|-----|
| `companies.vat_number` | Not unique |
| `company_feature_overrides` | Index on `(company_id, capability_key)` **not unique** — duplicate overrides possible |
| `company_status_events.previous_status_id` / `new_status_id` | Unsigned bigints, **no FK** to `status` |
| Compliance legal holds vs deletion | No FK or application check (AUD-P0-003) |
| `support_tickets` without `company_id` | Allowed; inbound unmatched senders create company-less tickets (`InboundEmailWebhookController` L60–68) |

---

## 3. Uniqueness

| Column | Unique? |
|--------|---------|
| `users.email` | Yes |
| `companies.email`, `companies.phone` | Yes (base migration) |
| `companies.vat_number` | **No** |
| `support_tickets.reference` | Yes |
| `subscription_plans.slug` | Yes |
| `subscription_payments.mollie_payment_id` | Yes (nullable unique) |
| `site_settings.key` | Yes |
| Admin coupon codes | Check `2026_10_19_160000_billing_commercial_admin.php` — `amount` integer; uniqueness should be verified on `code` in that migration (coupon CRUD validates in controller) |

Admin company update re-validates unique email/phone (`AdminCompanyController` L259–273) but not VAT.

---

## 4. Money precision

| Domain | Storage | Runtime |
|--------|---------|---------|
| Plans / platform payments | `unsignedInteger` cents | `MoneyAmount` helper |
| Coupons | `unsignedInteger amount` (cents or percent) | Admin converts in `AdminBillingController` |
| Invoice/offer items | `decimal(15,2)` | OK for display currency |
| Invoice totals | **Computed float accessors** | `Invoice.php` L142–177: `sum` then `$subtotal * $taxRate` |
| VAT | Single global `default_vat_rate` integer | Not per-line; ignores `fin_*` / `comp_tax_rules` |
| Admin reports | `round(cents/100, 2)` | `AdminBillingController` L135, L157–160 |
| Mollie API | `number_format(..., 2, '.', '')` | Platform + tenant services |

**Risk:** Mixed **integer cents** (subscriptions) and **decimal/float** (tenant invoices). Reconciliation sums `$i->total` in PHP (`AdminFinancialInsights`). Float VAT (`subtotal * rate`) can drift vs statutory rounding. No money library on invoices.

---

## 5. Concurrency and idempotency

| Area | Control | Gap |
|------|---------|-----|
| Mollie platform payment | Unique `mollie_payment_id` | Webhook can be replayed; should be idempotent if status updates are last-write |
| Governance bulk | Status must be `draft` before execute (L239–241) | No row-level lock; two admins could race (second should fail on status) |
| Settings persist | Last write wins on `site_settings.key` | Duplicate Mollie UIs increase overwrite risk (AUD-P1-019) |
| Company/user updates | No `updated_at` / version check | Lost updates |
| GET company show | **Creates** verification row | Concurrent first-views can race unique `company_id` (unique helps) |

No queue jobs under `app/Jobs/`. Mailables may implement `Queueable` but typical sends are synchronous `Mail::send`. Scheduled: recurring invoices + `subscriptions:process` only (`bootstrap/app.php` L21–23).

---

## 6. Soft deletes vs admin deletion

Customers, services, offers, invoices use soft deletes (`docs/application-features.md` and migrations). Admin company “completed” deletion:

- Sets `anonymized_at`
- Rewrites `company_name` / `email`
- Sets `is_active=false`
- **Does not** set `permanently_deleted_at`
- **Does not** purge or anonymize invoices, customers, files, or child companies’ documents

Compliance deletion jobs never run, so those rows stay `approved` forever.

---

## 7. Settings persistence vs application

`SiteSetting::get/set` (`app/Models/SiteSetting.php`) is the single KV store. Integrity of **behavior** is not referential: keys have no schema FK to registries. A typo or stale key remains forever.

Registries can persist JSON blobs (`type=json` / structured widgets). Runtime readers are sparse — see feature inventory “Stored-but-unread”.

Password fields: empty update skipped (good). Values stored as strings; booleans `'1'`/`'0'`.

Platform secrets in `site_settings` are **not** encrypted at rest (unlike company integration keys).

---

## 8. Indexes (notable)

Present: company status events `(company_id, created_at)`; feature overrides `(company_id, capability_key)` non-unique; deletion requests `(company_id, status)`; tickets `(status, priority)`; `site_settings.key`.

Missing for scale: financial reconciliation has no SQL aggregate path (loads all invoices). Global search (`AdminShellInsights::globalSearch`) does discrete queries — acceptable for admin, not proven at large N.

---

## 9. Orphan / mock tables

Several admin tables are ledgers without consumers:

- `communication_suppressions` — no writes
- `integration_failures` — no writes
- `gov_scheduled_config_changes` — no apply
- `gov_export_jobs` — no blob
- `compliance_consent_records` — no writes
- `infra` backup runs — no backup bytes

These inflate “implemented” appearance without integrity of the business process.

---

## 10. Integrity findings mapped

| Issue | Severity |
|-------|----------|
| Legal hold table disconnected from deletion | P0 (AUD-P0-003) |
| Invoice/offer items cascade on service delete | P1 |
| User delete cascades company | P1 (latent) |
| Float VAT / mixed money types | P1–P2 |
| Feature override duplicates allowed | P2 |
| Status event status ids without FK | P3 |
| VAT number not unique | P3 (business rule) |
| Inbound tickets without company | P2 |
| Shallow company anonymization | P2 |
