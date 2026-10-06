import Icon from './Icon';
import { t } from '../lib/i18n';

export function SendModalFrame({ open, onClose, title, documentNumber, hint, footer, children }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <button type="button" className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-label="Close" />
            <div
                className="relative z-10 flex max-h-[min(92vh,880px)] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-xl"
                role="dialog"
                aria-modal="true"
            >
                <div className="shrink-0 border-b border-slate-100 px-6 pb-4 pt-6">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
                            {documentNumber && (
                                <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
                                    {documentNumber}
                                </span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                            aria-label="Close"
                        >
                            <Icon name="close" className="h-4 w-4" />
                        </button>
                    </div>
                    {hint && <p className="mt-2 text-sm leading-relaxed text-slate-500">{hint}</p>}
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
                {footer && <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 px-6 py-4">{footer}</div>}
            </div>
        </div>
    );
}

export function SendModalFooter({ onCancel, onSubmit, processing, submitLabel }) {
    return (
        <>
            <button
                type="button"
                onClick={onCancel}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
                {t('common.cancel')}
            </button>
            <button
                type="button"
                disabled={processing}
                onClick={onSubmit}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 disabled:opacity-50"
            >
                {submitLabel || t('offers.send_confirm')}
                <Icon name="chevronRight" className="h-4 w-4" />
            </button>
        </>
    );
}

function MailIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="3" y="5" width="18" height="14" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
            <path d="m3 7 9 6 9-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

function WhatsAppIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2a10 10 0 0 0-8.7 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2Zm0 2a8 8 0 0 1 6.8 12.1l-.3.5-.8 2.3-2.4-.6-.5.3A8 8 0 1 1 12 4Zm-.5 3.5c-.3 0-.8.1-1.2.5-.4.4-1.2 1.2-1.2 2.9 0 1.7 1.2 3.4 1.4 3.6.2.2 2.3 3.6 5.7 4.9 2.8 1.1 3.4.7 4 .7.6 0 2-1 2.3-2 .3-.9.3-1.7.2-1.9-.1-.2-.4-.3-.9-.5-.5-.2-2.9-1.4-3.3-1.6-.4-.2-.7-.3-1 .5-.3.8-1.1 1.6-1.4 1.7-.3.2-.6.3-1.1.1-.5-.2-2.1-.8-4-2.5-1.5-1.3-2.5-3-2.8-3.5-.3-.5 0-.8.2-1 .2-.2.5-.5.6-.7.2-.2.3-.4.4-.7.1-.3 0-.5 0-.7 0-.2-.4-1.1-.6-1.5Z" />
        </svg>
    );
}

function PeppolIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

const ICONS = {
    email: { node: MailIcon, wrap: 'bg-amber-50 text-amber-600' },
    whatsapp: { node: WhatsAppIcon, wrap: 'bg-emerald-50 text-emerald-600' },
    postbode: { node: MailIcon, wrap: 'bg-slate-100 text-slate-500' },
    peppol: { node: PeppolIcon, wrap: 'bg-sky-50 text-sky-600' },
    mollie: { node: PeppolIcon, wrap: 'bg-violet-50 text-violet-600' },
};

export function DeliveryChannelsPanel({ channelError, extra, children }) {
    return (
        <section className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
            <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {t('send_modal.channels_heading')}
                </h3>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {t('send_modal.ready')}
                </span>
            </div>
            <ul className="space-y-2">{children}</ul>
            {channelError && <p className="mt-2 text-xs text-rose-600">{channelError}</p>}
            {extra}
        </section>
    );
}

export function ChannelCard({ id, checked, disabled, onToggle, title, subtitle, badge, icon = 'email' }) {
    const meta = ICONS[icon] || ICONS.email;
    const IconComponent = meta.node;

    return (
        <li>
            <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl border bg-white px-3 py-3 transition ${
                    disabled ? 'cursor-not-allowed border-slate-100 opacity-60' : 'border-slate-200 hover:border-slate-300'
                } ${checked && !disabled ? 'border-amber-200 ring-1 ring-amber-100' : ''}`}
            >
                <input
                    type="checkbox"
                    className="mt-1"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => !disabled && onToggle(id)}
                />
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{title}</span>
                        {badge && (
                            <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                                {badge}
                            </span>
                        )}
                    </div>
                    {subtitle && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{subtitle}</p>}
                </div>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.wrap}`}>
                    <IconComponent className="h-5 w-5" />
                </span>
            </label>
        </li>
    );
}

export function EmailDeliveryPanel({ show, placeholderOff, children }) {
    if (!show) {
        return (
            <section className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center">
                <p className="max-w-xs text-sm text-slate-500">{placeholderOff}</p>
            </section>
        );
    }

    return (
        <section className="rounded-xl border border-slate-200 bg-white p-4 lg:min-h-[280px]">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {t('send_modal.email_options_heading')}
            </h3>
            <div className="mt-4 space-y-4">{children}</div>
        </section>
    );
}

export function SendInfoBanner({ children }) {
    return (
        <div className="flex gap-3 rounded-xl border border-sky-100 bg-sky-50/80 px-3.5 py-3 text-xs leading-relaxed text-slate-600">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-700">
                i
            </span>
            <div>{children}</div>
        </div>
    );
}

export function MessageField({ label, optionalLabel, value, onChange, placeholder, rows = 5 }) {
    return (
        <label className="block">
            <span className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-800">{label}</span>
                {optionalLabel && <span className="text-xs font-normal text-slate-400">{optionalLabel}</span>}
            </span>
            <textarea
                rows={rows}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
            />
        </label>
    );
}
