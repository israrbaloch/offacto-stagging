# Offacto — application features and behavior

This document describes the company workspace: menus, pages, features, user interface, and the logic behind them. Platform administration (user management, company approval screens, service approval screens, and platform settings) is out of scope.

Offacto is a multi-company quoting and invoicing workspace for freelancers and small businesses. A user registers a company, works inside that company, and can switch between companies they own. The product covers customers, a service catalog, client briefings, quotations (offers), invoices, payments, and subscriptions.

The interface is English, French, or Dutch. Dates and currency follow the active locale. Money is shown in euros. VAT defaults to 21 percent unless the platform default rate is changed.

---

## 1. Application shell

Signed-in pages use a two-column layout.

**Sidebar (large screens)**

- Company logo when one is uploaded, otherwise the Offacto logo.
- Company switcher.
- A primary **Create invoice** button, shown only when a company is selected.
- Workspace links:
  - Dashboard
  - Customers
  - Services
  - Briefings
  - Offers
  - Invoices
  - Companies (company owners; hidden for platform administrators)
  - Support
- The active item is highlighted with the company’s primary brand color.

The sidebar is hidden below the large breakpoint. Search, language, theme, help, and the account menu remain in the top bar.

**Top bar**

- Global search. The query is matched in this order: invoice number, offer number, then customer first name, surname, or organization name. A match opens the matching list with the search applied. With no company selected, search sends the user to the companies page. An empty query returns to the dashboard. If nothing matches, the user lands on the invoice list with the search term.
- Subscription chip (company owners only):
  - Paid plan name, linking to Upgrade.
  - Trial days remaining, linking to Upgrade.
  - “Trial ended” when the trial is over.
- Light / dark theme toggle. The choice is stored in the session.
- Language switcher: English (`en`), French (`fr`), Dutch (`nl`). The choice is stored in the session.
- Help icon, linking to Support.
- Account menu: name, role, email, Profile, and Log out.

**Banners**

- Trial expired: the user can still open existing records, and is pointed to Upgrade.
- Company pending approval: a warning that the company is waiting for approval.

**Shared interface behavior**

- Flash messages appear in a toaster.
- Destructive actions use a confirmation dialog.
- Company brand colors are applied as CSS variables (`--company-primary`, `--company-secondary`) on the signed-in shell and on public quote and briefing pages.
- Lists that come from the server are paginated where the page uses the shared pagination component (offers, invoices, briefings).
- Customers, services, offers, and invoices use soft delete. Deleted records disappear from lists and can be restored only at the database level.

**Empty workspace**

Most modules require an active company. Without one, those pages redirect to the companies list. The dashboard instead shows an empty state with a link to add a company.

---

## 2. Accounts and access

### Registration

`/register` is a split layout: product headline and rotating testimonials on the left, the form on the right.

The form collects:

- Account: name, email, password, password confirmation.
- Company: company name, contact first name and surname, company email, phone, VAT number, street, house number, postal code, city, language, and self-employed activity.

On submit, the account name falls back to first name plus surname, and the company email falls back to the account email. Registration is followed by an email one-time code (`/register/verify`). The code can be resent (rate limited) or the flow can be cancelled. After verification the user is signed in.

A new company starts a 14-day trial the first time defaults are created, and receives a default numbering series and branding (see Profile).

### Sign in

`/login` accepts email and password. Unverified users are sent through email verification. After login, a subscription or trial reminder can be queued for the session (see Subscriptions).

### Password reset

Forgot password is an email OTP flow, not a magic link:

1. Enter email (`/forgot-password`).
2. Enter the code (`/forgot-password/verify`), with resend and cancel.
3. Set a new password (`/reset-password`).

From Profile, the user can also send themselves a password-reset email.

### Other auth pages

- Verify email prompt and signed verification link.
- Confirm password, used when a sensitive action requires the current password.
- Log out ends the session.

### What the user can and cannot do

Writes (create, edit, send, delete) are blocked when:

