import SettingsForm from '../../../Components/Admin/SettingsForm';
import SettingsSectionNav from '../../../Components/Admin/SettingsSectionNav';
import { AdminBody, AdminHeader, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function PlatformSettingsShow({ section, fields = [], values = {}, nav = [], locales = ['en', 'fr', 'nl'] }) {
    return (
        <AdminLayout title={section.title}>
            <AdminPage>
                <AdminHeader
                    eyebrow={section.group}
                    title={section.title}
                    description={section.description}
                    backHref="/admin/settings"
                    backLabel="All settings"
                />
                <SettingsSectionNav nav={nav} activeId={section.id} />
                <AdminBody className="max-w-4xl">
                    <SettingsForm
                        sectionId={section.id}
                        sectionTitle={section.title}
                        sectionDescription={section.description}
                        fields={fields}
                        values={values}
                        locales={locales}
                    />
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
