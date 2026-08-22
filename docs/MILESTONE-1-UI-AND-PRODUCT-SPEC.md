# Offacto — Milestone 1  
## Product, Data & UI Specification (Designer Brief)

**Audience:** Product designer (and later frontend)  
**Goal:** Redesign the portal UI in parts. This document describes **everything Milestone 1 must look like and support**, including screens that are still conceptual.  
**Constraint for engineering:** Keep existing database concepts and business logic where they already exist. New entities described here (trial, legal files, briefings, answers) are the intended data model the UI must be designed around.

Do **not** treat this as a gap analysis. Treat every section as a **requirement**: “the product will work like this.”

---

## 1. How to use this document

1. Use the **current portal** as a functional reference (layout, flows, field names, tables).
2. Use the **client reference images** for visual direction (modern, calmer, more premium).
3. Design **all screens listed here**, even if the current portal only has a placeholder or a related feature (e.g. Services instead of Briefings).
4. Later milestones (invoices, team, billing, admin) stay in the **shell navigation** as disabled or secondary items where needed, but this pack only specifies Milestone 1 screens in full.

**Product language**

| User-facing term | Internal / data term |
|---|---|
| Quotation / Quote / Offerte | `offers` |
| Quote line | `offer_items` |
| Customer | `customers` |
| Company | `companies` + `company_settings` |
| Service catalog (priced items) | `services` |
| Briefing | New module (questions + answers) |
| Trial | Company subscription window (14 days) |

Currency in the current product is **EUR** with Dutch-style formatting (`€ 1.234,56`). Design both EN and NL-ready layouts (labels will be translated later). Default VAT is a **site setting** (typically **21%**).

---

## 2. Product story (Milestone 1)

A freelancer or small company:

1. Creates an account and their first company in one flow.
2. Lands in a **14-day trial** with a visible countdown and a clear “trial expired” state.
3. Completes **company profile**: legal identity, branding, legal documents.
4. Adds **customers**.
5. Builds a **briefing** (questions with prices / linked services).
6. Shares the briefing; the customer answers it.
7. The system **auto-creates a draft quotation** from those answers.
8. The user reviews the draft, attaches files, applies branding, and **sends** the quote by email.

Manual quote creation (pick customer + add service lines) remains available as a parallel path.

---

## 3. App shell (every logged-in screen)

The current portal uses a **dark top bar + left sidebar + main canvas**. Redesign this chrome once; all Milestone 1 pages sit inside it.

### 3.1 Top bar

- Product logo (Offacto) — links to dashboard.
- Optional **shortcuts** (quick create: customer, briefing, quotation).
- Optional timer / notifications (can stay as reserved slots; not Milestone 1 logic).
- **User menu:** Profile & company settings, companies, logout.
- Mobile: hamburger that opens the same nav.

### 3.2 Sidebar

**Company switcher (top of sidebar)**

- Shows **active company** logo (or placeholder) + company name.
- If the user has more than one company: expandable list; switching reloads all lists in that company context.
- All Milestone 1 data is **scoped to the active company**.

**Primary nav (staff / company user)**

| Item | Purpose |
|---|---|
| Dashboard | Trial, open quotes, briefing activity |
| Customers | CRM list + create/edit |
| Briefings | Question sets + share + incoming answers |
| Quotations | Draft / sent / accepted quotes |
| Services | Priced catalog used on quotes and briefing options |
| Company | Profile, branding, legal docs, trial |

**Secondary / later milestones (show in IA, do not fully design in this pack)**

- Invoices  
- Team  
- Subscription / billing (Mollie, renewals)  
- Admin (users, company approval, site settings) — separate role

**Management block**

- Companies (list + add another company)  
- Profile  

### 3.3 Page frame

Reuse a consistent page pattern:

- **Page header:** title, primary action (e.g. “New quotation”), secondary actions.
- **Filters / search** on the right of the header when the page is a list.
- **Stats strip** on quotation list (open / accepted / invoiced totals).
- **Content:** table, form in accordion sections (“harmonica”), or document preview.
- **Toasts / inline notes** for success and error.
- **Empty states** with one clear CTA.

