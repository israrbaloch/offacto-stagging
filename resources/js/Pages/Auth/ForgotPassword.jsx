import { Link, useForm } from '@inertiajs/react';
import AuthSplitLayout, {
    authInputClass,
    authLabelClass,
    authLinkClass,
    authMutedClass,
    authPrimaryButtonClass,
} from '../../Layouts/AuthSplitLayout';
import { t } from '../../lib/i18n';

export default function ForgotPassword() {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    return (
        <AuthSplitLayout title={t('auth.reset_title')}>
            <Link href="/login" className={`inline-flex items-center gap-1 text-xs font-semibold ${authLinkClass}`}>
                ← {t('auth.back_login')}
            </Link>
            <h2 className="mt-4 font-[Urbanist,system-ui,sans-serif] text-[28px] font-extrabold tracking-tight">{t('auth.reset_title')}</h2>
            <p className={`mt-1.5 ${authMutedClass}`}>{t('auth.reset_body')}</p>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    post('/forgot-password');
                }}
                className="mt-6 grid gap-4"
            >
                <label className="block">
                    <span className={authLabelClass}>{t('auth.email_address')}</span>
                    <input
                        type="email"
                        className={authInputClass(errors.email)}
                        placeholder="jane@company.com"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                </label>
                <button type="submit" disabled={processing} className={authPrimaryButtonClass}>
                    {t('auth.send_code')}
                    <span aria-hidden="true">→</span>
                </button>
            </form>

            <p className={`mt-6 text-center ${authMutedClass}`}>
                {t('auth.back_login')}{' '}
                <Link href="/login" className={authLinkClass}>
                    {t('auth.sign_in')}
                </Link>
            </p>
        </AuthSplitLayout>
    );
}
