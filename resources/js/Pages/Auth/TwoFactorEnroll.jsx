import { Link, useForm, usePage } from '@inertiajs/react';
import FormErrorsToaster from '../../Components/FormErrorsToaster';
import AuthSplitLayout, {
    authHeadingClass,
    authInputClass,
    authLabelClass,
    authLinkClass,
    authMutedClass,
    authPrimaryButtonClass,
    authSubClass,
} from '../../Layouts/AuthSplitLayout';
import { t } from '../../lib/i18n';

export default function TwoFactorEnroll({ required, alreadyEnrolled, mustReenroll, policyRequired, setup, recoveryCodes }) {
    const start = useForm({ password: '' });
    const confirm = useForm({ code: '' });
    const { flash } = usePage().props;

    const intro = policyRequired
        ? t('auth.mfa_enroll_policy')
        : required
          ? t('auth.mfa_enroll_required')
          : t('auth.mfa_enroll_optional');

    return (
        <AuthSplitLayout title={t('auth.mfa_enroll_title')} showFormLogo>
            <FormErrorsToaster errors={{ ...start.errors, ...confirm.errors }} />
            <h2 className={authHeadingClass}>{t('auth.mfa_enroll_title')}</h2>
            <p className={authSubClass}>{intro}</p>

            {mustReenroll && (
                <p className="mt-3 rounded-[14px] border border-[#F0B44C]/40 bg-[#F0B44C]/15 px-3 py-2 text-[14.5px] text-[#0E1250] dark:text-[#E8ECFF]">
                    {t('auth.mfa_reenroll_warning')}
                </p>
            )}
            {alreadyEnrolled && !mustReenroll && !recoveryCodes && (
                <p className="mt-3 text-[14.5px] font-medium text-[#5FD3B3]">{t('auth.mfa_already_enrolled')}</p>
            )}

            {Array.isArray(recoveryCodes) && recoveryCodes.length > 0 && (
                <div className="mt-6 rounded-[14px] border border-[#F0B44C]/40 bg-[#F0B44C]/12 p-4">
                    <p className="text-[14.5px] font-semibold text-[#0E1250] dark:text-[#E8ECFF]">{t('auth.mfa_recovery_store')}</p>
                    <ul className="mt-3 space-y-1 font-mono text-sm">
                        {recoveryCodes.map((code) => (
                            <li key={code}>{code}</li>
                        ))}
                    </ul>
                    <Link href="/dashboard" className={`mt-4 inline-block text-sm ${authLinkClass}`}>
                        {t('auth.mfa_continue_workspace')}
                    </Link>
                </div>
            )}

            {!setup && !recoveryCodes && (
                <form
                    className="mt-6 grid gap-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        start.post('/two-factor/enroll/start');
                    }}
                >
                    <label className="block">
                        <span className={authLabelClass}>{t('auth.mfa_confirm_password')}</span>
                        <input
                            type="password"
                            autoComplete="current-password"
                            className={authInputClass(start.errors.password)}
                            value={start.data.password}
                            onChange={(e) => start.setData('password', e.target.value)}
                        />
                    </label>
                    <button type="submit" disabled={start.processing} className={authPrimaryButtonClass}>
                        {t('auth.mfa_generate_secret')}
                    </button>
                </form>
            )}

            {setup && (
                <form
                    className="mt-6 grid gap-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        confirm.post('/two-factor/enroll/confirm');
                    }}
                >
                    <p className={authMutedClass}>{t('auth.mfa_setup_instructions')}</p>
                    <label className="block">
                        <span className={authLabelClass}>{t('auth.mfa_secret')}</span>
                        <input readOnly className={`${authInputClass()} font-mono`} value={setup.secret} />
                    </label>
                    <label className="block">
                        <span className={authLabelClass}>{t('auth.mfa_otpauth_uri')}</span>
                        <textarea
                            readOnly
                            className={`${authInputClass()} min-h-[80px] font-mono text-xs`}
                            rows={3}
                            value={setup.uri}
                        />
                    </label>
                    <label className="block">
                        <span className={authLabelClass}>{t('auth.mfa_verification_code')}</span>
                        <input
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            className={`${authInputClass(confirm.errors.code)} text-center font-mono text-lg tracking-widest`}
                            maxLength={8}
                            value={confirm.data.code}
                            onChange={(e) => confirm.setData('code', e.target.value.replace(/\s/g, ''))}
                        />
                    </label>
                    <button type="submit" disabled={confirm.processing} className={authPrimaryButtonClass}>
                        {t('auth.mfa_confirm_enable')}
                    </button>
                </form>
            )}
            {flash?.status === 'mfa-enrolled' && !recoveryCodes && (
                <p className="mt-4 text-center text-[14.5px] font-medium text-[#5FD3B3]">{t('auth.mfa_enrolled')}</p>
            )}
        </AuthSplitLayout>
    );
}
