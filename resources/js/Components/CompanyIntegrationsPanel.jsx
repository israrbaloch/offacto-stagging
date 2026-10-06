import { router, useForm } from '@inertiajs/react';
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
            />
            {set && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </label>
    );
}

export default function CompanyIntegrationsPanel({ integrations = {}, links = {} }) {
    const form = useForm({
        integrations_mode: integrations.integrations_mode || 'test',
        mollie_test_key: '',
        mollie_live_key: '',
        postbode_test_token: '',
        postbode_live_token: '',
        postbode_mailbox_code: integrations.postbode_mailbox_code || '',
        postbode_envelope_uuid: integrations.postbode_envelope_uuid || '',
        postbode_v1_mailbox_id: integrations.postbode_v1_mailbox_id || '',
        postbode_v1_envelope_id: integrations.postbode_v1_envelope_id ?? 2,
        postbode_default_country: integrations.postbode_default_country || 'NL',
        postbode_registered: integrations.postbode_registered ?? false,
        postbode_send_immediately: integrations.postbode_send_immediately ?? true,
        postbode_api_version: integrations.postbode_api_version || 'v2',
    });

    const [testing, setTesting] = useState(false);
    const [testMessage, setTestMessage] = useState('');

    const save = (e) => {
        e.preventDefault();
        form.patch('/profile/integrations', { preserveScroll: true });
    };

    const testConnection = async () => {
        setTesting(true);
        setTestMessage('');
        try {
            const token = document.cookie.split('; ').find((r) => r.startsWith('XSRF-TOKEN='));
            const xsrf = token ? decodeURIComponent(token.split('=')[1]) : '';
            const res = await fetch('/profile/integrations/postbode/test', {
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
                    {integrations.mollie_configured ? t('settings.mollie_ready') : t('settings.mollie_missing')}
                </p>
                <p className="text-xs leading-relaxed text-slate-500">{t('integrations.mollie_webhook_hint')}</p>
            </section>

            <section className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
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
                <p className="rounded-lg border border-indigo-100 bg-white px-3 py-2 text-xs text-slate-600">{t('integrations.postbode_permissions_hint')}</p>

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
                        <select
                            className={fieldClass}
                            value={form.data.postbode_api_version}
                            onChange={(e) => form.setData('postbode_api_version', e.target.value)}
                        >
                            <option value="v2">{t('integrations.postbode_v2')}</option>
                            <option value="v1">{t('integrations.postbode_v1')}</option>
                        </select>
                    </label>
                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium text-slate-700">{t('integrations.postbode_country')}</span>
                        <input
                            className={fieldClass}
                            maxLength={2}
                            value={form.data.postbode_default_country}
                            onChange={(e) => form.setData('postbode_default_country', e.target.value.toUpperCase())}
                        />
                    </label>
                </div>

                {form.data.postbode_api_version === 'v2' ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-slate-700">{t('integrations.postbode_mailbox')}</span>
                            <input
                                className={fieldClass}
                                placeholder="PSBD"
                                value={form.data.postbode_mailbox_code}
                                onChange={(e) => form.setData('postbode_mailbox_code', e.target.value.toUpperCase())}
                            />
                        </label>
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-slate-700">{t('integrations.postbode_envelope')}</span>
                            <input
                                className={fieldClass}
                                placeholder="Envelope UUID"
                                value={form.data.postbode_envelope_uuid}
                                onChange={(e) => form.setData('postbode_envelope_uuid', e.target.value)}
                            />
                        </label>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-slate-700">{t('integrations.postbode_v1_mailbox')}</span>
                            <input
                                type="number"
                                className={fieldClass}
                                value={form.data.postbode_v1_mailbox_id}
                                onChange={(e) => form.setData('postbode_v1_mailbox_id', e.target.value)}
                            />
                        </label>
                        <label className="block">
                            <span className="mb-1.5 block text-sm font-medium text-slate-700">{t('integrations.postbode_v1_envelope')}</span>
                            <input
                                type="number"
                                className={fieldClass}
                                value={form.data.postbode_v1_envelope_id}
                                onChange={(e) => form.setData('postbode_v1_envelope_id', e.target.value)}
                            />
                        </label>
                    </div>
                )}

                <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={form.data.postbode_registered}
                            onChange={(e) => form.setData('postbode_registered', e.target.checked)}
                        />
                        {t('integrations.postbode_registered_default')}
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={form.data.postbode_send_immediately}
                            onChange={(e) => form.setData('postbode_send_immediately', e.target.checked)}
                        />
                        {t('integrations.postbode_send_immediately')}
                    </label>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        disabled={testing}
                        onClick={testConnection}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                        {testing ? t('integrations.testing') : t('integrations.postbode_test')}
                    </button>
                    {testMessage && <p className="text-xs text-slate-600">{testMessage}</p>}
                </div>
                <p className={`text-xs font-medium ${integrations.postbode_configured ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {integrations.postbode_configured ? t('integrations.postbode_ready') : t('integrations.postbode_missing')}
                </p>
            </section>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={form.processing}
                    className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                    {t('integrations.save')}
                </button>
            </div>
        </form>
    );
}
