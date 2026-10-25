import { router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import Icon from '../../Components/Icon';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { useUi } from '../../context/UiContext';
import { t } from '../../lib/i18n';
import { money } from '../../lib/utils';

function dateInput(value) {
    if (!value) return '';
    return String(value).slice(0, 10);
}

function blankLine() {
    return { description: '', amount_excl: '' };
}

function formFromInvoice(invoice) {
    return {
        supplier_id: invoice?.supplier_id ? String(invoice.supplier_id) : '',
        supplier_name: invoice?.supplier?.name || '',
        supplier_vat: invoice?.supplier?.vat_number || '',
        supplier_address: invoice?.supplier?.address || '',
        invoice_number: invoice?.invoice_number || '',
        invoice_date: dateInput(invoice?.invoice_date) || new Date().toISOString().slice(0, 10),
        due_date: dateInput(invoice?.due_date),
        category: invoice?.category || 'other',
        vat_rate: invoice?.vat_rate ?? 21,
        iban: invoice?.iban || invoice?.supplier?.iban || '',
        payment_note: invoice?.payment_note || '',
        lines: invoice?.lines?.length
            ? invoice.lines.map((line) => ({
                  description: line.description,
                  amount_excl: line.amount_excl,
              }))
            : [blankLine()],
        file: null,
    };
}

function statusClass(status) {
    if (status === 'paid' || status === 'booked') return 'ok';
    if (status === 'flagged') return 'bad';
    if (status === 'review') return 'warn';
    return 'grey';
}

export default function PurchasesIndex({
    invoices = [],
    suppliers = [],
    categories = [],
    selectedId = null,
    inboxAddress = '',
}) {
    const { toast } = useUi();
    const [creating, setCreating] = useState(invoices.length === 0);
    const selected = useMemo(
        () => invoices.find((row) => row.id === selectedId) || invoices[0] || null,
        [invoices, selectedId],
    );
    const active = creating ? null : selected;

    const form = useForm(formFromInvoice(active));

    useEffect(() => {
        form.setData(formFromInvoice(active));
        form.clearErrors();
        // Reset when the selected bill changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active?.id, creating]);

    const excl = form.data.lines.reduce((sum, line) => sum + (Number(line.amount_excl) || 0), 0);
    const vat = Math.round(excl * (Number(form.data.vat_rate) || 0)) / 100;
    const incl = excl + vat;

    const flags = active?.flags || [];

    function selectInvoice(id) {
        setCreating(false);
        router.get('/purchases', { invoice: id }, { preserveState: true, preserveScroll: true, replace: true });
    }

    function startNew() {
        setCreating(true);
        form.setData(formFromInvoice(null));
        form.clearErrors();
    }

    function onSupplier(id) {
        const supplier = suppliers.find((row) => String(row.id) === id);
        form.setData({
            ...form.data,
            supplier_id: id,
            supplier_name: supplier?.name || '',
            supplier_vat: supplier?.vat_number || '',
            supplier_address: supplier?.address || '',
            iban: form.data.iban || supplier?.iban || '',
        });
    }

    function submit(event) {
        event.preventDefault();
        const options = { forceFormData: true, preserveScroll: true };
        if (active) {
            form.put(`/purchases/${active.id}`, options);
        } else {
            form.post('/purchases', options);
        }
    }

    function copyAddress() {
        navigator.clipboard?.writeText(inboxAddress).catch(() => {});
        toast.success(t('purchases.copied'));
    }

    return (
        <AuthenticatedLayout title={t('purchases.title')}>
            <div className="offacto-briefings offacto-dash offacto-purchases-page">
                <header className="offacto-dash-hero">
                    <div>
                        <span className="offacto-dash-eyebrow">
                            <Icon name="inbox" />
                            {t('purchases.review')}
                        </span>
                        <h1>{t('purchases.title')}</h1>
                        <p>{t('purchases.subtitle', { address: inboxAddress })}</p>
                    </div>
                    <div className="offacto-dash-hero-actions">
                        <button type="button" className="offacto-dash-btn-ghost" onClick={copyAddress}>
                            <Icon name="copy" />
                            {t('purchases.copy_address')}
                        </button>
                        <button type="button" className="offacto-btn-p" onClick={startNew}>
                            <Icon name="up" />
                            {t('purchases.upload')}
                        </button>
                    </div>
                </header>

                <div className="offacto-dash-grid-21 offacto-purchases-review">
                    <form className="offacto-dash-card" onSubmit={submit}>
                        <div className="offacto-dash-card-head">
                            <h3>
                                {t('purchases.review')}
                                {active?.supplier?.name ? `: ${active.supplier.name}` : ''}
                            </h3>
                            {flags.length > 0 ? (
                                <span className="offacto-demo-badge warn nd">
                                    {t('purchases.warnings', { count: flags.length })}
                                </span>
                            ) : null}
                        </div>
                        <div className="offacto-dash-card-body offacto-purchases-form">
                            {flags.map((flag) => (
                                <div key={flag} className="offacto-invoice-note warn">
                                    <Icon name="alert" />
                                    <div>
                                        <b>{t(`purchases.flag_${flag}`)}</b>
                                    </div>
                                </div>
                            ))}
                            {active?.file_path && !flags.includes('unsafe') ? (
                                <div className="offacto-invoice-note">
                                    <Icon name="shield" />
                                    <div>
                                        <b>{t('purchases.file_safe')}</b>
                                        {active.file_name ? ` · ${active.file_name}` : ''}
                                    </div>
                                </div>
                            ) : (
                                <p className="offacto-purchases-hint">{t('purchases.no_file')}</p>
                            )}

                            <div className="offacto-time-fg2">
                                <label className="offacto-time-field">
                                    <span>{t('purchases.supplier')}</span>
                                    <select
                                        className="offacto-time-inp"
                                        value={form.data.supplier_id}
                                        onChange={(e) => onSupplier(e.target.value)}
                                    >
                                        <option value="">{t('purchases.new_supplier')}</option>
                                        {suppliers.map((supplier) => (
                                            <option key={supplier.id} value={supplier.id}>
                                                {supplier.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="offacto-time-field">
                                    <span>{t('purchases.supplier_name')}</span>
                                    <input
                                        className="offacto-time-inp"
                                        value={form.data.supplier_name}
                                        onChange={(e) => form.setData('supplier_name', e.target.value)}
                                        required={!form.data.supplier_id}
                                    />
                                </label>
                            </div>
                            <div className="offacto-time-fg2">
                                <label className="offacto-time-field">
                                    <span>{t('purchases.vat_number')}</span>
                                    <input
                                        className="offacto-time-inp"
                                        value={form.data.supplier_vat}
                                        onChange={(e) => form.setData('supplier_vat', e.target.value)}
                                    />
                                </label>
                                <label className="offacto-time-field">
                                    <span>{t('purchases.address')}</span>
                                    <input
                                        className="offacto-time-inp"
                                        value={form.data.supplier_address}
                                        onChange={(e) => form.setData('supplier_address', e.target.value)}
                                    />
                                </label>
                            </div>
                            <div className="offacto-time-fg2">
                                <label className="offacto-time-field">
                                    <span>{t('purchases.invoice_number')}</span>
                                    <input
                                        className="offacto-time-inp"
                                        value={form.data.invoice_number}
                                        onChange={(e) => form.setData('invoice_number', e.target.value)}
                                        required
                                    />
                                    {form.errors.invoice_number ? (
                                        <span className="offacto-drawer-hint bad">{form.errors.invoice_number}</span>
                                    ) : null}
                                </label>
                                <label className="offacto-time-field">
                                    <span>{t('purchases.category')}</span>
                                    <select
                                        className="offacto-time-inp"
                                        value={form.data.category}
                                        onChange={(e) => form.setData('category', e.target.value)}
                                    >
                                        {categories.map((key) => (
                                            <option key={key} value={key}>
                                                {t(`purchases.cat_${key}`)}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            <div className="offacto-time-fg2">
                                <label className="offacto-time-field">
                                    <span>{t('purchases.date')}</span>
                                    <input
                                        type="date"
                                        className="offacto-time-inp"
                                        value={form.data.invoice_date}
                                        onChange={(e) => form.setData('invoice_date', e.target.value)}
                                        required
                                    />
                                </label>
                                <label className="offacto-time-field">
                                    <span>{t('purchases.due')}</span>
                                    <input
                                        type="date"
                                        className="offacto-time-inp"
                                        value={form.data.due_date}
                                        onChange={(e) => form.setData('due_date', e.target.value)}
                                    />
                                </label>
                            </div>
                            <div className="offacto-time-fg2">
                                <label className="offacto-time-field">
                                    <span>{t('purchases.vat')}</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        className="offacto-time-inp"
                                        value={form.data.vat_rate}
                                        onChange={(e) => form.setData('vat_rate', e.target.value)}
                                    />
                                </label>
                                <label className="offacto-time-field">
                                    <span>{t('purchases.iban')}</span>
                                    <input
                                        className="offacto-time-inp"
                                        value={form.data.iban}
                                        onChange={(e) => form.setData('iban', e.target.value)}
                                    />
                                </label>
                            </div>
                            <label className="offacto-time-field">
                                <span>{t('purchases.payment_note')}</span>
                                <input
                                    className="offacto-time-inp"
                                    value={form.data.payment_note}
                                    onChange={(e) => form.setData('payment_note', e.target.value)}
                                />
                            </label>
                            <label className="offacto-time-field">
                                <span>PDF</span>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    className="offacto-time-inp"
                                    onChange={(e) => form.setData('file', e.target.files?.[0] || null)}
                                />
                            </label>

                            <div className="offacto-purchases-lines">
                                <div className="offacto-time-card-head">
                                    <h3>{t('purchases.lines')}</h3>
                                    <button
                                        type="button"
                                        className="offacto-brief-btn-sm"
                                        onClick={() => form.setData('lines', [...form.data.lines, blankLine()])}
                                    >
                                        <Icon name="plus" />
                                        {t('purchases.add_line')}
                                    </button>
                                </div>
                                {form.data.lines.map((line, index) => (
                                    <div key={index} className="offacto-time-fg2">
                                        <input
                                            className="offacto-time-inp"
                                            placeholder={t('purchases.line_description')}
                                            value={line.description}
                                            onChange={(e) => {
                                                const lines = [...form.data.lines];
                                                lines[index] = { ...line, description: e.target.value };
                                                form.setData('lines', lines);
                                            }}
                                            required
                                        />
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="offacto-time-inp"
                                            placeholder={t('purchases.amount_excl')}
                                            value={line.amount_excl}
                                            onChange={(e) => {
                                                const lines = [...form.data.lines];
                                                lines[index] = { ...line, amount_excl: e.target.value };
                                                form.setData('lines', lines);
                                            }}
                                            required
                                        />
                                    </div>
                                ))}
                                {form.errors.lines ? (
                                    <span className="offacto-drawer-hint bad">{form.errors.lines}</span>
                                ) : null}
                            </div>

                            <div className="offacto-purchases-actions">
                                {active && active.status !== 'flagged' && active.status !== 'paid' ? (
                                    <button
                                        type="button"
                                        className="offacto-drawer-btn danger"
                                        onClick={() => router.post(`/purchases/${active.id}/flag`)}
                                    >
                                        {t('purchases.flag')}
                                    </button>
                                ) : null}
                                <div className="offacto-drawer-foot-spacer" />
                                <button type="submit" className="offacto-brief-btn" disabled={form.processing}>
                                    {t('purchases.save')}
                                </button>
                                {active && active.status === 'review' ? (
                                    <button
                                        type="button"
                                        className="offacto-btn-p"
                                        onClick={() => router.post(`/purchases/${active.id}/book`)}
                                    >
                                        {t('purchases.approve')}
                                    </button>
                                ) : null}
                                {active && active.status === 'booked' ? (
                                    <button
                                        type="button"
                                        className="offacto-brief-btn"
                                        onClick={() => router.post(`/purchases/${active.id}/pay`)}
                                    >
                                        {t('purchases.mark_paid')}
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </form>

                    <div className="offacto-dash-card offacto-purchases-paper">
                        <div className="offacto-purchases-paper-head">
                            <b>{form.data.supplier_name || '—'}</b>
                            <span>{form.data.invoice_number || '—'}</span>
                        </div>
                        <p className="offacto-purchases-hint">
                            {[form.data.supplier_address, form.data.supplier_vat].filter(Boolean).join(' · ') || '—'}
                        </p>
                        <table className="offacto-brief-table">
                            <tbody>
                                {form.data.lines.map((line, index) => (
                                    <tr key={index}>
                                        <td>{line.description || '—'}</td>
                                        <td className="num">{money(line.amount_excl || 0)}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td>
                                        <b>
                                            {t('purchases.vat')} {form.data.vat_rate}%
                                        </b>
                                    </td>
                                    <td className="num">{money(vat)}</td>
                                </tr>
                                <tr>
                                    <td>
                                        <b>{t('purchases.total_incl')}</b>
                                    </td>
                                    <td className="num">
                                        <b>{money(incl)}</b>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        {form.data.payment_note ? (
                            <div className="offacto-purchases-note">{form.data.payment_note}</div>
                        ) : null}
                        {form.data.iban ? <p className="offacto-purchases-hint">{form.data.iban}</p> : null}
                        {active?.file_path ? (
                            <a className="offacto-time-link" href={`/purchases/${active.id}/file`}>
                                {active.file_name || 'PDF'}
                            </a>
                        ) : null}
                    </div>
                </div>

                <div className="offacto-brief-table-card offacto-dash-card">
                    <div className="offacto-time-card-head">
                        <h3>{t('purchases.all')}</h3>
                        <a className="offacto-brief-btn-sm" href="/purchases/export">
                            <Icon name="down" />
                            {t('purchases.export')}
                        </a>
                    </div>
                    <div className="offacto-brief-table-wrap">
                        <table className="offacto-brief-table">
                            <thead>
                                <tr>
                                    <th>{t('purchases.supplier')}</th>
                                    <th>{t('purchases.date')}</th>
                                    <th>{t('purchases.category')}</th>
                                    <th>{t('purchases.check')}</th>
                                    <th className="num">{t('purchases.amount')}</th>
                                    <th>{t('common.status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="offacto-brief-empty">
                                            {t('purchases.empty')}
                                        </td>
                                    </tr>
                                ) : (
                                    invoices.map((row) => (
                                        <tr
                                            key={row.id}
                                            className={active?.id === row.id ? 'on' : ''}
                                            onClick={() => selectInvoice(row.id)}
                                        >
                                            <td>
                                                <b>{row.supplier?.name}</b>
                                            </td>
                                            <td>{dateInput(row.invoice_date)}</td>
                                            <td>{t(`purchases.cat_${row.category}`)}</td>
                                            <td>
                                                {(row.flags || []).length === 0 ? (
                                                    <span className="offacto-demo-badge ok nd">{t('purchases.ok')}</span>
                                                ) : (
                                                    (row.flags || []).map((flag) => (
                                                        <span key={flag} className="offacto-demo-badge warn nd">
                                                            {t(`purchases.flag_${flag}`).split(' ').slice(0, 2).join(' ')}
                                                        </span>
                                                    ))
                                                )}
                                            </td>
                                            <td className="num">{money(row.amount_incl)}</td>
                                            <td>
                                                <span className={`offacto-demo-badge nd ${statusClass(row.status)}`}>
                                                    {t(`purchases.status_${row.status}`)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
