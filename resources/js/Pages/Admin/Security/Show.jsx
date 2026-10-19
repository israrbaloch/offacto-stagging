import SecuritySettingsStructuredField from '../../../Components/Admin/SecuritySettingsStructuredField';
import SettingsForm from '../../../Components/Admin/SettingsForm';
import SettingsSectionNav from '../../../Components/Admin/SettingsSectionNav';
import { AdminBody, AdminHeader, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function SecurityShow({ section, fields = [], values = {}, nav = [], locales = [] }) {
    return (
        <AdminLayout title={section.title}>
            <AdminPage>
                <AdminHeader eyebrow={section.group} title={section.title} description={section.description} backHref="/admin/security" backLabel="Security hub" />
                <SettingsSectionNav nav={nav} activeId={section.id} basePath="/admin/security" />
                <AdminBody className="max-w-4xl">
                    <SettingsForm
                        sectionId={section.id}
                        fields={fields}
                        values={values}
                        locales={locales}
                        settingsBasePath="/admin/security"
                        StructuredFieldComponent={SecuritySettingsStructuredField}
                    />
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
