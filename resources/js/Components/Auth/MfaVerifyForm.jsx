import { useState } from 'react';
import { useForm } from '@inertiajs/react';

/**
 * @param {{ verifyUrl: string, recoverUrl: string, recoveryAvailable?: boolean, inputClass: string, Button: import('react').ComponentType<any>, Field: import('react').ComponentType<any> }} props
 */
export default function MfaVerifyForm({
    verifyUrl,
    recoverUrl,
    recoveryAvailable = true,
    inputClass,
    Button,
    Field,
}) {
    const [mode, setMode] = useState('authenticator');
    const totp = useForm({ code: '' });
    const recovery = useForm({ recovery_code: '' });

    const subtitle =
        mode === 'authenticator'
            ? 'Enter the 6-digit code from your authenticator app.'
            : 'Enter a one-time recovery code. You will be asked to enroll a new authenticator afterward.';

    return (
        <>
            <p className="mt-2 text-center text-sm text-slate-500">{subtitle}</p>

            {mode === 'authenticator' ? (
                <form
                    className="mt-8 space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        totp.post(verifyUrl);
                    }}
                >
                    <Field label="Authenticator code" required error={totp.errors.code}>
                        <input
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            className={`${inputClass} text-center font-mono text-lg tracking-widest`}
                            maxLength={8}
                            value={totp.data.code}
                            onChange={(e) => totp.setData('code', e.target.value.replace(/\s/g, ''))}
                        />
                    </Field>
                    <Button type="submit" className="w-full" disabled={totp.processing}>
                        Verify and continue
                    </Button>
                </form>
            ) : (
                <form
                    className="mt-8 space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        recovery.post(recoverUrl);
                    }}
                >
                    <Field label="Recovery code" error={recovery.errors.recovery_code}>
                        <input
                            className={`${inputClass} text-center font-mono tracking-widest`}
                            autoComplete="off"
                            value={recovery.data.recovery_code}
                            onChange={(e) => recovery.setData('recovery_code', e.target.value)}
                        />
                    </Field>
                    <Button type="submit" className="w-full" disabled={recovery.processing}>
                        Use recovery code
                    </Button>
                </form>
            )}

            {recoveryAvailable && (
                <p className="mt-6 text-center">
                    <button
                        type="button"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                        onClick={() => setMode(mode === 'authenticator' ? 'recovery' : 'authenticator')}
                    >
                        {mode === 'authenticator' ? 'Use a recovery code instead' : 'Use authenticator code instead'}
                    </button>
                </p>
            )}
        </>
    );
}
