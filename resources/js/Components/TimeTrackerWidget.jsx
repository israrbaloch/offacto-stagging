import { router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';
import { t } from '../lib/i18n';

function xsrfToken() {
    const match = document.cookie.split('; ').find((row) => row.startsWith('XSRF-TOKEN='));
    return match ? decodeURIComponent(match.split('=')[1]) : '';
}

function formatElapsed(startedAtIso) {
    if (!startedAtIso) return '00:00:00';
    const start = new Date(startedAtIso).getTime();
    const secs = Math.max(0, Math.floor((Date.now() - start) / 1000));
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

export default function TimeTrackerWidget({ variant = 'default' }) {
    const isTopbar = variant === 'topbar';
    const idleBtnClass = isTopbar
        ? 'offacto-topbar-icobtn disabled:cursor-not-allowed disabled:opacity-40'
        : 'rounded-full p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40';
    const { timeTracking, activeCompany } = usePage().props;
    const anchorRef = useRef(null);
    const panelRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [panelStyle, setPanelStyle] = useState(null);
    const [running, setRunning] = useState(timeTracking?.running ?? null);
    const [tick, setTick] = useState(0);
    const [serviceId, setServiceId] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [description, setDescription] = useState('');
    const [busy, setBusy] = useState(false);

    const hourlyServices = timeTracking?.hourlyServices ?? [];
    const customers = timeTracking?.customers ?? [];
    const canTrack = Boolean(activeCompany && hourlyServices.length > 0);

    useEffect(() => {
        setRunning(timeTracking?.running ?? null);
    }, [timeTracking?.running]);

    useEffect(() => {
        if (!running?.started_at) return undefined;
        const id = setInterval(() => setTick((n) => n + 1), 1000);
        return () => clearInterval(id);
    }, [running?.started_at]);

    useEffect(() => {
        if (!open) return undefined;
        const update = () => {
            const el = anchorRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            setPanelStyle({
                top: rect.bottom + 8,
                right: Math.max(8, window.innerWidth - rect.right),
            });
        };
        update();
        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);
        return () => {
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', update, true);
        };
    }, [open]);

    useEffect(() => {
        if (!open) return undefined;
        const onPointer = (event) => {
            if (anchorRef.current?.contains(event.target) || panelRef.current?.contains(event.target)) {
                return;
            }
            setOpen(false);
        };
        const onKey = (event) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onPointer);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onPointer);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const elapsed = useMemo(() => formatElapsed(running?.started_at), [running?.started_at, tick]);

    if (!activeCompany) {
        return null;
    }

    const postJson = async (url, body) => {
        setBusy(true);
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
                throw new Error(data.message || 'Request failed');
            }
            return data;
        } finally {
            setBusy(false);
        }
    };

    const start = async () => {
        if (!serviceId) return;
        try {
            const data = await postJson('/time/timer/start', {
                service_id: Number(serviceId),
                customer_id: customerId ? Number(customerId) : null,
                description: description || null,
                billable: true,
            });
            setRunning(data.running);
            setOpen(false);
            router.reload({ only: ['timeTracking'] });
        } catch (e) {
            alert(e.message);
        }
    };

    const stop = async () => {
        try {
            await postJson('/time/timer/stop', {});
            setRunning(null);
            setOpen(false);
            router.reload({ only: ['timeTracking'] });
        } catch (e) {
            alert(e.message);
        }
    };

    const popover =
        open && canTrack && panelStyle
            ? createPortal(
                  <div
                      ref={panelRef}
                      role="dialog"
                      aria-label={t('time.start_timer')}
                      className="fixed z-[200] w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
                      style={{ top: panelStyle.top, right: panelStyle.right }}
                  >
                      <p className="mb-3 text-sm font-semibold text-slate-900">{t('time.start_timer')}</p>
                      <label className="mb-2 block text-xs font-medium text-slate-600">
                          {t('time.hourly_service')}
                          <select
                              className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                              value={serviceId}
                              onChange={(e) => setServiceId(e.target.value)}
                          >
                              <option value="">{t('time.select_service')}</option>
                              {hourlyServices.map((s) => (
                                  <option key={s.id} value={s.id}>
                                      {s.name}
                                  </option>
                              ))}
                          </select>
                      </label>
                      <label className="mb-2 block text-xs font-medium text-slate-600">
                          {t('time.customer')}
                          <select
                              className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                              value={customerId}
                              onChange={(e) => setCustomerId(e.target.value)}
                          >
                              <option value="">{t('time.select_customer')}</option>
                              {customers.map((c) => (
                                  <option key={c.id} value={c.id}>
                                      {c.label}
                                  </option>
                              ))}
                          </select>
                      </label>
                      <label className="mb-3 block text-xs font-medium text-slate-600">
                          {t('time.description')}
                          <input
                              className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                          />
                      </label>
                      <button
                          type="button"
                          disabled={busy || !serviceId || !customerId}
                          onClick={start}
                          className="w-full rounded-full bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                      >
                          {t('time.start')}
                      </button>
                  </div>,
                  document.body,
              )
            : null;

    if (running) {
        if (isTopbar) {
            return (
                <div className="flex items-center gap-1.5">
                    <span className="offacto-topbar-icobtn ring-2 ring-[#9D8DF1]/50" title={`${running.service?.name || ''} · ${elapsed}`}>
                        <Icon name="clock" />
                    </span>
                    <span className="hidden font-mono text-[11px] tabular-nums text-[#CEC6FB] lg:inline">{elapsed}</span>
                    <button
                        type="button"
                        disabled={busy}
                        onClick={stop}
                        className="rounded-full bg-[#6B59DC] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#5A48C8] disabled:opacity-50"
                    >
                        {t('time.stop')}
                    </button>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-1">
                <span
                    className="relative rounded-full p-2 text-indigo-600 ring-2 ring-indigo-200"
                    title={`${running.service?.name || ''} · ${elapsed}`}
                >
                    <Icon name="clock" className="h-5 w-5" />
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                </span>
                <span className="hidden font-mono text-xs tabular-nums text-indigo-800 md:inline">{elapsed}</span>
                <button
                    type="button"
                    disabled={busy}
                    onClick={stop}
                    className="rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                    {t('time.stop')}
                </button>
            </div>
        );
    }

    return (
        <>
            <button
                type="button"
                ref={anchorRef}
                disabled={!canTrack}
                onClick={() => canTrack && setOpen((v) => !v)}
                className={idleBtnClass}
                aria-label={t('time.start_timer')}
                title={canTrack ? t('time.start_timer') : t('time.no_hourly_services')}
            >
                <Icon name="clock" className="h-5 w-5" />
            </button>
            {popover}
        </>
    );
}
