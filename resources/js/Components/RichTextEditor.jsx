import { useEffect, useRef, useState } from 'react';
import { sanitizeHtml } from '../lib/sanitizeHtml';

const ACTIONS = [
    { cmd: 'bold', label: 'B', title: 'Bold', className: 'font-bold' },
    { cmd: 'italic', label: 'I', title: 'Italic', className: 'italic' },
    { cmd: 'underline', label: 'U', title: 'Underline', className: 'underline' },
    { cmd: 'insertUnorderedList', label: '•', title: 'Bullet list', className: 'font-semibold' },
];

export default function RichTextEditor({ value = '', onChange, placeholder = '', minHeight = '11rem', error }) {
    const editorRef = useRef(null);
    const focusedRef = useRef(false);
    const [active, setActive] = useState({});
    const [focused, setFocused] = useState(false);
    const empty = !value || value === '<br>' || value === '<div><br></div>';

    useEffect(() => {
        const el = editorRef.current;
        if (!el || focusedRef.current) return;
        const next = sanitizeHtml(value || '');
        if (el.innerHTML !== next) {
            el.innerHTML = next;
        }
    }, [value]);

    const emit = () => {
        const html = sanitizeHtml(editorRef.current?.innerHTML || '');
        onChange?.(html === '<br>' ? '' : html);
        refreshState();
    };

    const refreshState = () => {
        setActive({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        });
    };

    const run = (cmd) => {
        editorRef.current?.focus();
        document.execCommand(cmd, false, null);
        emit();
    };

    return (
        <div className={`overflow-hidden rounded-xl border bg-white ${error ? 'border-rose-400' : 'border-slate-200'}`}>
            <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
                {ACTIONS.map((action) => (
                    <button
                        key={action.cmd}
                        type="button"
                        title={action.title}
                        onMouseDown={(event) => {
                            event.preventDefault();
                            run(action.cmd);
                        }}
                        className={`rounded-md px-2 py-1 text-xs text-slate-600 hover:bg-white ${action.className} ${
                            active[action.cmd] ? 'bg-indigo-100 text-indigo-700' : ''
                        }`}
                    >
                        {action.label}
                    </button>
                ))}
            </div>
            <div className="relative">
                {empty && !focused && (
                    <div className="pointer-events-none absolute inset-0 px-3.5 py-2.5 text-sm text-slate-400">{placeholder}</div>
                )}
                <div
                    ref={editorRef}
                    contentEditable
                    role="textbox"
                    aria-multiline="true"
                    className="rich-text min-h-[11rem] px-3.5 py-2.5 text-sm text-slate-900 outline-none"
                    style={{ minHeight }}
                    onFocus={() => {
                        focusedRef.current = true;
                        setFocused(true);
                    }}
                    onBlur={() => {
                        focusedRef.current = false;
                        setFocused(false);
                        emit();
                    }}
                    onInput={emit}
                    onKeyUp={refreshState}
                    onMouseUp={refreshState}
                    data-placeholder={placeholder}
                />
            </div>
        </div>
    );
}
