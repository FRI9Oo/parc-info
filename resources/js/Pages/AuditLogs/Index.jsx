import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import usePagination from '@/Hooks/usePagination';
import { useLanguage } from '@/Context/LanguageContext';
import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Index({ logs = [] }) {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [moduleFilter, setModuleFilter] = useState('all');
    const [actionFilter, setActionFilter] = useState('all');
    const [selectedLog, setSelectedLog] = useState(null);

    // List of unique modules and actions for dropdown filters
    const modules = useMemo(() => {
        const set = new Set(logs.map((l) => l.module).filter(Boolean));
        return Array.from(set);
    }, [logs]);

    const actions = useMemo(() => {
        const set = new Set(logs.map((l) => l.action).filter(Boolean));
        return Array.from(set);
    }, [logs]);

    // Computed filtered logs
    const filteredLogs = useMemo(() => {
        return logs.filter((l) => {
            if (moduleFilter !== 'all' && l.module !== moduleFilter) return false;
            if (actionFilter !== 'all' && l.action !== actionFilter) return false;

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchUser = l.user_name?.toLowerCase().includes(q);
                const matchDesc = l.description?.toLowerCase().includes(q);
                const matchIp = l.ip_address?.toLowerCase().includes(q);
                const matchModule = l.module?.toLowerCase().includes(q);
                const matchAction = l.action?.toLowerCase().includes(q);

                return matchUser || matchDesc || matchIp || matchModule || matchAction;
            }

            return true;
        });
    }, [logs, searchQuery, moduleFilter, actionFilter]);

    // ---------- Pagination ----------
    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalItems,
        totalPages,
        paginatedItems: paginatedLogs,
    } = usePagination(filteredLogs, 15, [searchQuery, moduleFilter, actionFilter]);

    const actionBadgeClass = (action) => {
        switch (action) {
            case 'Création':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'Modification':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Suppression':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'Clôture':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'Annulation clôture':
                return 'bg-orange-50 text-orange-700 border-orange-200';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('audit_title')} />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Header & KPI Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="lux-card p-5">
                            <div className="text-3xl font-extrabold text-slate-900">{logs.length}</div>
                            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">{t('audit_events_recorded')}</div>
                        </div>
                        <div className="lux-card p-5">
                            <div className="text-3xl font-extrabold text-[#11508f]">{modules.length}</div>
                            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">{t('audit_modules_monitored')}</div>
                        </div>
                        <div className="lux-card p-5">
                            <div className="text-3xl font-extrabold text-[#57b24a]">{filteredLogs.length}</div>
                            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">{t('audit_results_displayed')}</div>
                        </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="lux-card p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{t('audit_title')}</h1>
                                <p className="text-xs font-medium text-slate-500 mt-0.5">{t('audit_subtitle')}</p>
                            </div>

                            <a
                                href={route('exports.audit-logs.csv')}
                                className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/10 whitespace-nowrap"
                            >
                                📥 {t('export_csv')}
                            </a>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                            <input
                                type="text"
                                placeholder={t('search_placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm w-full focus:ring-1 focus:ring-[#11508f] bg-slate-50/50"
                            />

                            <select
                                value={moduleFilter}
                                onChange={(e) => setModuleFilter(e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm w-full bg-white focus:ring-1 focus:ring-[#11508f]"
                            >
                                <option value="all">{t('all')} {t('modules')}</option>
                                {modules.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>

                            <select
                                value={actionFilter}
                                onChange={(e) => setActionFilter(e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm w-full bg-white focus:ring-1 focus:ring-[#11508f]"
                            >
                                <option value="all">{t('all')} {t('actions')}</option>
                                {actions.map((a) => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>
                        </div>

                        {/* Reset Filters Bar */}
                        {(searchQuery || moduleFilter !== 'all' || actionFilter !== 'all') && (
                            <div className="mb-4 text-xs text-slate-500 flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                <span>{t('pagination_showing', { from: 1, to: filteredLogs.length, total: logs.length })}</span>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setModuleFilter('all');
                                        setActionFilter('all');
                                    }}
                                    className="text-[#11508f] font-semibold hover:underline"
                                >
                                    {t('reset_filters')}
                                </button>
                            </div>
                        )}

                        {/* Logs Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b bg-slate-50 text-xs text-slate-600 font-semibold uppercase tracking-wider">
                                        <th className="py-3 px-3">{t('audit_timestamp')}</th>
                                        <th className="py-3 px-3">{t('audit_user')}</th>
                                        <th className="py-3 px-3">{t('audit_module')}</th>
                                        <th className="py-3 px-3">{t('audit_action')}</th>
                                        <th className="py-3 px-3">{t('audit_description')}</th>
                                        <th className="py-3 px-3 text-right">{t('audit_ip')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-slate-100">
                                    {paginatedLogs.map((log) => (
                                        <tr
                                            key={log.id}
                                            onClick={() => setSelectedLog(log)}
                                            className="hover:bg-slate-50 cursor-pointer transition"
                                        >
                                            <td className="py-3 px-3 whitespace-nowrap font-mono text-xs text-slate-500">
                                                {log.created_at}
                                            </td>
                                            <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-900">
                                                {log.user_name}
                                            </td>
                                            <td className="py-3 px-3 whitespace-nowrap">
                                                <span className="inline-flex items-center text-xs px-2.5 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700">
                                                    {log.module}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 whitespace-nowrap">
                                                <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-md border font-medium ${actionBadgeClass(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-slate-700 max-w-md truncate">
                                                {log.description}
                                            </td>
                                            <td className="py-3 px-3 text-right font-mono text-xs text-slate-400 whitespace-nowrap">
                                                {log.ip_address || '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredLogs.length === 0 && (
                                <p className="text-center text-slate-500 text-sm py-12">
                                    {t('pagination_no_data')}
                                </p>
                            )}
                        </div>

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={setPageSize}
                        />
                    </div>
                </div>
            </div>

            {/* Modal Detail view */}
            <Modal show={selectedLog !== null} onClose={() => setSelectedLog(null)} maxWidth="md">
                <div className="p-6 space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 border-b pb-2">
                        {t('audit_details')} #{selectedLog?.id}
                    </h2>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="font-semibold text-slate-600">{t('audit_timestamp')} :</span>
                            <span className="font-mono text-slate-900">{selectedLog?.created_at}</span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="font-semibold text-slate-600">{t('audit_user')} :</span>
                            <span className="font-medium text-slate-900">{selectedLog?.user_name}</span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="font-semibold text-slate-600">{t('audit_module')} :</span>
                            <span className="font-medium text-slate-900">{selectedLog?.module}</span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="font-semibold text-slate-600">{t('audit_action')} :</span>
                            <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded border font-medium ${actionBadgeClass(selectedLog?.action)}`}>
                                {selectedLog?.action}
                            </span>
                        </div>

                        <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="font-semibold text-slate-600">{t('audit_ip')} :</span>
                            <span className="font-mono text-slate-900">{selectedLog?.ip_address || '—'}</span>
                        </div>

                        <div className="pt-2">
                            <span className="font-semibold text-slate-600 block mb-1">{t('audit_full_description')} :</span>
                            <div className="bg-slate-50 p-3 rounded-lg text-slate-800 text-xs leading-relaxed border border-slate-200">
                                {selectedLog?.description}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <button
                            onClick={() => setSelectedLog(null)}
                            className="bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition"
                        >
                            {t('close')}
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
