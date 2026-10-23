import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import FlashToaster from '../../../Components/FlashToaster';
import FormErrorsToaster from '../../../Components/FormErrorsToaster';
import FloatingFavicons from '../../../Components/FloatingFavicons';
import Logo from '../../../Components/Logo';
import { AdminButton, checkboxClass, inputClass } from '../../../Components/Admin/ui';
import { AdminFieldError, AdminValidatedField } from '../../../Components/Admin/shared';

/** SH-001 — platform administrator sign-in. */
export default function AdminLogin({ allowRegistration = true }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    return (
        <div className="min-h-screen bg-slate-100">
            <Head title="Admin sign in" />
            <FlashToaster />
            <FormErrorsToaster errors={errors} />
            <div className="mx-auto flex min-h-screen max-w-6xl flex-col lg:flex-row">
                <aside className="auth-aside-bg relative hidden w-full flex-col justify-center overflow-hidden px-10 py-12 lg:flex lg:w-[42%]">
                    <FloatingFavicons count={6} minSize={28} maxSize={96} />
                    <div className="relative z-10">
                        <Logo className="h-8 w-auto" />
                        <h1 className="mt-10 text-3xl font-semibold tracking-tight text-slate-900">Platform administration</h1>
                        <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">Sign in with a platform administrator account. Workspace customer login uses the standard portal.</p>
                    </div>
                </aside>
                <section className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12">
                    <div className="mx-auto w-full max-w-md">
                        <div className="lg:hidden">
                            <Logo className="h-7 w-auto" />
                        </div>
                        <h2 className="mt-6 text-2xl font-semibold text-slate-900">Admin sign in</h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Or{' '}
                            <Link href="/login" className="font-medium text-slate-800 hover:underline">
                                use the customer login
                            </Link>
                        </p>
                        <form
                            className="mt-8 space-y-5"
                            onSubmit={(e) => {
                                e.preventDefault();
                                post('/login');
                            }}
                        >
                            <AdminValidatedField label="Email" required error={errors.email}>
                                <input
                                    type="email"
                                    autoComplete="username"
                                    className={inputClass}
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </AdminValidatedField>
                            <AdminValidatedField label="Password" required error={errors.password}>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        className={inputClass}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500" onClick={() => setShowPassword((v) => !v)}>
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </AdminValidatedField>
                            <label className="flex items-center gap-2 text-sm text-slate-600">
                                <input type="checkbox" className={checkboxClass} checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} />
                                Remember this device
                            </label>
                            <AdminFieldError message={errors.email && !errors.password ? errors.email : null} />
                            <AdminButton type="submit" className="w-full" disabled={processing}>
                                {processing ? 'Signing in…' : 'Sign in to admin'}
                            </AdminButton>
                        </form>
                        {allowRegistration && (
                            <p className="mt-6 text-center text-xs text-slate-400">
                                Need an account? <Link href="/register" className="text-slate-600 hover:underline">Register</Link>
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
