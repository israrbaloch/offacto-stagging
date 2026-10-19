import { AdminButton, AdminField, AdminSection, AdminTextButton, inputClass } from './ui';

/** List of email addresses (stored as JSON string array). */
export default function EmailRecipientListField({ title, description, value, onChange }) {
    const rows = Array.isArray(value) ? value : [];
    const setRow = (i, email) => {
        const next = [...rows];
        next[i] = email;
        onChange(next.filter((e) => e !== undefined));
    };
    const add = () => onChange([...rows, '']);
    const remove = (i) => onChange(rows.filter((_, j) => j !== i));

    return (
        <AdminSection title={title} description={description}>
            {rows.length === 0 && <p className="mb-3 text-sm text-slate-500">No addresses yet. Add at least one email for notifications to be sent.</p>}
            {rows.map((email, i) => (
                <div key={i} className="mb-2 flex flex-wrap items-end gap-2">
                    <AdminField label={`Email ${i + 1}`} className="min-w-[240px] flex-1">
                        <input
                            type="email"
                            className={inputClass}
                            value={email}
                            placeholder="name@company.com"
                            onChange={(e) => setRow(i, e.target.value.trim())}
                        />
                    </AdminField>
                    <AdminTextButton type="button" className="pb-2" onClick={() => remove(i)}>
                        Remove
                    </AdminTextButton>
                </div>
            ))}
            <AdminButton type="button" variant="secondary" onClick={add}>
                Add email address
            </AdminButton>
        </AdminSection>
    );
}