### 3.4 Shared UI components to redesign

Design a modern version of each (they appear everywhere):

- Buttons: primary, bordered, destructive, icon-only  
- Form fields: floating or inside-label inputs, select, textarea, date, file upload  
- Color scheme picker (preset swatches + custom primary/secondary)  
- Logo upload with live preview  
- Accordion / harmonica form sections  
- Data table (desktop) + card list (mobile)  
- Status badges (Draft, Sent, Accepted, Rejected, Expired, Active, Prospect…)  
- Modal (add customer, pick services, send email, confirm delete)  
- Notes / alerts (success, error, warning, **trial**)  
- Pagination  

### 3.5 Trial chrome (global)

Trial is a **company-level** 14-day window starting when the company is created (or when first approved, if approval is required).

**Active trial**

- Persistent banner or sidebar chip: “Trial — X days left”.
- Optional progress bar (day 1–14).
- Link: “Upgrade” / Subscription (later milestone; design the button).

**Expired trial**

- Banner: trial ended; quoting/sending locked or read-only as product decides.
- Company settings sections that are “paid features” visually collapse or show an expired treatment (current mock uses class `e-trial-expired` and a trial note on payment blocks).
- User can still view existing quotes and company data.

Design both states now so they are not bolted on later.

---

## 4. Guest / authentication screens

All guest screens use a **centered auth frame**: logo, title, form card, footer links (`Forgot password` | `Register` | offacto.com).

### 4.1 Login

**Fields**

- Email  
- Password  
- Remember me  

**Actions**

- Log in  
- Forgot password  
- Register (hidden if site setting disables registration)  

**Feedback**

- Invalid credentials  
- Account inactive  
- Company pending approval (user may be blocked until company is approved)  
- Success flash after password reset or registration-pending-approval  

### 4.2 Register (account + first company in one form)

Two visual groups on one page (or a 2-step wizard if that photographs better — data submitted together).

**Account**

- Name  
- Email (unique)  
- Password  
- Confirm password  

**Company (initial)**

- Company name  
- First name, surname (contact person)  
- Company email  
- Phone  
- VAT number (optional at register, required later on profile)  
- Street, house number, postal code, city  
- Language (from `languages` table)  
- Self-employed activity: Main profession / Secondary profession (optional)

**After submit (two outcomes)**

1. **Immediate access:** user is logged in, company is active, trial starts, redirect dashboard.  
2. **Pending approval:** stay on a confirmation state (or login with a status message): “Your company is pending approval. We will email you.”

**Emails this flow triggers (design HTML templates, branded later)**

- Welcome email to the user  
- New user registered → admin  
- If approval required: pending approval → admin; confirmation → user  

### 4.3 Forgot password

- Email field  
- Submit: “Send reset link”  
- Success: generic “If the account exists, we sent a link” (do not confirm existence in copy if security prefers that)

### 4.4 Reset password

- New password, confirm password  
- Token from email link  
- Then redirect to login  

### 4.5 Verify email (if enabled)

- “Check your inbox” + resend verification  

---

## 5. Dashboard (logged in)

Scoped to **active company**.

**Widgets / regions**

1. **Greeting** + active company name + trial chip.  
2. **KPI cards**
   - Revenue (this year, from accepted / invoiced quotes — later also invoices)  
   - Expenses (placeholder 0 until a later milestone)  
   - Net result  
   - Open quotations total (Draft + Sent + similar)  
   - Period label: “1 January — today”  
3. **Open quotations** — last 5: quote number, customer, status badge, amount, date. Click → quote detail. Empty: “Create your first quotation”.  
4. **Briefing activity** (Milestone 1 story)
   - Briefings awaiting answers  
   - New completed briefings ready to review as draft quotes  
5. **Top customers** — by accepted/invoiced quote value; name + amount.  
6. **Quick actions:** Add customer, New briefing, New quotation.

If the user has **no company**: empty dashboard with CTA “Add company”.

---

## 6. Company profile, branding, legal documents, trial

