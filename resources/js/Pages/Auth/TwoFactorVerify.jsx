import { Head, useForm } from '@inertiajs/react';
import Logo from '../../Components/Logo';

const inputClass =
    'w-full rounded-xl border border-indigo-100 bg-indigo-50/80 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100';

export default function TwoFactorVerify({ hint, recoveryAvailable = true }) {
    const totp = useForm({ code: '' });
    const recovery = useForm({ recovery_code: '' });

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
            <Head title="Verify identity" />
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <Logo className="mx-auto h-7 w-auto" />
                <h1 className="mt-6 text-center text-xl font-semibold text-slate-900">Two-step verification</h1>
                <p className="mt-2 text-center text-sm text-slate-500">{hint}</p>
                <form
                    className="mt-8 space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        totp.post('/two-factor/verify');
                    }}
                >
                    <label className="block text-sm">
                        <span className="mb-1.5 block font-medium text-slate-700">Authenticator code</span>
                        <input
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            className={`${inputClass} text-center font-mono text-lg tracking-widest`}
                            maxLength={8}
                            value={totp.data.code}
                            onChange={(e) => totp.setData('code', e.target.value.replace(/\s/g, ''))}
                        />
                        {totp.errors.code && <span className="mt-1 block text-xs text-rose-600">{totp.errors.code}</span>}
                    </label>
                    <button
                        type="submit"
                        disabled={totp.processing}
                        className="w-full rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                    >
                        Verify and continue
                    </button>
                </form>
                {recoveryAvailable && (
                    <form
                        className="mt-8 space-y-3 border-t border-slate-100 pt-6"
                        onSubmit={(e) => {
                            e.preventDefault();
                            recovery.post('/two-factor/recover');
                        }}
                    >
                        <label className="block text-sm">
                            <span className="mb-1.5 block font-medium text-slate-700">Recovery code</span>
                            <input
                                className={`${inputClass} text-center font-mono tracking-widest`}
                                autoComplete="off"
                                value={recovery.data.recovery_code}
                                onChange={(e) => recovery.setData('recovery_code', e.target.value)}
                            />
                            {recovery.errors.recovery_code && (
                                <span className="mt-1 block text-xs text-rose-600">{recovery.errors.recovery_code}</span>
                            )}
                        </label>
                        <p className="text-xs text-slate-500">Using a recovery code signs you in and asks you to enroll a new authenticator.</p>
                        <button
                            type="submit"
                            disabled={recovery.processing}
                            className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Use recovery code
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
