import { useEffect, useMemo, useState } from 'react';
import Icon from '../../Components/Icon';
import ServiceDrawer from '../../Components/ServiceDrawer';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import {
    catalogUnitFromService,
    catalogUnitLabel,
    serviceIconName,
    vatBadgeLabel,
} from '../../lib/serviceCatalog';
import { t } from '../../lib/i18n';
import { money } from '../../lib/utils';

function queryFromFilters(filters, overrides = {}) {
    const next = { ...filters, ...overrides };
    Object.keys(next).forEach((key) => {
        if (next[key] === undefined || next[key] === '') {
            delete next[key];
        }
    });
    return next;
}

function drawerStateFromFilters(f) {
    if (f.drawer === 'new') {
        return { mode: 'new', id: null };
    }
    if (f.service) {
        return { mode: 'edit', id: Number(f.service) };
    }
    return { mode: null, id: null };
}

function serviceIsArchived(service) {
    const name = String(service?.status_relation?.name || '').toLowerCase();
    return name === 'archived' || name === 'inactive';
}

export default function Index({ services = [], filters = {}, statuses = {}, defaultStatusId = null }) {
    const [drawerState, setDrawerState] = useState(() => drawerStateFromFilters(filters));

    useEffect(() => {
        setDrawerState(drawerStateFromFilters(filters));
    }, [filters.service, filters.drawer]);

    const drawerService = useMemo(() => {
        if (drawerState.mode !== 'edit' || !drawerState.id) {
            return null;
        }
        return services.find((row) => row.id === drawerState.id) || null;
    }, [services, drawerState]);

    const drawerOpen = drawerState.mode === 'new' || (drawerState.mode === 'edit' && Boolean(drawerService));

    useEffect(() => {
        if (!drawerOpen) {
            document.body.style.removeProperty('overflow');
            return undefined;
        }
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [drawerOpen]);

    function syncDrawerUrl(overrides = {}) {
        const params = new URLSearchParams();
        const merged = queryFromFilters(filters, overrides);
        if (merged.drawer === 'new') {
            params.set('drawer', 'new');
        } else if (merged.service) {
            params.set('service', String(merged.service));
        }
        const qs = params.toString();
        window.history.replaceState({}, '', qs ? `/services?${qs}` : '/services');
    }

    function openNewDrawer() {
        setDrawerState({ mode: 'new', id: null });
        syncDrawerUrl({ drawer: 'new', service: undefined });
    }

    function openServiceDrawer(service) {
        setDrawerState({ mode: 'edit', id: service.id });
        syncDrawerUrl({ service: service.id, drawer: undefined });
    }

    function closeDrawer() {
        setDrawerState({ mode: null, id: null });
        syncDrawerUrl({ service: undefined, drawer: undefined });
    }

    return (
        <AuthenticatedLayout title={t('services.title_products')}>
            <div className="offacto-briefings offacto-dash offacto-services-page">
                <header className="offacto-brief-edit-ph">
                    <div>
                        <h1>{t('services.title_products')}</h1>
                        <p>{t('services.subtitle_demo')}</p>
                    </div>
                    <button type="button" className="offacto-btn-p" onClick={openNewDrawer}>
                        <Icon name="plus" />
                        {t('services.new')}
                    </button>
                </header>

                {services.length === 0 ? (
                    <div className="offacto-dash-card offacto-services-empty">
                        <p>{t('services.empty')}</p>
                        <button type="button" className="offacto-btn-p" onClick={openNewDrawer}>
                            <Icon name="plus" />
                            {t('services.new')}
                        </button>
                    </div>
                ) : (
                    <div className="offacto-dash-grid-3 offacto-services-grid">
                        {services.map((service) => {
                            const catalogUnit = catalogUnitFromService(service);
                            const statusName = String(service.status_relation?.name || '').toLowerCase();
                            return (
                                <button
                                    key={service.id}
                                    type="button"
                                    className={`offacto-dash-card lift offacto-service-card${serviceIsArchived(service) ? ' offacto-service-card--inactive' : ''}`}
                                    onClick={() => openServiceDrawer(service)}
                                >
                                    <span className="offacto-dash-kpi-corner" aria-hidden="true" />
                                    <div className="offacto-service-card-inner">
                                        <div className="offacto-dash-kpi-ic">
                                            <Icon name={serviceIconName(service)} />
                                        </div>
                                        <b className="offacto-service-card-name">{service.name}</b>
                                        <div className="offacto-service-card-price">
                                            {money(service.price)}
                                            <span className="offacto-service-card-unit">{catalogUnitLabel(catalogUnit)}</span>
                                        </div>
                                        <div className="offacto-service-card-badges">
                                            <span className="offacto-demo-badge grey nd">
                                                {vatBadgeLabel(service.vat_code || '21')}
                                            </span>
                                            {statusName === 'pending' ? (
                                                <span className="offacto-demo-badge warn nd">{t('common.pending')}</span>
                                            ) : null}
                                            {serviceIsArchived(service) ? (
                                                <span className="offacto-demo-badge grey nd">{t('common.inactive')}</span>
                                            ) : null}
                                        </div>
                                    </div>
                                </button>
                                    );
                                })}
                    </div>
                )}

                <ServiceDrawer
                    key={drawerState.mode === 'new' ? 'new' : drawerService?.id || 'closed'}
                    open={drawerOpen}
                    onClose={closeDrawer}
                    service={drawerState.mode === 'new' ? null : drawerService}
                    statuses={statuses}
                    defaultStatusId={defaultStatusId}
                />
            </div>
        </AuthenticatedLayout>
    );
}
