import { useForm } from '@inertiajs/react';
import AuthSplitLayout, {
    authHeadingClass,
    authInputClass,
    authLabelClass,
    authPrimaryButtonClass,
    authSubClass,
} from '../../Layouts/AuthSplitLayout';
import { t } from '../../lib/i18n';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors } = useForm({ password: '' });

    return (
        <AuthSplitLayout title={t('auth.confirm_password_title')} showFormLogo>
            <h2 className={authHeadingClass}>{t('auth.confirm_password_title')}</h2>
            <p className={authSubClass}>{t('auth.confirm_password_hint')}</p>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    post('/confirm-password');
                }}
                className="mt-6 grid gap-4"
            >
                <label className="block">
                    <span className={authLabelClass}>{t('auth.password')}</span>
                    <input
                        type="password"
                        autoComplete="current-password"
                        className={authInputClass(errors.password)}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                    />
                </label>
                <button type="submit" disabled={processing} className={authPrimaryButtonClass}>
                    {t('auth.confirm')}
                </button>
            </form>
        </AuthSplitLayout>
    );
}