This is the company “settings” hub. Current portal splits **Company details** and **Company settings (logo, theme, numbering)** on Profile. Redesign as one **Company** area with tabs or stacked sections.

### 6.1 Company details

Bound to `companies`.

| Field | Notes |
|---|---|
| Company name | Required |
| First name / surname | Contact person |
| Company email | Unique per company |
| Phone | Unique per company |
| VAT number | Required on update |
| Street / house / postal code / city | Required |
| Language | Dropdown from `languages` |
| Self-employed activity | Main / secondary |
| Status | Read-only for the user: Pending approval / Approved / Rejected / Suspended |
| Active flag | Admin-controlled; user sees if company is inactive |

**Approval copy:** if pending, a banner explains they cannot send quotes until approved (product rule to confirm).

### 6.2 Branding

Bound to `company_settings`.

**Logo**

- Upload JPEG/PNG/GIF, max 2 MB  
- Recommended 300×300  
- Live preview  
- Used on: sidebar switcher, quotation document, quotation email, later invoices  
- Fallback: placeholder mark + company name initials  

**Theme**

- Preset color schemes (pairs of primary + secondary hex), plus default product colors (`#4054B2` / `#454545`)  
- Custom hex for primary and secondary  
- Theme is stored as JSON `{ primary, secondary }`  
- Applied to quotation document (headers, totals, buttons), emails, and optional in-app accent for that company  

**Numbering series**

- Select a series from `numbering_series` for this company  
- Series defines prefix, year/month style, separator, digit padding, next number  
- Quotations get an automatic number like `OFF-2026-0001` (prefix comes from site/company settings)

### 6.3 Legal document upload

Design this section even if files are new storage.

**Purpose:** store official files that can be **attached to outgoing quotations/emails** and shown on the company page.

Suggested document types (cards + upload each):

- Terms & conditions (PDF)  
- Privacy statement (PDF)  
- Chamber of commerce / KvK extract (PDF)  
- ID / other legal proof (PDF or image, admin-facing if sensitive)  

Each card: file name, upload date, replace, remove, “Attach by default to quotations” toggle.

Data the UI must assume:

- Company has many **legal documents** (file path, type, original name, attach-by-default).  
- Quotation send can include selected legal PDFs plus quote-specific attachments.

### 6.4 Trial & subscription teaser

On the same Company page (or a slim “Plan” card):

- Trial start date, end date (start + 14 days)  
- Days remaining  
- CTA: Activate payment / Upgrade (links to Subscription — later milestone)  
- Expired: lock messaging + upgrade CTA  

The current subscription mock talks about **Mollie direct debit** and auto-renew. Design a simple plan card now; do not fully design payment methods in this milestone pack unless the reference images require it.

### 6.5 Companies list & add company

**List:** all companies the user belongs to — logo, name, city, status, “Set active”.  
**Create:** same company fields as registration (without account fields). New company gets its own settings, trial, customers, briefings, quotes.

---

## 7. Customers

Company-scoped. Current UX: list page + **modals** for add/edit/delete. Designer may use a slide-over or full page; keep the same fields.

### 7.1 List

**Columns**

- Name (first + surname; org name as subtitle)  
- Type badge: Individual / Organization  
- Email  
- Phone  
- Status: Active / Inactive / Prospect / Archived  
- Actions: edit, delete  

**Header:** “Customers” + “Add customer”.  
**Empty:** illustration + “Add your first customer”.

### 7.2 Create / edit form

| Field | Rules |
|---|---|
| Type | Individual or Organization |
| First name, surname | Required |
| Organisation name | Required if type = organization |
| Email | Required, unique **per company** |
| Phone | Optional |
| Country | Required, from `countries` |
| VAT number | Optional |
| Office address | Optional |
| Status | From customer statuses |
| Notes | Long text |
| Email usage | Optional multi-select / tags (what the email is used for) |
| Additional receivers | Optional list of extra email addresses for quotes |

**Inline create:** from the quotation form, a “+” opens this same form in a modal, then selects the new customer.

Delete is a **soft delete** — confirm modal: customer name, irreversible from the list (recover is out of scope for UI unless you add an archive filter).

