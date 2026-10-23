import { Link, useForm } from '@inertiajs/react';
import AuthSplitLayout, {
    authHeadingClass,
    authLinkClass,
    authMutedClass,
    authPrimaryButtonClass,
    authSubClass,
} from '../../Layouts/AuthSplitLayout';
import { t } from '../../lib/i18n';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    return (
        <AuthSplitLayout title={t('auth.verify_email_title')} showFormLogo>
            <h2 className={authHeadingClass}>{t('auth.verify_email_title')}</h2>
            <p className={authSubClass}>{t('auth.verify_email_body')}</p>
            {status === 'verification-link-sent' && (
                <p className="mt-3 text-[14.5px] font-medium text-[#5FD3B3]">{t('auth.verification_link_sent')}</p>
            )}
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                    type="button"
                    disabled={processing}
                    onClick={() => post('/email/verification-notification')}
                    className={`${authPrimaryButtonClass} sm:w-auto sm:px-8`}
                >
                    {t('auth.resend_email')}
                </button>
                <Link href="/logout" method="post" as="button" className={`text-sm ${authLinkClass}`}>
                    {t('auth.log_out')}
                </Link>
            </div>
            <p className={`mt-6 text-center ${authMutedClass}`}>
                {t('auth.back_login')}{' '}
                <Link href="/login" className={authLinkClass}>
                    {t('auth.sign_in')}
                </Link>
            </p>
        </AuthSplitLayout>
    );
}