- No company is selected.
- The paid subscription period has ended. Existing records stay visible. Creating and sending require a renewal.
- The 14-day trial has ended and there is no valid subscription. Same rule: view only.
- The company is inactive (and not merely waiting for approval).
- The action is a send, and the company is still pending approval. Quotations cannot be sent until the company is approved.
- The current plan does not include that capability, or a monthly or total limit has been reached.

Viewing existing customers, services, briefings, offers, and invoices remains available after a trial or subscription ends.

---

## 3. Companies and the workspace

### Company list (`/companies`)

Shown to company owners. Cards summarize total, active, pending, and inactive companies. Filters: all, active, pending, inactive. Each row shows the company name, status, and a way to open or add a company.

### Add company (`/companies/create`)

Same company fields as registration: name, contact, email, phone, VAT, address, language, self-employed activity. Creating another company is a plan capability (`companies.create`). Starter and Growth presets allow one company in total. Scale allows more. The trial allows one company.

If company approval is required by the platform, a new company stays pending. The user sees the pending banner and cannot send documents until it is approved.

### Switcher

The sidebar switcher lists the user’s companies. Choosing one posts to `/company/switch/{company}` and makes that company the active workspace. All customers, services, briefings, offers, and invoices are scoped to that company. Administrators can also clear the workspace and work with no company selected; company owners always work inside a company.

### Company data

Each company stores the owner, contact name, language, self-employed activity, email, phone, VAT number, legal name, street, house number, postal code, city, active flag, approval status, trial dates, and subscription dates.

---

## 4. Dashboard (`/dashboard`)

The home page is the company hub.

**Hero**

- Company name, plus trial days left or “trial ended” when there is no paid plan.
- Open quotations total (sum of draft, sent, pending, and open offers, including VAT).
- Shortcuts: new customer, new briefing, create quotation.

**Briefing activity**

- Up to five active briefings, labeled as awaiting the customer.
- Up to five recent responses. A response that already produced a quote is marked for review and shows the quote number. A response without a quote is marked new.

**Open quotations**

A short table of the five latest open offers: customer, date, status, total. The customer name links to the quote editor.

**Top customers**

The five customers with the highest amount actually paid on their invoices. Customers with zero collected payments are omitted.

**Insights**

- Year-to-date revenue: sum of amounts paid on invoices dated in the current calendar year. Expenses are not tracked, so net result equals that revenue and the screen says expenses are not tracked.
- Cash-flow chart for the last 12 months: paid amounts and outstanding amounts, grouped by invoice date. The expenses series is always zero.
- Payment donut: counts of paid, partial, unpaid, and overdue invoices, plus total outstanding (amount still due on unpaid invoices).
- Days sales outstanding for the last six months: for invoices paid in that month, the average days from invoice date to the last payment date.

---

## 5. Customers

### List (`/customers`)

Stats: total, organizations, individuals, inactive. Filter by organization or individual. Each row shows initials, display name (organization name, otherwise first name and surname), email, type, and status. Rows can be edited or deleted after confirmation.

### Create and edit

Two cards:

**Contact**

- Type: individual or organization.
- Organization name, shown only for organizations.
- First name, surname, email, phone.

**Business details**

- Office address.
- Country.
- VAT / tax number.
- Status (from the customer status list).
- Notes.

Customers also store email-usage flags and additional receivers on the record. Those fields exist in the data model for sending; the form above is what the screen edits.

A customer belongs to the active company. Deleting is a soft delete.

---

## 6. Services

Services are the catalog used on quotation lines, invoice lines, and priced briefing questions.

### List (`/services`)

Shows each service with name, price, unit, billing mode, and status. Stats group the catalog (including inactive). Rows can be edited or deleted.

### Create and edit

**Details:** name and description (shown on quotes).

**Pricing**

- Price.
- Billing mode: fixed price, or hourly.
- Unit. Hourly mode locks the unit to `hour`. Fixed mode accepts a free unit such as piece, project, or day.

