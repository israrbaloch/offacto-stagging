import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { flashLabel } from '../lib/utils';

export default function Toast() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(false);
    const message = flash?.error || (flash?.status ? flashLabel(flash.status) : null);
    const isError = Boolean(flash?.error);

    useEffect(() => {
        if (!message) {
            setVisible(false);
            return;
        }
        setVisible(true);
        const t = setTimeout(() => setVisible(false), 4000);
        return () => clearTimeout(t);
    }, [message, flash?.status, flash?.error]);

    if (!visible || !message) return null;

    return (
        <div
            className={`fixed right-4 top-4 z-50 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${
                isError ? 'bg-rose-600' : 'bg-emerald-600'
            }`}
        >
            {message}
        </div>
    );
}
