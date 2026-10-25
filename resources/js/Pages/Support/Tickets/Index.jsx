import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Icon from '../../../Components/Icon';
import SupportTicketDrawer from '../../../Components/SupportTicketDrawer';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import { t } from '../../../lib/i18n';
import { formatDate } from '../../../lib/utils';

function ticketStatusBadgeClass(status) {
    const key = String(status || '').toLowerCase();
    if (key === 'closed') {
        return 'grey';
    }
    if (key === 'open' || key === 'new') {
        return 'ok';
    }
    if (key === 'pending' || key === 'waiting') {
        return 'warn';
    }
    return '';
}

function priorityLabel(priority) {
    const key = String(priority || 'normal').toLowerCase();
    const map = {
        low: 'support.priority_low',
        normal: 'support.priority_normal',
        high: 'support.priority_high',
        urgent: 'support.priority_urgent',
    };
    return t(map[key] || map.normal);
}

function drawerOpenFromFilters(filters = {}) {
    return filters.drawer === 'new';
}

export default function SupportTicketsIndex({ tickets = [], company, filters = {} }) {
    const [drawerOpen, setDrawerOpen] = useState(() => drawerOpenFromFilters(filters));
    const companyName = company?.name || company?.company_name || '';

    useEffect(() => {
        setDrawerOpen(drawerOpenFromFilters(filters));
    }, [filters.drawer]);

    useEffect(() => {
        if (!drawerOpen) {
            document.body.style.removeProperty('overflow');
            return undefined;
        }
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [drawerOpen]);

    function syncDrawerUrl(open) {
        const url = open ? '/support?drawer=new' : '/support';
        window.history.replaceState({}, '', url);
    }

    function openNewDrawer() {
        setDrawerOpen(true);
        syncDrawerUrl(true);
    }

    function closeDrawer() {
        setDrawerOpen(false);
        syncDrawerUrl(false);
    }

    function openTicket(id) {
        router.visit(`/support/tickets/${id}`);
    }

    return (
        <AuthenticatedLayout title={t('support.title')}>
            <div className="offacto-briefings offacto-dash offacto-support-page">
                <header className="offacto-brief-edit-ph">
                    <div>
                        <span className="offacto-support-eyebrow">
                            <Icon name="help" />
                            {t('nav.support')}
                        </span>
                        <h1>{t('support.title')}</h1>
                        <p>{t('support.tickets_intro', { company: companyName })}</p>
                    </div>
                    <button type="button" className="offacto-btn-p" onClick={openNewDrawer}>
                        <Icon name="plus" />
                        {t('support.new_ticket')}
                    </button>
                </header>

                <div className="offacto-brief-table-card offacto-dash-card">
                    <div className="offacto-quotes-toolbar">
                        <b className="offacto-support-table-title">{t('support.your_tickets')}</b>
                    </div>
                    <div className="offacto-brief-table-wrap">
                        <table className="offacto-brief-table">
                            <thead>
                                <tr>
                                    <th>{t('support.subject')}</th>
                                    <th>{t('support.reference')}</th>
                                    <th>{t('support.updated')}</th>
                                    <th>{t('support.priority')}</th>
                                    <th>{t('support.status')}</th>
                                </tr>
                            </thead>
                            <tbody className="offacto-brief-table-click">
                                {tickets.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="offacto-brief-empty">
                                            {t('support.empty')}
                                        </td>
                                    </tr>
                                ) : (
                                    tickets.map((row) => (
                                        <tr key={row.id} onClick={() => openTicket(row.id)}>
                                            <td>
                                                <b className="offacto-support-table-subject">{row.subject}</b>
                                            </td>
                                            <td>
                                                <span className="offacto-support-table-muted">{row.reference}</span>
                                            </td>
                                            <td>
                                                <span className="offacto-support-table-muted">{formatDate(row.updated_at)}</span>
                                            </td>
                                            <td>
                                                <span className="offacto-demo-badge grey nd">{priorityLabel(row.priority)}</span>
                                            </td>
                                            <td>
                                                <span className={`offacto-demo-badge nd ${ticketStatusBadgeClass(row.status)}`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <SupportTicketDrawer
                    key={drawerOpen ? 'open' : 'closed'}
                    open={drawerOpen}
                    onClose={closeDrawer}
                    companyName={companyName}
                />
            </div>
        </AuthenticatedLayout>
    );
}
