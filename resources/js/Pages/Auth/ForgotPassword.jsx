import { Link, useForm, usePage } from '@inertiajs/react';
import Button from '../../Components/Button';
import Input from '../../Components/Input';
import GuestLayout from '../../Layouts/GuestLayout';

export default function ForgotPassword() {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    return (
        <GuestLayout title="Forgot password">
            {flash?.status && <p className="mb-4 text-sm text-emerald-600">{flash.status}</p>}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    post('/forgot-password');
                }}
                className="space-y-4"
            >
                <Input label="Email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} />
                <Button type="submit" disabled={processing} className="w-full">
                    Email reset link
                </Button>
            </form>
            <Link href="/login" className="mt-4 block text-center text-sm text-slate-500">
                Back to login
            </Link>
        </GuestLayout>
    );
}