Hourly services do not start a timer. On quotes and invoices, quantity is treated as hours and price as the hourly rate. When every priced line is hourly, column headers become “Hours” and “Rate / hour”. Mixed lines use “Qty / hours” and “Price / rate”.

### Approval

If the platform requires service approval, a new service is saved as Pending and the platform is notified. Otherwise it is saved as Active. Only the user’s own company services appear in pickers.

---

## 7. Briefings

A briefing is a shareable questionnaire. Answers can become a draft quotation.

### List (`/briefings`)

Columns: title, customer, status, response count, updated date. Statuses:

- **Draft** — not yet open to respondents.
- **Active** — the public link accepts answers.
- **Closed** — archived; the public form no longer accepts answers.

Actions: edit, duplicate, archive (sets status to closed), open responses. Mobile cards show the same actions.

### Builder (`/briefings/create` and `/briefings/{id}/edit`)

**Settings**

- Internal title.
- Optional linked customer. If empty, the respondent’s name and email are used to find or create a customer when they submit.
- Quote validity in days (default 14). Used as the generated quote’s valid-until date.
- Introduction shown to the respondent.
- **Auto-generate offer.** When on, a draft quote is created as soon as someone submits. When off, the user generates the quote later from the response.

**Share**

- Copy the public link (`/b/{token}`).
- Email the link with an optional message.
- Preview the public form.
- Activate (status becomes active) or close it.
- Save, or delete after confirmation.

**Questions**

Each question has a type, label, optional help text, required flag, sort order, and can be reordered in the builder.

| Type | What the respondent sees | What it does to a quote |
| --- | --- | --- |
| Heading | Section title, not an answer | Ignored |
| Short text | Single line | Included in the quote description only |
| Long text | Paragraph | Included in the quote description only |
| Yes / No | Yes or no | A “yes” adds one priced line from the linked service |
| Single choice | One option | The chosen option becomes one priced line |
| Multiple choice | Several options | Each selected option becomes its own priced line |
| Quantity | A number | Quantity times the linked service (or price override) |
| File upload | A file | The file is stored and attached to the generated quote |

Priced questions can link a catalog service and set a price override. Choice options can carry their own label, service, and price. If a question has no service and no price, it stays in the written summary and does not become a money line.

### Public form (`/b/{token}`)

No login. The page uses the company logo and primary color. The respondent enters name and email, then answers the questions. A progress count shows how many questions are answered. Required questions (except headings) must be answered. Headings are display-only.

On submit:

1. The form is rejected if the briefing is not active.
2. A customer is resolved or created from the name and email when the briefing is not already tied to one.
3. Answers and uploaded files are stored.
4. If auto-generate is on, a draft offer is created immediately.
5. The respondent sees a submitted confirmation. They cannot edit the response from this page.

### Responses (`/briefings/{id}/responses`)

Lists each submission: respondent, email, submitted time, and whether a quote exists. The user can open the generated quote or generate one manually when auto-generate was off or generation was skipped. Generating twice returns the existing quote.

### How a response becomes a quote

The draft quote receives:

- The next offer number from the company’s numbering series.
- Today as the offer date, and today plus the briefing’s validity days as valid-until.
- The briefing introduction.
- A description built as “question: answer” lines.
- Line items from yes/no, single choice, multiple choice, and quantity answers.
- File answers copied on as quote attachments.
- Status Draft, linked back to the response.

Yes/no only prices a line when the answer is yes. Quantity uses the number the respondent entered. Choice prices come from the option, then the question override, then the service price.

---

## 8. Offers (quotations)

### List (`/offers`)

Stats, each as a money total:

- Open (draft, sent, pending, open).
- Expired: still open, and valid-until is in the past. The row status shows Expired even if the stored status is still Sent or Draft.
- Accepted.
- Invoiced.

Filters: all, this year, this month (by offer date).

Table: number, customer, issue date, valid until, type, status, actions, amount. The number opens the editor. Actions include copying the public link. Mobile cards show number, customer, status, amount, and the copy-link action.

**Export** downloads a zip of PDFs for the current filter.

