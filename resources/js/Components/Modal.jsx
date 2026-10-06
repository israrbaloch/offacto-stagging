import Icon from './Icon';

const SIZE_CLASS = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
    xl: 'max-w-4xl',
};

export default function Modal({ open, title, onClose, children, footer, size = 'md' }) {
    if (!open) return null;

    const widthClass = SIZE_CLASS[size] || SIZE_CLASS.md;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <button type="button" className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-label="Close" />
            <div
                className={`relative z-10 flex w-full ${widthClass} max-h-[min(92vh,880px)] flex-col rounded-2xl bg-white shadow-xl`}
                role="dialog"
                aria-modal="true"
            >
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                    <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                    <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700" aria-label="Close">
                        <Icon name="close" className="h-4 w-4" />
                    </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
                {footer && <div className="flex shrink-0 justify-end gap-2 border-t border-slate-100 px-6 py-4">{footer}</div>}
            </div>
        </div>
    );
}
