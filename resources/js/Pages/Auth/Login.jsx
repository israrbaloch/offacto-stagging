import { Link, useForm, usePage } from '@inertiajs/react';
import Button from '../../Components/Button';
import Input from '../../Components/Input';
import GuestLayout from '../../Layouts/GuestLayout';

export default function Login({ allowRegistration = true }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    return (
        <GuestLayout title="Login">
            {flash?.status && <p className="mb-4 text-sm text-emerald-600">{flash.status}</p>}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    post('/login');
                }}
                className="space-y-4"
            >
                <Input label="Email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} />
                <Input label="Password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} error={errors.password} />
                <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} />
                    Remember me
                </label>
                <Button type="submit" disabled={processing} className="w-full">
                    Sign in
                </Button>
            </form>
            <div className="mt-4 flex justify-between text-sm">
                <Link href="/forgot-password" className="text-slate-500 hover:text-slate-800">
                    Forgot password
                </Link>
                {allowRegistration && (
                    <Link href="/register" className="text-[var(--company-primary)]">
                        Create account
                    </Link>
                )}
            </div>
        </GuestLayout>
    );
}
