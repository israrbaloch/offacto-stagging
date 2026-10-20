# Offacto platform admin manual

This guide describes every major **platform admin** screen: what it is for, what you can do, and what changes when you use it. It is written for operators and product owners, not for developers.

**Audience:** users with the **admin** role.  
**Where you sign in:** `/admin/login` (platform admin sign-in).  
**Home:** `/admin` (dashboard).

---

## 1. How the admin area is organised

### 1.1 Shared chrome (every page)

| Element | Function | Impact |
| --- | --- | --- |
| **Sidebar** | Opens hubs and tools. Active page is highlighted. | Navigation only. |
| **Top bar search** | Searches companies, users, invoices, and audit events. | Read-only. |
| **Notifications bell** | In-app alerts for platform admins (approvals, failed jobs, **support tickets**, and similar). | Opening a support ticket marks that ticket’s in-app alert as read. Extra notification emails do **not** appear here. |
| **Profile menu** | Account and sign-out. | Ends the admin session. |
| **Environment banner** | Shown when the deployment is labelled staging or development (Governance setting). | Reminder only; does not change data. |

### 1.2 Two kinds of pages inside a hub

Most hubs (Settings, Financial, Compliance, Integrations, Communications, Support, Security, Infrastructure, Product, Governance) have:

1. **Configure** pages — forms you **Save**. They change platform behaviour for companies and users.
2. **Operations / reports** — lists, reviews, and actions on live records (tickets, exports, health checks).

**Save** writes settings for that section only. **Reset section** restores that page’s factory defaults and does not reset other sections.

### 1.3 Notification split (support)

| Who | In-app bell | Email |
| --- | --- | --- |
| **Platform admin accounts** | Yes | Yes |
| **Extra addresses** listed under Support → Staff notifications | No | Yes only |

Outgoing mail uses **Communications → Outgoing email**. If that is not configured, emails will not leave the server (or will only be logged, if the sending method is “Log only”).

---

## 2. Overview

### 2.1 Dashboard — `/admin`

**Function:** Snapshot of the platform: subscription revenue, company approval state, plan payments, failed payments, and customers to follow up (pending approval, ended trials, new accounts).

**Impact:** Read-only. Use the cards and links to jump into Companies, Subscriptions, or Billing.

---

## 3. Directory

### 3.1 Companies — `/admin/companies`

**Function:** List and open customer companies.

**On a company (`/admin/companies/{id}`):**

| Area | Function | Impact |
| --- | --- | --- |
| Company details & usage | Identity and high-level counts (not document contents). | Read-only. |
| Status & restrictions | Activate, suspend, or restrict the workspace. | Users of that company may lose access or be limited. |
| Verification | Record verification state. | Audit trail; may affect trust workflows. |
| Feature overrides | Turn features on or off for this company only. | Overrides global or plan defaults for that company. |
| Subscription | See plan and billing state. | Informational; billing changes are under Subscriptions / Billing. |
| Data export | Request an export of company data. | Creates a controlled export job. |
| Deletion & retention | Start or review deletion subject to holds and policy. | Can permanently remove or anonymise data after approvals. |
| Activity timeline | Status, payments, logins, admin actions. | Read-only audit. |
| Edit (`…/edit`) | Change business identity, contact, and address. | Updates the company record customers see on documents. |

### 3.2 Company approvals — `/admin/companies/approvals`

**Function:** Queue of companies waiting for approval when “Require company approval” is on.

**Impact:** Approve lets the company use Offacto. Reject keeps them out and can notify them. Pending companies cannot work in the product until approved.

### 3.3 Users — `/admin/users`

**Function:** Platform user directory.

**On a user (`/admin/users/{id}`):**

| Area | Function | Impact |
| --- | --- | --- |
| Account | Name, email, active flag, verification. | Deactivating blocks sign-in. |
| Account actions | Reset flows, reminders, activation. | Can send mail or lock the account. |
| Roles | Assign roles (including admin). | Changes what the person can open. Removing the last admin is blocked. |
| Permissions | Effective rights from roles. | Read-only summary. |
| Companies | Companies they own or can open. | Membership changes access to workspaces. |
| Sessions | Active sessions. | Revoking signs them out. |
| Activity & security events | Recent actions and security signals. | Read-only. |

