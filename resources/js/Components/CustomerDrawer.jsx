import { Link, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from './Icon';
import { useUi } from '../context/UiContext';
import { customerTypeLabel, customerTypeOptions, isOrgLikeType } from '../lib/customerTypes';
import { t } from '../lib/i18n';
import { customerName, optionsFromMap } from '../lib/utils';

function xsrfToken() {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

function UploadDots({ light = false }) {
    return (
        <span className={`offacto-drawer-dots${light ? ' offacto-drawer-dots--light' : ''}`} aria-hidden="true">
            <span />
            <span />
            <span />
        </span>
    );
}

function statusIdByName(statuses, name) {
    const needle = String(name).toLowerCase();
    const match = Object.entries(statuses).find(([, label]) => String(label).toLowerCase() === needle);
    return match ? Number(match[0]) : null;
}

function DemoToggle({ on, onToggle, ariaLabel, disabled = false }) {
    return (
        <button
            type="button"
            className={`offacto-invoice-toggle${on ? ' on' : ''}`}
            aria-pressed={on}
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={() => {
                if (!disabled) {
                    onToggle(!on);
                }
            }}
        />
    );
}

function displayTitle(customer, data) {
    if (!customer?.id) {
        return t('customers.new');
    }
    if (isOrgLikeType(data.type)) {
        return data.org_name || customerName(customer);
    }
    return customerName(customer);
}

function joinPersonName(first, surname) {
    return [first, surname].filter(Boolean).join(' ').trim();
}

function splitPersonName(full) {
    const parts = String(full || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    if (!parts.length) {
        return { first_name: '', surname: '' };
    }
    if (parts.length === 1) {
        return { first_name: parts[0], surname: '' };
    }
    return { first_name: parts[0], surname: parts.slice(1).join(' ') };
}

function initials(customer, data) {
    const source = isOrgLikeType(data?.type)
        ? data?.org_name
        : [data?.first_name, data?.surname].filter(Boolean).join(' ');
    if (!source) {
        return '—';
    }
    return source
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
}

export default function CustomerDrawer({
    open,
    onClose,
    customer = null,
    statuses = {},
    countries = {},
    defaultStatusId,
    latestCreditCheck = null,
    creditsafeConfigured = false,
    peppolConfigured = false,
    countryCodes = {},
}) {
    const { toast, confirm } = useUi();
    const editing = Boolean(customer?.id);
    const fileInputRef = useRef(null);
    const [viesState, setViesState] = useState(null);
    const [viesResult, setViesResult] = useState(null);
    const [viesError, setViesError] = useState('');
    const [docs, setDocs] = useState([]);
    const [uploadingNames, setUploadingNames] = useState([]);

    const { data, setData, post, put, processing, errors, reset, clearErrors, transform } = useForm({
        first_name: customer?.first_name || '',
        surname: customer?.surname || '',
        type: customer?.type === 'organization' ? 'company' : customer?.type || 'individual',
        country_id: customer?.country_id || '',
        vat_number: customer?.vat_number || '',
        org_name: customer?.org_name || '',
        office_address: customer?.office_address || '',
        email: customer?.email || '',
        phone: customer?.phone || '',
        notes: customer?.notes || '',
        status: customer?.status || defaultStatusId || '',
    });

    useEffect(() => {
        if (!open) {
            return;
        }
        reset();
        clearErrors();
        setViesState(null);
        setViesResult(null);
        setViesError('');
        setUploadingNames([]);
        setDocs(customer?.documents || []);
        if (customer?.id) {
            setData({
                first_name: customer.first_name || '',
                surname: customer.surname || '',
                type: customer.type === 'organization' ? 'company' : customer.type || 'individual',
                country_id: customer.country_id || '',
                vat_number: customer.vat_number || '',
                org_name: customer.org_name || '',
                office_address: customer.office_address || '',
                email: customer.email || '',
                phone: customer.phone || '',
                notes: customer.notes || '',
                status: customer.status || defaultStatusId || '',
            });
        } else {
            setData({
                first_name: '',
                surname: '',
                type: 'individual',
                country_id: '',
                vat_number: '',
                org_name: '',
                office_address: '',
                email: '',
                phone: '',
                notes: '',
                status: defaultStatusId || '',
            });
        }
    }, [open, customer?.id, customer?.updated_at, defaultStatusId]);

    useEffect(() => {
        if (open && customer?.documents) {
            setDocs(customer.documents);
        }
    }, [open, customer?.documents, customer?.updated_at]);

    const peppolEligible = useMemo(() => {
        if (!data.vat_number || !peppolConfigured) {
            return false;
        }
        const code = String(
            (data.country_id && countryCodes[data.country_id]) || customer?.country?.code || '',
        ).toUpperCase();
        return Boolean(code);
    }, [countryCodes, customer?.country?.code, data.country_id, data.vat_number, peppolConfigured]);

    const peppolDetail = useMemo(() => {
        if (!peppolConfigured || !peppolEligible) {
            return t('customers.peppol_not_found');
        }
        const vat = String(data.vat_number || customer?.vat_number || '')
            .replace(/[\s.]+/g, '')
            .toUpperCase();
        return vat || t('customers.peppol_not_found');
    }, [customer?.vat_number, data.vat_number, peppolConfigured, peppolEligible]);

    const creditRating = latestCreditCheck?.rating || customer?.creditsafe_rating || null;

    const activeStatusId = useMemo(
        () => statusIdByName(statuses, 'Active') ?? defaultStatusId ?? null,
        [statuses, defaultStatusId],
    );
    const archivedStatusId = useMemo(
        () => statusIdByName(statuses, 'Archived') ?? statusIdByName(statuses, 'Inactive'),
        [statuses],
    );

    const isArchived = useMemo(() => {
        const name = customer?.status_relation?.name?.toLowerCase();
        return editing && (name === 'archived' || name === 'inactive');
    }, [customer?.status_relation?.name, editing]);

    const hasDpa = docs.some((doc) => /verwerker|dpa|processing|verwerkers/i.test(String(doc.original_name || '')));

    const submit = (event) => {
        event.preventDefault();
        const opts = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(editing ? t('customers.saved_toast') : t('customers.created_toast'));
                if (editing) {
                    onClose();
                }
            },
        };
        transform((form) => ({
            ...form,
            status: form.status || activeStatusId || '',
        }));
        if (editing) {
            put(`/customers/${customer.id}`, opts);
        } else {
            post('/customers', opts);
        }
    };

    const runVies = async () => {
        const raw = String(data.vat_number || '').trim();
        if (!raw) {
            setViesState('invalid');
            setViesError(t('customers.vies_invalid'));
            return;
        }

        const countryCode = data.country_id ? countryCodes[data.country_id] : customer?.country?.code;

        setViesState('checking');
        setViesResult(null);
        setViesError('');

        try {
            const res = await fetch('/customers/vies-validate', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': xsrfToken(),
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    vat_number: raw,
                    country_code: countryCode ? String(countryCode).slice(0, 2) : null,
                }),
            });

            const payload = await res.json().catch(() => ({}));

            if (!res.ok) {
                setViesState('invalid');
                setViesError(
                    payload?.errors?.vat_number?.[0] || payload?.message || t('customers.vies_service_unavailable'),
                );
                return;
            }

            const result = payload?.data;
            if (!result?.valid) {
                setViesState('invalid');
                setViesError(t('customers.vies_not_registered'));
                setViesResult(result);
                return;
            }

            setViesState('valid');
            setViesResult(result);
            if (result.vat_number) {
                setData('vat_number', result.vat_number);
            }
            if (result.name && isOrgLikeType(data.type) && !data.org_name) {
                setData('org_name', result.name);
            }
            if (result.address && !data.office_address) {
                setData('office_address', result.address.replace(/\n+/g, ', '));
            }
        } catch {
            setViesState('invalid');
            setViesError(t('customers.vies_service_unavailable'));
        }
    };

    const updateLifecycleStatus = async (statusId, { confirmMessage, confirmLabel, danger, toastKey }) => {
        if (!statusId) {
            toast.error(t('customers.status_unavailable'));
            return;
        }
        if (
            confirmMessage &&
            !(await confirm({
                message: confirmMessage,
                confirmLabel,
                danger,
            }))
        ) {
            return;
        }
        transform((form) => ({
            ...form,
            status: statusId,
        }));
        put(`/customers/${customer.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success(t(toastKey)),
        });
    };

    const archiveCustomer = () =>
        updateLifecycleStatus(archivedStatusId, {
            confirmMessage: t('customers.archive_confirm'),
            confirmLabel: t('customers.archive'),
            danger: true,
            toastKey: 'customers.archived_toast',
        });

    const activateCustomer = () =>
        updateLifecycleStatus(activeStatusId, {
            confirmMessage: null,
            confirmLabel: t('customers.mark_active'),
            danger: false,
            toastKey: 'customers.activated_toast',
        });

    const runCreditCheck = () => {
        router.post(`/customers/${customer.id}/credit-check`, {}, { preserveScroll: true });
    };

    const uploadFiles = async (files) => {
        if (!editing || !files?.length) {
            toast.info(t('customers.document_save_first'));
            return;
        }
        for (const file of Array.from(files)) {
            const pendingKey = `${file.name}-${file.lastModified}`;
            setUploadingNames((prev) => [...prev, pendingKey]);
            try {
                const body = new FormData();
                body.append('file', file);
                body.append('attach_on_invoice', '1');
                const res = await fetch(`/customers/${customer.id}/documents`, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'X-XSRF-TOKEN': xsrfToken(),
                    },
                    credentials: 'same-origin',
                    body,
                });
                if (!res.ok) {
                    const payload = await res.json().catch(() => ({}));
                    toast.error(payload?.message || t('customers.document_upload_failed'));
                    continue;
                }
                router.reload({ only: ['customers'], preserveScroll: true });
            } catch {
                toast.error(t('customers.document_upload_failed'));
            } finally {
                setUploadingNames((prev) => prev.filter((key) => key !== pendingKey));
            }
        }
    };

    const toggleDocAuto = (doc) => {
        router.patch(
            `/customers/${customer.id}/documents/${doc.id}`,
            { attach_on_invoice: !doc.attach_on_invoice },
            { preserveScroll: true },
        );
    };

    const removeDoc = async (doc) => {
        if (
            !(await confirm({
                message: t('customers.document_delete_confirm'),
                confirmLabel: t('common.delete'),
                danger: true,
            }))
        ) {
            return;
        }
        router.delete(`/customers/${customer.id}/documents/${doc.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success(t('customers.document_removed_toast')),
        });
    };

    return (
        <>
            <button
                type="button"
                className={`offacto-drawer-scrim${open ? ' on' : ''}`}
                aria-label={t('common.close')}
                aria-hidden={!open}
                tabIndex={open ? 0 : -1}
                onClick={onClose}
            />
            <aside
                className={`offacto-drawer offacto-customer-drawer${open ? ' on' : ''}`}
                role="dialog"
                aria-modal="true"
                aria-hidden={!open}
                aria-labelledby="customer-drawer-title"
            >
                <div className="offacto-drawer-head">
                    <div className="offacto-drawer-who">
                        {(editing || data.org_name || data.first_name) && (
                            <span className="offacto-drawer-av">{initials(customer, data)}</span>
                        )}
                        <div>
                            <h3 id="customer-drawer-title">{displayTitle(customer, data)}</h3>
                            {editing ? (
                                <small>
                                    {customerTypeLabel(data.type)} · {customer.email || '—'}
                                </small>
                            ) : null}
                        </div>
                    </div>
                    <button type="button" className="offacto-drawer-icobtn" onClick={onClose} aria-label={t('common.close')}>
                        <Icon name="x" />
                    </button>
                </div>

                <form className="offacto-drawer-form" onSubmit={submit}>
                    <div className="offacto-drawer-body">
                        <div className="offacto-drawer-field">
                            <label className="offacto-drawer-lbl">{t('customers.vat_number')}</label>
                            <div className="offacto-drawer-inrow">
                                <input
                                    className="offacto-drawer-inp"
                                    value={data.vat_number}
                                    onChange={(e) => {
                                        setData('vat_number', e.target.value);
                                        setViesState(null);
                                        setViesResult(null);
                                        setViesError('');
                                    }}
                                    placeholder="BE0… / FR… / NL…"
                                />
                                <button
                                    type="button"
                                    className="offacto-drawer-btn"
                                    onClick={runVies}
                                    disabled={viesState === 'checking'}
                                >
                                    <Icon name="check" />
                                    VIES
                                </button>
                            </div>
                            <div id="viesr">
                                {viesState === 'checking' ? (
                                    <p className="offacto-drawer-hint">{t('customers.vies_checking')}</p>
                                ) : null}
                                {viesState === 'valid' && viesResult ? (
                                    <div className="offacto-drawer-okline">
                                        <Icon name="check" />
                                        <div>
                                            {viesResult.name
                                                ? t('customers.vies_valid_detail', {
                                                      vat: viesResult.vat_number,
                                                      name: viesResult.name,
                                                  })
                                                : t('customers.vies_valid_detail_no_name', { vat: viesResult.vat_number })}
                                        </div>
                                    </div>
                                ) : null}
                                {viesState === 'invalid' ? (
                                    <p className="offacto-drawer-hint bad">{viesError || t('customers.vies_invalid')}</p>
                                ) : null}
                                {!viesState && !data.vat_number ? (
                                    <p className="offacto-drawer-hint">{t('customers.vies_hint')}</p>
                                ) : null}
                            </div>
                            {errors.vat_number ? <p className="offacto-drawer-hint bad">{errors.vat_number}</p> : null}
                        </div>

                        <div className="offacto-drawer-field">
                            <label className="offacto-drawer-lbl">{t('customers.display_name')}</label>
                            {isOrgLikeType(data.type) ? (
                                <input
                                    className="offacto-drawer-inp"
                                    value={data.org_name}
                                    onChange={(e) => setData('org_name', e.target.value)}
                                />
                            ) : (
                                <input
                                    className="offacto-drawer-inp"
                                    value={joinPersonName(data.first_name, data.surname)}
                                    onChange={(e) => {
                                        const { first_name, surname } = splitPersonName(e.target.value);
                                        setData({ ...data, first_name, surname });
                                    }}
                                />
                            )}
                            {errors.org_name ? <p className="offacto-drawer-hint bad">{errors.org_name}</p> : null}
                            {!isOrgLikeType(data.type) && (errors.first_name || errors.surname) ? (
                                <p className="offacto-drawer-hint bad">{errors.first_name || errors.surname}</p>
                            ) : null}
                        </div>

                        <div className="offacto-drawer-fg2">
                            <div className="offacto-drawer-field">
                                <label className="offacto-drawer-lbl">
                                    {isOrgLikeType(data.type) ? t('customers.contact_person') : t('customers.phone')}
                                </label>
                                <input
                                    className="offacto-drawer-inp"
                                    value={
                                        isOrgLikeType(data.type)
                                            ? joinPersonName(data.first_name, data.surname)
                                            : data.phone || ''
                                    }
                                    onChange={(e) => {
                                        if (isOrgLikeType(data.type)) {
                                            const { first_name, surname } = splitPersonName(e.target.value);
                                            setData({ ...data, first_name, surname });
                                        } else {
                                            setData('phone', e.target.value);
                                        }
                                    }}
                                />
                                {errors.first_name ? <p className="offacto-drawer-hint bad">{errors.first_name}</p> : null}
                                {!isOrgLikeType(data.type) && errors.phone ? (
                                    <p className="offacto-drawer-hint bad">{errors.phone}</p>
                                ) : null}
                            </div>
                            <div className="offacto-drawer-field">
                                <label className="offacto-drawer-lbl">{t('customers.type')}</label>
                                <select
                                    className="offacto-drawer-inp"
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                >
                                    {customerTypeOptions().map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.type ? <p className="offacto-drawer-hint bad">{errors.type}</p> : null}
                            </div>
                        </div>

                        <div className="offacto-drawer-fg2">
                            <div className="offacto-drawer-field">
                                <label className="offacto-drawer-lbl">{t('common.email')}</label>
                                <input
                                    type="email"
                                    className="offacto-drawer-inp"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email ? <p className="offacto-drawer-hint bad">{errors.email}</p> : null}
                            </div>
                            <div className="offacto-drawer-field">
                                <label className="offacto-drawer-lbl">{t('customers.preferred_channel')}</label>
                                <select className="offacto-drawer-inp" defaultValue={peppolEligible ? 'peppol' : 'email'}>
                                    <option value="peppol">Peppol</option>
                                    <option value="email">{t('invoices.channel_email')}</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="postbode">{t('invoices.channel_postbode')}</option>
                                </select>
                            </div>
                        </div>

                        <div className="offacto-drawer-field">
                            <label className="offacto-drawer-lbl">{t('customers.country')}</label>
                            <select
                                className="offacto-drawer-inp"
                                value={data.country_id}
                                onChange={(e) => setData('country_id', e.target.value)}
                            >
                                <option value="">{t('common.select')}</option>
                                {optionsFromMap(countries).map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            {errors.country_id ? <p className="offacto-drawer-hint bad">{errors.country_id}</p> : null}
                        </div>

                        {editing ? (
                            <div className="offacto-drawer-integ-grid">
                                <div className="offacto-drawer-integ">
                                    <span className="offacto-drawer-integ-logo peppol" aria-hidden="true">
                                        P
                                    </span>
                                    <div className="grow">
                                        <b>Peppol</b>
                                        <div className="offacto-drawer-integ-hint">{peppolDetail}</div>
                                    </div>
                                </div>
                                <div className="offacto-drawer-integ">
                                    <span className="offacto-drawer-integ-logo creditsafe" aria-hidden="true">
                                        C
                                    </span>
                                    <div className="grow">
                                        <b>Creditsafe</b>
                                        <div className="offacto-drawer-integ-hint">
                                            {creditRating ? (
                                                t('customers.creditsafe_score_inline', { rating: creditRating })
                                            ) : creditsafeConfigured ? (
                                                <button type="button" className="offacto-drawer-link" onClick={runCreditCheck}>
                                                    {t('customers.creditsafe_retrieve')}
                                                </button>
                                            ) : (
                                                <Link href="/company/settings?section=integrations" className="offacto-drawer-link">
                                                    {t('customers.creditsafe_setup')}
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        <div className="offacto-drawer-field">
                            <div className="offacto-drawer-vault-head">
                                <label className="offacto-drawer-lbl">{t('customers.document_vault')}</label>
                                <span className="offacto-drawer-hint">{t('customers.document_vault_hint')}</span>
                            </div>
                            <div className="offacto-drawer-vault-list">
                                {uploadingNames.map((key) => (
                                    <div key={key} className="offacto-drawer-vault-row offacto-drawer-vault-row--loading">
                                        <span className="offacto-drawer-av-sm">
                                            <Icon name="file" />
                                        </span>
                                        <div className="grow">
                                            <b>{t('customers.document_uploading')}</b>
                                        </div>
                                        <UploadDots />
                                    </div>
                                ))}
                                {docs.length === 0 && uploadingNames.length === 0 ? (
                                    <p className="offacto-drawer-hint">{t('customers.document_vault_empty')}</p>
                                ) : (
                                    docs.map((doc) => (
                                        <div key={doc.id} className="offacto-drawer-vault-row">
                                            <span className="offacto-drawer-av-sm">
                                                <Icon name="file" />
                                            </span>
                                            <div className="grow">
                                                <b>{doc.original_name}</b>
                                            </div>
                                            <span className="offacto-drawer-hint">{doc.attach_on_invoice ? 'auto' : '—'}</span>
                                            <DemoToggle
                                                on={Boolean(doc.attach_on_invoice)}
                                                onToggle={() => toggleDocAuto(doc)}
                                                ariaLabel={t('customers.document_vault')}
                                                disabled={!editing}
                                            />
                                            {editing ? (
                                                <button type="button" className="offacto-drawer-icobtn sm" onClick={() => removeDoc(doc)}>
                                                    <Icon name="trash" />
                                                </button>
                                            ) : null}
                                        </div>
                                    ))
                                )}
                            </div>
                            <label
                                className={`offacto-drawer-drop${uploadingNames.length ? ' offacto-drawer-drop--busy' : ''}`}
                                onClick={() => {
                                    if (!uploadingNames.length) {
                                        fileInputRef.current?.click();
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        fileInputRef.current?.click();
                                    }
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.classList.add('over');
                                }}
                                onDragLeave={(e) => e.currentTarget.classList.remove('over')}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.classList.remove('over');
                                    if (!uploadingNames.length) {
                                        uploadFiles(e.dataTransfer.files);
                                    }
                                }}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="application/pdf"
                                    className="sr-only"
                                    multiple
                                    onChange={(e) => {
                                        uploadFiles(e.target.files);
                                        e.target.value = '';
                                    }}
                                />
                                <Icon name="up" />
                                <div>
                                    <b>{t('customers.document_drop_title')}</b>
                                    <br />
                                    <small>{t('customers.document_drop_hint')}</small>
                                </div>
                            </label>
                        </div>

                        {editing && isOrgLikeType(data.type) && !hasDpa ? (
                            <div className="offacto-invoice-note warn">
                                <Icon name="alert" />
                                <div>
                                    {t('customers.dpa_missing')}{' '}
                                    <button type="button" className="offacto-drawer-link" onClick={() => toast.info(t('customers.dpa_request_toast'))}>
                                        {t('customers.dpa_request')}
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="offacto-drawer-foot">
                        {editing && !isArchived ? (
                            <button type="button" className="offacto-drawer-btn danger" onClick={archiveCustomer}>
                                {t('customers.archive')}
                            </button>
                        ) : null}
                        {editing && isArchived ? (
                            <button type="button" className="offacto-drawer-btn" onClick={activateCustomer}>
                                {t('customers.mark_active')}
                            </button>
                        ) : null}
                        <div className="offacto-drawer-foot-spacer" />
                        <button type="button" className="offacto-drawer-btn" onClick={onClose} disabled={processing}>
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            className={`offacto-drawer-btn primary${processing ? ' is-loading' : ''}`}
                            disabled={processing}
                            aria-busy={processing}
                        >
                            {processing ? (
                                <>
                                    <UploadDots light />
                                    {t('common.saving')}
                                </>
                            ) : (
                                t('common.save')
                            )}
                        </button>
                    </div>
                </form>
            </aside>
        </>
    );
}