**New offer** opens the editor.

### Editor (`/offers/create` and `/offers/{id}/edit`)

Header actions:

- Copy public link (once the quote exists).
- Preview.
- Save draft.
- Send quote. Disabled when the trial has expired or the company is pending approval. Sending requires a customer.

If the quote came from a briefing, a banner links back to that briefing’s responses.

If the client has accepted or declined, an acceptance panel shows the date, drawn signature, and voice note (with playback and download).

Sections, each collapsible:

**Basic information**

- Title (stored in the introduction structure used by the editor).
- Offer number, read-only, allocated from the numbering series.
- Customer.
- Offer date.
- Quote expiration date.
- Trade name, read-only, from the active company.

**Assignment**

- Introduction and description, both rich text.

**Quotation lines**

- Add a catalog service (pulls name, description, price, and hourly flag).
- Add a custom priced line.
- Add a zero-price note line.
- Edit description, quantity, and price. Line total is quantity times price.
- Running subtotal, VAT, and total. VAT uses the platform default rate (21 percent unless changed).

**Payment terms**

Optional free text.

**Copyright**

- Full ownership transfer.
- License to use.
- Rights remain with the company.
- Optional special conditions.

**Content blocks** (saved on an existing quote)

Drag to reorder. Block types:

- Text.
- Image upload.
- Video URL.
- Table, with an editable grid (legacy markdown tables are still read).

**Email and attachments**

- Email body with merge codes `#CLIENTNAME#`, `#COMPANY#`, and `#OFFERLINK#`.
- PDF attachments uploaded for the email.
- Legal documents marked “attach to quotes by default” are included unless the send step overrides the selection.

### Sending a quote

The send dialog offers:

- **Email.** One or more recipients (the customer email is prefilled and can be split on commas, semicolons, or spaces). Optional message. At least one recipient is required when email is selected.
- **Postbode** (postal), when the company has Postbode configured. Optional registered shipment.

At least one channel is required. Send is refused without a customer, without the send capability, or when the company cannot send (trial, subscription, approval, or inactive).

Email behavior:

- Status becomes Sent.
- The message merge codes are replaced.
- The email includes the quotation PDF, any uploaded PDF attachments, and the selected legal PDFs.
- The public link in the message is `/q/{share token}`.

The postal channel is offered in the same dialog. When Postbode is configured, both quotations and invoices dispatch the document PDF through Postbode (same integration settings under Profile → Integrations).

### Quote statuses the user sees

Draft, Sent, Pending, Open, Accepted, Declined / Rejected, Invoiced, and the computed Expired state described above.

### Quote detail (`/offers/{id}`)

Preview PDF, edit, create an invoice from this quote, and delete (with confirmation). The acceptance panel is shown in full here.

### PDF, preview, and zip

Authenticated preview and download render an A4 PDF (`pdf/offer`) with company branding, customer, lines, VAT, and notes. The public token has the same preview and download. Zip export bundles PDFs for the filtered list.

### Creating an invoice from a quote

`/invoices/from-offer/{offer}` opens a new invoice prefilled from the quote (customer, lines, and the offer link). The quote can later show as invoiced once that relationship exists.

---

## 9. Public quotation (`/q/{token}`)

No login. The client sees the company logo, quotation number, dates, introduction, description, content blocks, line items, VAT, total, payment terms, and notes, styled with the company colors.

While the quote is Sent, Pending, or Open, and has not been accepted or declined, the client can:

- **Accept.** A dialog with two tabs:
  - Draw a signature, or upload a PNG.
  - Record or upload a voice note (mp3, wav, webm, ogg, m4a, up to 5 MB).
  - Signature and voice note are optional. Accepting sets status to Accepted and stores the timestamp, signature image, and voice file.
- **Decline.** Sets `declined_at`. A declined quote cannot be accepted afterward, and an accepted quote cannot be declined.
- **Preview PDF** in a modal, which streams the same A4 PDF.

After a decision, the page shows an accepted or declined banner and hides the action buttons.