**Edit user** updates profile fields and whether they receive billing reminder emails.

---

## 4. Platform settings — `/admin/settings`

Global defaults. Many values apply to **new** companies; existing companies keep their own settings unless a screen says otherwise.

| Screen | Path | Function | Impact |
| --- | --- | --- | --- |
| General | `/admin/settings/general` | Platform name, tagline, logo, favicon, timezone, language, currency, registration, welcome email, company/service approval. Primary admin contact email. | Branding and sign-up rules for the whole product. Approval flags create queues under Approvals. Primary admin email is a fallback contact for registrations. |
| Theme & branding | `…/theme` | Colours, light/dark/system, font, navigation density. | Default look of the product. |
| Company branding policies | `…/branding` | Whether companies may upload logos, colours, invoice logos; lock selected fields; optional platform footer. | Limits what a company admin can change. |
| Languages | `…/languages` | Enabled languages and optional English phrase replacements. | Which languages appear in the product. |
| Regional formats | `…/regional` | Date, time, decimals, thousands, currency position. | Defaults for **new** companies. |
| Global tax | `…/tax` | Default VAT % and tax categories (name, short code, rate). | Copied when new companies are created. |
| Document templates | `…/documents` | Default quotation and invoice layout (logo, alignment, footer). | Starting layout for generated PDFs. |
| Email templates | `…/email-templates` | Subjects and optional bodies for system emails. | Changes wording of verification, invoices, reminders, and similar mail. Outgoing delivery is configured under Communications. |
| PDF layout | `…/pdf` | Margins (mm), logo position, page numbers, legal footer note. | All PDFs that use the platform layout. |
| Numbering | `…/numbering` | Invoice/quotation prefixes and how numbers are built (year, padding, yearly reset). | Default series for **new** companies. |
| Payment terms | `…/payment-terms` | Default due days, bank instructions, late wording, default payment methods. | Defaults on new documents. |
| Payment gateway | `…/payment-gateway` | Mollie test/live mode and API keys for **platform subscription checkout**. | Real charges if live keys and live mode are used. |
| Copyright clauses | `…/copyright` | Reusable clause text for offers. | Text companies can insert. |
| Legal library | `…/legal` | Terms and privacy titles, versions, URLs, auto-attach. | What can be linked or attached to documents. |
| Navigation | `…/navigation` | Show/hide and order workspace menu items. | What company users see in the sidebar. |
| Feature toggles | `…/features` | Platform-wide Peppol, Postbode, AI briefings, recurring invoices. | Turns modules off for everyone (plan/company overrides may still apply where implemented). |
| Custom fields | `…/custom-fields` | Placeholder for future extra fields. | No live custom-field builder yet. |
| Workflows & forms | `…/workflows`, `…/forms` | Informational; built-in statuses are in use. | No custom workflow engine yet. |
| Dashboard widgets | `…/dashboard-widgets` | Which widgets owners vs members see by default. | Default home layout for new users. |
| Notification preferences | `…/notifications` | Default email/in-app prefs for new users. | Starting point before a user changes their own settings. |
| Public pages | `…/public-pages` | Logo and accent on public briefing and quotation pages. | What customers see without logging in. |
| Maintenance mode | `…/maintenance` | Turn on a public maintenance message; allow admins through. | **Customers are blocked** from the app while it is on. This is the only switch for the customer maintenance page (Infrastructure links here). |

---

## 5. Financial documents — `/admin/financial`

Belgium-oriented rules for quotations, invoices, tax, and payments. **Configure** changes policy. **Operations** review live documents.

### 5.1 Policy screens

