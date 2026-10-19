/** Human-friendly option catalogs for admin settings UI (avoid raw keys/paths in forms). */

export const TIMEZONE_OPTIONS = [
    { value: 'Europe/Brussels', label: 'Belgium (Brussels)' },
    { value: 'Europe/Amsterdam', label: 'Netherlands (Amsterdam)' },
    { value: 'Europe/Paris', label: 'France (Paris)' },
    { value: 'UTC', label: 'UTC' },
];

export const SLA_PRIORITY_LABELS = {
    urgent: 'Urgent — respond within (hours)',
    high: 'High priority — respond within (hours)',
    normal: 'Normal — respond within (hours)',
    low: 'Low — respond within (hours)',
};

export const WORKING_DAY_PRESETS = [
    { value: 'Mon-Fri', label: 'Monday to Friday' },
    { value: 'Mon-Sat', label: 'Monday to Saturday' },
    { value: 'Mon-Sun', label: 'Every day' },
];

export const ESCALATION_TYPES = [
    { value: 'sla_breach', label: 'Response time exceeded' },
    { value: 'customer_escalation', label: 'Customer asked for a manager' },
    { value: 'billing_dispute', label: 'Billing or payment dispute' },
    { value: 'security_concern', label: 'Security or abuse concern' },
    { value: 'integration_outage', label: 'Integration or delivery failure' },
];

export const SUPPORT_TEAMS = [
    { value: 'tier1', label: 'First-line support' },
    { value: 'tier2', label: 'Specialist support' },
    { value: 'billing', label: 'Billing team' },
    { value: 'engineering', label: 'Engineering on-call' },
];

export const NOTIFICATION_EVENTS = [
    { value: 'invoice.sent', label: 'Invoice sent to customer' },
    { value: 'offer.sent', label: 'Quotation sent to customer' },
    { value: 'subscription.expiring', label: 'Subscription expiring soon' },
    { value: 'payment.received', label: 'Payment received' },
    { value: 'payment.failed', label: 'Payment failed' },
    { value: 'company.approved', label: 'Company approved' },
];

export const NOTIFICATION_ROLES = [
    { value: 'owner', label: 'Company owner' },
    { value: 'admin', label: 'Company admin' },
    { value: 'member', label: 'Team member' },
];

export const MERGE_CODE_CONTEXTS = [
    { value: 'invoice', label: 'Invoices' },
    { value: 'offer', label: 'Quotations' },
    { value: 'subscription', label: 'Subscriptions' },
    { value: 'account', label: 'Account emails' },
];

export const PRIVILEGED_SOD_ACTIONS = [
    { value: 'permanent_delete', label: 'Permanent deletion' },
    { value: 'bulk_export', label: 'Bulk export of customer data' },
    { value: 'refund_issue', label: 'Issue a refund' },
    { value: 'credential_change', label: 'Change integration credentials' },
    { value: 'company_suspend', label: 'Suspend a company' },
    { value: 'settings_restore', label: 'Restore platform settings' },
    { value: 'subscription_adjustment', label: 'Change a subscription' },
    { value: 'disclosure_approval', label: 'Approve a data disclosure' },
    { value: 'deletion_job_approve', label: 'Approve a deletion job' },
];

export const INTEGRATION_API_SCOPES = [
    { value: 'read', label: 'Read-only access' },
    { value: 'write', label: 'Create and update records' },
    { value: 'webhooks', label: 'Manage webhooks' },
];

export const RUNBOOK_CATEGORIES = [
    { value: 'outage', label: 'Service outage' },
    { value: 'integration', label: 'Integration problem' },
    { value: 'payment', label: 'Payments' },
    { value: 'security', label: 'Security incident' },
    { value: 'restore', label: 'Backup & restore' },
];

export const BACKUP_REGIONS = [
    { value: 'EEA', label: 'European Economic Area' },
    { value: 'BE', label: 'Belgium' },
    { value: 'EU', label: 'European Union (other)' },
    { value: 'US', label: 'United States' },
];

/** Common translation phrase keys → plain label (stored key stays internal). */
export const TRANSLATION_PHRASE_OPTIONS = [
    { value: 'common.save', label: 'Save button' },
    { value: 'common.cancel', label: 'Cancel button' },
    { value: 'common.delete', label: 'Delete button' },
    { value: 'dashboard.title', label: 'Dashboard title' },
    { value: 'invoices.title', label: 'Invoices page title' },
    { value: 'offers.title', label: 'Quotations page title' },
    { value: 'customers.title', label: 'Customers page title' },
];

export const WORKSPACE_EXTRA_DEFAULTS = [
    { key: 'invoice_numbering_prefix', label: 'Invoice number prefix', type: 'text', placeholder: 'INV' },
    { key: 'offer_validity_days', label: 'Quotation validity (days)', type: 'number', min: 1, max: 365 },
    { key: 'default_vat_rate', label: 'Default VAT rate (%)', type: 'number', min: 0, max: 100 },
];

export function slugifyLabel(text) {
    return String(text || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 128);
}

export function normalizeSelectOptions(options = []) {
    return options.map((opt) => (typeof opt === 'object' && opt !== null && 'value' in opt ? opt : { value: opt, label: String(opt) }));
}

export const MAIL_DRIVER_LABELS = {
    smtp: 'SMTP (your email host)',
    postmark: 'Postmark',
    resend: 'Resend',
    ses: 'Amazon SES',
    log: 'Log only (development — no real send)',
};

export const SMTP_ENCRYPTION_LABELS = {
    tls: 'TLS (recommended, port 587)',
    ssl: 'SSL (often port 465)',
    none: 'None (not recommended)',
};

export const INBOUND_PROVIDER_LABELS = {
    postmark: 'Postmark inbound',
    mailgun: 'Mailgun routes',
    sendgrid: 'SendGrid inbound parse',
    generic: 'Generic JSON webhook',
};

export const INBOUND_MODE_LABELS = {
    webhook: 'Provider webhook (recommended)',
    forward_only: 'Manual / forward only (no automatic ticket)',
};

export function labelForSelectOption(fieldKey, value) {
    const maps = {
        int_mail_driver: MAIL_DRIVER_LABELS,
        int_smtp_encryption: SMTP_ENCRYPTION_LABELS,
        comm_inbound_provider: INBOUND_PROVIDER_LABELS,
        comm_inbound_mode: INBOUND_MODE_LABELS,
    };
    const map = maps[fieldKey];
    return map?.[value] ?? value;
}
