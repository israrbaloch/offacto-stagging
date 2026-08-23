import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
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

export default function VerifyOtp({ email, expiresAt, resendAt }) {
    const { flash } = usePage().props;
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [expiresIn, setExpiresIn] = useState(() => secondsUntil(expiresAt));
    const [resendIn, setResendIn] = useState(() => secondsUntil(resendAt));
    const inputs = useRef([]);
    const { errors, setData, data } = useForm({ code: '' });
    const [processing, setProcessing] = useState(false);
    const submitting = useRef(false);

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
        router.post('/forgot-password/verify', { code }, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                submitting.current = false;
                setProcessing(false);
            },
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
        <AuthSplitLayout title="Verify email">
            <p className="text-sm font-medium text-indigo-600">Offacto</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Verify your email</h2>
            <p className="mt-2 text-sm text-slate-500">
                We’ve sent a 6-digit code to <span className="font-medium text-slate-700">{email}</span>.
            </p>
            {flash?.status && <p className="mt-3 text-sm text-emerald-600">{flash.status}</p>}

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
                            className={`h-12 w-11 rounded-lg border text-center text-lg font-semibold outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${
                                errors.code ? 'border-rose-400' : 'border-slate-200'
                            }`}
                        />
                    ))}
                </div>
                {errors.code && <p className="text-xs text-rose-600">{errors.code}</p>}

                <button
                    type="submit"
                    disabled={processing || digits.join('').length !== 6}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                    Verify account
                    <span aria-hidden="true">→</span>
                </button>
            </form>

            <div className="mt-6 space-y-2 text-center text-sm text-slate-500">
                {resendIn > 0 ? (
                    <p>Resend code in {formatTime(resendIn)}</p>
                ) : (
                    <button
                        type="button"
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                        onClick={() => router.post('/forgot-password/resend')}
                    >
                        Resend code
                    </button>
                )}
                <p className="text-xs text-slate-400">
                    {expiresIn > 0 ? `Code expires in ${formatTime(expiresIn)}` : 'This code has expired.'}
                </p>
                <Link href="/forgot-password" className="block text-sm text-slate-500 hover:text-slate-700">
                    Use a different email
                </Link>
            </div>
        </AuthSplitLayout>
    );
}
