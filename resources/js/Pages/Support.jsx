import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';

export default function Support() {
    return (
        <AuthenticatedLayout title="Support">
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
                <h1 className="text-xl font-semibold text-slate-900">Support</h1>
                <p className="mt-2 text-sm text-slate-500">This page will be available soon.</p>
            </div>
        </AuthenticatedLayout>
    );
}
