import { useForm } from '@inertiajs/react';
import CommunicationMergeCodesReference from '../../../Components/Admin/CommunicationMergeCodesReference';
import CommunicationSettingsStructuredField from '../../../Components/Admin/CommunicationSettingsStructuredField';
import SettingsForm from '../../../Components/Admin/SettingsForm';
import SettingsSectionNav from '../../../Components/Admin/SettingsSectionNav';
import { AdminBody, AdminButton, AdminCard, AdminHeader, AdminPage, checkboxClass } from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';

export default function CommunicationsShow({
    section,
    fields = [],
    values = {},
    nav = [],
    locales = [],
    mergeCatalog = {},
    inboundWebhookUrl = '',
    outboundConfigured = false,
}) {
    const outboundTest = useForm({ confirm_test: false });

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
                    {section.id === 'outgoing-email' && (
                        <AdminCard className="mb-6" title="Connection check">
                            <p className="text-sm text-slate-600">
                                {outboundConfigured
                                    ? 'Outgoing email appears configured. Send a test to your login address after saving any changes.'
                                    : 'Outgoing email is not fully configured yet. Fill in the sending method and credentials below, save, then run a test.'}
                            </p>
                            <form
                                className="mt-4 space-y-3"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    outboundTest.post('/admin/communications/outbound-test');
                                }}
                            >
                                <label className="flex items-start gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        className={checkboxClass}
                                        checked={outboundTest.data.confirm_test}
                                        onChange={(e) => outboundTest.setData('confirm_test', e.target.checked)}
                                    />
                                    Send a simple test email to my admin login address only.
                                </label>
                                <AdminButton type="submit" disabled={!outboundTest.data.confirm_test || outboundTest.processing}>
                                    Send connection test
                                </AdminButton>
                            </form>
                        </AdminCard>
                    )}

                    {section.id === 'incoming-email' && (
                        <AdminCard className="mb-6" title="Webhook address for your email provider">
                            <p className="text-sm text-slate-600">
                                Point Postmark, Mailgun, SendGrid, or a custom script to this URL. Authenticate with the{' '}
                                <code className="rounded bg-slate-100 px-1 text-xs">X-Inbound-Secret</code> header (or{' '}
                                <code className="rounded bg-slate-100 px-1 text-xs">X-Webhook-Secret</code>). Query-string secrets are rejected. Provider HMAC signatures are not verified yet — keep the shared secret private.
                            </p>
                            <p className="mt-3 break-all rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800">
                                {inboundWebhookUrl}
                            </p>
                            <p className="mt-3 text-xs text-slate-500">
                                Replies are attached only when the sender is the ticket company, company owner, or ticket customer. A ticket reference in the subject is not enough on its own.
                            </p>
                        </AdminCard>
                    )}

                    {section.id === 'email-variables' && (
                        <div className="mb-6">
                            <CommunicationMergeCodesReference mergeCatalog={mergeCatalog} />
                        </div>
                    )}
                    <SettingsForm
                        sectionId={section.id}
                        sectionTitle={section.title}
                        sectionDescription={section.description}
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