| Screen | Function | Impact |
| --- | --- | --- |
| Document policy center | Master rules for how documents behave. | Affects creation and editing of offers and invoices. |
| Invoice issuance & locking | When an invoice becomes final and locked. | Locked invoices should not be silently rewritten. |
| Credit note policies | Prefix and rules for credit notes. | How corrections are numbered and issued. |
| Quotation acceptance | How customers accept or decline quotes. | Public quotation behaviour. |
| Invoice / quotation approval | Whether internal approval is required before send. | Can block sending until approved. |
| VAT calculation & rounding | How VAT is rounded. | Totals on documents. |
| Tax exemptions & reverse charge | Wording and flags for special VAT cases. | Legal wording on invoices. |
| Invoice validation rules | Required fields before an invoice is valid. | Can stop invalid invoices from being sent. |
| Payment recording | How payments are recorded against invoices. | Ledger consistency. |
| Adjustments & refunds | Rules for partial payments and refunds. | Money movement records. |
| Overdue & reminders | When reminders may be sent. | Customer emails (also depends on Communications schedules). |
| Recurring invoices | Allowed intervals and safeguards. | Automated invoice generation. |
| Export formats | Which financial export formats are allowed. | What can be downloaded. |

### 5.2 Operations

| Screen | Function | Impact |
| --- | --- | --- |
| Version history | Who changed which document fields. | Read-only audit. |
| Reconciliation | Compare invoice balances, recorded payments, and provider payments. | Highlights mismatches; does not auto-fix money. |
| Exceptions | Unusual totals, tax, duplicates. | Review queue. |
| Delivery history | Email, postal, and Peppol attempts. | Read-only. |
| Audit export | CSV-style bundle for authorised review. | Creates a file containing activity metadata. Treat as confidential. |

---

## 6. Compliance — `/admin/compliance`

Privacy, retention, and lawful-request workflows. **An incoming request is not permission to export everything.** Disclosures are recorded manually.

### 6.1 Policy screens

| Screen | Function | Impact |
| --- | --- | --- |
| Jurisdiction profiles | Markets and baseline invoicing/privacy rules. Belgium is the default. | Documents which rules you claim to follow. |
| Jurisdictional tax | Dated rates, exemptions, reverse charge wording. | Reference for tax configuration. |
| E-invoicing compliance | Allowed structured formats and validation. | What Peppol-style sends are permitted. |
| Peppol policy | Retry and monitoring defaults. Company credentials stay on the company. | Platform-level behaviour only. |
| Data retention | How long categories of data are kept. | Guides deletion jobs; legal holds override deletion. |
| Data residency | Where data is hosted and transfer safeguards. | Documentation for audits and DPAs. |
| Export security | Who may export, expiry, download logging. | Restricts compliance exports. |
| Disclosure notification | Whether customers may be told about authority disclosures. | Process rule for your team. |
| Emergency disclosure | Extra approvers for emergencies, with later review. | Does not skip the register. |
| Processing register | High-level record of processing activities. | Your internal RoPA-style notes (not a full DPO system by itself). |

### 6.2 Operations

| Screen | Function | Impact |
| --- | --- | --- |
| Legal document versioning | Publish terms, privacy, DPA versions. | Customers may be asked to accept a new version. |
| Consent & acknowledgements | Record consent and withdrawals. | Evidence of lawful basis. |
| Data subject requests | Access, correction, export, restriction, deletion. | You must complete the request in line with policy; the screen tracks status and deadlines. |
| Legal holds | Place or release a preservation hold. | **Blocks deletion** of held records. |
| Deletion & anonymisation jobs | Run approved cleanup. | Irreversible once executed. |
| Privacy access review | Review privileged access patterns. | Oversight, not continuous surveillance of all users. |
| Data breach management | Log incidents, containment, and notification deadlines. | Regulatory clock starts when you record the incident. |
| Authority request register | Log a formal request (who, jurisdiction, scope, status). | No automatic data release. |
| Legal request review | Check that the request is authentic and in scope. | Gate before any disclosure. |
| Evidence preservation | Hashes and chain-of-custody notes. | Integrity of evidence packages. |
| Controlled disclosure | Record exactly which fields or files were shared. | Audit of what left the platform. |
| Compliance cases | Cases separate from customer support. | Restricted internal workflow. |
| Peppol monitoring | Recent structured invoice transmissions. | Read-only health of e-invoicing. |
| Compliance reports | Controlled exports. | Confidential downloads; logged. |

---

## 7. Integrations — `/admin/integrations`

External providers. Company-level Mollie and Postbode tokens stay on each company; this area is the **platform** layer.

