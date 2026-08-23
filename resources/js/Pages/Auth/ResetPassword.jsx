import { useForm } from '@inertiajs/react';
import Button from '../../Components/Button';
import Input from '../../Components/Input';
import GuestLayout from '../../Layouts/GuestLayout';

export default function ResetPassword({ email = '', token = '' }) {
    const { data, setData, post, processing, errors } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    return (
        <GuestLayout title="Reset password">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    post('/reset-password');
                }}
                className="space-y-4"
            >
                <Input label="Email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} error={errors.email} />
                <Input label="Password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} error={errors.password} />
                <Input label="Confirm password" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} />
                <Button type="submit" disabled={processing} className="w-full">
                    Reset password
                </Button>
            </form>
        </GuestLayout>
    );
}
