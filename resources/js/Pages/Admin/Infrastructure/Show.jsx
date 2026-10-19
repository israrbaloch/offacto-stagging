import InfrastructureSettingsStructuredField from '../../../Components/Admin/InfrastructureSettingsStructuredField';
import SettingsForm from '../../../Components/Admin/SettingsForm';
import SettingsSectionNav from '../../../Components/Admin/SettingsSectionNav';
import { AdminBody, AdminHeader, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function InfrastructureShow({ section, fields = [], values = {}, nav = [], locales = [] }) {
    return (
        <AdminLayout title={section.title}>
            <AdminPage>
                <AdminHeader eyebrow={section.group} title={section.title} description={section.description} backHref="/admin/infrastructure" backLabel="Infrastructure hub" />
                <SettingsSectionNav nav={nav} activeId={section.id} basePath="/admin/infrastructure" />
                <AdminBody className="max-w-4xl">
                    <SettingsForm
                        sectionId={section.id}
                        fields={fields}
                        values={values}
                        locales={locales}
                        settingsBasePath="/admin/infrastructure"
                        StructuredFieldComponent={InfrastructureSettingsStructuredField}
                    />
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
