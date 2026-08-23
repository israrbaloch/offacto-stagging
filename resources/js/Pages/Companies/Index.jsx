import Button from '../../Components/Button';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';

export default function Index({ companies = [], requireCompanyApproval }) {
    return (
        <AuthenticatedLayout title="Companies">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Companies</h1>
                <Button href="/companies/create">Add company</Button>
            </div>
            {requireCompanyApproval && (
                <p className="mb-4 text-sm text-slate-500">New companies may require admin approval before they become active.</p>
            )}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Active</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map((company) => (
                            <tr key={company.id} className="border-t border-slate-100">
                                <td className="px-4 py-3 font-medium">{company.company_name}</td>
                                <td className="px-4 py-3">{company.email}</td>
                                <td className="px-4 py-3">{company.status_relation?.name || '—'}</td>
                                <td className="px-4 py-3">{company.is_active ? 'Yes' : 'No'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
}
