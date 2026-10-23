import { router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AuthSplitLayout, {
    authHeadingClass,
    authLinkClass,
    authMutedClass,
    authOtpInputClass,
    authPrimaryButtonClass,
    authSubClass,
} from '../../Layouts/AuthSplitLayout';
import { t } from '../../lib/i18n';

function secondsUntil(iso) {
    if (!iso) return 0;
    return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 1000));
}

function formatTime(total) {
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const OTP_ROUTE_KEYS = {
    registration: {
        verify: '/register/verify',
        resend: '/register/resend',
        cancel: '/register/verify/cancel',
        backLabelKey: 'auth.back_login',
        submitLabelKey: 'auth.otp_verify_email_submit',
        titleKey: 'auth.otp_verify_email_title',
        hintKey: 'auth.otp_verify_email_hint',
    },
    password_reset: {
        verify: '/forgot-password/verify',
        resend: '/forgot-password/resend',
        cancel: '/forgot-password/verify/cancel',
        backLabelKey: 'auth.otp_back_reset',
        submitLabelKey: 'auth.otp_reset_submit',
        titleKey: 'auth.otp_reset_title',
        hintKey: 'auth.otp_reset_hint',
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
    const routes = OTP_ROUTE_KEYS[otpContext] ?? OTP_ROUTE_KEYS.password_reset;
    const title = t(routes.titleKey);

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
        <AuthSplitLayout title={title} showFormLogo>
            <h2 className={authHeadingClass}>{title}</h2>
            <p className={authSubClass}>{t(routes.hintKey)}</p>
            <p className={`mt-1 ${authMutedClass}`}>
                {t('auth.otp_sent_to')}{' '}
                <span className="font-semibold text-[#0E1250] dark:text-[#E8ECFF]">{email}</span>
            </p>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    submitCode(data.code || digits.join(''));
                }}
                className="mt-6 space-y-5"
            >
                <div className="auth-otp-row" onPaste={onPaste}>
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
                            className={authOtpInputClass(codeError)}
                        />
                    ))}
                </div>
                <button
                    type="submit"
                    disabled={processing || digits.join('').length !== 6}
                    className={authPrimaryButtonClass}
                >
                    {t(routes.submitLabelKey)}
                    <span aria-hidden="true">→</span>
                </button>
            </form>

            <div className={`mt-6 space-y-2 text-center ${authMutedClass}`}>
                {resendIn > 0 ? (
                    <p>{t('auth.otp_resend_in', { time: formatTime(resendIn) })}</p>
                ) : (
                    <button
                        type="button"
                        disabled={resending}
                        className={`${authLinkClass} disabled:opacity-50`}
                        onClick={resendCode}
                    >
                        {resending ? t('auth.otp_resending') : t('auth.otp_resend')}
                    </button>
                )}
                <p className="text-xs opacity-80">
                    {expiresIn > 0
                        ? t('auth.otp_expires_in', { time: formatTime(expiresIn) })
                        : t('auth.otp_expired')}
                </p>
                <button
                    type="button"
                    className={`block w-full text-sm opacity-90 hover:opacity-100 ${authLinkClass}`}
                    onClick={() => router.post(routes.cancel)}
                >
                    {t(routes.backLabelKey)}
                </button>
            </div>
        </AuthSplitLayout>
    );
}
