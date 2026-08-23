import { useForm } from '@inertiajs/react';
import Button from '../../Components/Button';
import Input from '../../Components/Input';
import GuestLayout from '../../Layouts/GuestLayout';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors } = useForm({ password: '' });

    return (
        <GuestLayout title="Confirm password">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    post('/confirm-password');
                }}
                className="space-y-4"
            >
                <Input label="Password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} error={errors.password} />
                <Button type="submit" disabled={processing} className="w-full">
                    Confirm
                </Button>
            </form>
        </GuestLayout>
    );
}
