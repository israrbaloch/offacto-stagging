import { Head } from '@inertiajs/react';
import MfaVerifyForm from '../../Components/Auth/MfaVerifyForm';
import Logo from '../../Components/Logo';

const inputClass =
    'w-full rounded-xl border border-indigo-100 bg-indigo-50/80 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100';

function Field({ label, required, error, children }) {
    return (
        <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-slate-700">
                {label}
                {required && <span className="text-rose-500"> *</span>}
            </span>
            {children}
            {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
        </label>
    );
}

function Button({ type, className, disabled, children }) {
    return (
        <button
            type={type}
            disabled={disabled}
            className={`rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 ${className ?? ''}`}
        >
            {children}
        </button>
    );
}

export default function TwoFactorVerify({ recoveryAvailable = true }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
            <Head title="Verify identity" />
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <Logo className="mx-auto h-7 w-auto" />
                <h1 className="mt-6 text-center text-xl font-semibold text-slate-900">Two-step verification</h1>
                <MfaVerifyForm
                    verifyUrl="/two-factor/verify"
                    recoverUrl="/two-factor/recover"
                    recoveryAvailable={recoveryAvailable}
                    inputClass={inputClass}
                    Button={Button}
                    Field={Field}
                />
            </div>
        </div>
    );
}
