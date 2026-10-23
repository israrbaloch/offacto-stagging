import { usePage } from '@inertiajs/react';
import MfaVerifyForm from '../../Components/Auth/MfaVerifyForm';
import FormErrorsToaster from '../../Components/FormErrorsToaster';
import AuthSplitLayout, {
    authHeadingClass,
    authInputClass,
    authLabelClass,
    authPrimaryButtonClass,
    authSubClass,
} from '../../Layouts/AuthSplitLayout';
import { t } from '../../lib/i18n';

function AuthField({ label, required, children }) {
    return (
        <label className="block">
            <span className={authLabelClass}>
                {label}
                {required ? <span className="text-rose-500"> *</span> : null}
            </span>
            {children}
        </label>
    );
}

function AuthSubmitButton({ type, className, disabled, children }) {
    return (
        <button type={type} disabled={disabled} className={`${authPrimaryButtonClass} ${className ?? ''}`}>
            {children}
        </button>
    );
}

export default function TwoFactorVerify({ recoveryAvailable = true }) {
    const { errors } = usePage().props;

    return (
        <AuthSplitLayout title={t('auth.mfa_verify_title')} showFormLogo>
            <FormErrorsToaster errors={errors} />
            <h2 className={authHeadingClass}>{t('auth.mfa_verify_title')}</h2>
            <MfaVerifyForm
                verifyUrl="/two-factor/verify"
                recoverUrl="/two-factor/recover"
                recoveryAvailable={recoveryAvailable}
                inputClass={authInputClass()}
                Button={AuthSubmitButton}
                Field={AuthField}
                className={authSubClass}
            />
        </AuthSplitLayout>
    );
}
