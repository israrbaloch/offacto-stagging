import { usePage } from '@inertiajs/react';
import { useLayoutEffect } from 'react';
import { setI18n } from '../lib/i18n';

export default function I18nSync() {
    const { locale, translations } = usePage().props;

    useLayoutEffect(() => {
        setI18n(locale, translations);
    }, [locale, translations]);

    setI18n(locale, translations);

    return null;
}