---

## 8. Services (priced catalog)

Services are **reusable priced lines**. They feed:

- Manual quotation lines  
- Briefing answers that map to a price  

### 8.1 List

- Name, description, unit, price (excl. VAT), status  
- Add / edit / delete (soft delete)  
- Empty CTA  

### 8.2 Form

- Name (required)  
- Description  
- Price (required, ≥ 0)  
- Unit (e.g. hour, piece, project)  
- Status: Active / Inactive / Pending / Archived  

Admin may later approve services; for staff UI, show a “Pending approval” badge if that rule is on.

---

## 9. Briefings module

This is the ** Milestones 1 differentiator**. Design it as a first-class area.

### 9.1 Concept

A **Briefing** is a reusable or one-off questionnaire owned by the company.

- Each briefing has **sections** and **questions**.  
- Questions can carry **pricing logic** (fixed price, linked service, quantity, choice multipliers).  
- The company **shares** a briefing (public link and/or email to a customer).  
- The **customer** (or company user filling on their behalf) submits **answers**.  
- On submit, the system **creates a Draft quotation** for that customer, with line items derived from answers.

### 9.2 Briefing list

- Title, customer (if assigned) or “Template”, status, updated date, number of questions, last response  
- Statuses: Draft, Active (open for answers), Closed, Archived  
- Actions: edit questions, preview, copy share link, view responses, duplicate  
- Primary CTA: “New briefing”

### 9.3 Briefing builder (company user)

**Header:** title, save, preview, publish/activate, share.

**Briefing settings**

- Internal title  
- Customer (optional until share)  
- Intro text shown to the respondent  
- Language  
- Whether answers auto-create a draft quote (default: yes)  
- Validity: quote “valid until” offset (e.g. +14 days from generation)

**Question types to design (cards + settings panel)**

| Type | Pricing idea |
|---|---|
| Short text / long text | No price, or “notes on quote” |
| Yes / No | Yes adds a service or fixed amount |
| Single choice | Each option → service and/or extra price |
| Multiple choice | Sum of selected option prices |
| Number / quantity | Quantity × unit price or linked service |
| File upload | Attachment on the generated quote |
| Heading / helper text | Layout only |

**Each question card**

- Label (required)  
- Help text  
- Required toggle  
- Drag handle to reorder  
- Link to **service** (picker from catalog)  
- Override price (optional)  
- Visibility: always / if previous answer = X (simple conditional — design the rule row)

**Preview mode:** phone + desktop frames of the **customer-facing** form (next section).

### 9.4 Customer-facing briefing (public / token URL)

This is a **guest layout** (no sidebar): company **logo + theme colors**, briefing title, progress (stepper or bar), one section at a time or long scroll.

- Validate required questions  
- File upload dropzone  
- Sticky footer: Back / Next / Submit  
- Success page: “Thank you — we will send your quotation.”  

No login required for the respondent if they have a secure link.

### 9.5 Responses inbox

- Per briefing: list of submissions (customer, date, status: New / Converted to draft quote / Quote sent)  
- Open a response: answers in a readable timeline + “Open draft quotation”  
- If auto-generation ran: show quote number and status  

### 9.6 Data the UI assumes (for later implementation)

```
briefings
  id, company_id, customer_id (nullable), title, intro, status, auto_generate_offer, valid_until_days
  share_token, created_at, updated_at

briefing_questions
  id, briefing_id, sort_order, type, label, help_text, required
  service_id (nullable), price_override, options (JSON), visibility_rules (JSON)

briefing_responses
  id, briefing_id, customer_id (nullable), submitted_at, offer_id (nullable)

briefing_answers
  id, response_id, question_id, value (text/json), file_path
```

Relations:

- Company → many Briefings  
- Briefing → many Questions  
- Briefing → many Responses  
- Response → one Draft Offer (`offers`)  
- Question → optional Service  
- Answer file → quotation attachment  

---

## 10. Auto-generation of draft quotations

**Trigger:** briefing response submitted (or company user clicks “Generate quotation” on a response).

**Behaviour the UI must explain (review screen)**

