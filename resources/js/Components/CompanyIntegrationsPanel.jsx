import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { t } from '../lib/i18n';
import Icon from './Icon';

const fieldClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100';

function SecretInput({ label, hint, placeholder, value, onChange, set }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
            <input
                type="password"
                autoComplete="off"
                className={fieldClass}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={false}
            />
            {set && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </label>
    );
}

function IntegrationToggle({ enabled, onChange, label, hint }) {
    return (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div>
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => onChange(!enabled)}
                className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${enabled ? 'left-5' : 'left-0.5'}`} />
            </button>
        </div>
    );
}

export default function CompanyIntegrationsPanel({ integrations = {}, links = {}, settingsBasePath = '/company/settings' }) {
    const form = useForm({
        integrations_mode: integrations.integrations_mode || 'test',
        mollie_enabled: integrations.mollie_enabled ?? true,
        postbode_enabled: integrations.postbode_enabled ?? true,
        peppol_enabled: integrations.peppol_enabled ?? false,
        mollie_test_key: '',
        mollie_live_key: '',
        postbode_test_token: '',
        postbode_live_token: '',
        peppol_test_endpoint: integrations.peppol_test_endpoint || '',
        peppol_live_endpoint: integrations.peppol_live_endpoint || '',
        peppol_test_token: '',
        peppol_live_token: '',
        postbode_mailbox_code: integrations.postbode_mailbox_code || '',
        postbode_envelope_uuid: integrations.postbode_envelope_uuid || '',
        postbode_v1_mailbox_id: integrations.postbode_v1_mailbox_id || '',
        postbode_v1_envelope_id: integrations.postbode_v1_envelope_id ?? 2,
        postbode_default_country: integrations.postbode_default_country || 'NL',
        postbode_registered: integrations.postbode_registered ?? false,
        postbode_send_immediately: integrations.postbode_send_immediately ?? true,
        postbode_api_version: integrations.postbode_api_version || 'v2',
        whatsapp_enabled: integrations.whatsapp_enabled ?? true,
        whatsapp_use_customer_phone: integrations.whatsapp_use_customer_phone ?? true,
        whatsapp_business_phone: integrations.whatsapp_business_phone || '',
        whatsapp_invoice_template: integrations.whatsapp_invoice_template || '',
        whatsapp_quotation_template: integrations.whatsapp_quotation_template || '',
        whatsapp_api_enabled: integrations.whatsapp_api_enabled ?? false,
        whatsapp_api_phone_number_id: integrations.whatsapp_api_phone_number_id || '',
        whatsapp_api_access_token: '',
        creditsafe_enabled: integrations.creditsafe_enabled ?? false,
        creditsafe_test_api_key: '',
        creditsafe_live_api_key: '',
    });

    const [testing, setTesting] = useState(false);
    const [testMessage, setTestMessage] = useState('');

    const save = (e) => {
        e.preventDefault();
        form.patch(`${settingsBasePath}/integrations`, { preserveScroll: true });
    };

    const testConnection = async () => {
        setTesting(true);
        setTestMessage('');
        try {
            const token = document.cookie.split('; ').find((r) => r.startsWith('XSRF-TOKEN='));
            const xsrf = token ? decodeURIComponent(token.split('=')[1]) : '';
            const res = await fetch(`${settingsBasePath}/integrations/postbode/test`, {
                method: 'POST',
                headers: { Accept: 'application/json', 'X-XSRF-TOKEN': xsrf },
                credentials: 'same-origin',
            });
            const data = await res.json();
            setTestMessage(data.message || (data.ok ? t('integrations.postbode_test_ok') : t('integrations.postbode_test_fail')));
        } catch {
            setTestMessage(t('integrations.postbode_test_fail'));
        } finally {
            setTesting(false);
        }
    };

    const sectionMuted = (enabled) => (!enabled ? 'opacity-60 pointer-events-none' : '');

    return (
        <form onSubmit={save} className="space-y-8">
            <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">{t('integrations.active_environment')}</label>
                <select
                    className={fieldClass}
                    value={form.data.integrations_mode}
                    onChange={(e) => form.setData('integrations_mode', e.target.value)}
                >
                    <option value="test">{t('integrations.env_test')}</option>
                    <option value="live">{t('integrations.env_live')}</option>
                </select>
                <p className="mt-1 text-xs text-slate-500">{t('integrations.env_hint')}</p>
            </div>

            <section className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <IntegrationToggle
                    enabled={!!form.data.mollie_enabled}
                    onChange={(v) => form.setData('mollie_enabled', v)}
                    label={t('integrations.mollie_enable')}
                    hint={t('integrations.mollie_enable_hint')}
                />
                <div className={`space-y-4 ${sectionMuted(form.data.mollie_enabled)}`}>
                    <div className="flex items-center gap-2">
                        <Icon name="invoice" className="h-4 w-4 text-indigo-600" />
                        <h3 className="text-sm font-semibold text-slate-900">{t('integrations.mollie_title')}</h3>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-600">{t('integrations.mollie_body')}</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <SecretInput
                            label={t('settings.mollie_test_key')}
                            placeholder={integrations.mollie_test_key_set ? t('integrations.key_keep') : 'test_…'}
                            value={form.data.mollie_test_key}
                            onChange={(v) => form.setData('mollie_test_key', v)}
                            set={integrations.mollie_test_key_set}
                            hint={t('integrations.key_keep')}
                        />
                        <SecretInput
                            label={t('settings.mollie_live_key')}
                            placeholder={integrations.mollie_live_key_set ? t('integrations.key_keep') : 'live_…'}
                            value={form.data.mollie_live_key}
                            onChange={(v) => form.setData('mollie_live_key', v)}
                            set={integrations.mollie_live_key_set}
                            hint={t('integrations.key_keep')}
                        />
                    </div>
                    <p className={`text-xs font-medium ${integrations.mollie_configured ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {integrations.mollie_configured ? t('settings.mollie_ready') : t('integrations.mollie_off_or_missing')}
                    </p>
                </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <IntegrationToggle
                    enabled={!!form.data.postbode_enabled}
                    onChange={(v) => form.setData('postbode_enabled', v)}
                    label={t('integrations.postbode_enable')}
                    hint={t('integrations.postbode_enable_hint')}
                />
                <div className={`space-y-4 ${sectionMuted(form.data.postbode_enabled)}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Icon name="send" className="h-4 w-4 text-indigo-600" />
                            <h3 className="text-sm font-semibold text-slate-900">{t('integrations.postbode_title')}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                            {links.postbode_tokens && (
                                <a href={links.postbode_tokens} target="_blank" rel="noreferrer" className="font-medium text-indigo-600 hover:text-indigo-500">
                                    {t('integrations.postbode_create_token')}
                                </a>
                            )}
                            {links.postbode_docs && (
                                <a href={links.postbode_docs} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-700">
                                    {t('integrations.postbode_api_docs')}
                                </a>
                            )}
                        </div>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-600">{t('integrations.postbode_body')}</p>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <SecretInput
                            label={t('integrations.postbode_test_token')}
                            placeholder={integrations.postbode_test_token_set ? t('integrations.key_keep') : 'Bearer token (test)'}
                            value={form.data.postbode_test_token}
                            onChange={(v) => form.setData('postbode_test_token', v)}
                            set={integrations.postbode_test_token_set}
                            hint={t('integrations.key_keep')}
                        />
                        <SecretInput
                            label={t('integrations.postbode_live_token')}
                            placeholder={integrations.postbode_live_token_set ? t('integrations.key_keep') : 'Bearer token (live)'}
                            value={form.data.postbode_live_token}
                            onChange={(v) => form.setData('postbode_live_token', v)}
                            set={integrations.postbode_live_token_set}
                            hint={t('integrations.key_keep')}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-slate-700">{t('integrations.postbode_api_version')}</span>
                            <select className={fieldClass} value={form.data.postbode_api_version} onChange={(e) => form.setData('postbode_api_version', e.target.value)}>
                                <option value="v2">{t('integrations.postbode_v2')}</option>
                                <option value="v1">{t('integrations.postbode_v1')}</option>
                            </select>
                        </label>
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-slate-700">{t('integrations.postbode_country')}</span>
                            <input className={fieldClass} maxLength={2} value={form.data.postbode_default_country} onChange={(e) => form.setData('postbode_default_country', e.target.value.toUpperCase())} />
                        </label>
                    </div>

                    {form.data.postbode_api_version === 'v2' ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-slate-700">{t('integrations.postbode_mailbox')}</span>
                                <input className={fieldClass} placeholder="PSBD" value={form.data.postbode_mailbox_code} onChange={(e) => form.setData('postbode_mailbox_code', e.target.value.toUpperCase())} />
                            </label>
                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-slate-700">{t('integrations.postbode_envelope')}</span>
                                <input className={fieldClass} placeholder="Envelope UUID" value={form.data.postbode_envelope_uuid} onChange={(e) => form.setData('postbode_envelope_uuid', e.target.value)} />
                            </label>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-slate-700">{t('integrations.postbode_v1_mailbox')}</span>
                                <input type="number" className={fieldClass} value={form.data.postbode_v1_mailbox_id} onChange={(e) => form.setData('postbode_v1_mailbox_id', e.target.value)} />
                            </label>
                            <label className="block">
                                <span className="mb-1.5 block text-sm font-medium text-slate-700">{t('integrations.postbode_v1_envelope')}</span>
                                <input type="number" className={fieldClass} value={form.data.postbode_v1_envelope_id} onChange={(e) => form.setData('postbode_v1_envelope_id', e.target.value)} />
                            </label>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked={form.data.postbode_registered} onChange={(e) => form.setData('postbode_registered', e.target.checked)} />
                            {t('integrations.postbode_registered_default')}
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked={form.data.postbode_send_immediately} onChange={(e) => form.setData('postbode_send_immediately', e.target.checked)} />
                            {t('integrations.postbode_send_immediately')}
                        </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button type="button" disabled={testing} onClick={testConnection} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                            {testing ? t('integrations.testing') : t('integrations.postbode_test')}
                        </button>
                        {testMessage && <p className="text-xs text-slate-600">{testMessage}</p>}
                    </div>
                    <p className={`text-xs font-medium ${integrations.postbode_configured ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {integrations.postbode_configured ? t('integrations.postbode_ready') : t('integrations.postbode_off_or_missing')}
                    </p>
                </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <IntegrationToggle
                    enabled={!!form.data.peppol_enabled}
                    onChange={(v) => form.setData('peppol_enabled', v)}
                    label={t('integrations.peppol_enable')}
                    hint={t('integrations.peppol_enable_hint')}
                />
                <div className={`space-y-4 ${sectionMuted(form.data.peppol_enabled)}`}>
                    <div className="flex items-center gap-2">
                        <Icon name="peppol" className="h-4 w-4 text-indigo-600" />
                        <h3 className="text-sm font-semibold text-slate-900">{t('integrations.peppol_title')}</h3>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-600">{t('integrations.peppol_body')}</p>
                    {integrations.peppol_platform_fallback && (
                        <p className="rounded-lg border border-indigo-100 bg-white px-3 py-2 text-xs text-slate-600">{t('integrations.peppol_platform_fallback')}</p>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-slate-700">{t('integrations.peppol_test_endpoint')}</span>
                            <input className={fieldClass} value={form.data.peppol_test_endpoint} onChange={(e) => form.setData('peppol_test_endpoint', e.target.value)} placeholder="https://…" />
                        </label>
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-slate-700">{t('integrations.peppol_live_endpoint')}</span>
                            <input className={fieldClass} value={form.data.peppol_live_endpoint} onChange={(e) => form.setData('peppol_live_endpoint', e.target.value)} placeholder="https://…" />
                        </label>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <SecretInput
                            label={t('integrations.peppol_test_token')}
                            placeholder={integrations.peppol_test_token_set ? t('integrations.key_keep') : t('integrations.peppol_token_placeholder')}
                            value={form.data.peppol_test_token}
                            onChange={(v) => form.setData('peppol_test_token', v)}
                            set={integrations.peppol_test_token_set}
                            hint={t('integrations.key_keep')}
                        />
                        <SecretInput
                            label={t('integrations.peppol_live_token')}
                            placeholder={integrations.peppol_live_token_set ? t('integrations.key_keep') : t('integrations.peppol_token_placeholder')}
                            value={form.data.peppol_live_token}
                            onChange={(v) => form.setData('peppol_live_token', v)}
                            set={integrations.peppol_live_token_set}
                            hint={t('integrations.key_keep')}
                        />
                    </div>
                    <p className={`text-xs font-medium ${integrations.peppol_configured ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {integrations.peppol_configured ? t('integrations.peppol_ready') : t('integrations.peppol_off_or_missing')}
                    </p>
                </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <IntegrationToggle
                    enabled={!!form.data.whatsapp_enabled}
                    onChange={(v) => form.setData('whatsapp_enabled', v)}
                    label={t('integrations.whatsapp_enable')}
                    hint={t('integrations.whatsapp_enable_hint')}
                />
                <div className={`space-y-4 ${sectionMuted(form.data.whatsapp_enabled)}`}>
                    <div className="flex items-center gap-2">
                        <Icon name="whatsapp" className="h-4 w-4 text-emerald-600" />
                        <h3 className="text-sm font-semibold text-slate-900">{t('integrations.whatsapp_title')}</h3>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-600">{t('integrations.whatsapp_body')}</p>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={!!form.data.whatsapp_use_customer_phone}
                            onChange={(e) => form.setData('whatsapp_use_customer_phone', e.target.checked)}
                        />
                        {t('integrations.whatsapp_use_customer_phone')}
                    </label>
                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-slate-700">{t('integrations.whatsapp_business_phone')}</span>
                        <input
                            className={fieldClass}
                            value={form.data.whatsapp_business_phone}
                            onChange={(e) => form.setData('whatsapp_business_phone', e.target.value)}
                            placeholder="+32…"
                        />
                        <p className="mt-1 text-xs text-slate-500">{t('integrations.whatsapp_business_phone_hint')}</p>
                    </label>
                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-slate-700">{t('integrations.whatsapp_invoice_template')}</span>
                        <textarea
                            className={`${fieldClass} min-h-[72px] resize-y`}
                            value={form.data.whatsapp_invoice_template}
                            onChange={(e) => form.setData('whatsapp_invoice_template', e.target.value)}
                            placeholder={t('integrations.whatsapp_template_placeholder')}
                        />
                    </label>
                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-slate-700">{t('integrations.whatsapp_quotation_template')}</span>
                        <textarea
                            className={`${fieldClass} min-h-[72px] resize-y`}
                            value={form.data.whatsapp_quotation_template}
                            onChange={(e) => form.setData('whatsapp_quotation_template', e.target.value)}
                            placeholder={t('integrations.whatsapp_template_placeholder')}
                        />
                    </label>
                    <p className="text-xs text-slate-500">{t('integrations.whatsapp_template_hint')}</p>
                    <p className={`text-xs font-medium ${integrations.whatsapp_configured ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {integrations.whatsapp_configured ? t('integrations.whatsapp_ready') : t('integrations.whatsapp_off_or_missing')}
                    </p>
                    {integrations.whatsapp_api_platform_allowed && (
                        <div className="space-y-3 border-t border-slate-200 pt-4">
                            <IntegrationToggle
                                enabled={!!form.data.whatsapp_api_enabled}
                                onChange={(v) => form.setData('whatsapp_api_enabled', v)}
                                label={t('integrations.whatsapp_api_enable')}
                                hint={t('integrations.whatsapp_api_enable_hint')}
                            />
                            <div className={sectionMuted(form.data.whatsapp_api_enabled)}>
                                <label className="block">
                                    <span className="mb-1.5 block text-sm font-medium text-slate-700">{t('integrations.whatsapp_api_phone_number_id')}</span>
                                    <input
                                        className={fieldClass}
                                        value={form.data.whatsapp_api_phone_number_id}
                                        onChange={(e) => form.setData('whatsapp_api_phone_number_id', e.target.value)}
                                    />
                                </label>
                                <SecretInput
                                    label={t('integrations.whatsapp_api_access_token')}
                                    placeholder={integrations.whatsapp_api_access_token_set ? t('integrations.key_keep') : t('integrations.whatsapp_api_token_placeholder')}
                                    value={form.data.whatsapp_api_access_token}
                                    onChange={(v) => form.setData('whatsapp_api_access_token', v)}
                                    set={integrations.whatsapp_api_access_token_set}
                                    hint={t('integrations.key_keep')}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <IntegrationToggle
                    enabled={!!form.data.creditsafe_enabled}
                    onChange={(v) => form.setData('creditsafe_enabled', v)}
                    label="Creditsafe"
                    hint="Optional customer credit checks (requires API key)."
                />
                <div className={`space-y-4 ${sectionMuted(form.data.creditsafe_enabled)}`}>
                    <SecretInput
                        label="Creditsafe test API key"
                        placeholder={integrations.creditsafe_test_api_key_set ? t('integrations.key_keep') : 'Test key'}
                        value={form.data.creditsafe_test_api_key}
                        onChange={(v) => form.setData('creditsafe_test_api_key', v)}
                        set={integrations.creditsafe_test_api_key_set}
                        hint={t('integrations.key_keep')}
                    />
                    <SecretInput
                        label="Creditsafe live API key"
                        placeholder={integrations.creditsafe_live_api_key_set ? t('integrations.key_keep') : 'Live key'}
                        value={form.data.creditsafe_live_api_key}
                        onChange={(v) => form.setData('creditsafe_live_api_key', v)}
                        set={integrations.creditsafe_live_api_key_set}
                        hint={t('integrations.key_keep')}
                    />
                </div>
            </section>

            <div className="flex justify-end">
                <button type="submit" disabled={form.processing} className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
                    {t('integrations.save')}
                </button>
            </div>
        </form>
    );
}
