import FinancialSettingsStructuredField from '../../../Components/Admin/FinancialSettingsStructuredField';
import SettingsForm from '../../../Components/Admin/SettingsForm';
import SettingsSectionNav from '../../../Components/Admin/SettingsSectionNav';
import { AdminBody, AdminCard, AdminHeader, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function FinancialShow({ section, fields = [], values = {}, nav = [], locales = [] }) {
    return (
        <AdminLayout title={section.title}>
            <AdminPage>
                <AdminHeader
                    eyebrow={section.group}
                    title={section.title}
                    description={section.description}
                    backHref="/admin/financial"
                    backLabel="Financial hub"
                />
                <SettingsSectionNav nav={nav} activeId={section.id} basePath="/admin/financial" />
                <AdminBody className="max-w-4xl">
                    <AdminCard className="mb-6 border-indigo-100 bg-indigo-50/40" padding={true}>
                        <p className="text-sm leading-relaxed text-slate-700">
                            <strong className="font-medium text-slate-900">Belgium default.</strong> These policies set platform-wide rules. They do not replace legal advice — invoice content must still match your transaction type and national requirements.
                        </p>
                    </AdminCard>
                    <SettingsForm
                        sectionId={section.id}
                        sectionTitle={section.title}
                        sectionDescription={section.description}
                        fields={fields}
                        values={values}
                        locales={locales}
                        settingsBasePath="/admin/financial"
                        StructuredFieldComponent={FinancialSettingsStructuredField}
                    />
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
