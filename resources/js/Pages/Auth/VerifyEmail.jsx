import { Link, useForm } from '@inertiajs/react';
import Button from '../../Components/Button';
import GuestLayout from '../../Layouts/GuestLayout';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    return (
        <GuestLayout title="Verify email">
            <p className="text-sm text-slate-600">Thanks for signing up. Please verify your email address.</p>
            {status === 'verification-link-sent' && (
                <p className="mt-3 text-sm text-emerald-600">A new verification link has been sent.</p>
            )}
            <div className="mt-6 flex items-center justify-between">
                <Button type="button" disabled={processing} onClick={() => post('/email/verification-notification')}>
                    Resend email
                </Button>
                <Link href="/logout" method="post" as="button" className="text-sm text-slate-500">
                    Log out
                </Link>
            </div>
        </GuestLayout>
    );
}
