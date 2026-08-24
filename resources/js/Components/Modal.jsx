import Icon from './Icon';

export default function Modal({ open, title, onClose, children, footer }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button type="button" className="absolute inset-0 bg-slate-900/40" onClick={onClose} aria-label="Close" />
            <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                    <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700" aria-label="Close">
                        <Icon name="close" className="h-4 w-4" />
                    </button>
                </div>
                <div>{children}</div>
                {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
            </div>
        </div>
    );
}
