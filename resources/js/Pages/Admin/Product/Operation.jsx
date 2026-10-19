import { router, useForm } from '@inertiajs/react';
import SettingsSectionNav from '../../../Components/Admin/SettingsSectionNav';
import {
    AdminBadge,
    AdminBody,
    AdminButton,
    AdminCard,
    AdminField,
    AdminHeader,
    AdminPage,
    AdminTable,
    AdminTextButton,
    badgeToneFor,
    checkboxClass,
    inputClass,
    selectClass,
} from '../../../Components/Admin/ui';
import AdminLayout from '../../../Layouts/AdminLayout';
import { formatDate } from '../../../lib/utils';

const textareaClass = `${inputClass} min-h-[80px]`;

function planLabel(plan) {
    const labels = plan.name_labels || {};
    return labels.en || labels.nl || plan.slug;
}

export default function ProductOperation({
    section,
    operation,
    nav = [],
    pages = [],
    announcements = [],
    testimonials = [],
    articles = [],
    notes = [],
    rollouts = [],
    plans = [],
    companies = [],
    experiments = [],
    policy = {},
    feedback = [],
    roadmap = [],
}) {
    const pageForm = useForm({ slug: '', title: '', page_type: 'landing', locale: 'nl', body: '', status: 'draft' });
    const annForm = useForm({ title: '', body: '', severity: 'info', audience: 'all', published: false });
    const testForm = useForm({ author_name: '', company_name: '', body: '', rating: '', consent_obtained: false });
    const helpForm = useForm({ slug: '', title: '', category: 'guide', locale: 'nl', body: '', published: false });
    const releaseForm = useForm({ version: '', title: '', body: '', note_type: 'feature', published: false });
    const rolloutForm = useForm({ feature_key: '', name: '', description: '', status: 'draft', rollout_percent: 0, plan_slugs: [], company_ids: [] });
    const abForm = useForm({ name: '', surface: '', variant_a_label: '', variant_b_label: '', success_metric: '', privacy_ack: false });
    const fbForm = useForm({ title: '', body: '', source: 'admin', company_id: '' });
    const roadForm = useForm({ title: '', description: '', quarter_label: '', status: 'planned', public: false });

    return (
        <AdminLayout title={section?.title}>
            <AdminPage>
                <AdminHeader eyebrow="Product" title={section?.title} description={section?.description} backHref="/admin/product" backLabel="Product hub" />
                <SettingsSectionNav nav={nav} activeId={operation} basePath="/admin/product" />
                <AdminBody className="space-y-6">
                    {operation === 'public-cms' && (
                        <>
                            <AdminCard title="New public page">
                                <form
                                    className="grid gap-3 sm:grid-cols-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        pageForm.post('/admin/product/public-pages');
                                    }}
                                >
                                    <AdminField label="Slug">
                                        <input className={inputClass} value={pageForm.data.slug} onChange={(e) => pageForm.setData('slug', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Title">
                                        <input className={inputClass} value={pageForm.data.title} onChange={(e) => pageForm.setData('title', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Type">
                                        <select className={selectClass} value={pageForm.data.page_type} onChange={(e) => pageForm.setData('page_type', e.target.value)}>
                                            <option value="landing">Landing</option>
                                            <option value="product">Product</option>
                                            <option value="faq">FAQ</option>
                                            <option value="help">Help</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </AdminField>
                                    <AdminField label="Status">
                                        <select className={selectClass} value={pageForm.data.status} onChange={(e) => pageForm.setData('status', e.target.value)}>
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                        </select>
                                    </AdminField>
                                    <AdminField label="Body" className="sm:col-span-2">
                                        <textarea className={textareaClass} value={pageForm.data.body} onChange={(e) => pageForm.setData('body', e.target.value)} />
                                    </AdminField>
                                    <AdminButton type="submit">Create page</AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Slug', 'Title', 'Type', 'Status', '']}>
                                {pages.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.slug}</td>
                                        <td className="px-4 py-3 text-sm">{row.title}</td>
                                        <td className="px-4 py-3 text-sm">{row.page_type}</td>
                                        <td className="px-4 py-3">
                                            <AdminBadge tone={row.status === 'published' ? 'success' : 'neutral'}>{row.status}</AdminBadge>
                                        </td>
                                        <td className="px-4 py-3">
                                            {row.status !== 'published' && (
                                                <AdminTextButton type="button" onClick={() => router.patch(`/admin/product/public-pages/${row.id}`, { status: 'published' })}>
                                                    Publish
                                                </AdminTextButton>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'announcements' && (
                        <>
                            <AdminCard title="New announcement">
                                <form
                                    className="space-y-3"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        annForm.post('/admin/product/announcements');
                                    }}
                                >
                                    <AdminField label="Title">
                                        <input className={inputClass} value={annForm.data.title} onChange={(e) => annForm.setData('title', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Body">
                                        <textarea className={textareaClass} value={annForm.data.body} onChange={(e) => annForm.setData('body', e.target.value)} />
                                    </AdminField>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <AdminField label="Severity">
                                            <select className={selectClass} value={annForm.data.severity} onChange={(e) => annForm.setData('severity', e.target.value)}>
                                                <option value="info">Info</option>
                                                <option value="feature">Feature</option>
                                                <option value="warning">Warning</option>
                                                <option value="critical">Critical</option>
                                            </select>
                                        </AdminField>
                                        <AdminField label="Audience">
                                            <select className={selectClass} value={annForm.data.audience} onChange={(e) => annForm.setData('audience', e.target.value)}>
                                                <option value="all">All users</option>
                                                <option value="workspace">Workspace members</option>
                                                <option value="admin">Platform admins</option>
                                            </select>
                                        </AdminField>
                                    </div>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" className={checkboxClass} checked={annForm.data.published} onChange={(e) => annForm.setData('published', e.target.checked)} />
                                        Publish immediately
                                    </label>
                                    <AdminButton type="submit">Create</AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Reference', 'Title', 'Severity', 'Published', '']}>
                                {announcements.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                                        <td className="px-4 py-3 text-sm">{row.title}</td>
                                        <td className="px-4 py-3 text-sm">{row.severity}</td>
                                        <td className="px-4 py-3">
                                            <AdminBadge tone={row.published ? 'success' : 'neutral'}>{row.published ? 'Yes' : 'No'}</AdminBadge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <AdminTextButton type="button" onClick={() => router.patch(`/admin/product/announcements/${row.id}/publish`, { published: !row.published })}>
                                                Toggle
                                            </AdminTextButton>
                                        </td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'testimonials' && (
                        <>
                            <AdminCard title="Add testimonial (with consent)">
                                <form
                                    className="space-y-3"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        testForm.post('/admin/product/testimonials');
                                    }}
                                >
                                    <AdminField label="Author">
                                        <input className={inputClass} value={testForm.data.author_name} onChange={(e) => testForm.setData('author_name', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Company">
                                        <input className={inputClass} value={testForm.data.company_name} onChange={(e) => testForm.setData('company_name', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Quote">
                                        <textarea className={textareaClass} value={testForm.data.body} onChange={(e) => testForm.setData('body', e.target.value)} />
                                    </AdminField>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" className={checkboxClass} checked={testForm.data.consent_obtained} onChange={(e) => testForm.setData('consent_obtained', e.target.checked)} />
                                        Written consent obtained for publication
                                    </label>
                                    <AdminButton type="submit" disabled={!testForm.data.consent_obtained}>
                                        Submit for moderation
                                    </AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Reference', 'Author', 'Status', '']}>
                                {testimonials.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                                        <td className="px-4 py-3 text-sm">{row.author_name}</td>
                                        <td className="px-4 py-3">
                                            <AdminBadge tone={badgeToneFor(row.status)}>{row.status}</AdminBadge>
                                        </td>
                                        <td className="px-4 py-3 space-x-2">
                                            {row.status === 'pending' && (
                                                <AdminTextButton type="button" onClick={() => router.patch(`/admin/product/testimonials/${row.id}`, { status: 'approved' })}>
                                                    Approve
                                                </AdminTextButton>
                                            )}
                                            {row.status === 'approved' && (
                                                <AdminTextButton type="button" onClick={() => router.patch(`/admin/product/testimonials/${row.id}`, { status: 'published' })}>
                                                    Publish
                                                </AdminTextButton>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'help-center' && (
                        <>
                            <AdminCard title="New help article">
                                <form
                                    className="grid gap-3 sm:grid-cols-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        helpForm.post('/admin/product/help-articles');
                                    }}
                                >
                                    <AdminField label="Slug">
                                        <input className={inputClass} value={helpForm.data.slug} onChange={(e) => helpForm.setData('slug', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Title">
                                        <input className={inputClass} value={helpForm.data.title} onChange={(e) => helpForm.setData('title', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Category">
                                        <select className={selectClass} value={helpForm.data.category} onChange={(e) => helpForm.setData('category', e.target.value)}>
                                            <option value="guide">User guide</option>
                                            <option value="integration">Integration</option>
                                            <option value="troubleshooting">Troubleshooting</option>
                                        </select>
                                    </AdminField>
                                    <label className="flex items-end gap-2 pb-2 text-sm">
                                        <input type="checkbox" className={checkboxClass} checked={helpForm.data.published} onChange={(e) => helpForm.setData('published', e.target.checked)} />
                                        Published
                                    </label>
                                    <AdminField label="Body" className="sm:col-span-2">
                                        <textarea className={textareaClass} value={helpForm.data.body} onChange={(e) => helpForm.setData('body', e.target.value)} />
                                    </AdminField>
                                    <AdminButton type="submit">Save article</AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Slug', 'Title', 'Category', 'Live']}>
                                {articles.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.slug}</td>
                                        <td className="px-4 py-3 text-sm">{row.title}</td>
                                        <td className="px-4 py-3 text-sm">{row.category}</td>
                                        <td className="px-4 py-3">{row.published ? 'Yes' : 'No'}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'release-notes' && (
                        <>
                            <AdminCard title="New release note">
                                <form
                                    className="space-y-3"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        releaseForm.post('/admin/product/release-notes');
                                    }}
                                >
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <AdminField label="Version">
                                            <input className={inputClass} value={releaseForm.data.version} onChange={(e) => releaseForm.setData('version', e.target.value)} placeholder="1.4.0" />
                                        </AdminField>
                                        <AdminField label="Type">
                                            <select className={selectClass} value={releaseForm.data.note_type} onChange={(e) => releaseForm.setData('note_type', e.target.value)}>
                                                <option value="feature">Feature</option>
                                                <option value="fix">Bug fix</option>
                                                <option value="known_issue">Known limitation</option>
                                            </select>
                                        </AdminField>
                                    </div>
                                    <AdminField label="Title">
                                        <input className={inputClass} value={releaseForm.data.title} onChange={(e) => releaseForm.setData('title', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Body">
                                        <textarea className={textareaClass} value={releaseForm.data.body} onChange={(e) => releaseForm.setData('body', e.target.value)} />
                                    </AdminField>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" className={checkboxClass} checked={releaseForm.data.published} onChange={(e) => releaseForm.setData('published', e.target.checked)} />
                                        Publish
                                    </label>
                                    <AdminButton type="submit">Save</AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Version', 'Title', 'Type', 'Published']}>
                                {notes.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.version}</td>
                                        <td className="px-4 py-3 text-sm">{row.title}</td>
                                        <td className="px-4 py-3 text-sm">{row.note_type}</td>
                                        <td className="px-4 py-3 text-sm">{formatDate(row.published_at)}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'feature-rollouts' && (
                        <>
                            <AdminCard title="Define rollout">
                                <form
                                    className="grid gap-3 sm:grid-cols-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        rolloutForm.post('/admin/product/feature-rollouts');
                                    }}
                                >
                                    <AdminField label="Feature key">
                                        <input className={inputClass} value={rolloutForm.data.feature_key} onChange={(e) => rolloutForm.setData('feature_key', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Display name">
                                        <input className={inputClass} value={rolloutForm.data.name} onChange={(e) => rolloutForm.setData('name', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Status">
                                        <select className={selectClass} value={rolloutForm.data.status} onChange={(e) => rolloutForm.setData('status', e.target.value)}>
                                            <option value="draft">Draft</option>
                                            <option value="pilot">Pilot</option>
                                            <option value="ga">General availability</option>
                                        </select>
                                    </AdminField>
                                    <AdminField label="Rollout % (hash bucket)">
                                        <input type="number" className={inputClass} value={rolloutForm.data.rollout_percent} onChange={(e) => rolloutForm.setData('rollout_percent', Number(e.target.value))} />
                                    </AdminField>
                                    <AdminButton type="submit" className="sm:col-span-2">
                                        Save rollout
                                    </AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Key', 'Name', 'Status', '%', '']}>
                                {rollouts.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.feature_key}</td>
                                        <td className="px-4 py-3 text-sm">{row.name}</td>
                                        <td className="px-4 py-3 text-sm">{row.status}</td>
                                        <td className="px-4 py-3 text-sm">{row.rollout_percent}</td>
                                        <td className="px-4 py-3">
                                            {row.status === 'pilot' && (
                                                <AdminTextButton type="button" onClick={() => router.patch(`/admin/product/feature-rollouts/${row.id}`, { status: 'ga' })}>
                                                    Promote to GA
                                                </AdminTextButton>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </AdminTable>
                            <p className="text-xs text-slate-500">Plans available: {plans.map((p) => planLabel(p)).join(', ') || '—'}. Assign plan slugs via API or extend this form later.</p>
                        </>
                    )}

                    {operation === 'ab-testing' && (
                        <>
                            <AdminCard className="border-violet-100 bg-violet-50/40">
                                <p className="text-sm text-slate-700">Minimum sample before analysis: {policy.min_participants ?? 100}. No PII in variant labels (see A/B testing policy).</p>
                            </AdminCard>
                            <AdminCard title="New experiment">
                                <form
                                    className="space-y-3"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        abForm.post('/admin/product/ab-experiments');
                                    }}
                                >
                                    <AdminField label="Name">
                                        <input className={inputClass} value={abForm.data.name} onChange={(e) => abForm.setData('name', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Surface (UI area)">
                                        <input className={inputClass} value={abForm.data.surface} onChange={(e) => abForm.setData('surface', e.target.value)} />
                                    </AdminField>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <AdminField label="Variant A">
                                            <input className={inputClass} value={abForm.data.variant_a_label} onChange={(e) => abForm.setData('variant_a_label', e.target.value)} />
                                        </AdminField>
                                        <AdminField label="Variant B">
                                            <input className={inputClass} value={abForm.data.variant_b_label} onChange={(e) => abForm.setData('variant_b_label', e.target.value)} />
                                        </AdminField>
                                    </div>
                                    <AdminField label="Success metric">
                                        <input className={inputClass} value={abForm.data.success_metric} onChange={(e) => abForm.setData('success_metric', e.target.value)} />
                                    </AdminField>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input type="checkbox" className={checkboxClass} checked={abForm.data.privacy_ack} onChange={(e) => abForm.setData('privacy_ack', e.target.checked)} />
                                        Privacy policy acknowledged
                                    </label>
                                    <AdminButton type="submit" disabled={!abForm.data.privacy_ack}>
                                        Create draft
                                    </AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Reference', 'Name', 'Status', '']}>
                                {experiments.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                                        <td className="px-4 py-3 text-sm">{row.name}</td>
                                        <td className="px-4 py-3 text-sm">{row.status}</td>
                                        <td className="px-4 py-3">
                                            {row.status === 'draft' && (
                                                <AdminTextButton type="button" onClick={() => router.patch(`/admin/product/ab-experiments/${row.id}`, { status: 'running' })}>
                                                    Start
                                                </AdminTextButton>
                                            )}
                                            {row.status === 'running' && (
                                                <AdminTextButton type="button" onClick={() => router.patch(`/admin/product/ab-experiments/${row.id}`, { status: 'completed' })}>
                                                    Complete
                                                </AdminTextButton>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}

                    {operation === 'feedback-roadmap' && (
                        <>
                            <AdminCard title="Log feedback">
                                <form
                                    className="space-y-3"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        fbForm.post('/admin/product/feedback');
                                    }}
                                >
                                    <AdminField label="Title">
                                        <input className={inputClass} value={fbForm.data.title} onChange={(e) => fbForm.setData('title', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Detail">
                                        <textarea className={textareaClass} value={fbForm.data.body} onChange={(e) => fbForm.setData('body', e.target.value)} />
                                    </AdminField>
                                    <AdminButton type="submit">Add</AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Reference', 'Title', 'Votes', 'Status', '']}>
                                {feedback.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 font-mono text-xs">{row.reference}</td>
                                        <td className="px-4 py-3 text-sm">{row.title}</td>
                                        <td className="px-4 py-3 text-sm">{row.votes}</td>
                                        <td className="px-4 py-3 text-sm">{row.status}</td>
                                        <td className="px-4 py-3">
                                            <AdminTextButton type="button" onClick={() => router.patch(`/admin/product/feedback/${row.id}`, { status: 'planned', votes: row.votes + 1 })}>
                                                Prioritize
                                            </AdminTextButton>
                                        </td>
                                    </tr>
                                ))}
                            </AdminTable>
                            <AdminCard title="Roadmap item">
                                <form
                                    className="grid gap-3 sm:grid-cols-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        roadForm.post('/admin/product/roadmap');
                                    }}
                                >
                                    <AdminField label="Title" className="sm:col-span-2">
                                        <input className={inputClass} value={roadForm.data.title} onChange={(e) => roadForm.setData('title', e.target.value)} />
                                    </AdminField>
                                    <AdminField label="Quarter">
                                        <input className={inputClass} value={roadForm.data.quarter_label} onChange={(e) => roadForm.setData('quarter_label', e.target.value)} placeholder="2026 Q4" />
                                    </AdminField>
                                    <label className="flex items-end gap-2 pb-2 text-sm">
                                        <input type="checkbox" className={checkboxClass} checked={roadForm.data.public} onChange={(e) => roadForm.setData('public', e.target.checked)} />
                                        Public on roadmap
                                    </label>
                                    <AdminButton type="submit">Add to roadmap</AdminButton>
                                </form>
                            </AdminCard>
                            <AdminTable columns={['Title', 'Quarter', 'Status', 'Public']}>
                                {roadmap.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-4 py-3 text-sm">{row.title}</td>
                                        <td className="px-4 py-3 text-sm">{row.quarter_label || '—'}</td>
                                        <td className="px-4 py-3 text-sm">{row.status}</td>
                                        <td className="px-4 py-3">{row.public ? 'Yes' : 'No'}</td>
                                    </tr>
                                ))}
                            </AdminTable>
                        </>
                    )}
                </AdminBody>
            </AdminPage>
        </AdminLayout>
    );
}