The company user plays the voice note on the quote and can download the file.

---

## 10. Invoices

### List (`/invoices`)

Stats:

- Outstanding (amount still due).
- Overdue (due date passed and not paid).
- Paid year to date.
- Count of invoices sent through Peppol.

Filters: all, paid, unpaid.

Table: number, customer, issue date, due date (highlighted when overdue), type, status, amount. Drafts open the editor. Other invoices open the detail page.

Type is **credit** when the number starts with the credit-note series or the total is negative, otherwise **standard**.

**Export** downloads a zip of invoice PDFs for the current filter.

### Editor (`/invoices/create` and `/invoices/{id}/edit`)

Collapsible sections:

- **Basic:** invoice number (from the numbering series), customer, invoice date, due date, link to a source offer when present.
- **Assignment:** introduction and description (rich text).
- **Lines:** the same line editor as quotes, including hourly services and VAT.
- **Copyright:** full ownership transfer or license to use. The stored legal paragraph is generated from that choice and the company name. Full transfer assigns rights to the customer on full payment. License to use keeps rights with the company and grants a non-exclusive license.
- **Comments / notes.**
- **Email attachments:** PDF files, and an email body with merge codes `#CLIENTNAME#`, `#COMPANY#`, `#INVOICENUMBER#`, and `#PAYLINK#`.

If a sent invoice was changed in a way that requires another send, a banner says it must be resent. Sending clears that flag.

### Detail (`/invoices/{id}`)

Header: number, customer, date, document status, payment status.

Actions:

- Preview PDF (when not a draft).
- Edit.
- Send.
- Payment reminder, when the invoice is not a draft, not fully paid, and the customer has an email.
- Credit note, when the invoice is not a draft and not fully paid.
- Delete, drafts only.

**Recurring**

A checkbox turns the invoice into a template. Interval: weekly, monthly, or yearly. Saving stores the next run date (one interval from today, or a new date if the interval changed). Turning it off clears the next run.

A scheduled command (`invoices:generate-recurring`) copies due templates into new **draft** invoices. It copies lines, notes, copyright terms, email message, and PDF attachments. It assigns a new invoice number, sets the due date 30 days out, does not send or collect payment, and links the copy to the template. The template’s next run moves forward by the interval.

**On-screen status**

- Mollie checkout link, when one exists.
- Peppol sent date.
- Postbode sent date and postal status.
- Payment history: date, method, amount.
- Amount due.
- Attachment list. Drafts can upload or remove PDFs.

The body is a branded invoice preview: sender, recipient, scope, lines, notes, copyright text, and totals.

### Sending an invoice

Channels in the send dialog:

| Channel | When it appears | What happens |
| --- | --- | --- |
| Email | Always | PDF, optional UBL XML, extra PDF attachments, and selected legal PDFs. Optional CC to the company email. |
| WhatsApp | Always | After a successful send, opens `wa.me` with a prewritten line: invoice number, amount due, and due date. WhatsApp itself is a share link, not a server-side message. |
| Peppol | Always listed; disabled until platform Peppol credentials exist | Posts UBL to the configured Peppol endpoint and stamps `peppol_sent_at`. |
| Postbode | When the company integration is configured | Sends the invoice by post through Postbode. Registered shipment can be toggled. Stores postal id, status, and customer reference. |
| Mollie | When the company Mollie key is set and the invoice is not paid | Creates a checkout for the amount due and can place the pay link in the email via `#PAYLINK#`. |

Email plus Mollie together still creates the checkout so the pay link can be merged into the email. A draft becomes Sent. `needs_resend` is cleared.

Send requires a customer and the invoice-send capability, and is blocked by the same trial, subscription, approval, and inactive rules as quotes.

### Reminders

The reminder dialog sends an email with a custom message and the invoice PDF to one address. It does not change the payment status.

### Credit notes

Creates a new draft invoice:

