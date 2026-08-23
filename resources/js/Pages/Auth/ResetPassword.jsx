import { useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AuthSplitLayout, { inputClass } from '../../Layouts/AuthSplitLayout';

const checks = [
    { id: 'length', label: 'At least 8 characters', test: (value) => value.length >= 8 },
    { id: 'number', label: 'Contains one number', test: (value) => /\d/.test(value) },
    { id: 'special', label: 'Contains one special character', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

export default function ResetPassword({ email = '' }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const results = useMemo(() => checks.map((check) => ({ ...check, ok: check.test(data.password) })), [data.password]);

    return (
        <AuthSplitLayout title="Reset password">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Reset your password</h2>
            <p className="mt-2 text-sm text-slate-500">Create a new, strong password for {email}.</p>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    post('/reset-password');
                }}
                className="mt-8 space-y-5"
            >
                <div>
                    <span className="mb-1.5 block text-sm font-medium text-slate-600">New Password</span>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className={`${inputClass(errors.password)} pr-14`}
                            placeholder="New Password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-3 text-xs font-medium text-slate-400 hover:text-slate-600"
                            onClick={() => setShowPassword((v) => !v)}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    {errors.password && <span className="mt-1 block text-xs text-rose-600">{errors.password}</span>}
                </div>

                <div>
                    <span className="mb-1.5 block text-sm font-medium text-slate-600">Confirm New Password</span>
                    <div className="relative">
                        <input
                            type={showConfirm ? 'text' : 'password'}
                            className={`${inputClass(errors.password_confirmation)} pr-14`}
                            placeholder="Confirm New Password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-3 text-xs font-medium text-slate-400 hover:text-slate-600"
                            onClick={() => setShowConfirm((v) => !v)}
                        >
                            {showConfirm ? 'Hide' : 'Show'}
                        </button>
                    </div>
                </div>

                <div className="rounded-xl bg-indigo-50 px-4 py-3">
                    <p className="mb-2 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                        Password requirements
                    </p>
                    <ul className="space-y-1.5 text-sm">
                        {results.map((check) => (
                            <li key={check.id} className={check.ok ? 'text-emerald-600' : 'text-slate-500'}>
                                {check.ok ? '●' : '○'} {check.label}
                            </li>
                        ))}
                    </ul>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="flex w-full items-center justify-center rounded-lg bg-slate-900 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                    Update password
                </button>
            </form>
        </AuthSplitLayout>
    );
}
