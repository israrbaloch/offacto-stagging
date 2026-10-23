import { Head, Link, useForm, usePage } from '@inertiajs/react';
import FormErrorsToaster from '../../Components/FormErrorsToaster';
import Logo from '../../Components/Logo';

const inputClass =
    'w-full rounded-xl border border-indigo-100 bg-indigo-50/80 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100';

export default function TwoFactorEnroll({ required, alreadyEnrolled, mustReenroll, policyRequired, setup, recoveryCodes }) {
    const start = useForm({ password: '' });
    const confirm = useForm({ code: '' });
    const { flash } = usePage().props;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10">
            <Head title="Set up authenticator" />
            <FormErrorsToaster errors={{ ...start.errors, ...confirm.errors }} />
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <Logo className="mx-auto h-7 w-auto" />
                <h1 className="mt-6 text-center text-xl font-semibold text-slate-900">Authenticator app</h1>
                <p className="mt-2 text-center text-sm text-slate-500">
                    {policyRequired
                        ? 'Platform policy requires two-step verification for your admin access.'
                        : required
                          ? 'Scan the secret in Google Authenticator, Authy, or a similar app. You will need a code on each login.'
                          : 'Add an authenticator app to this account.'}
                </p>
                {mustReenroll && (
                    <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        A recovery code was used. Enroll a new authenticator before continuing.
                    </p>
                )}
                {alreadyEnrolled && !mustReenroll && !recoveryCodes && (
                    <p className="mt-3 text-center text-sm text-emerald-700">This account already has an authenticator enrolled.</p>
                )}

                {Array.isArray(recoveryCodes) && recoveryCodes.length > 0 && (
                    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm font-medium text-amber-900">Store these recovery codes now. They are shown once.</p>
                        <ul className="mt-3 space-y-1 font-mono text-sm">
                            {recoveryCodes.map((code) => (
                                <li key={code}>{code}</li>
                            ))}
                        </ul>
                        <Link href="/dashboard" className="mt-4 inline-block text-sm font-medium text-indigo-700 underline">
                            Continue to workspace
                        </Link>
                    </div>
                )}

                {!setup && !recoveryCodes && (
                    <form
                        className="mt-8 space-y-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            start.post('/two-factor/enroll/start');
                        }}
                    >
                        <label className="block text-sm">
                            <span className="mb-1.5 block font-medium text-slate-700">Confirm your password</span>
                            <input
                                type="password"
                                autoComplete="current-password"
                                className={inputClass}
                                value={start.data.password}
                                onChange={(e) => start.setData('password', e.target.value)}
                            />
                        </label>
                        <button
                            type="submit"
                            disabled={start.processing}
                            className="w-full rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                        >
                            Generate setup secret
                        </button>
                    </form>
                )}

                {setup && (
                    <form
                        className="mt-8 space-y-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            confirm.post('/two-factor/enroll/confirm');
                        }}
                    >
                        <p className="text-sm text-slate-600">Add this account in your authenticator app using the secret or URI below, then enter the 6-digit code.</p>
                        <label className="block text-sm">
                            <span className="mb-1.5 block font-medium text-slate-700">Secret</span>
                            <input readOnly className={`${inputClass} font-mono`} value={setup.secret} />
                        </label>
                        <label className="block text-sm">
                            <span className="mb-1.5 block font-medium text-slate-700">otpauth URI</span>
                            <textarea readOnly className={`${inputClass} min-h-[80px] font-mono text-xs`} rows={3} value={setup.uri} />
                        </label>
                        <label className="block text-sm">
                            <span className="mb-1.5 block font-medium text-slate-700">Verification code</span>
                            <input
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                className={`${inputClass} text-center font-mono text-lg tracking-widest`}
                                maxLength={8}
                                value={confirm.data.code}
                                onChange={(e) => confirm.setData('code', e.target.value.replace(/\s/g, ''))}
                            />
                        </label>
                        <button
                            type="submit"
                            disabled={confirm.processing}
                            className="w-full rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                        >
                            Confirm and enable
                        </button>
                    </form>
                )}
                {flash?.status === 'mfa-enrolled' && !recoveryCodes && (
                    <p className="mt-4 text-center text-sm text-emerald-700">Authenticator enrolled.</p>
                )}
            </div>
        </div>
    );
}
