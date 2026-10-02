import { router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import Logo from '../../Components/Logo';
import AuthSplitLayout from '../../Layouts/AuthSplitLayout';

function secondsUntil(iso) {
    if (!iso) return 0;
    return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 1000));
}

function formatTime(total) {
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const OTP_ROUTES = {
    registration: {
        verify: '/register/verify',
        resend: '/register/resend',
        cancel: '/register/verify/cancel',
        backLabel: 'Back to login',
        submitLabel: 'Verify email',
        title: 'Verify your email',
        hint: 'Enter the code we sent to finish creating your account.',
    },
    password_reset: {
        verify: '/forgot-password/verify',
        resend: '/forgot-password/resend',
        cancel: '/forgot-password/verify/cancel',
        backLabel: 'Use a different email',
        submitLabel: 'Continue',
        title: 'Enter reset code',
        hint: 'Enter the code we sent to reset your password.',
    },
};

function resolveOtpContext(propContext, url) {
    const path = (url || '').split('?')[0];
    if (path === '/register/verify') {
        return 'registration';
    }
    if (path === '/forgot-password/verify') {
        return 'password_reset';
    }
    if (propContext === 'registration' || propContext === 'password_reset') {
        return propContext;
    }
    return 'password_reset';
}

function firstError(errors, key) {
    const value = errors?.[key];
    if (!value) {
        return '';
    }
    return Array.isArray(value) ? value[0] : value;
}

export default function VerifyOtp({ email, expiresAt, resendAt, otpContext: otpContextProp }) {
    const { props, url } = usePage();
    const otpContext = useMemo(() => resolveOtpContext(otpContextProp, url), [otpContextProp, url]);
    const routes = OTP_ROUTES[otpContext] ?? OTP_ROUTES.password_reset;

    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [expiresIn, setExpiresIn] = useState(() => secondsUntil(expiresAt));
    const [resendIn, setResendIn] = useState(() => secondsUntil(resendAt));
    const [resending, setResending] = useState(false);
    const inputs = useRef([]);
    const { setData, data } = useForm({ code: '' });
    const [processing, setProcessing] = useState(false);
    const submitting = useRef(false);

    const codeError = firstError(props.errors, 'code');

    useEffect(() => {
        setExpiresIn(secondsUntil(expiresAt));
        setResendIn(secondsUntil(resendAt));
    }, [expiresAt, resendAt]);

    useEffect(() => {
        const timer = setInterval(() => {
            setExpiresIn(secondsUntil(expiresAt));
            setResendIn(secondsUntil(resendAt));
        }, 1000);
        return () => clearInterval(timer);
    }, [expiresAt, resendAt]);

    const submitCode = (code) => {
        if (code.length !== 6 || submitting.current) return;
        submitting.current = true;
        setData('code', code);
        router.post(routes.verify, { code }, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onError: () => {
                setDigits(['', '', '', '', '', '']);
                setData('code', '');
                requestAnimationFrame(() => inputs.current[0]?.focus());
            },
            onFinish: () => {
                submitting.current = false;
                setProcessing(false);
            },
        });
    };

    const resendCode = () => {
        if (resending) return;
        setResending(true);
        router.post(routes.resend, {}, {
            preserveScroll: true,
            onFinish: () => setResending(false),
        });
    };

    const updateDigit = (index, value) => {
        if (!/^\d?$/.test(value)) return;
        const next = [...digits];
        next[index] = value;
        setDigits(next);
        setData('code', next.join(''));
        if (value && index < 5) {
            inputs.current[index + 1]?.focus();
        }
        if (next.every(Boolean)) {
            submitCode(next.join(''));
        }
    };

    const onPaste = (event) => {
        const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;
        event.preventDefault();
        const next = Array.from({ length: 6 }, (_, i) => pasted[i] || '');
        setDigits(next);
        setData('code', next.join(''));
        inputs.current[Math.min(pasted.length, 5)]?.focus();
        if (pasted.length === 6) {
            submitCode(pasted);
        }
    };

    return (
        <AuthSplitLayout title={routes.title}>
            <Logo className="h-7 w-auto" />
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{routes.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{routes.hint}</p>
            <p className="mt-1 text-sm text-slate-500">
                Code sent to <span className="font-medium text-slate-700">{email}</span>
            </p>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    submitCode(data.code || digits.join(''));
                }}
                className="mt-8 space-y-6"
            >
                <div className="flex justify-between gap-2" onPaste={onPaste}>
                    {digits.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => {
                                inputs.current[index] = el;
                            }}
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => updateDigit(index, e.target.value.replace(/\D/g, ''))}
                            onKeyDown={(e) => {
                                if (e.key === 'Backspace' && !digits[index] && index > 0) {
                                    inputs.current[index - 1]?.focus();
                                }
                            }}
                            aria-invalid={codeError ? 'true' : undefined}
                            aria-describedby={codeError ? 'otp-code-error' : undefined}
                            className={`h-12 w-11 rounded-lg border bg-white text-center text-lg font-semibold outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${
                                codeError ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'
                            }`}
                        />
                    ))}
                </div>
                {codeError && (
                    <div
                        id="otp-code-error"
                        role="alert"
                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
                    >
                        {codeError}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={processing || digits.join('').length !== 6}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                    {routes.submitLabel}
                    <span aria-hidden="true">→</span>
                </button>
            </form>

            <div className="mt-6 space-y-2 text-center text-sm text-slate-500">
                {resendIn > 0 ? (
                    <p>Resend code in {formatTime(resendIn)}</p>
                ) : (
                    <button
                        type="button"
                        disabled={resending}
                        className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                        onClick={resendCode}
                    >
                        {resending ? 'Sending…' : 'Resend code'}
                    </button>
                )}
                <p className="text-xs text-slate-400">
                    {expiresIn > 0 ? `Code expires in ${formatTime(expiresIn)}` : 'This code has expired. Use resend for a new one.'}
                </p>
                <button
                    type="button"
                    className="block w-full text-sm text-slate-500 hover:text-slate-700"
                    onClick={() => router.post(routes.cancel)}
                >
                    {routes.backLabel}
                </button>
            </div>
        </AuthSplitLayout>
    );
}
