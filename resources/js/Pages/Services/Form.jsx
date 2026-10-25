import { Link, useForm } from '@inertiajs/react';
import Icon from '../../Components/Icon';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import {
    CATALOG_UNITS,
    VAT_CODES,
    billingFromCatalogUnit,
    catalogUnitFromService,
    catalogUnitLabel,
    vatLabel,
} from '../../lib/serviceCatalog';
import { t } from '../../lib/i18n';

export default function Form({ service = null }) {
    const editing = Boolean(service?.id);
    const { data, setData, post, put, processing, errors, transform } = useForm({
        name: service?.name || '',
        description: service?.description || '',
        price: service?.price ?? '',
        catalog_unit: catalogUnitFromService(service),
        vat_code: service?.vat_code || '21',
    });

    const submit = (e) => {
        e.preventDefault();
        transform((payload) => {
            const { billing_mode, unit } = billingFromCatalogUnit(payload.catalog_unit);
            return {
                name: payload.name,
                description: payload.description || null,
                price: payload.price,
                billing_mode,
                unit,
                vat_code: payload.vat_code,
            };
        });
        if (editing) {
            put(`/services/${service.id}`);
        } else {
            post('/services');
        }
    };

    return (
        <AuthenticatedLayout title={editing ? t('services.edit') : t('services.new')}>
            <div className="offacto-briefings offacto-dash offacto-services-page">
                <form onSubmit={submit} className="space-y-6">
                    <header className="offacto-brief-edit-ph">
                        <div>
                            <Link href="/services" className="offacto-services-back">
                                <Icon name="back" />
                                {t('services.title_products')}
                            </Link>
                            <h1>{editing ? t('services.edit') : t('services.new')}</h1>
                            <p>{editing ? t('services.edit_subtitle') : t('services.add_subtitle')}</p>
                        </div>
                        <div className="offacto-services-form-actions">
                            <Link href="/services" className="offacto-brief-btn">
                                {t('common.cancel')}
                            </Link>
                            <button type="submit" disabled={processing} className="offacto-btn-p">
                                {processing ? t('common.saving') : editing ? t('services.save_changes') : t('services.save')}
                            </button>
                        </div>
                    </header>

                    <div className="offacto-dash-card offacto-services-form-card">
                        <div className="offacto-services-form-body">
                            <label className="offacto-time-field">
                                <span>{t('services.field_name')}</span>
                                <input
                                    className="offacto-time-inp"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name ? <span className="offacto-drawer-hint bad">{errors.name}</span> : null}
                            </label>
                            <label className="offacto-time-field">
                                <span>{t('services.description')}</span>
                                <textarea
                                    className="offacto-time-inp"
                                    rows={5}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                            </label>
                            <div className="offacto-time-fg2">
                                <label className="offacto-time-field">
                                    <span>{t('services.price')}</span>
                                    <input
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        className="offacto-time-inp"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        required
                                    />
                                </label>
                                <label className="offacto-time-field">
                                    <span>{t('services.unit')}</span>
                                    <select
                                        className="offacto-time-inp"
                                        value={data.catalog_unit}
                                        onChange={(e) => setData('catalog_unit', e.target.value)}
                                    >
                                        {CATALOG_UNITS.map((u) => (
                                            <option key={u} value={u}>
                                                {catalogUnitLabel(u)}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            <label className="offacto-time-field">
                                <span>{t('services.vat_short')}</span>
                                <select
                                    className="offacto-time-inp"
                                    value={data.vat_code}
                                    onChange={(e) => setData('vat_code', e.target.value)}
                                >
                                    {VAT_CODES.map((code) => (
                                        <option key={code} value={code}>
                                            {vatLabel(code)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
