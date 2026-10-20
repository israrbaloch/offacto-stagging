import { Head, useForm } from '@inertiajs/react';
import Logo from '../../../Components/Logo';
import { AdminButton } from '../../../Components/Admin/ui';
import { AdminValidatedField } from '../../../Components/Admin/shared';
import { inputClass } from '../../../Components/Admin/ui';

export default function AdminMfaVerify({ hint, recoveryAvailable = true }) {
    const totp = useForm({ code: '' });
    const recovery = useForm({ recovery_code: '' });

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4">
            <Head title="Verify identity" />
            <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-8 shadow-sm">
                <Logo className="mx-auto h-7 w-auto" />
                <h1 className="mt-6 text-center text-xl font-semibold text-slate-900">Additional verification</h1>
                <p className="mt-2 text-center text-sm text-slate-500">{hint}</p>
                <form
                    className="mt-8 space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        totp.post('/admin/mfa/verify');
                    }}
                >
                    <AdminValidatedField label="Authenticator code" required error={totp.errors.code}>
                        <input
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            className={`${inputClass} text-center font-mono text-lg tracking-widest`}
                            maxLength={8}
                            value={totp.data.code}
                            onChange={(e) => totp.setData('code', e.target.value.replace(/\s/g, ''))}
                        />
                    </AdminValidatedField>
                    <AdminButton type="submit" className="w-full" disabled={totp.processing}>
                        Verify and continue
                    </AdminButton>
                </form>
                {recoveryAvailable && (
                    <form
                        className="mt-8 space-y-3 border-t border-slate-100 pt-6"
                        onSubmit={(e) => {
                            e.preventDefault();
                            recovery.post('/admin/mfa/recover');
                        }}
                    >
                        <AdminValidatedField label="Recovery code" error={recovery.errors.recovery_code}>
                            <input
                                className={`${inputClass} text-center font-mono tracking-widest`}
                                autoComplete="off"
                                value={recovery.data.recovery_code}
                                onChange={(e) => recovery.setData('recovery_code', e.target.value)}
                            />
                        </AdminValidatedField>
                        <p className="text-xs text-slate-500">Using a recovery code signs you in and asks you to enroll a new authenticator.</p>
                        <AdminButton type="submit" className="w-full" disabled={recovery.processing}>
                            Use recovery code
                        </AdminButton>
                    </form>
                )}
            </div>
        </div>
    );
}