- Number from the credit-note series (numbers are recognizable as credit notes, including a `CRN` prefix in the list logic).
- Same customer, source offer, introduction, and notes.
- Description “Credit note for {original number}”.
- Each line quantity negated.
- Linked to the original invoice as its parent.
- Opens in the editor so the user can adjust and send it.

### Payments

Payment status is one of unpaid, partial, or paid.

- Paid when the status is paid or the amount due is zero or less.
- Partial when some amount has been recorded and a balance remains.
- Overdue when the due date is in the past and the invoice is not paid. Overdue wins over “Sent” in the list.

Recording a payment stores amount, date, method, reference, and notes, then recalculates status. Methods: bank transfer, cash, credit card, PayPal, other, and Mollie (set by the payment webhook). The invoice page lists payments. Mollie payments are written automatically when the webhook confirms them. There is a payment endpoint for manual recording; the invoice screen itself does not include a “record payment” form.

### UBL

`/invoices/{id}/ubl` downloads the invoice as UBL XML. The same XML can be attached to the send email or posted to Peppol.

### PDF

Preview and download use an A4 invoice PDF with branding, lines, VAT, and payment state.

---

## 11. Integrations (company profile)

Configured on the profile page, per company. Secrets are stored encrypted. The user picks an active environment: **test** or **live**. Test mode falls back to the live key only when the test secret is empty.

### Mollie (customer payments and, separately, Offacto subscriptions)

- Test API key and live API key. Blank fields keep the saved key.
- Used to create an invoice checkout in EUR for the amount due.
- The customer returns to `/payment/mollie/return`.
- Mollie’s webhook at `/webhooks/mollie` confirms the payment and records an invoice payment with method `mollie`, then updates paid / partial / unpaid.

Subscription checkout for Offacto’s own plans uses the platform Mollie account, not these company keys.

### Postbode (postal mail)

- API version v1 or v2.
- Test token and live token.
- v2: mailbox code and envelope id.
- v1: mailbox id and envelope id (default envelope 2).
- Default country (default `NL`).
- Registered mail default.
- Send immediately default.
- A **Test connection** button calls Postbode and shows success or failure.

Postbode is offered on invoice send when those fields are complete, and on the quote send dialog when configured. Invoice send performs the postal dispatch. Quote send records a queued status (see Offers).

### Peppol

Peppol credentials are platform configuration, not company keys. The invoice send dialog shows Peppol as disabled until that platform endpoint and token exist. A successful send stores the sent timestamp. The invoice list counts how many invoices have been sent this way.

### WhatsApp

No WhatsApp API key. Choosing WhatsApp on invoice send opens the user’s WhatsApp (or WhatsApp Web) with a text summary after the invoice send request succeeds.

---

## 12. Profile (`/profile`)

Opened from the account menu.

**Account**

- Full name and email.
- Save.
- Send password reset.

**Company information** (active company)

- Company name, first name, surname, email, phone, VAT, street, house, postal code, city, language, self-employed activity.
- If there is no company, a link to add one.

**Numbering series**

See the numbering section below.

**Trial and plan**

- Trial active or expired, with start and end dates.
- Current plan name when subscribed.
- Upgrade call to action.

**Branding**

- Invoice logo upload, used in the sidebar, PDFs, emails (when enabled), and public pages.
- “Use logo in emails” toggle.
- Primary and accent colors. Primary drives the active navigation bar and public pages.

**Integrations**

The Mollie and Postbode panel described above.

**Legal documents**

Upload a PDF as terms, contract, or other. Each file can be marked “attach to quotes by default.” Files can be replaced or deleted. Send dialogs can override which of these files go out with a quote or invoice.

**Delete account**

Requires the current password. This removes the user account.

---

## 13. Numbering

Each company can keep several numbering series. A series has:

- Name.
- Type: invoices, offers, or both.
- Prefix.
- Period token: full year, short year, year+month, or short year+month.
- Separator.
- Digit width (default 4).
- Next number.
- Optional suffix.
- Restart: the counter can reset when the year (or the series’ restart rule) changes.

Preview example with the defaults created for a new company: `OFF_2026-0001`.

