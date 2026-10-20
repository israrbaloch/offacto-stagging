import { Head } from '@inertiajs/react';
import MfaVerifyForm from '../../../Components/Auth/MfaVerifyForm';
import Logo from '../../../Components/Logo';
import { AdminButton } from '../../../Components/Admin/ui';
import { AdminValidatedField } from '../../../Components/Admin/shared';
import { inputClass } from '../../../Components/Admin/ui';

function Field({ label, required, error, children }) {
    return (
        <AdminValidatedField label={label} required={required} error={error}>
            {children}
        </AdminValidatedField>
    );
}

export default function AdminMfaVerify({ recoveryAvailable = true }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4">
            <Head title="Verify identity" />
            <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-8 shadow-sm">
                <Logo className="mx-auto h-7 w-auto" />
                <h1 className="mt-6 text-center text-xl font-semibold text-slate-900">Additional verification</h1>
                <MfaVerifyForm
                    verifyUrl="/admin/mfa/verify"
                    recoverUrl="/admin/mfa/recover"
                    recoveryAvailable={recoveryAvailable}
                    inputClass={inputClass}
                    Button={AdminButton}
                    Field={Field}
                />
            </div>
        </div>
    );
}
