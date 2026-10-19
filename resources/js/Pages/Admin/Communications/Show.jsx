import CommunicationSettingsStructuredField from '../../../Components/Admin/CommunicationSettingsStructuredField';
import SettingsForm from '../../../Components/Admin/SettingsForm';
import SettingsSectionNav from '../../../Components/Admin/SettingsSectionNav';
import { AdminBody, AdminCard, AdminHeader, AdminPage, AdminTable } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function CommunicationsShow({ section, fields = [], values = {}, nav = [], locales = [], mergeCatalog = {} }) {
    return (
        <AdminLayout title={section.title}>
            <AdminPage>
                <AdminHeader
                    eyebrow={section.group}
                    title={section.title}
                    description={section.description}
                    backHref="/admin/communications"
                    backLabel="Communications hub"
                />
                <SettingsSectionNav nav={nav} activeId={section.id} basePath="/admin/communications" />
                <AdminBody className="max-w-4xl">
                    {section.id === 'email-variables' && (
                        <AdminCard className="mb-6" title="Built-in merge codes">
                            <AdminTable columns={['Code', 'Label', 'Contexts', 'Description']}>
                                {Object.entries(mergeCatalog).map(([code, meta]) => (
                                    <tr key={code}>
                                        <td className="px-4 py-3 font-mono text-xs">{code}</td>
                                        <td className="px-4 py-3 text-sm">{meta.label}</td>
                                        <td className="px-4 py-3 text-xs text-slate-600">{(meta.contexts || []).join(', ')}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{meta.description}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </AdminCard>
                    )}
                    <SettingsForm
                        sectionId={section.id}
                        fields={fields}
                        values={values}
                        locales={locales}
                        settingsBasePath="/admin/communications"
                        StructuredFieldComponent={CommunicationSettingsStructuredField}
                    />
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