The active series is chosen in company settings. Offers and invoices pull the next number from the series that matches their type (or type “both”). Allocation locks the row, resets the counter when the period changed, returns the formatted number, and increments the counter. Credit notes use a separate credit-note number generator so they stay distinct in the invoice list.

---

## 14. Subscriptions and plans (`/upgrade`)

Reached from the top-bar chip, the trial banner, and the profile trial card.

### Trial

14 days from the moment company defaults are created. During the trial the workspace gets a generous capability set: most features on, Peppol off, 50 offers per month, 50 invoices per month, 200 customers total, 1 company. After the trial, without a paid plan, create and send are blocked. Lists and detail pages still open.

### Plans

Plans are loaded from the platform catalog. The seeded commercial plans are monthly, in euros:

| Plan | Price | Position | Included in the preset |
| --- | --- | --- | --- |
| Starter | €29 | — | Quotes, invoices, customers, briefings, email. No recurring invoices, Mollie, Peppol, or Postbode. One company. |
| Growth | €59 | Highlighted as popular | Starter, plus recurring invoices, Mollie payment links, and Postbode. Peppol off. One company. |
| Scale | €99 | — | Everything on, including Peppol and multiple companies. |

Feature bullets and exact entitlements can be edited in platform settings; the upgrade page renders whatever plans are active. The current plan is marked and cannot be selected again. A plan the user is not allowed to move down to is shown as unavailable. Checkout is disabled when platform Mollie is not configured.

Choosing a plan posts to `/upgrade`, which starts a Mollie checkout on the **platform** account. The return URL is `/upgrade/callback`. A successful payment extends the company one month from today, or from the existing end date if it is still in the future. The plan slug, start date, and end date are stored, and a pending cancellation is cleared.

### Billing management (while a subscription is valid)

- Shows the renewal date, or the date access ends if cancellation is pending.
- Email reminder toggle (per user).
- Cancel plan: sets cancel-at-period-end. Access continues until `subscription_ends_at`, then the subscription is treated as expired.

Downgrade in the middle of a period is not offered as a self-serve switch.

### Reminders

On login, if the trial or subscription ends within the platform reminder window (default 7 days), or the subscription has already expired, a modal can appear. The user can dismiss it for the session. Admins do not see it. The modal respects the user’s email-reminder preference for the ongoing email notices; dismissing only hides the in-app modal.

---

## 15. Plan limits (what the workspace enforces)

Capabilities are checked on the matching action. Limits are checked when creating a record.

| Area | Capabilities | Limit key |
| --- | --- | --- |
| Offers | access, create, update, delete, send, Postbode, Peppol, attachments, public accept | offers (monthly and/or total) |
| Invoices | access, create, update, delete, send, reminder, recurring, credit note, Mollie, Postbode, Peppol, attachments, record payment | invoices |
| Customers | access, create, update, delete | customers |
| Services | access, create, update, delete | services |
| Briefings | access, create, update, delete, public form, generate quote | briefings |
| Workspace | create company, invite team, manage roles, company settings, dashboard reports | companies, plus team users |
| Integrations | Mollie, Postbode, Peppol, WhatsApp | — |

A null limit means unlimited. Monthly counts reset at the start of the calendar month. Totals count all records for the company (soft-deleted rows follow the model’s default query, so deleted rows are not counted). Company limits count companies owned by the same user.

Team invite and role management appear in the entitlement catalog. The company workspace documented here does not include a team-member screen; those capabilities are reserved for plans and are not a separate menu.

---

## 16. Support (`/support`)

A single information page linked from the sidebar and the help icon. It does not open a ticket form. The upgrade page also links here for billing help.

---

## 17. Cross-cutting logic

**VAT.** Subtotal is the sum of line totals (quantity × unit price). Tax is subtotal × the platform VAT rate. Total is subtotal + tax. The rate is not chosen per line.

**Line items.** Every priced row stores a service id, description, quantity, price, and total. A “note” line is a zero-price row. Changing the selected service refills the description and price when those were empty or tied to the previous service.

