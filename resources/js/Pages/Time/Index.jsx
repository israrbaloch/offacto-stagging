import { Link, router, useForm, usePage } from '@inertiajs/react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import Icon from '../../Components/Icon';
import Modal from '../../Components/Modal';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { useUi } from '../../context/UiContext';
import { t } from '../../lib/i18n';

function xsrfToken() {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

function formatHm(seconds) {
    const minutes = Math.floor(Number(seconds || 0) / 60);
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}${t('time.hour_suffix')} ${String(m).padStart(2, '0')}m`;
}

function formatClockFromStart(startedAtIso) {
    if (!startedAtIso) {
        return '00:00:00';
    }
    const secs = Math.max(0, Math.floor((Date.now() - new Date(startedAtIso).getTime()) / 1000));
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

function formatDay(iso) {
    if (!iso) {
        return '—';
    }
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' });
}

function customerLabel(customer) {
    if (!customer) {
        return '—';
    }
    return customer.org_name || [customer.first_name, customer.surname].filter(Boolean).join(' ') || '—';
}

function entryProject(entry) {
    return entry.description?.trim() || entry.service?.name || '—';
}

function statusBadge(entry) {
    if (entry.status === 'invoiced') {
        return { className: 'ok', label: t('time.status_invoiced') };
    }
    if (entry.billable && entry.customer_id && entry.status === 'completed') {
        return { className: '', label: t('time.status_billable') };
    }
    return { className: 'grey', label: t('time.status_internal') };
}

function dayKey(iso) {
    if (!iso) {
        return '';
    }
    return String(iso).slice(0, 10);
}

function entryGroupKey(entry) {
    return `${entry.customer_id ?? 0}-${entry.service_id ?? 0}-${dayKey(entry.started_at)}`;
}

function groupEntries(rows) {
    const map = new Map();
    for (const entry of rows) {
        const key = entryGroupKey(entry);
        if (!map.has(key)) {
            map.set(key, { key, entries: [] });
        }
        map.get(key).entries.push(entry);
    }

    return [...map.values()]
        .map((group) => {
            const totalSeconds = group.entries.reduce((sum, e) => sum + (e.duration_seconds || 0), 0);
            const latest = group.entries.reduce((max, e) => {
                const ts = e.started_at ? new Date(e.started_at).getTime() : 0;
                return ts > max ? ts : max;
            }, 0);
            return { ...group, totalSeconds, latest };
        })
        .sort((a, b) => b.latest - a.latest);
}

function groupProjectLabel(group) {
    const first = group.entries[0];
    const serviceName = first?.service?.name;
    if (group.entries.length === 1) {
        return entryProject(first);
    }
    const descriptions = [...new Set(group.entries.map((e) => e.description?.trim()).filter(Boolean))];
    if (descriptions.length === 1) {
        return descriptions[0];
    }
    if (serviceName) {
        return t('time.group_service_sessions', { service: serviceName, count: group.entries.length });
    }
    return t('time.sessions_count', { count: group.entries.length });
}

function groupStatusBadge(entries) {
    const badges = entries.map(statusBadge);
    const labels = [...new Set(badges.map((b) => b.label))];
    if (labels.length === 1) {
        return badges[0];
    }
    return { className: 'grey', label: t('time.status_mixed') };
}

function isSelectableEntry(entry) {
    return entry.status === 'completed' && entry.billable && entry.customer_id;
}

function formatSessionRange(entry) {
    if (!entry.started_at) {
        return '—';
    }
    const start = new Date(entry.started_at);
    const end = entry.ended_at ? new Date(entry.ended_at) : null;
    const fmt = (d) => d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    if (end) {
        return `${fmt(start)} – ${fmt(end)}`;
    }
    return fmt(start);
}

export default function TimeIndex({
    entries,
    hourlyServices = [],
    customers = [],
    weekStats = { days: [], total_display: '0h 00m', billable_percent: 0, today: '' },
}) {
    const { toast } = useUi();
    const { timeTracking } = usePage().props;
    const [selected, setSelected] = useState([]);
    const [manualOpen, setManualOpen] = useState(false);
    const [timerBusy, setTimerBusy] = useState(false);
    const [tick, setTick] = useState(0);
    const [expandedGroups, setExpandedGroups] = useState(() => new Set());

    const [description, setDescription] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [serviceId, setServiceId] = useState(hourlyServices[0]?.id ? String(hourlyServices[0].id) : '');

    const running = timeTracking?.running ?? null;
    const trackingCustomers = timeTracking?.customers ?? customers.map((c) => ({
        id: c.id,
        label: customerLabel(c),
    }));

    useEffect(() => {
        if (!running?.started_at) {
            return undefined;
        }
        const id = setInterval(() => setTick((n) => n + 1), 1000);
        return () => clearInterval(id);
    }, [running?.started_at]);

    useEffect(() => {
        if (running) {
            setDescription(running.description || '');
            setCustomerId(running.customer?.id ? String(running.customer.id) : '');
            setServiceId(running.service?.id ? String(running.service.id) : serviceId);
        }
    }, [running?.id]);

    const clock = useMemo(() => formatClockFromStart(running?.started_at), [running?.started_at, tick]);

    const manualForm = useForm({
        service_id: hourlyServices[0]?.id || '',
        customer_id: '',
        description: '',
        entry_date: new Date().toISOString().slice(0, 10),
        duration_minutes: 60,
        billable: true,
    });

    const entryRows = entries.data ?? [];
    const entryGroups = useMemo(() => groupEntries(entryRows), [entryRows]);

    const toggle = (id) => {
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const toggleGroupExpanded = (key) => {
        setExpandedGroups((prev) => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    };

    const toggleGroupSelection = (group) => {
        const ids = group.entries.filter(isSelectableEntry).map((e) => e.id);
        if (ids.length === 0) {
            return;
        }
        setSelected((prev) => {
            const allSelected = ids.every((id) => prev.includes(id));
            if (allSelected) {
                return prev.filter((id) => !ids.includes(id));
            }
            return [...new Set([...prev, ...ids])];
        });
    };

    const selectedSeconds = useMemo(() => {
        return entryRows.filter((e) => selected.includes(e.id)).reduce((sum, e) => sum + (e.duration_seconds || 0), 0);
    }, [entryRows, selected]);

    const selectedCustomerId = useMemo(() => {
        const rows = entryRows.filter((e) => selected.includes(e.id));
        const ids = [...new Set(rows.map((e) => e.customer_id).filter(Boolean))];
        return ids.length === 1 ? ids[0] : null;
    }, [entryRows, selected]);

    const canInvoice = selected.length > 0 && selectedCustomerId && selectedSeconds > 0;

    const postJson = async (url, body) => {
        setTimerBusy(true);
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': xsrfToken(),
                },
                credentials: 'same-origin',
                body: JSON.stringify(body),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message || t('time.timer_error'));
            }
            return data;
        } finally {
            setTimerBusy(false);
        }
    };

    const toggleTimer = async () => {
        if (hourlyServices.length === 0) {
            toast.info(t('time.no_hourly_services'));
            return;
        }
        if (running) {
            try {
                await postJson('/time/timer/stop', {});
                router.reload({ preserveScroll: true, preserveState: true });
            } catch (e) {
                toast.error(e.message);
            }
            return;
        }
        if (!serviceId) {
            toast.info(t('time.select_service'));
            return;
        }
        if (!customerId) {
            toast.info(t('time.select_customer'));
            return;
        }
        try {
            await postJson('/time/timer/start', {
                service_id: Number(serviceId),
                customer_id: Number(customerId),
                description: description || null,
                billable: true,
            });
            router.reload({ preserveScroll: true, preserveState: true });
        } catch (e) {
            toast.error(e.message);
        }
    };

    const createInvoice = () => {
        if (!canInvoice) {
            return;
        }
        router.post(
            '/invoices/from-time-entries',
            {
                customer_id: selectedCustomerId,
            time_entry_ids: selected,
            },
            { preserveScroll: true },
        );
    };

    const submitManual = (e) => {
        e.preventDefault();
        const date = manualForm.data.entry_date;
        const minutes = Number(manualForm.data.duration_minutes) || 0;
        if (!date || minutes < 1) {
            return;
        }
        const started = new Date(`${date}T09:00:00`);
        const ended = new Date(started.getTime() + minutes * 60 * 1000);
        const payload = {
            ...manualForm.data,
            started_at: started.toISOString().slice(0, 16),
            ended_at: ended.toISOString().slice(0, 16),
        };
        manualForm.transform(() => payload);
        manualForm.post('/time', {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                manualForm.reset();
                setManualOpen(false);
                setSelected([]);
            },
        });
    };

    return (
        <AuthenticatedLayout title={t('time.title')}>
            <div className="offacto-briefings offacto-dash offacto-time-page">
                <header className="offacto-brief-edit-ph">
                    <div>
                        <h1>{t('time.title')}</h1>
                        <p>{t('time.subtitle_demo')}</p>
                    </div>
                    <button
                        type="button"
                        className="offacto-btn-p"
                        disabled={!canInvoice}
                        onClick={createInvoice}
                    >
                        <Icon name="file" />
                        {t('time.invoice')}
                        {selectedSeconds > 0 ? ` ${formatHm(selectedSeconds)}` : ''}
                    </button>
                </header>

                {hourlyServices.length === 0 && (
                    <div className="offacto-time-note warn">
                        <Icon name="alert" />
                        <div>
                        {t('time.no_hourly_services')}{' '}
                            <Link href="/services/create" className="offacto-time-link">
                            {t('time.add_service')}
                        </Link>
                        </div>
                    </div>
                )}

                <div className="offacto-dash-card offacto-time-timer-card">
                    <div className="offacto-time-timer">
                        <button
                            type="button"
                            className={`offacto-time-playbtn${running ? ' on' : ''}`}
                            disabled={timerBusy || hourlyServices.length === 0}
                            onClick={toggleTimer}
                            aria-label={running ? t('time.stop') : t('time.start')}
                        >
                            <Icon name={running ? 'pause' : 'play'} />
                        </button>
                        <div className="offacto-time-clock" aria-live="polite">
                            {clock}
                        </div>
                        <div className="offacto-time-timer-fields">
                            <input
                                className="offacto-time-inp"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t('time.project_placeholder')}
                                disabled={Boolean(running)}
                            />
                            <select
                                className="offacto-time-inp"
                                value={customerId}
                                onChange={(e) => setCustomerId(e.target.value)}
                                disabled={Boolean(running)}
                            >
                                <option value="">{t('time.select_customer')}</option>
                                {trackingCustomers.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="offacto-time-inp"
                                value={serviceId}
                                onChange={(e) => setServiceId(e.target.value)}
                                disabled={Boolean(running)}
                            >
                                <option value="">{t('time.select_service')}</option>
                                {hourlyServices.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="offacto-time-grid">
                    <div className="offacto-brief-table-card offacto-dash-card">
                        <div className="offacto-time-card-head">
                            <h3>{t('time.entries')}</h3>
                            <button type="button" className="offacto-brief-btn-sm" onClick={() => setManualOpen(true)}>
                                <Icon name="plus" />
                                {t('time.manual_short')}
                            </button>
                        </div>
                        <div className="offacto-brief-table-wrap">
                            <table className="offacto-brief-table">
                                <thead>
                                    <tr>
                                        <th className="w-10" />
                                        <th>{t('time.col_project')}</th>
                                        <th>{t('time.customer')}</th>
                                        <th>{t('time.col_day')}</th>
                                        <th>{t('time.col_duration')}</th>
                                        <th>{t('time.col_status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entryRows.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="offacto-brief-empty">
                                                {t('time.empty')}
                                            </td>
                                        </tr>
                                    ) : (
                                        entryGroups.map((group) => {
                                            const multi = group.entries.length > 1;
                                            const expanded = expandedGroups.has(group.key);
                                            const selectableIds = group.entries.filter(isSelectableEntry).map((e) => e.id);
                                            const allSelected =
                                                selectableIds.length > 0 &&
                                                selectableIds.every((id) => selected.includes(id));
                                            const someSelected =
                                                selectableIds.length > 0 &&
                                                selectableIds.some((id) => selected.includes(id));
                                            const badge = groupStatusBadge(group.entries);
                                            const lead = group.entries[0];

                                            return (
                                                <Fragment key={group.key}>
                                                    <tr className="offacto-time-group-row">
                                                        <td>
                                                            <div className="offacto-time-row-actions">
                                                                {multi ? (
                                                                    <button
                                                                        type="button"
                                                                        className={`offacto-time-expand${expanded ? ' on' : ''}`}
                                                                        aria-expanded={expanded}
                                                                        aria-label={t('time.toggle_sessions')}
                                                                        onClick={() => toggleGroupExpanded(group.key)}
                                                                    >
                                                                        <Icon name="chevron" />
                                                                    </button>
                                                                ) : (
                                                                    <span className="offacto-time-expand-spacer" aria-hidden="true" />
                                                                )}
                                                                {selectableIds.length > 0 ? (
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={allSelected}
                                                                        ref={(el) => {
                                                                            if (el) {
                                                                                el.indeterminate =
                                                                                    someSelected && !allSelected;
                                                                            }
                                                                        }}
                                                                        aria-label={t('time.select_group')}
                                                                        onChange={() => toggleGroupSelection(group)}
                                                                    />
                                                                ) : null}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <b>{groupProjectLabel(group)}</b>
                                                        </td>
                                                        <td>{customerLabel(lead.customer)}</td>
                                                        <td>{formatDay(lead.started_at)}</td>
                                                        <td>{formatHm(group.totalSeconds)}</td>
                                                        <td>
                                                            <span
                                                                className={`offacto-demo-badge nd ${badge.className}`.trim()}
                                                            >
                                                                {badge.label}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                    {multi && expanded
                                                        ? group.entries.map((entry) => {
                                                              const sessionBadge = statusBadge(entry);
                                                              return (
                                                                  <tr
                                                                      key={`${group.key}-${entry.id}`}
                                                                      className="offacto-time-session-row"
                                                                  >
                                                                      <td>
                                                                          {isSelectableEntry(entry) ? (
                                                                              <input
                                                                                  type="checkbox"
                                                                                  checked={selected.includes(entry.id)}
                                                                                  onChange={() => toggle(entry.id)}
                                                                              />
                                                                          ) : null}
                                                                      </td>
                                                                      <td>
                                                                          <span className="offacto-time-session-label">
                                                                              {formatSessionRange(entry)}
                                                                              {entry.description?.trim()
                                                                                  ? ` · ${entry.description.trim()}`
                                                                                  : ''}
                                                                          </span>
                                                                      </td>
                                                                      <td aria-hidden="true" />
                                                                      <td aria-hidden="true" />
                                                                      <td>{formatHm(entry.duration_seconds)}</td>
                                                                      <td>
                                                                          <span
                                                                              className={`offacto-demo-badge nd ${sessionBadge.className}`.trim()}
                                                                          >
                                                                              {sessionBadge.label}
                                                                          </span>
                                                                      </td>
                                                                  </tr>
                                                              );
                                                          })
                                                        : null}
                                                </Fragment>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {entries.links?.length > 3 ? (
                            <div className="offacto-time-pagination">
                                {entries.links.map((link, i) =>
                                    link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={`offacto-time-page-link${link.active ? ' on' : ''}`}
                                            preserveScroll
                                            preserveState
                                        >
                                            {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                                        </Link>
                                    ) : (
                                        <span key={i} className="offacto-time-page-link disabled">
                                            {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                                        </span>
                                    ),
                                )}
                            </div>
                        ) : null}
                    </div>

                    <div className="offacto-dash-card offacto-time-week-card">
                        <div className="offacto-time-card-head">
                            <h3>{t('time.this_week')}</h3>
                            <b>{weekStats.total_display}</b>
                        </div>
                        <div className="offacto-time-week-body">
                            <div className="offacto-time-wk">
                                {weekStats.days?.map((day) => (
                                    <div
                                        key={day.date}
                                        className={day.date === weekStats.today ? 'today' : ''}
                                    >
                                        <small>{day.label}</small>
                                        <b>{day.display}</b>
                                    </div>
                                ))}
                            </div>
                            <div className="offacto-time-sep" />
                            <div className="offacto-time-billable-row">
                                <span>{t('time.status_billable')}</span>
                                <b>{weekStats.billable_percent}%</b>
                            </div>
                            <div className="offacto-time-bar">
                                <i style={{ width: `${weekStats.billable_percent}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                <Modal
                    open={manualOpen}
                    title={t('time.log_manual')}
                    onClose={() => setManualOpen(false)}
                    footer={
                        <>
                            <button type="button" className="offacto-brief-btn" onClick={() => setManualOpen(false)}>
                                {t('common.cancel')}
                            </button>
                            <button
                                type="submit"
                                form="time-manual-form"
                                className="offacto-btn-p"
                                disabled={manualForm.processing}
                            >
                                {manualForm.processing ? t('common.saving') : t('common.save')}
                            </button>
                        </>
                    }
                >
                    <form id="time-manual-form" className="offacto-time-manual-form" onSubmit={submitManual}>
                        <label className="offacto-time-field">
                            <span>{t('time.col_project')}</span>
                            <input
                                className="offacto-time-inp"
                                value={manualForm.data.description}
                                onChange={(e) => manualForm.setData('description', e.target.value)}
                            />
                        </label>
                        <label className="offacto-time-field">
                            <span>{t('time.hourly_service')}</span>
                                <select
                                className="offacto-time-inp"
                                    value={manualForm.data.service_id}
                                    onChange={(e) => manualForm.setData('service_id', e.target.value)}
                                >
                                    {hourlyServices.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        <label className="offacto-time-field">
                            <span>{t('time.customer')}</span>
                                <select
                                className="offacto-time-inp"
                                    value={manualForm.data.customer_id}
                                    onChange={(e) => manualForm.setData('customer_id', e.target.value)}
                                >
                                    <option value="">{t('time.select_customer')}</option>
                                    {customers.map((c) => (
                                        <option key={c.id} value={c.id}>
                                        {customerLabel(c)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        <div className="offacto-time-fg2">
                            <label className="offacto-time-field">
                                <span>{t('time.entry_date')}</span>
                                <input
                                    type="date"
                                    className="offacto-time-inp"
                                    value={manualForm.data.entry_date}
                                    onChange={(e) => manualForm.setData('entry_date', e.target.value)}
                                />
                            </label>
                            <label className="offacto-time-field">
                                <span>{t('time.duration_minutes')}</span>
                                <input
                                    type="number"
                                    min={1}
                                    className="offacto-time-inp"
                                    value={manualForm.data.duration_minutes}
                                    onChange={(e) => manualForm.setData('duration_minutes', e.target.value)}
                                />
                            </label>
                        </div>
                    </form>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
