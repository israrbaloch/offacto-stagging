import { useEffect, useRef } from 'react';
import { useUi } from '../context/UiContext';

/** First human-readable validation message from an Inertia/Laravel errors bag. */
export function firstFormErrorMessage(errors) {
    if (!errors || typeof errors !== 'object') {
        return null;
    }
    if (errors.auth) {
        return errors.auth;
    }
    if (errors.email) {
        return errors.email;
    }
    if (errors.password) {
        return errors.password;
    }
    if (errors.code) {
        return errors.code;
    }
    const first = Object.values(errors).find((value) => typeof value === 'string' && value.trim());
    return first ?? null;
}

/**
 * Show validation errors in the demo toast (once per distinct error payload).
 * @param {Record<string, string>|undefined|null} errors
 * @param {'error'|'warning'|'info'|'success'} variant
 */
export function useFormErrorsToast(errors, variant = 'error') {
    const { toast } = useUi();
    const lastKey = useRef('');

    useEffect(() => {
        const message = firstFormErrorMessage(errors);
        const key = message ? JSON.stringify(errors) : '';

        if (!message) {
            lastKey.current = '';
            return;
        }

        if (key === lastKey.current) {
            return;
        }

        lastKey.current = key;
        const fn = toast[variant] || toast.error;
        fn(message, 2400);
    }, [errors, toast, variant]);
}
