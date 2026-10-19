import IntegrationSettingsStructuredField from '../../../Components/Admin/IntegrationSettingsStructuredField';
import SettingsForm from '../../../Components/Admin/SettingsForm';
import SettingsSectionNav from '../../../Components/Admin/SettingsSectionNav';
import { AdminBody, AdminCard, AdminHeader, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function IntegrationsShow({ section, fields = [], values = {}, nav = [], locales = [] }) {
    return (
        <AdminLayout title={section.title}>
            <AdminPage>
                <AdminHeader
                    eyebrow={section.group}
                    title={section.title}
                    description={section.description}
                    backHref="/admin/integrations"
                    backLabel="Integration hub"
                />
                <SettingsSectionNav nav={nav} activeId={section.id} basePath="/admin/integrations" />
                <AdminBody className="max-w-4xl">
                    {section.id === 'credentials-secrets' && (
                        <AdminCard className="mb-6 border-amber-100 bg-amber-50/40" padding={true}>
                            <p className="text-sm text-slate-700">
                                Company-owned keys are stored encrypted on <code className="text-xs">company_settings</code>. Platform keys are restricted to admins and never shown again after save.
                            </p>
                        </AdminCard>
                    )}
                    <SettingsForm
                        sectionId={section.id}
                        sectionTitle={section.title}
                        sectionDescription={section.description}
                        fields={fields}
                        values={values}
                        locales={locales}
                        settingsBasePath="/admin/integrations"
                        StructuredFieldComponent={IntegrationSettingsStructuredField}
                    />
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