| Screen | Function | Impact |
| --- | --- | --- |
| Hub | Mollie mode, Peppol status, open failures, companies using Mollie/Postbode, webhooks, API keys. | Read-only summary. Test-mode banner when Mollie is in test. |
| Credentials & secrets | Who may view integration settings; reminder to rotate keys; internal policy text. | Access and process rules. |
| Environment management | Test vs live; block live company integrations while platform is in test; block live Peppol from a developer machine. | Prevents accidental live charges or sends. |
| Mollie administration | Gateway, mode, test/live keys, optional custom webhook address, reconciliation logging. | **Live keys + live mode can charge real cards** for platform checkout. Shared with Settings → Payment gateway. |
| Peppol administration | Access-point address, token, formats, failure logging. | Platform default when a company has no override. |
| Postbode administration | Service address, default country, registered mail default, API version. | Defaults for new companies; each company still sets its own mailbox token. |
| Email delivery | Link only. | SMTP is configured under **Communications → Outgoing email** (single place). |
| WhatsApp policies | Allow share links; optional API delivery (off by default); message text with placeholders. | Share buttons on invoices/quotes. API delivery is not a full WhatsApp Business setup unless you enable and integrate it. |
| API rate limits | Requests per minute, burst, daily quota. | Limits platform API keys when enforcement is active. |
| Retry policies | How many times Mollie, Postbode, Peppol, and webhooks are retried. | Fewer duplicates and fewer silent failures. |
| Webhooks | Register outbound HTTPS endpoints and optional signing secret. | Your systems receive events. A wrong URL leaks event payloads to that host. |
| API keys | Create keys with permissions (read, write, webhooks). Secret shown **once**. | Anyone with the key can call the API within those permissions. Revoke immediately if leaked. |
| Health checks | Connectivity tests without showing secrets. | Read-only diagnostics. |
| Failure queue | Failed payments, postal, Peppol, email, webhooks. | Review; does not auto-refund. |
| Provider registry | Catalogue of third parties (name, purpose, data access, status, privacy-doc link). | Documentation for compliance, not a live connection by itself. |

---

## 8. Email & communications — `/admin/communications`

### 8.1 Delivery (do this first)

| Screen | Function | Impact |
| --- | --- | --- |
| **Outgoing email** | Sending method (SMTP, Postmark, Resend, Amazon SES, or log-only), From name/address, reply-to, SMTP server/port/encryption/username/password, provider tokens. Connection test to your own login email. Empty fields can fall back to server environment settings. | **All product email** (invoices, OTP, support alerts, approvals) uses this after you save. Log-only does not deliver to inboxes. Wrong SMTP can bounce or land in spam. |
| **Incoming email** | Enable processing, support inbox address, provider, webhook vs manual, webhook secret, auto-create tickets, optional extra forward list. Page shows the webhook URL. | Provider posts to `/webhooks/inbound-email` with header `X-Inbound-Secret`. Matching subject `TKT-…` or the company’s email appends to a ticket; otherwise a new ticket can be created. Staff are notified per Support settings. |

### 8.2 Content and rules

| Screen | Function | Impact |
| --- | --- | --- |
| Email template library | Subjects and optional bodies; reject unknown personalisation codes. | Wording of transactional mail. Shared with Settings → Email templates. |
| Personalisation codes | Built-in codes (read-only list) plus your own `#CODE#` values and where they apply. | Codes are replaced when mail is sent. Unknown codes can be blocked on save. |
| Notification rules | Event (invoice sent, quote sent, payment failed, …), email or in-app, roles. | Who is notified for those events where the rule is enforced. |
| Scheduled notifications | Days-before reminders for trials and renewals; invoice reminders can follow each company’s own settings. Master on/off. | Scheduler must be running on the server for reminders to go out. |
| Suppression | Honour unsubscribe, require marketing consent, bounce suppression days, allow transactional mail anyway. | Stops marketing to people who opted out. Transactional mail (invoices, OTP) can still send if that option is on. |

### 8.3 Operations

| Screen | Function | Impact |
| --- | --- | --- |
| Preview & testing | Preview a template with sample data; send a test **only to your admin email**. | Does not email customers. |
| Delivery analytics | Counts of sent, bounced, failed (30 days). | Read-only. |
| Queue monitor | Waiting and failed send jobs; retry with confirmation. | Retry sends the job again. |
| Communication history | Metadata of deliveries, not full bodies for every admin. | Privacy-preserving audit. |

