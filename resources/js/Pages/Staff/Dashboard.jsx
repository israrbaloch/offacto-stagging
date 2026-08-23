import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';

export default function Dashboard() {
    return (
        <AuthenticatedLayout title="Staff">
            <h1 className="text-2xl font-semibold">Staff dashboard</h1>
            <p className="mt-2 text-slate-500">Staff tools will appear here.</p>
        </AuthenticatedLayout>
    );
}