1. Create `offers` row: status **Draft**, `customer_id` from briefing or response, `offer_date` = today, `valid_until` from briefing rule, intro/description from briefing intro + answer summary.  
2. For each priced answer, create `offer_items`: `service_id`, description (question + chosen option), quantity, price, line total.  
3. Attach uploaded answer files onto the quote.  
4. Open **quotation editor** with a banner: “Generated from briefing *{title}* — review before sending.”  
5. User can add/remove lines, change prices, attach extra PDFs, then save or send.

**Edge cases to design**

- Response with no priced answers → draft quote with empty lines + warning  
- Missing customer → force “Assign customer” before generate  
- Duplicate submit → “A draft already exists” + link  

---

## 11. Quotations (base structure, attachments, send)

Quotations are `offers` + `offer_items`. Users will say “quote”; keep “Offer” only if the current Dutch UI stays (“Offerte”).

### 11.1 List

**Header**

- Title: Quotations  
- Primary: “New quotation”  
- Search: customer name or quote number  
- Date filter: current year / month / quarter, last quarter, last year, specific year  

**Stats strip**

- Open amount (Draft + Sent + Pending)  
- Accepted amount  
- Invoiced amount (later milestone; still show the slot)

**Table columns**

- Quote number  
- Customer  
- Date  
- Valid until  
- Status badge: Draft, Sent, Accepted, Rejected, Expired, Cancelled  
- Total (incl. VAT)  
- Actions: view, edit (if draft), send, delete, convert to invoice (later — can be a disabled button)

Pagination (15 per page in current logic).

### 11.2 Create / edit (accordion form)

**Page header:** title + Cancel + Save.

**Section — Basic information**

- Customer select + “Add customer”  
- Valid until (date)  
- Quote date (can be hidden, default today)  
- Status (default Draft on create; visible on edit)

**Section — Assignment**

- Introduction (required) — opening text on the document  
- Description (required) — scope of work  

**Section — Quote lines**

- Button “Add service” → modal list of company services  
  - Each row: name, price, quantity stepper, add  
  - Empty catalog: link to Services  
- Table: description (editable), quantity, unit price excl. VAT, line total, remove  
- Live totals: subtotal, tax (site VAT %), grand total  

**Section — Comments**

- Internal notes (not necessarily printed — label as internal)

**Section — Attachments**

- Multi file; current portal copy says PDF  
- Show uploaded files with remove  
- Option: “Include company legal documents” checklist (T&Cs, etc.)

**Hidden/auto**

- `offer_number` generated on save  
- `company_id` = active company  

### 11.3 Document / preview (show)

A **print-like page** (and later PDF) using company branding:

- Logo (or name fallback)  
- Theme colors on header bar, table header, total highlight  
- Company block: name, street, house, postal, city, email, VAT  
- Customer block  
- Quote number, date, valid until  
- Intro, line table, description, totals  
- Footer: contact line  
- Attached file list  

Actions: Edit, Send, Download PDF, Back to list.

### 11.4 Send quotation

**Modal or dedicated panel**

- To: default customer email; editable  
- CC: additional receivers from customer  
- Subject: default `Offer #{number} from {company}`  
- Message: optional personal note  
- Attachments: quote PDF + user files + selected legal PDFs  

**After send**

- Status becomes **Sent**  
- Success toast  
- Email uses the same branding (logo + theme + company details)

### 11.5 Quotation email (design as an HTML template)

- Header band in primary color + logo  
- Company address  
- Optional custom message  
- Quote number, dates  
- Intro  
- Line table + totals  
- Description  
- Footer: “Sent by {company}” + company email  
- Attached PDF (in the email client, not in the HTML)

Welcome / approval emails can stay simpler but should share the same header/footer kit.

---

## 12. Apply branding everywhere (Milestone 1 rule)

| Surface | How branding appears |
|---|---|
| Sidebar company switcher | Logo |
| Dashboard greeting | Company name + logo |
| Quotation preview / PDF | Logo, primary/secondary, typography hierarchy |
| Quotation email | Logo, primary header, company identity |
| Customer briefing form | Logo, primary buttons/progress, background/secondary |
| Legal PDF attachments | Unchanged files; branding is on the quote around them |