---

## 9. Product & content — `/admin/product`

| Screen | Function | Impact |
| --- | --- | --- |
| Hub | Counts of pages, announcements, testimonials, help articles, pilots, experiments. | Read-only. |
| Public website CMS | Landing, FAQ, and public help pages. | What anonymous visitors read. |
| Announcements | In-app banners (maintenance, releases, policy). | Every signed-in user in scope sees the banner. |
| Testimonials | Moderate and publish reviews; record consent. | Public marketing content. |
| Help center | Guides and troubleshooting articles. | Customer self-service. |
| Release notes | Version history. | Public or in-app changelog. |
| Feature rollouts | Enable a feature for plans, specific companies, or a percentage. | Gradual exposure; mistakes can hide or show a feature. |
| A/B testing policy | Consent, minimum sample size, no personal data in experiment labels. | Guardrails for experiments. |
| A/B testing manager | Run UI experiments. | Users may see different layouts. Stop a test to end the split. |
| Feedback & roadmap | Collect requests and publish roadmap items. | Public commitments if you mark items public. |
| Onboarding | Checklist steps shown to new users. | First-run experience only. |
| System-wide defaults | Language, currency, payment terms, invoice prefix, quote validity, VAT for **new workspaces only**. | Does **not** rewrite existing companies. |

---

## 10. Governance — `/admin/governance`

High-impact operations. Prefer preview and snapshots before execute.

| Screen | Function | Impact |
| --- | --- | --- |
| Environment separation | Label development / staging / production; block destructive bulk actions in production; show the banner. | Stops accidental bulk deletes on production when the block is on. |
| Bulk operation policies | Dual confirmation and max rows. | Limits blast radius. |
| Bulk operations | Preview dormant-company deactivation or unverified-user lists, then execute a draft. | **Can deactivate companies.** Always read the impact summary. |
| Import & migration | Upload CSV, map columns, validate. | Creates or updates records when you confirm import. Bad mapping corrupts data. |
| Export jobs | Large exports with expiry. | Confidential files; downloads should be logged. |
| Export policies | Link expiry and download logging. | How long a link works. |
| Configuration change history | Old vs new values, who, when. | Read-only. Secrets are masked. |
| Versioning & rollback | Snapshot a settings section and restore that section only. | **Overwrites current settings in that section** with the snapshot. Other sections stay as they are. |
| Approval queue | Company, access, and compliance items waiting for a decision. | Approving or rejecting changes customer or staff access. |
| Scheduled changes | Title, effective time, reason, approval checkbox. | Records an intended future change. Apply the real settings in the relevant screen; this page does not silently edit every field by itself. |
| Action simulation | Pick a settings area and open it. | Navigation aid before you change production settings. |
| Runbooks | Outage, integration, payment, security, and restore procedures. | Documentation for your team. Publishing makes the text the current procedure. |
| Global audit search | Search actions and admin emails. | Read-only. |
| Reconciliation dashboard | Data-integrity flags shared with infrastructure checks. | Investigate; does not auto-correct. |
| Admin API & automation | Issue a scoped automation key (shown once) and revoke it. | Same risk as Integrations API keys. |
| Admin access review | Active admins, verification, last activity, inactive privileged accounts. | Use it to remove unused admin access. |

---

## 11. Billing

### 11.1 Subscriptions — `/admin/subscriptions`

**Function:** Platform subscription dashboard (revenue, status of company plans).

**Directory — `/admin/subscriptions/directory`:** Search subscriptions.

**Company subscription (`/admin/subscriptions/{id}`):** Inspect and, where the screen allows, adjust plan state.

**Impact:** Changes whether a company is on trial, paid, or expired, and what plan features they receive.

### 11.2 Plans — `/admin/plans`

**Function:** Create and edit sellable plans (price, interval, feature flags such as Peppol or priority support).

**Impact:** New checkouts use these plans. Changing a live plan can change what existing subscribers are entitled to, depending on how the plan is applied at renewal.

### 11.3 Billing rules — `/admin/billing/settings`

**Function:** Trial length, grace periods, and which billing emails are sent (trial ending, renewal, failed payment, cancellation, confirmation).

**Impact:** When access stops after non-payment and which emails customers receive. Requires outgoing email to be configured.

