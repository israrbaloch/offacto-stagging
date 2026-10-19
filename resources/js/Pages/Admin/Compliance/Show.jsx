import ComplianceSettingsStructuredField from '../../../Components/Admin/ComplianceSettingsStructuredField';
import SettingsForm from '../../../Components/Admin/SettingsForm';
import SettingsSectionNav from '../../../Components/Admin/SettingsSectionNav';
import { AdminBody, AdminCard, AdminHeader, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function ComplianceShow({ section, fields = [], values = {}, nav = [], locales = [] }) {
    return (
        <AdminLayout title={section.title}>
            <AdminPage>
                <AdminHeader
                    eyebrow={section.group}
                    title={section.title}
                    description={section.description}
                    backHref="/admin/compliance"
                    backLabel="Compliance hub"
                />
                <SettingsSectionNav nav={nav} activeId={section.id} basePath="/admin/compliance" />
                <AdminBody className="max-w-4xl">
                    <AdminCard className="mb-6 border-indigo-100 bg-indigo-50/40" padding={true}>
                        <p className="text-sm leading-relaxed text-slate-700">
                            GDPR principles apply: purpose limitation, minimization, storage limitation, security, and accountability. Configuration here supports compliance workflows; it does not guarantee legal outcomes.
                        </p>
                    </AdminCard>
                    <SettingsForm
                        sectionId={section.id}
                        sectionTitle={section.title}
                        sectionDescription={section.description}
                        fields={fields}
                        values={values}
                        locales={locales}
                        settingsBasePath="/admin/compliance"
                        StructuredFieldComponent={ComplianceSettingsStructuredField}
                    />
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
