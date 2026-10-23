import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { authLinkClass, authMutedClass } from '../../Layouts/AuthSplitLayout';
import { t } from '../../lib/i18n';

/**
 * @param {{ verifyUrl: string, recoverUrl: string, recoveryAvailable?: boolean, inputClass: string, Button: import('react').ComponentType<any>, Field: import('react').ComponentType<any>, className?: string }} props
 */
export default function MfaVerifyForm({
    verifyUrl,
    recoverUrl,
    recoveryAvailable = true,
    inputClass,
    Button,
    Field,
    className = '',
}) {
    const [mode, setMode] = useState('authenticator');
    const totp = useForm({ code: '' });
    const recovery = useForm({ recovery_code: '' });

    const subtitle =
        mode === 'authenticator' ? t('auth.mfa_code_subtitle') : t('auth.mfa_recovery_subtitle');

    return (
        <>
            <p className={`${className || authMutedClass}`}>{subtitle}</p>

            {mode === 'authenticator' ? (
                <form
                    className="mt-6 grid gap-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        totp.post(verifyUrl);
                    }}
                >
                    <Field label={t('auth.mfa_authenticator_code')} required>
                        <input
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            className={`${inputClass} text-center font-mono text-lg tracking-widest`}
                            maxLength={8}
                            value={totp.data.code}
                            onChange={(e) => totp.setData('code', e.target.value.replace(/\s/g, ''))}
                        />
                    </Field>
                    <Button type="submit" disabled={totp.processing}>
                        {t('auth.mfa_verify_continue')}
                    </Button>
                </form>
            ) : (
                <form
                    className="mt-6 grid gap-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        recovery.post(recoverUrl);
                    }}
                >
                    <Field label={t('auth.mfa_recovery_code')}>
                        <input
                            className={`${inputClass} text-center font-mono tracking-widest`}
                            autoComplete="off"
                            value={recovery.data.recovery_code}
                            onChange={(e) => recovery.setData('recovery_code', e.target.value)}
                        />
                    </Field>
                    <Button type="submit" disabled={recovery.processing}>
                        {t('auth.mfa_use_recovery_submit')}
                    </Button>
                </form>
            )}

            {recoveryAvailable && (
                <p className="mt-6 text-center">
                    <button
                        type="button"
                        className={`text-sm ${authLinkClass}`}
                        onClick={() => setMode(mode === 'authenticator' ? 'recovery' : 'authenticator')}
                    >
                        {mode === 'authenticator' ? t('auth.mfa_use_recovery') : t('auth.mfa_use_authenticator')}
                    </button>
                </p>
            )}
        </>
    );
}