**Documents and customers.** Offers and invoices can be saved against a customer. Sending requires one. Public briefing submissions create a customer when they need to.

**Share tokens.** Offers and briefings get a random 40-character token on create. Public URLs are `/q/{token}` and `/b/{token}`.

**Email merge codes**

- Quotes: `#CLIENTNAME#`, `#COMPANY#`, `#OFFERLINK#`.
- Invoices: `#CLIENTNAME#`, `#COMPANY#`, `#INVOICENUMBER#`, `#PAYLINK#` (empty when there is no Mollie checkout).

The client name is the person’s name, or the organization name when the person name is empty.

**Branding on output.** PDFs, emails, the sidebar, and public pages use the invoice logo and theme colors. Emails include the logo when “logo in emails” is on.

**Statuses.** Offers, invoices, customers, services, and companies use a shared status table, filtered by what the status is for. Payment status on invoices is separate from document status (Draft / Sent).

**Files.** Uploads (logos, legal PDFs, quote and invoice attachments, briefing files, block images, signatures, voice notes) are stored on the public disk and served from `/storage/...` where a public URL is needed. Signature image data on the offer is not exposed in normal API payloads.

**Locale and theme.** Both are session values, not profile fields. Company language is a company profile field used as company data, separate from the UI locale switcher.

**Search** does not open a results page. It redirects to the best list.

**Confirmation and errors.** Deletes, credit notes, archive, and subscription cancel ask for confirmation. Entitlement and access failures come back as an error toast with a specific reason (trial ended, pending approval, missing feature, or limit reached).

---

## 18. Page map (workspace and public)

| Path | Who | Purpose |
| --- | --- | --- |
| `/register`, `/register/verify` | Guest | Create account and company, confirm email OTP |
| `/login` | Guest | Sign in |
| `/forgot-password`, `/forgot-password/verify`, `/reset-password` | Guest | OTP password reset |
| `/verify-email` | Signed in | Email verification prompt |
| `/dashboard` | Signed in | Company hub |
| `/search` | Signed in | Redirect search |
| `/customers`, create, edit | Signed in | Customer directory |
| `/services`, create, edit | Signed in | Service catalog |
| `/briefings`, create, edit, responses | Signed in | Briefing builder and answers |
| `/b/{token}` | Public | Answer a briefing |
| `/offers`, create, edit, show | Signed in | Quotations |
| `/offers/export-zip`, preview, download | Signed in | PDF export |
| `/q/{token}` | Public | View, accept, or decline a quote; PDF |
| `/invoices`, create, edit, show | Signed in | Invoices |
| `/invoices/from-offer/{offer}` | Signed in | Invoice prefilled from a quote |
| `/invoices/export-zip`, preview, download, UBL | Signed in | PDF and UBL |
| `/companies`, `/companies/create` | Company owner | Company list and add |
| `/profile` | Signed in | Account, company, branding, numbering, integrations, legal |
| `/upgrade` | Signed in | Plans and billing |
| `/support` | Signed in | Help text |
| `/payment/mollie/return` | Customer returning from Mollie | Payment return |
| `/webhooks/mollie` | Mollie | Payment confirmation |

---

## 19. Typical flows

**New freelancer**

Register → email code → land in a company on a 14-day trial → add customers and services → write a quote → send by email → client opens `/q/...`, accepts with a signature → create an invoice from the quote → send by email, with a Mollie pay link if Growth or Scale and Mollie is connected.

**Briefing first**

Build questions, link services and prices, activate, copy or email the link → client submits `/b/...` → a draft quote appears (or the user generates it) → user reviews lines and sends.

**Recurring work**

Send the first invoice, mark it recurring monthly → the scheduler later drops a new draft with the same lines → user reviews and sends that draft. The template itself is not emailed by the scheduler.

**Trial ends**

The top bar and a banner point to Upgrade. Existing quotes and invoices stay readable. Create, edit, and send stop until a plan is paid. A modal can warn during the last days of the trial or subscription.
