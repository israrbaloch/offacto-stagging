import { Head, useForm, usePage } from '@inertiajs/react';
import Logo from '../../../Components/Logo';
import { AdminButton } from '../../../Components/Admin/ui';
import { AdminValidatedField } from '../../../Components/Admin/shared';
import { inputClass } from '../../../Components/Admin/ui';

export default function AdminMfaEnroll({ required, alreadyEnrolled, mustReenroll, setup, recoveryCodes }) {
    const start = useForm({ password: '' });
    const confirm = useForm({ code: '' });
    const { flash } = usePage().props;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 py-10">
            <Head title="Set up authenticator" />
            <div className="w-full max-w-lg rounded-2xl border border-slate-200/70 bg-white p-8 shadow-sm">
                <Logo className="mx-auto h-7 w-auto" />
                <h1 className="mt-6 text-center text-xl font-semibold text-slate-900">Authenticator app</h1>
                <p className="mt-2 text-center text-sm text-slate-500">
                    {required
                        ? 'Platform policy requires MFA for admin access. Add an authenticator app to continue.'
                        : 'Add an authenticator app for this admin account.'}
                </p>
                {mustReenroll && (
                    <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        A recovery code was used. Enroll a new authenticator before continuing.
                    </p>
                )}
                {alreadyEnrolled && !mustReenroll && !recoveryCodes && (
                    <p className="mt-3 text-center text-sm text-emerald-700">This account already has MFA enrolled.</p>
                )}

                {Array.isArray(recoveryCodes) && recoveryCodes.length > 0 && (
                    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm font-medium text-amber-900">Store these recovery codes now. They are shown once.</p>
                        <ul className="mt-3 space-y-1 font-mono text-sm">
                            {recoveryCodes.map((code) => (
                                <li key={code}>{code}</li>
                            ))}
                        </ul>
                        <a href="/admin" className="mt-4 inline-block text-sm font-medium text-slate-900 underline">
                            Continue to admin
                        </a>
                    </div>
                )}

                {!setup && !recoveryCodes && (
                    <form
                        className="mt-8 space-y-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            start.post('/admin/mfa/enroll/start');
                        }}
                    >
                        <AdminValidatedField label="Confirm your password" required error={start.errors.password}>
                            <input
                                type="password"
                                autoComplete="current-password"
                                className={inputClass}
                                value={start.data.password}
                                onChange={(e) => start.setData('password', e.target.value)}
                            />
                        </AdminValidatedField>
                        <AdminButton type="submit" className="w-full" disabled={start.processing}>
                            Generate setup secret
                        </AdminButton>
                    </form>
                )}

                {setup && (
                    <form
                        className="mt-8 space-y-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            confirm.post('/admin/mfa/enroll/confirm');
                        }}
                    >
                        <p className="text-sm text-slate-600">Add this account in your authenticator app using the secret or URI below, then enter the 6-digit code.</p>
                        <AdminValidatedField label="Secret">
                            <input readOnly className={`${inputClass} font-mono`} value={setup.secret} />
                        </AdminValidatedField>
                        <AdminValidatedField label="otpauth URI">
                            <textarea readOnly className={`${inputClass} min-h-[80px] font-mono text-xs`} rows={3} value={setup.uri} />
                        </AdminValidatedField>
                        <AdminValidatedField label="Verification code" required error={confirm.errors.code}>
                            <input
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                className={`${inputClass} text-center font-mono text-lg tracking-widest`}
                                maxLength={8}
                                value={confirm.data.code}
                                onChange={(e) => confirm.setData('code', e.target.value.replace(/\s/g, ''))}
                            />
                        </AdminValidatedField>
                        <AdminButton type="submit" className="w-full" disabled={confirm.processing}>
                            Confirm and enable MFA
                        </AdminButton>
                    </form>
                )}
                {flash?.status === 'mfa-enrolled' && !recoveryCodes && (
                    <p className="mt-4 text-center text-sm text-emerald-700">Authenticator enrolled.</p>
                )}
            </div>
        </div>
    );
}
