import { useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import Icon from './Icon';
import { useUi } from '../context/UiContext';
import {
    CATALOG_UNITS,
    VAT_CODES,
    billingFromCatalogUnit,
    catalogUnitFromService,
    catalogUnitLabel,
    vatLabel,
} from '../lib/serviceCatalog';
import { t } from '../lib/i18n';

function statusIdByName(statuses, name) {
    const needle = String(name).toLowerCase();
    const match = Object.entries(statuses).find(([, label]) => String(label).toLowerCase() === needle);
    return match ? Number(match[0]) : null;
}

function payloadFromForm(form, statusId = null) {
    const { billing_mode, unit } = billingFromCatalogUnit(form.catalog_unit);
    const payload = {
        name: form.name,
        description: form.description || null,
        price: form.price,
        billing_mode,
        unit,
        vat_code: form.vat_code,
    };
    if (statusId !== null && statusId !== undefined) {
        payload.status = statusId;
    }
    return payload;
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

export default function ServiceDrawer({ open, onClose, service = null, statuses = {}, defaultStatusId = null }) {
    const { confirm, toast } = useUi();
    const editing = Boolean(service?.id);

    const { data, setData, post, put, processing, errors, transform } = useForm({
        name: service?.name || '',
        description: service?.description || '',
        price: service?.price ?? '',
        catalog_unit: catalogUnitFromService(service),
        vat_code: service?.vat_code || '21',
    });

    const activeStatusId = useMemo(
        () => statusIdByName(statuses, 'Active') ?? defaultStatusId ?? null,
        [statuses, defaultStatusId],
    );
    const archivedStatusId = useMemo(
        () => statusIdByName(statuses, 'Archived') ?? statusIdByName(statuses, 'Inactive'),
        [statuses],
    );

    const isArchived = useMemo(() => {
        const name = service?.status_relation?.name?.toLowerCase();
        return editing && (name === 'archived' || name === 'inactive');
    }, [service?.status_relation?.name, editing]);

    const submit = (e) => {
        e.preventDefault();
        transform((form) => (editing ? payloadFromForm(form, service.status) : payloadFromForm(form)));

        const opts = {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success(editing ? t('services.save_changes') : t('services.save'));
                onClose();
            },
        };

        if (editing) {
            put(`/services/${service.id}`, opts);
        } else {
            post('/services', opts);
        }
    };

    const updateLifecycleStatus = async (statusId, { confirmMessage, confirmLabel, danger, toastKey }) => {
        if (!statusId) {
            toast.error(t('services.status_unavailable'));
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
        transform((form) => payloadFromForm(form, statusId));
        put(`/services/${service.id}`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => toast.success(t(toastKey)),
        });
    };

    const archiveService = () =>
        updateLifecycleStatus(archivedStatusId, {
            confirmMessage: t('services.archive_confirm'),
            confirmLabel: t('services.archive'),
            danger: true,
            toastKey: 'services.archived_toast',
        });

    const activateService = () =>
        updateLifecycleStatus(activeStatusId, {
            confirmMessage: null,
            confirmLabel: t('services.mark_active'),
            danger: false,
            toastKey: 'services.activated_toast',
        });

    const statusName = String(service?.status_relation?.name || '').toLowerCase();
    const isPending = statusName === 'pending';

    return (
        <>
            <button
                type="button"
                className={`offacto-drawer-scrim${open ? ' on' : ''}`}
                aria-label={t('common.close')}
                onClick={onClose}
            />
            <aside
                className={`offacto-drawer offacto-customer-drawer${open ? ' on' : ''}`}
                aria-hidden={!open}
                aria-label={editing ? t('services.edit') : t('services.new')}
            >
                <div className="offacto-drawer-head">
                    <div className="offacto-drawer-who">
                        <span className="offacto-drawer-av">
                            <Icon name={data.catalog_unit === 'hour' ? 'clock' : 'box'} />
                        </span>
                        <div>
                            <b>{editing ? data.name || t('services.edit') : t('services.new')}</b>
                            <div className="offacto-service-drawer-badges">
                                {isPending ? (
                                    <span className="offacto-demo-badge warn nd">{t('common.pending')}</span>
                                ) : null}
                                {isArchived ? (
                                    <span className="offacto-demo-badge grey nd">{t('common.inactive')}</span>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    <button type="button" className="offacto-drawer-icobtn" onClick={onClose} aria-label={t('common.close')}>
                        <Icon name="x" />
                    </button>
                </div>

                <form className="offacto-drawer-form" onSubmit={submit}>
                    <div className="offacto-drawer-body">
                        <div className="offacto-drawer-field">
                            <label className="offacto-drawer-lbl">{t('services.field_name')}</label>
                            <input
                                className="offacto-drawer-inp"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            {errors.name ? <p className="offacto-drawer-hint bad">{errors.name}</p> : null}
                        </div>

                        <div className="offacto-drawer-field">
                            <label className="offacto-drawer-lbl">{t('services.description')}</label>
                            <textarea
                                className="offacto-drawer-inp"
                                rows={4}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            {errors.description ? <p className="offacto-drawer-hint bad">{errors.description}</p> : null}
                        </div>

                        <div className="offacto-drawer-fg2">
                            <div className="offacto-drawer-field">
                                <label className="offacto-drawer-lbl">{t('services.price')}</label>
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    className="offacto-drawer-inp"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    required
                                />
                                {errors.price ? <p className="offacto-drawer-hint bad">{errors.price}</p> : null}
                            </div>
                            <div className="offacto-drawer-field">
                                <label className="offacto-drawer-lbl">{t('services.unit')}</label>
                                <select
                                    className="offacto-drawer-inp"
                                    value={data.catalog_unit}
                                    onChange={(e) => setData('catalog_unit', e.target.value)}
                                >
                                    {CATALOG_UNITS.map((u) => (
                                        <option key={u} value={u}>
                                            {catalogUnitLabel(u)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="offacto-drawer-field">
                            <label className="offacto-drawer-lbl">{t('services.vat_short')}</label>
                            <select
                                className="offacto-drawer-inp"
                                value={data.vat_code}
                                onChange={(e) => setData('vat_code', e.target.value)}
                            >
                                {VAT_CODES.map((code) => (
                                    <option key={code} value={code}>
                                        {vatLabel(code)}
                                    </option>
                                ))}
                            </select>
                            {errors.vat_code ? <p className="offacto-drawer-hint bad">{errors.vat_code}</p> : null}
                        </div>

                        {isPending ? (
                            <div className="offacto-invoice-note warn">
                                <Icon name="alert" />
                                <div>{t('services.pending_banner')}</div>
                            </div>
                        ) : null}
                    </div>

                    <div className="offacto-drawer-foot">
                        {editing && !isArchived ? (
                            <button type="button" className="offacto-drawer-btn danger" onClick={archiveService}>
                                {t('services.archive')}
                            </button>
                        ) : null}
                        {editing && isArchived ? (
                            <button type="button" className="offacto-drawer-btn" onClick={activateService}>
                                {t('services.mark_active')}
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
