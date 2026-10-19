import { Head, useForm } from '@inertiajs/react';
import Logo from '../../../Components/Logo';
import { AdminButton } from '../../../Components/Admin/ui';
import { AdminValidatedField } from '../../../Components/Admin/shared';
import { inputClass } from '../../../Components/Admin/ui';

/** SH-002 — privileged access MFA challenge (UI shell; wire to your MFA provider). */
export default function AdminMfaVerify({ hint }) {
    const { data, setData, post, processing, errors } = useForm({ code: '' });

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4">
            <Head title="Verify identity" />
            <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white p-8 shadow-sm">
                <Logo className="mx-auto h-7 w-auto" />
                <h1 className="mt-6 text-center text-xl font-semibold text-slate-900">Additional verification</h1>
                <p className="mt-2 text-center text-sm text-slate-500">{hint}</p>
                <form
                    className="mt-8 space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        post('/admin/mfa/verify');
                    }}
                >
                    <AdminValidatedField label="Verification code" required error={errors.code}>
                        <input
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            className={`${inputClass} text-center font-mono text-lg tracking-widest`}
                            maxLength={8}
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value.replace(/\s/g, ''))}
                        />
                    </AdminValidatedField>
                    <AdminButton type="submit" className="w-full" disabled={processing}>
                        Verify and continue
                    </AdminButton>
                </form>
            </div>
        </div>
    );
}
