import { Link, useForm } from '@inertiajs/react';
import AuthSplitLayout, { inputClass } from '../../Layouts/AuthSplitLayout';

export default function ForgotPassword() {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    return (
        <AuthSplitLayout title="Forgot password">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Forgot password</h2>
            <p className="mt-2 text-sm text-slate-500">Enter your email and we’ll send a 6-digit verification code.</p>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    post('/forgot-password');
                }}
                className="mt-8 space-y-5"
            >
                <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-slate-600">Email Address</span>
                    <input
                        type="email"
                        className={inputClass(errors.email)}
                        placeholder="jane@company.com"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    {errors.email && <span className="mt-1 block text-xs text-rose-600">{errors.email}</span>}
                </label>
                <button
                    type="submit"
                    disabled={processing}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                    Send verification code
                    <span aria-hidden="true">→</span>
                </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
                Remembered it?{' '}
                <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Sign in
                </Link>
            </p>
        </AuthSplitLayout>
    );
}