### 11.4 Coupons — `/admin/billing/coupons`

**Function:** Create discount codes (percent or amount, expiry, usage limits).

**Impact:** Reduces what a company pays at checkout. A public unlimited coupon is a revenue leak.

### 11.5 Payments — `/admin/billing/payments`

**Function:** Reconciliation of subscription checkouts (paid, pending, failed).

**Impact:** Read and operational follow-up. Refunds, if offered on the screen, move money and must match your payment provider.

### 11.6 Reports — `/admin/billing/reports`

**Function:** Revenue and subscription reports for a date range.

**Impact:** Read-only exports for finance. Treat downloads as confidential.

---

## 12. Support

Customer tickets are also created from the **company workspace → Support** (`/support`) when the portal is enabled, and from **incoming email**.

### 12.1 Hub — `/admin/support`

Open tickets, average first response, escalations, feedback, and links into every support tool.

### 12.2 Tickets — `/admin/support/tickets`

| Action | Impact |
| --- | --- |
| Create ticket | Opens a case, optional company and assignee. Emails admins and extra recipients; in-app alert for admins. |
| Open ticket | Thread, internal notes, assignment, status, priority. Viewing clears the in-app alert for that ticket. |
| Public reply | Visible to the customer on their Support page. Can email staff if that toggle is on. |
| Internal note | Staff only; not shown to the customer. |
| Resolve / close | Stops the SLA clock for an open case. Customers cannot reply on a **closed** ticket. |

### 12.3 Settings

| Screen | Function | Impact |
| --- | --- | --- |
| Customer support portal | Allow company users to open and reply to tickets. | Off: workspace Support shows “unavailable”. |
| Staff notifications | In-app alerts for admins; extra email-only addresses; toggles for new ticket, customer reply, agent reply, assignment. | See section 1.3. |
| SLA & escalation | First-response hours by priority, working hours (Belgium time zones), escalation type → team, require access approval before viewing a customer workspace. | Due times on new tickets. Escalation paths are routing guidance for your team. |

### 12.4 Operations

| Screen | Function | Impact |
| --- | --- | --- |
| Support access approval | Request and approve time-limited, read-only context on a customer workspace. | Without approval, staff should not browse that company’s data. |
| Customer activity timeline | Account, subscription, and restriction events for a company. | Read-only. |
| Account recovery | Verified recovery assistance. | Must not reveal or reset passwords outside the product’s normal reset flow. |
| Macros & knowledge | Canned replies and internal articles. | Faster, consistent answers. |
| Customer feedback | Complaints and satisfaction. | Product input; not the same as a support ticket unless you create one. |
| Escalations | Route billing, fraud, privacy, or legal issues. | Hands the case to another queue; does not by itself change invoices or disclose data. |

---

## 13. Security — `/admin/security`

| Screen | Function | Impact |
| --- | --- | --- |
| Security policy center | Password, session, MFA, and privileged-access baseline. | How strict sign-in is, once enforcement uses these values. |
| Rate limiting | Caps on sign-in, registration, password reset, public quotes, briefing forms. | Slows abuse; too low blocks real users. |
| File upload security | Allow images, PDF, Office, audio; malware-scan flag; restrict sensitive downloads. | What customers can attach. |
| Encryption & key management | Review cadence and notes. Platform encryption key rotation is done at deploy time, not by typing a new key here. | Process documentation. |
| Privileged action controls | Extra confirmation for delete, export, refund, credential change, suspend. | Extra prompt before dangerous actions where enforced. |
| Separation of duties | Actions that need a second admin. | One person should not both request and approve. |
| Suspicious activity | Unusual logins, exports, privilege changes. | Review queue. |
| Account risk & restrictions | Temporary limits and documented suspensions. | Can block a user or company. |
| Fraud review queue | Registrations, payments, refunds, abuse reports. | Holding a case delays activation or payout decisions you record here. |
| Secret rotation | Plan and record credential rotations. | Tracking only until you rotate the real key in Outgoing email, Mollie, or the server. |
| Security audit log | Security events and access decisions. | Read-only. |
| Vulnerability management | Track dependency advisories and remediation. | Process record. |
| Security incidents | Severity, containment, recovery. | Your incident log. |
| Policy exceptions | Time-limited exceptions with an expiry. | Temporarily weakens a control. Remove them when they expire. |