If theme is empty, use product defaults.

---

## 13. Data model the UI is designed against

This is the **connected database** the screens read and write. Designers do not implement it; they must not invent fields that contradict it, and they **should** include UI for the briefing/trial/legal pieces below.

### 13.1 Existing core tables (keep)

```
users
  id, name, email, password, is_active, email_verified_at
  ↔ roles (many-to-many)
  ↔ companies (user owns / has companies)
  active company stored per session/user

roles, permissions, role_user, permission_role

languages
  id, name, …

status
  id, name, for  → for ∈ {services, customers, offers, invoices, companies, …}

countries
  id, name, …

companies
  id, user_id, first_name, surname, language, self_employed_activity
  email, phone, vat_number, company_name, street, house, postal_code, city
  is_active, status, approved_at, approved_by

company_settings
  id, company_id, invoice_logo, theme (JSON), numbering_series

numbering_series
  id, company_id, name, type, prefix, year_month, separator, digits, next_number

customers
  id, company_id, first_name, surname, type (organization|individual)
  country_id, vat_number, org_name, office_address, email, phone
  email_usage (JSON), additional_recivers (JSON), notes, status
  deleted_at

services
  id, company_id, name, description, price, unit, status, deleted_at

offers                    ← quotations
  id, company_id, customer_id, offer_number, offer_date, valid_until
  intro, desc, attachment, notes, status, deleted_at

offer_items
  id, offer_id, service_id, description, quantity, price, total

site_settings
  key/value groups: general, branding (product-level), features
  e.g. allow_user_registration, require_company_approval, default_vat_rate, offer_prefix
```

**Relationships (how screens join)**

```
User 1—* Company
Company 1—1 CompanySetting
Company 1—* NumberingSeries
Company 1—* Customer
Company 1—* Service
Company 1—* Offer
Customer 1—* Offer
Offer 1—* OfferItem
OfferItem *—1 Service
Company *—1 Status (approval)
Offer *—1 Status
Customer *—1 Status
Customer *—1 Country
Company *—1 Language
```

### 13.2 Intended additions (design UI now)

```
companies (or company_settings / subscriptions)
  + trial_starts_at, trial_ends_at   (ends_at = starts_at + 14 days)

company_legal_documents
  id, company_id, type, file_path, original_name, attach_to_quotes_default, created_at

briefings, briefing_questions, briefing_responses, briefing_answers
  (see §9.6)

offers
  + briefing_response_id (nullable)   so the quote can show “from briefing”
  attachment → prefer a child table offer_attachments (many files) over a single longText
```

### 13.3 What each screen writes

| Screen | Creates / updates |
|---|---|
| Register | `users`, `role_user`, `companies`, settings/series defaults, trial dates |
| Login | Session only |
| Forgot/reset | Password reset tokens / `users.password` |
| Company details | `companies` |
| Branding | `company_settings` (logo file on disk, theme JSON) |
| Legal uploads | `company_legal_documents` + files |
| Add company | new `companies` + settings + trial |
| Switch company | user active company pointer |
| Customers | `customers` |
| Services | `services` |
| Briefing builder | `briefings`, `briefing_questions` |
| Briefing submit | `briefing_responses`, `briefing_answers`, then `offers` + `offer_items` |
| Quote create/edit | `offers`, `offer_items`, attachments |
| Quote send | email + `offers.status` → Sent |

---

## 14. Status vocabularies (badges)

Design a badge for each; colors should work on the new UI.

**Companies:** Pending Approval, Approved, Rejected, Suspended  

**Customers:** Active, Inactive, Prospect, Archived  

**Services:** Active, Inactive, Pending, Archived  

**Quotations:** Draft, Sent, Accepted, Rejected, Expired, Cancelled  

**Briefings (proposed):** Draft, Active, Closed, Archived  

**Responses (proposed):** Received, Draft quote created, Quote sent  

---

## 15. Roles relevant to this milestone

