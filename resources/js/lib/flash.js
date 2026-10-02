import { t } from './i18n';

/** Status keys that should stay on-page (not auto toast). */
export const FLASH_SKIP_TOAST = new Set(['payment-processing', 'briefing-submitted']);

export function flashLabel(status) {
    if (!status) {
        return '';
    }
    const key = `flash.${status}`;
    const translated = t(key);
    if (translated !== key) {
        return translated;
    }
    if (/[\s]/.test(status) && status.length > 24) {
        return status;
    }

    return status.replace(/-/g, ' ');
}

/**
 * @returns {{ message: string, variant: string, duration?: number, skipToast?: boolean } | null}
 */
export function resolveFlashMessage(flash) {
    if (!flash) {
        return null;
    }

    if (flash.error) {
        return { message: flash.error, variant: 'error', duration: 6000 };
    }

    if (!flash.status) {
        return null;
    }

    if (FLASH_SKIP_TOAST.has(flash.status)) {
        return { skipToast: true };
    }

    const message = flashLabel(flash.status);
    const variant = flash.status.includes('error') || flash.status.includes('failed') ? 'error' : 'success';

    return { message, variant, duration: 4500 };
}
