import { useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { COMPANY_INTEGRATION_CATALOG, integrationIsConnected } from '../lib/companyIntegrationCatalog';
import { t } from '../lib/i18n';
import Icon from './Icon';
import CompanyIntegrationDrawer from './CompanyIntegrationDrawer';

const fieldClass = 'offacto-time-inp offacto-drawer-inp';

function SecretInput({ label, hint, placeholder, value, onChange, set }) {
    return (
        <label className="offacto-drawer-field">
            <span className="offacto-drawer-lbl">{label}</span>
            <input type="password" autoComplete="off" className={fieldClass} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
            {set && hint ? <p className="offacto-drawer-hint">{hint}</p> : null}
        </label>
    );
}

function IntegrationToggle({ enabled, onChange, label, hint }) {
    return (
        <div className="offacto-integration-drawer-toggle">
            <div>
                <p className="offacto-integration-drawer-toggle-title">{label}</p>
                {hint ? <p className="offacto-drawer-hint">{hint}</p> : null}
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label={label}
                onClick={() => onChange(!enabled)}
                className={`offacto-invoice-toggle${enabled ? ' on' : ''}`}
            />
        </div>
    );
}

function PlatformInfoBlock({ bodyKey }) {
    return (
        <div className="offacto-integration-platform-note">
            <Icon name="globe" />
            <p>{t(bodyKey)}</p>
        </div>
    );
}

function IntegrationDetailContent({
    integrationId,
    form,
    integrations,
    links,
    sectionMuted,
    testing,
    testMessage,
    testConnection,
}) {
    if (!integrationId) {
        return null;
    }

    if (integrationId === 'vies') {
        return <PlatformInfoBlock bodyKey="integrations.vies_platform_body" />;
    }

    if (integrationId === 'intervat') {
        return <PlatformInfoBlock bodyKey="integrations.intervat_platform_body" />;
    }

    if (integrationId === 'mollie') {
        return (
            <div className="offacto-integration-drawer-sections">
                <IntegrationToggle
                    enabled={!!form.data.mollie_enabled}
                    onChange={(v) => form.setData('mollie_enabled', v)}
                    label={t('integrations.mollie_enable')}
                    hint={t('integrations.mollie_enable_hint')}
                />
                <div className={sectionMuted(form.data.mollie_enabled)}>
                    <p className="offacto-drawer-hint">{t('integrations.mollie_body')}</p>
                    <div className="offacto-drawer-inrow">
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
                    <p className={`offacto-integration-status${integrations.mollie_configured ? ' ok' : ' warn'}`}>
                        {integrations.mollie_configured ? t('settings.mollie_ready') : t('integrations.mollie_off_or_missing')}
                    </p>
                </div>
            </div>
        );
    }

    if (integrationId === 'postbode') {
        return (
            <div className="offacto-integration-drawer-sections">
                <IntegrationToggle
                    enabled={!!form.data.postbode_enabled}
                    onChange={(v) => form.setData('postbode_enabled', v)}
                    label={t('integrations.postbode_enable')}
                    hint={t('integrations.postbode_enable_hint')}
                />
                <div className={sectionMuted(form.data.postbode_enabled)}>
                    <p className="offacto-drawer-hint">{t('integrations.postbode_body')}</p>
                    <div className="offacto-integration-drawer-links">
                        {links.postbode_tokens ? (
                            <a href={links.postbode_tokens} target="_blank" rel="noreferrer">
                                {t('integrations.postbode_create_token')}
                            </a>
                        ) : null}
                        {links.postbode_docs ? (
                            <a href={links.postbode_docs} target="_blank" rel="noreferrer">
                                {t('integrations.postbode_api_docs')}
                            </a>
                        ) : null}
                    </div>
                    <div className="offacto-drawer-inrow">
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
                    <div className="offacto-drawer-inrow">
                        <label className="offacto-drawer-field">
                            <span className="offacto-drawer-lbl">{t('integrations.postbode_api_version')}</span>
                            <select className={fieldClass} value={form.data.postbode_api_version} onChange={(e) => form.setData('postbode_api_version', e.target.value)}>
                                <option value="v2">{t('integrations.postbode_v2')}</option>
                                <option value="v1">{t('integrations.postbode_v1')}</option>
                            </select>
                        </label>
                        <label className="offacto-drawer-field">
                            <span className="offacto-drawer-lbl">{t('integrations.postbode_country')}</span>
                            <input className={fieldClass} maxLength={2} value={form.data.postbode_default_country} onChange={(e) => form.setData('postbode_default_country', e.target.value.toUpperCase())} />
                        </label>
                    </div>
                    {form.data.postbode_api_version === 'v2' ? (
                        <div className="offacto-drawer-inrow">
                            <label className="offacto-drawer-field">
                                <span className="offacto-drawer-lbl">{t('integrations.postbode_mailbox')}</span>
                                <input className={fieldClass} placeholder="PSBD" value={form.data.postbode_mailbox_code} onChange={(e) => form.setData('postbode_mailbox_code', e.target.value.toUpperCase())} />
                            </label>
                            <label className="offacto-drawer-field">
                                <span className="offacto-drawer-lbl">{t('integrations.postbode_envelope')}</span>
                                <input className={fieldClass} placeholder="Envelope UUID" value={form.data.postbode_envelope_uuid} onChange={(e) => form.setData('postbode_envelope_uuid', e.target.value)} />
                            </label>
                        </div>
                    ) : (
                        <div className="offacto-drawer-inrow">
                            <label className="offacto-drawer-field">
                                <span className="offacto-drawer-lbl">{t('integrations.postbode_v1_mailbox')}</span>
                                <input type="number" className={fieldClass} value={form.data.postbode_v1_mailbox_id} onChange={(e) => form.setData('postbode_v1_mailbox_id', e.target.value)} />
                            </label>
                            <label className="offacto-drawer-field">
                                <span className="offacto-drawer-lbl">{t('integrations.postbode_v1_envelope')}</span>
                                <input type="number" className={fieldClass} value={form.data.postbode_v1_envelope_id} onChange={(e) => form.setData('postbode_v1_envelope_id', e.target.value)} />
                            </label>
                        </div>
                    )}
                    <div className="offacto-integration-drawer-checks">
                        <label className="offacto-settings-check">
                            <input type="checkbox" checked={form.data.postbode_registered} onChange={(e) => form.setData('postbode_registered', e.target.checked)} />
                            {t('integrations.postbode_registered_default')}
                        </label>
                        <label className="offacto-settings-check">
                            <input type="checkbox" checked={form.data.postbode_send_immediately} onChange={(e) => form.setData('postbode_send_immediately', e.target.checked)} />
                            {t('integrations.postbode_send_immediately')}
                        </label>
                    </div>
                    <div className="offacto-integration-drawer-test">
                        <button type="button" disabled={testing} onClick={testConnection} className="offacto-drawer-btn">
                            {testing ? t('integrations.testing') : t('integrations.postbode_test')}
                        </button>
                        {testMessage ? <p className="offacto-drawer-hint">{testMessage}</p> : null}
                    </div>
                    <p className={`offacto-integration-status${integrations.postbode_configured ? ' ok' : ' warn'}`}>
                        {integrations.postbode_configured ? t('integrations.postbode_ready') : t('integrations.postbode_off_or_missing')}
                    </p>
                </div>
            </div>
        );
    }

    if (integrationId === 'peppol') {
        return (
            <div className="offacto-integration-drawer-sections">
                <IntegrationToggle
                    enabled={!!form.data.peppol_enabled}
                    onChange={(v) => form.setData('peppol_enabled', v)}
                    label={t('integrations.peppol_enable')}
                    hint={t('integrations.peppol_enable_hint')}
                />
                <div className={sectionMuted(form.data.peppol_enabled)}>
                    <p className="offacto-drawer-hint">{t('integrations.peppol_body')}</p>
                    {integrations.peppol_platform_fallback ? (
                        <p className="offacto-integration-platform-inline">{t('integrations.peppol_platform_fallback')}</p>
                    ) : null}
                    <div className="offacto-drawer-inrow">
                        <label className="offacto-drawer-field">
                            <span className="offacto-drawer-lbl">{t('integrations.peppol_test_endpoint')}</span>
                            <input className={fieldClass} value={form.data.peppol_test_endpoint} onChange={(e) => form.setData('peppol_test_endpoint', e.target.value)} placeholder="https://…" />
                        </label>
                        <label className="offacto-drawer-field">
                            <span className="offacto-drawer-lbl">{t('integrations.peppol_live_endpoint')}</span>
                            <input className={fieldClass} value={form.data.peppol_live_endpoint} onChange={(e) => form.setData('peppol_live_endpoint', e.target.value)} placeholder="https://…" />
                        </label>
                    </div>
                    <div className="offacto-drawer-inrow">
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
                    <p className={`offacto-integration-status${integrations.peppol_configured ? ' ok' : ' warn'}`}>
                        {integrations.peppol_configured ? t('integrations.peppol_ready') : t('integrations.peppol_off_or_missing')}
                    </p>
                </div>
            </div>
        );
    }

    if (integrationId === 'whatsapp') {
        return (
            <div className="offacto-integration-drawer-sections">
                <IntegrationToggle
                    enabled={!!form.data.whatsapp_enabled}
                    onChange={(v) => form.setData('whatsapp_enabled', v)}
                    label={t('integrations.whatsapp_enable')}
                    hint={t('integrations.whatsapp_enable_hint')}
                />
                <div className={sectionMuted(form.data.whatsapp_enabled)}>
                    <p className="offacto-drawer-hint">{t('integrations.whatsapp_body')}</p>
                    <label className="offacto-settings-check">
                        <input type="checkbox" checked={!!form.data.whatsapp_use_customer_phone} onChange={(e) => form.setData('whatsapp_use_customer_phone', e.target.checked)} />
                        {t('integrations.whatsapp_use_customer_phone')}
                    </label>
                    <label className="offacto-drawer-field">
                        <span className="offacto-drawer-lbl">{t('integrations.whatsapp_business_phone')}</span>
                        <input className={fieldClass} value={form.data.whatsapp_business_phone} onChange={(e) => form.setData('whatsapp_business_phone', e.target.value)} placeholder="+32…" />
                        <p className="offacto-drawer-hint">{t('integrations.whatsapp_business_phone_hint')}</p>
                    </label>
                    <label className="offacto-drawer-field">
                        <span className="offacto-drawer-lbl">{t('integrations.whatsapp_invoice_template')}</span>
                        <textarea className={`${fieldClass} offacto-settings-textarea`} value={form.data.whatsapp_invoice_template} onChange={(e) => form.setData('whatsapp_invoice_template', e.target.value)} placeholder={t('integrations.whatsapp_template_placeholder')} />
                    </label>
                    <label className="offacto-drawer-field">
                        <span className="offacto-drawer-lbl">{t('integrations.whatsapp_quotation_template')}</span>
                        <textarea className={`${fieldClass} offacto-settings-textarea`} value={form.data.whatsapp_quotation_template} onChange={(e) => form.setData('whatsapp_quotation_template', e.target.value)} placeholder={t('integrations.whatsapp_template_placeholder')} />
                    </label>
                    <p className="offacto-drawer-hint">{t('integrations.whatsapp_template_hint')}</p>
                    <p className={`offacto-integration-status${integrations.whatsapp_configured ? ' ok' : ' warn'}`}>
                        {integrations.whatsapp_configured ? t('integrations.whatsapp_ready') : t('integrations.whatsapp_off_or_missing')}
                    </p>
                    {integrations.whatsapp_api_platform_allowed ? (
                        <div className="offacto-integration-drawer-sub">
                            <IntegrationToggle
                                enabled={!!form.data.whatsapp_api_enabled}
                                onChange={(v) => form.setData('whatsapp_api_enabled', v)}
                                label={t('integrations.whatsapp_api_enable')}
                                hint={t('integrations.whatsapp_api_enable_hint')}
                            />
                            <div className={sectionMuted(form.data.whatsapp_api_enabled)}>
                                <label className="offacto-drawer-field">
                                    <span className="offacto-drawer-lbl">{t('integrations.whatsapp_api_phone_number_id')}</span>
                                    <input className={fieldClass} value={form.data.whatsapp_api_phone_number_id} onChange={(e) => form.setData('whatsapp_api_phone_number_id', e.target.value)} />
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
                    ) : null}
                </div>
            </div>
        );
    }

    return null;
}

export default function CompanyIntegrationsPanel({ integrations = {}, links = {}, settingsBasePath = '/company/settings' }) {
    const [activeId, setActiveId] = useState(null);
    const [testing, setTesting] = useState(false);
    const [testMessage, setTestMessage] = useState('');

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

    const activeIntegration = useMemo(
        () => COMPANY_INTEGRATION_CATALOG.find((row) => row.id === activeId) || null,
        [activeId],
    );

    const sectionMuted = (enabled) => (!enabled ? 'offacto-integration-drawer-muted' : '');

    const save = (e) => {
        e?.preventDefault?.();
        form.patch(`${settingsBasePath}/integrations`, {
            preserveScroll: true,
            onSuccess: () => setActiveId(null),
        });
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

    useEffect(() => {
        if (!activeId) {
            return undefined;
        }
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setActiveId(null);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [activeId]);

    const drawerNeedsSave = activeId && !['vies', 'intervat'].includes(activeId);

    return (
        <>
            <label className="offacto-drawer-field offacto-settings-integ-env">
                <span className="offacto-drawer-lbl">{t('integrations.active_environment')}</span>
                <select className={fieldClass} value={form.data.integrations_mode} onChange={(e) => form.setData('integrations_mode', e.target.value)}>
                    <option value="test">{t('integrations.env_test')}</option>
                    <option value="live">{t('integrations.env_live')}</option>
                </select>
                <p className="offacto-drawer-hint">{t('integrations.env_hint')}</p>
            </label>

            <ul className="offacto-settings-integ-list">
                {COMPANY_INTEGRATION_CATALOG.map((item) => {
                    const connected = integrationIsConnected(integrations, item.id);

                    return (
                        <li key={item.id}>
                            <div className="offacto-settings-integ-row">
                                <span className={`offacto-settings-integ-mark offacto-settings-integ-mark--${item.markTone}`}>{item.mark}</span>
                                <div className="offacto-settings-integ-copy">
                                    <b>{t(item.titleKey)}</b>
                                    <span>{t(item.descKey)}</span>
                                </div>
                                {connected ? (
                                    <button type="button" className="offacto-settings-integ-connected" onClick={() => setActiveId(item.id)}>
                                        <span className="offacto-settings-integ-dot" aria-hidden />
                                        {t('integrations.connected')}
                                    </button>
                                ) : (
                                    <button type="button" className="offacto-settings-integ-connect" onClick={() => setActiveId(item.id)}>
                                        {t('integrations.connect')}
                                    </button>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>

            <CompanyIntegrationDrawer
                open={Boolean(activeId)}
                integration={activeIntegration}
                onClose={() => setActiveId(null)}
                footer={
                    drawerNeedsSave ? (
                        <>
                            <div className="offacto-drawer-foot-spacer" />
                            <button type="button" className="offacto-drawer-btn" onClick={() => setActiveId(null)}>
                                {t('common.cancel')}
                            </button>
                            <button type="button" className="offacto-drawer-btn primary" disabled={form.processing} onClick={save}>
                                {form.processing ? t('common.saving') : t('integrations.save')}
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="offacto-drawer-foot-spacer" />
                            <button type="button" className="offacto-drawer-btn primary" onClick={() => setActiveId(null)}>
                                {t('common.close')}
                            </button>
                        </>
                    )
                }
            >
                <IntegrationDetailContent
                    integrationId={activeId}
                    form={form}
                    integrations={integrations}
                    links={links}
                    sectionMuted={sectionMuted}
                    testing={testing}
                    testMessage={testMessage}
                    testConnection={testConnection}
                />
            </CompanyIntegrationDrawer>
        </>
    );
}
