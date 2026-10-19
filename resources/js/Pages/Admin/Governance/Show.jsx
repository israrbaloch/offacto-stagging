import GovernanceSettingsStructuredField from '../../../Components/Admin/GovernanceSettingsStructuredField';
import SettingsForm from '../../../Components/Admin/SettingsForm';
import SettingsSectionNav from '../../../Components/Admin/SettingsSectionNav';
import { AdminBody, AdminHeader, AdminPage } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function GovernanceShow({ section, fields = [], values = {}, nav = [], locales = [] }) {
    return (
        <AdminLayout title={section.title}>
            <AdminPage>
                <AdminHeader eyebrow={section.group} title={section.title} description={section.description} backHref="/admin/governance" backLabel="Governance hub" />
                <SettingsSectionNav nav={nav} activeId={section.id} basePath="/admin/governance" />
                <AdminBody className="max-w-4xl">
                    <SettingsForm
                        sectionId={section.id}
                        sectionTitle={section.title}
                        sectionDescription={section.description}
                        fields={fields}
                        values={values}
                        locales={locales}
                        settingsBasePath="/admin/governance"
                        StructuredFieldComponent={GovernanceSettingsStructuredField}
                    />
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
