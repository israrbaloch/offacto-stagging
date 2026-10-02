import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { useUi } from '../context/UiContext';
import { resolveFlashMessage } from '../lib/flash';

/**
 * Syncs Laravel session flash → toast stack (once per navigation).
 */
export default function FlashToaster() {
    const { flash } = usePage().props;
    const { toast } = useUi();
    const lastKey = useRef('');

    useEffect(() => {
        const key = `${flash?.error ?? ''}|${flash?.status ?? ''}`;
        if (!key.trim() || key === lastKey.current) {
            return;
        }
        lastKey.current = key;

        const resolved = resolveFlashMessage(flash);
        if (!resolved || resolved.skipToast) {
            return;
        }

        const fn = toast[resolved.variant] || toast.info;
        fn(resolved.message, resolved.duration ?? 4500);
    }, [flash?.error, flash?.status, toast]);

    return null;
}
