import { Head } from '@inertiajs/react';
import Toast from '../Components/Toast';

export default function GuestLayout({ title, children }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
            <Head title={title} />
            <Toast />
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="text-2xl font-semibold text-white">Offacto</div>
                    <p className="mt-1 text-sm text-slate-400">Invoices, offers, and your company in one place.</p>
                </div>
                <div className="rounded-2xl bg-white p-8 shadow-xl">{children}</div>
            </div>
        </div>
    );
}
