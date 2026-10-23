import { useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AuthSplitLayout, {
    authHeadingClass,
    authInputClass,
    authLabelClass,
    authMutedClass,
    authPrimaryButtonClass,
    authSubClass,
} from '../../Layouts/AuthSplitLayout';
import { t } from '../../lib/i18n';

const checks = [
    { id: 'length', labelKey: 'auth.reset_req_length', test: (value) => value.length >= 8 },
    { id: 'number', labelKey: 'auth.reset_req_number', test: (value) => /\d/.test(value) },
    { id: 'special', labelKey: 'auth.reset_req_special', test: (value) => /[^A-Za-z0-9]/.test(value) },
];

export default function ResetPassword({ email = '' }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const results = useMemo(
        () =>
            checks.map((check) => ({
                ...check,
                label: t(check.labelKey),
                ok: check.test(data.password),
            })),
        [data.password],
    );

    return (
        <AuthSplitLayout title={t('auth.reset_password_title')} showFormLogo>
            <h2 className={authHeadingClass}>{t('auth.reset_password_title')}</h2>
            <p className={authSubClass}>{t('auth.reset_password_body', { email })}</p>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    post('/reset-password');
                }}
                className="mt-6 grid gap-4"
            >
                <label className="block">
                    <span className={authLabelClass}>{t('auth.new_password')}</span>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className={`${authInputClass(errors.password)} pr-14`}
                            placeholder={t('auth.new_password')}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-3 text-xs font-semibold text-[#48537F] hover:text-[#6B59DC] dark:text-[#A1A9DD]"
                            onClick={() => setShowPassword((v) => !v)}
                        >
                            {showPassword ? t('auth.hide') : t('auth.show')}
                        </button>
                    </div>
                </label>

                <label className="block">
                    <span className={authLabelClass}>{t('auth.confirm_new_password')}</span>
                    <div className="relative">
                        <input
                            type={showConfirm ? 'text' : 'password'}
                            className={`${authInputClass(errors.password_confirmation)} pr-14`}
                            placeholder={t('auth.confirm_new_password')}
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-3 text-xs font-semibold text-[#48537F] hover:text-[#6B59DC] dark:text-[#A1A9DD]"
                            onClick={() => setShowConfirm((v) => !v)}
                        >
                            {showConfirm ? t('auth.hide') : t('auth.show')}
                        </button>
                    </div>
                </label>

                <div className="rounded-[14px] border border-[rgba(14,18,80,0.08)] bg-white px-4 py-3 dark:border-white/10 dark:bg-[#1E2466]">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#48537F] dark:text-[#A1A9DD]">
                        {t('auth.password_requirements')}
                    </p>
                    <ul className="space-y-1.5 text-[14.5px]">
                        {results.map((check) => (
                            <li
                                key={check.id}
                                className={check.ok ? 'font-medium text-[#5FD3B3]' : authMutedClass}
                            >
                                {check.ok ? '●' : '○'} {check.label}
                            </li>
                        ))}
                    </ul>
                </div>

                <button type="submit" disabled={processing} className={authPrimaryButtonClass}>
                    {t('auth.update_password')}
                </button>
            </form>
        </AuthSplitLayout>
    );
}