| Role | Milestone 1 experience |
|---|---|
| Staff (company user) | Full company portal: customers, briefings, quotes, company settings |
| Admin | Separate admin chrome (not in this pack): approve companies/users/services, site branding/settings |
| Guest | Auth + public briefing form + (optional) quote view via link |

Login may reject inactive users or users whose only company is pending/rejected. Design those error states on login.

---

## 16. Screen inventory (design every one)

### Guest

1. Login  
2. Register (account + company)  
3. Registration pending approval (message state)  
4. Forgot password  
5. Reset password  
6. Verify email  
7. Public briefing form  
8. Briefing thank-you  

### App shell

9. Shell: sidebar, header, company switcher, trial banner, user menu  
10. Dashboard  

### Company

11. Company details  
12. Branding (logo, theme, numbering)  
13. Legal documents  
14. Trial / plan teaser  
15. Companies list  
16. Add company  
17. Profile (user name, email, password)  

### Customers & catalog

18. Customer list  
19. Customer create / edit (page or modal)  
20. Customer delete confirm  
21. Service list  
22. Service create / edit  

### Briefings

23. Briefing list  
24. Briefing builder  
25. Briefing preview  
26. Share briefing (link + email)  
27. Responses list  
28. Response detail + generate/open draft quote  

### Quotations

29. Quotation list  
30. Quotation create  
31. Quotation edit  
32. Service picker modal  
33. Add customer modal (from quote)  
34. Quotation preview / document  
35. Send quotation  
36. Delete quotation confirm  

### Emails (HTML)

37. Welcome  
38. Password reset (framework)  
39. Company pending / approved (user + admin variants can share a layout)  
40. Quotation sent  

### Global states

41. Empty lists  
42. No active company  
43. Trial expired overlay / locked actions  
44. Form validation errors  
45. 403 / no access to another company’s record  

---

## 17. Interaction notes (keep current logic, new visuals)

- **Harmonica sections:** first section open; others expand on click. On trial expiry, some sections look locked.  
- **Modals:** dimmed backdrop, close on overlay, body scroll lock.  
- **Quote line math:** `line total = quantity × price`; tax = subtotal × VAT%; update live.  
- **Soft deletes:** lists hide deleted customers/services/quotes.  
- **JSON fields:** `theme`, `email_usage`, `additional_recivers`, question `options` — UI is structured controls, not raw JSON.  
- **File storage:** logos under public storage; legal and quote files similarly; show friendly names, not paths.  
- **Responsive:** tables become stacked cards; auth and briefing forms stay single column on small screens.

---

## 18. Visual direction (for the redesign)

The current portal is dense: dark header, purple-accent buttons, accordion forms, compact tables.

This milestone pack should feel:

- **Clearer hierarchy** (one primary action per page)  
- **More whitespace**, larger type, calmer surfaces  
- **Status and trial** always scannable  
- **Document-quality** quote preview (the quote *is* the product)  
- **Briefing builder** that feels like a modern form builder (Notion/Typeform-like cards), not a spreadsheet  
- **Public briefing** that looks like the company’s brand, not the Offacto admin theme  

Deliver per screen: desktop + mobile, empty + populated, and the trial-expired variant on Company + Quotations + Send.

---

## 19. Out of scope for Milestone 1 UI pack (do not deep-design)

- Full invoicing, payments, UBL  
- Team members & permissions UI  
- Mollie / subscription checkout  
- Admin console (unless needed for approval emails only)  
- Timesheets, incoming mail, stats pages that exist as static mocks  

Keep those items in the **sidebar as later** so the information architecture stays stable.

---

## 20. Suggested designer deliverables

1. Design system (type, color, components listed in §3.4)  
2. App shell + trial banner  
3. Auth set  
4. Company hub (details, branding, legal, trial)  
5. Customers + services  
6. Briefings (builder + public form + responses)  
7. Quotations (list, editor, preview, send)  
8. Email templates (welcome + quote sent)  
9. Prototype: Register → Company branding → Briefing → Customer answers → Draft quote → Send  

That sequence is the Milestone 1 story the new UI must make obvious.
