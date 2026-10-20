# Batch 1 operator actions

These steps are required after deploying the Batch 1 security fixes. They are not performed automatically.

## MFA enrollment (AUD-P0-001)

1. Leave **Security → Require MFA for platform admins** **off** until at least one admin has enrolled.
2. Sign in as a platform admin and open `/admin/mfa/enroll`.
3. Confirm your password, add the displayed secret to an authenticator app, then enter the 6-digit code.
4. Store the recovery codes shown **once**. Each code works a single time.
5. After every admin who needs access has enrolled, turn the MFA setting **on**.
6. Admins who have not enrolled are sent to setup instead of being locked out. Lost-device recovery: use a recovery code, then enroll a new authenticator immediately.
7. MFA cannot be disabled while the setting is on.

There is no undocumented break-glass bypass.

## Inbound email (AUD-P0-002 / AUD-P2-002)

1. Configure the provider to send `X-Inbound-Secret` (or `X-Webhook-Secret`). Query-string `?secret=` is rejected.
2. Provider HMAC signatures are **not** verified. Treat the shared secret as the only inbound authenticator until a provider-specific signature is implemented.
3. Rotate `comm_inbound_webhook_secret` if it may have appeared in access logs from the previous query-string support.

## Webhook signing secrets (AUD-P1-021)

Admin Inertia responses no longer include outbound webhook `signing_secret` values. If that admin page was opened in a browser, proxy, or log while the previous code was deployed, **rotate those signing secrets** in the connected systems. This report does not claim a confirmed leak.

## Platform secrets at rest (AUD-P2-027)

SMTP, Postmark, Resend, Mollie, Peppol, and inbound webhook secrets in `site_settings` are encrypted with the application key (`APP_KEY`). Keep `APP_KEY` out of source control and data exports. Existing plaintext rows are encrypted on migrate. Do not rotate live provider credentials unless you also intend to update them in the admin UI.

## Workspace access (AUD-P1-003)

Entering a company workspace requires an approved, unexpired access request **only when** **Support → Require access approval** is enabled. The previous unread default is treated as off until you turn it on.

## Production job retries (AUD-P1-022 / AUD-P2-010)

Destructive governance actions and failed-job retries now follow `APP_ENV=production`, not the editable environment label. Mail, payment, and similar jobs cannot be replayed from admin. Relabeling the UI environment to “staging” does not weaken this.
