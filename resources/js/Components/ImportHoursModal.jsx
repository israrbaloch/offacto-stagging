import { useEffect, useState } from 'react';
import Modal from './Modal';
import { t } from '../lib/i18n';

export default function ImportHoursModal({ open, customerId, onClose, onConfirm }) {
    const [rows, setRows] = useState([]);
    const [selected, setSelected] = useState([]);
    const [phase, setPhase] = useState('idle');

    useEffect(() => {
        if (!open || !customerId) {
            setPhase('idle');
            return undefined;
        }
        let cancelled = false;
        setPhase('loading');
        setSelected([]);
        fetch(`/invoices/uninvoiced-time?customer_id=${encodeURIComponent(customerId)}`, {
            headers: { Accept: 'application/json' },
        })
            .then((response) => response.json())
            .then((payload) => {
                if (!cancelled) {
                    setRows(Array.isArray(payload?.data) ? payload.data : []);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setRows([]);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setPhase('ready');
                }
            });
        return () => {
            cancelled = true;
        };
    }, [open, customerId]);

    const toggle = (id) => {
        setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={t('invoices.import_hours_title')}
            footer={
                <>
                    <button type="button" className="offacto-brief-btn" onClick={onClose}>
                        {t('common.cancel')}
                    </button>
                    <button
                        type="button"
                        className="offacto-btn-p"
                        disabled={selected.length === 0}
                        onClick={() => onConfirm(rows.filter((row) => selected.includes(row.id)))}
                    >
                        {t('invoices.import_hours_add')}
                    </button>
                </>
            }
        >
            {phase !== 'ready' ? <p className="text-sm text-slate-500">{t('invoices.import_hours_loading')}</p> : null}
            {phase === 'ready' && rows.length === 0 ? (
                <p className="text-sm text-slate-500">{t('invoices.import_hours_empty')}</p>
            ) : null}
            <ul className="space-y-2">
                {rows.map((row) => (
                    <li key={row.id}>
                        <label className="flex items-start gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                            <input
                                type="checkbox"
                                className="mt-1"
                                checked={selected.includes(row.id)}
                                onChange={() => toggle(row.id)}
                            />
                            <span>
                                <b>{row.service_name || t('invoices.import_hours')}</b>
                                <span className="mt-0.5 block text-slate-500">
                                    {row.hours} h{row.description ? ` · ${row.description}` : ''}
                                </span>
                            </span>
                        </label>
                    </li>
                ))}
            </ul>
        </Modal>
    );
}
