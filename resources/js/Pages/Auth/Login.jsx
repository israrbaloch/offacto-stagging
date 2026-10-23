import { Link, useForm } from '@inertiajs/react';
import AuthSplitLayout, {
    AuthOrDivider,
    authGoogleButtonClass,
    authHeadingClass,
    authInputClass,
    authLabelClass,
    authLinkClass,
    authMutedClass,
    authPrimaryButtonClass,
    authSubClass,
} from '../../Layouts/AuthSplitLayout';
import { t } from '../../lib/i18n';

export default function Login({ allowRegistration = true, googleLoginUrl = null }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    return (
        <AuthSplitLayout title={t('auth.login')} showFormLogo>
            <h2 className={authHeadingClass}>{t('auth.welcome')}</h2>
            <p className={authSubClass}>{t('auth.sign_in_hint')}</p>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    post('/login');
                }}
                className="auth-form-grid"
            >
                <label className="block">
                    <span className={authLabelClass}>{t('auth.email_address')}</span>
                    <input
                        type="email"
                        autoComplete="username"
                        className={authInputClass(errors.email)}
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                </label>

                <div>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                        <span className={authLabelClass.replace('mb-1.5 ', '')}>{t('auth.password')}</span>
                        <Link href="/forgot-password" className={`text-[12px] font-semibold ${authLinkClass}`}>
                            {t('auth.forgot_password')}
                        </Link>
                    </div>
                    <input
                        type="password"
                        autoComplete="current-password"
                        className={authInputClass(errors.password)}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                    />
                </div>

                <label className="flex items-center gap-2 text-[13px] text-[#0E1250] dark:text-[#E8ECFF]">
                    <input
                        type="checkbox"
                        className="rounded border-[rgba(14,18,80,0.2)] text-[#6B59DC] focus:ring-[#9D8DF1]"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                    />
                    {t('auth.stay_logged_in')}
                </label>

                <button type="submit" disabled={processing} className={authPrimaryButtonClass}>
                    {t('auth.sign_in')}
                    <span aria-hidden="true">→</span>
                </button>

                <AuthOrDivider />

                {googleLoginUrl ? (
                    <a href={googleLoginUrl} className={authGoogleButtonClass}>
                        {t('auth.google_sign_in')}
                    </a>
                ) : (
                    <button type="button" className={authGoogleButtonClass}>
                        {t('auth.google_sign_in')}
                    </button>
                )}
            </form>

            {allowRegistration && (
                <p className={`mt-[22px] text-center ${authMutedClass}`}>
                    {t('auth.no_account')}{' '}
                    <Link href="/register" className={authLinkClass}>
                        {t('auth.start_free_trial')}
                    </Link>
                </p>
            )}
        </AuthSplitLayout>
    );
}
