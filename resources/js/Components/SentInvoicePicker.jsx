import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useUi } from '../context/UiContext';
import { t } from '../lib/i18n';
import { money } from '../lib/utils';
import Modal from './Modal';

export default function SentInvoicePicker({ open, mode = 'credit', onClose }) {
    const { confirm } = useUi();
    const [rows, setRows] = useState([]);
    const [phase, setPhase] = useState('idle');
    const [busyId, setBusyId] = useState(null);

    useEffect(() => {
        if (!open) {
            setPhase('idle');
            setRows([]);
            return undefined;
        }
        let cancelled = false;
        setPhase('loading');
        fetch('/invoices/issued-sources', {
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
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
    }, [open]);

    const choose = async (row) => {
        const message = mode === 'recurring'
            ? t('invoices.recurring_from_sent_confirm')
            : t('invoices.credit_note_confirm');
        if (!(await confirm({ message, confirmLabel: t('common.confirm') }))) {
            return;
        }
        setBusyId(row.id);
        const path = mode === 'recurring'
            ? `/invoices/${row.id}/recurring-from`
            : `/invoices/${row.id}/credit-note`;
        router.post(path, {}, {
            onFinish: () => setBusyId(null),
        });
    };

    return (
        <Modal
            open={open}
            title={mode === 'recurring' ? t('invoices.pick_recurring_title') : t('invoices.pick_credit_title')}
            onClose={busyId ? () => {} : onClose}
            size="lg"
        >
            {phase !== 'ready' ? <p className="offacto-invoice-hint">{t('invoices.pick_source_loading')}</p> : null}
            {phase === 'ready' && rows.length === 0 ? <p className="offacto-invoice-hint">{t('invoices.pick_source_empty')}</p> : null}
            {phase === 'ready' && rows.length > 0 ? (
                <ul className="offacto-source-list">
                    {rows.map((row) => (
                        <li key={row.id}>
                            <button type="button" className="offacto-source-row" disabled={busyId !== null} onClick={() => choose(row)}>
                                <b>{row.invoice_number || '—'}</b>
                                <span>{row.customer_name || '—'}</span>
                                <span>{money(row.total)}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : null}
        </Modal>
    );
}