Legacy **Security log** remains at `/admin/logs/security` (failed logins and lockouts).

---

## 14. Infrastructure — `/admin/infrastructure`

| Screen | Function | Impact |
| --- | --- | --- |
| Hub | Database, queue depth, failed jobs, integrity flags, storage size, whether the customer maintenance page is on. | Read-only. |
| Database health | Availability and size signals. | Diagnostic. |
| Queue & workers | Depth and worker guidance. | A stuck queue delays email and invoices. |
| Scheduled tasks | Recurring invoices, subscriptions, daily commands. | If the scheduler is down, renewals and reminders do not run. |
| Backup policies | Expected frequency, retention days, encryption, destination names and regions. | Documents your backup design. Actual backups run on your host. |
| Backup management | Record backup runs. | Evidence for audits. |
| Restore & disaster recovery | Record restore tests. | Evidence; does not restore production by itself. |
| Recovery time targets | Max acceptable data loss (hours), target time to restore, test cadence. | Planning targets, not an automatic failover. |
| Storage management | Disk and upload growth. | Capacity planning. |
| Attachment lifecycle | How long temporary files, PDFs, and voice notes are kept; optional cleanup job. | Cleanup **deletes** old files when the job is enabled. |
| Failed jobs | Inspect and replay with confirmation. | Replay can send email or charge again if the job was a payment. Read the job first. |
| System logs | Recent log lines with secrets redacted. | Troubleshooting. |
| Data integrity | Orphan records, balance mismatches, broken links. | Fix in the related admin screen; this list does not auto-repair. |
| Maintenance windows | Plan a window, note whether queues should pause. | Coordination record. |
| Maintenance controls | Explains that the **customer** maintenance switch lives under Settings → Maintenance, plus a recommendation to pause background jobs. | Does not duplicate the on/off switch. |

---

## 15. Audit

| Screen | Path | Function | Impact |
| --- | --- | --- | --- |
| Activity | `/admin/logs/activity` | Broad activity log. | Read-only. |
| Security log (legacy) | `/admin/logs/security` | Failed sign-ins and blocks. | Read-only. Prefer Security → Security audit log for newer events. |
| Global audit search | `/admin/governance/operations/global-audit` | Search across admin actions. | Read-only. |

---

## 16. Access and related customer screens

| Screen | Path | Function |
| --- | --- | --- |
| Admin sign-in | `/admin/login` | Email and password for admin role. |
| Extra verification | `/admin/mfa` | Second step when MFA is required. |
| Access denied | shown on 403 | You are signed in but lack permission for that page. |
| Customer Support | `/support` (company workspace, not under `/admin`) | Company users open and reply to tickets for the **active company**. |

---

## 17. Safe operating order

1. **Communications → Outgoing email** — prove delivery with the connection test.  
2. **Settings → General** — name, logo, approval rules, primary admin email.  
3. **Settings → Maintenance** — confirm it is **off** before go-live.  
4. **Integrations → Mollie** — stay in **test** until you intend to take live payments.  
5. **Support → Staff notifications** — confirm admin in-app alerts and any extra email-only addresses.  
6. **Support → Customer portal** — on, if companies should file tickets themselves.  
7. **Governance → Environment** — label production and block destructive bulk actions.  
8. Take a **settings snapshot** (Governance → Versioning) before large policy edits.

---

## 18. Actions that are hard to undo

| Action | Where | Effect |
| --- | --- | --- |
| Live Mollie keys | Integrations or Payment gateway | Real charges. |
| Maintenance mode on | Settings → Maintenance | Customers locked out. |
| Reset section | Any settings page | That page returns to defaults. |
| Restore snapshot | Governance → Versioning | Overwrites that settings section. |
| Execute bulk deactivation | Governance → Bulk operations | Companies deactivated. |
| Deletion job | Compliance | Data removed or anonymised. |
| Revoke API key | Integrations or Governance | Integrations using that key stop. |
| Close ticket | Support | Customer can no longer reply. |
| Remove admin role | Users | That person loses this admin area. |

When a screen asks you to confirm, read the impact line before you continue.
