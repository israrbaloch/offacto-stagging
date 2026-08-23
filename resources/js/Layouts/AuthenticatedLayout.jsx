import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import Sidebar from '../Components/Sidebar';
import Toast from '../Components/Toast';
import TopBar from '../Components/TopBar';

export default function AuthenticatedLayout({ title, children }) {
    const { activeCompany } = usePage().props;
    const primary = activeCompany?.theme?.primary || '#4f46e5';
    const secondary = activeCompany?.theme?.secondary || '#0f172a';

    useEffect(() => {
        document.documentElement.style.setProperty('--company-primary', primary);
        document.documentElement.style.setProperty('--company-secondary', secondary);
    }, [primary, secondary]);

    return (
        <div className="min-h-screen bg-slate-100">
            <Head title={title} />
            <Toast />
            <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex min-w-0 flex-1 flex-col bg-white lg:rounded-r-3xl">
                    <TopBar />
                    <main className="flex-1 bg-slate-50 px-4 py-6 lg:px-8">{children}</main>
                </div>
            </div>
        </div>
    );
}
