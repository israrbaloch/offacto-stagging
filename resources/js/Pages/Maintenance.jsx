import { Head } from '@inertiajs/react';
import Logo from '../Components/Logo';

export default function Maintenance({ message }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-6 text-center">
            <Head title="Maintenance" />
            <Logo variant="dark" className="mx-auto h-8 w-auto opacity-90" />
            <h1 className="mt-8 text-2xl font-semibold tracking-tight text-slate-900">We&apos;ll be back soon</h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">{message}</p>
        </div>
    );
}
