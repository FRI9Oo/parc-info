import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import usePagination from '@/Hooks/usePagination';
import { useLanguage } from '@/Context/LanguageContext';
import { Head, useForm, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Index({ factures = [], achats = [] }) {
    const { auth = {} } = usePage().props;
    const { permissions = [], isAdmin = false } = auth;
    const canCreate = isAdmin || permissions.includes('gerer_factures') || permissions.includes('creer_facture');
    const canEdit = isAdmin || permissions.includes('gerer_factures') || permissions.includes('modifier_facture');
    const canDelete = isAdmin || permissions.includes('gerer_factures') || permissions.includes('supprimer_facture');

    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [achatFilter, setAchatFilter] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            return params.get('achat_id') || 'all';
        }
        return 'all';
    });
    const [editingFacture, setEditingFacture] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const createForm = useForm({
        numero_facture: '',
        date_facture: new Date().toISOString().split('T')[0],
        montant_ht: '',
        taux_tva: 20,
        achat_id: achatFilter !== 'all' ? achatFilter : '',
    });

    const editForm = useForm({
        numero_facture: '',
        date_facture: '',
        montant_ht: '',
        taux_tva: 20,
        achat_id: '',
    });

    const filteredFactures = useMemo(() => {
        return factures.filter((f) => {
            if (achatFilter !== 'all' && String(f.achat_id) !== String(achatFilter)) {
                return false;
            }
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchNum = f.numero_facture?.toLowerCase().includes(q);
                const matchAchat = f.achat?.numero_achat?.toLowerCase().includes(q);
                const matchObj = f.achat?.objet_achat?.toLowerCase().includes(q);
                const matchFourn = f.achat?.fournisseur?.nom_fournisseur?.toLowerCase().includes(q);
                return matchNum || matchAchat || matchObj || matchFourn;
            }
            return true;
        });
    }, [factures, searchQuery, achatFilter]);

    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalItems,
        totalPages,
        paginatedItems,
    } = usePagination(filteredFactures, 10, [searchQuery, achatFilter]);

    // KPI aggregates
    const kpiTotalHt = useMemo(() => {
        return filteredFactures.reduce((acc, f) => acc + (parseFloat(f.montant_ht) || 0), 0);
    }, [filteredFactures]);
    const kpiTotalTtc = useMemo(() => {
        return filteredFactures.reduce((acc, f) => acc + (parseFloat(f.montant_ttc) || 0), 0);
    }, [filteredFactures]);

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('factures.store'), {
            onSuccess: () => {
                createForm.reset();
                setIsCreateModalOpen(false);
            },
        });
    };

    const openEditModal = (f) => {
        setEditingFacture(f);
        editForm.setData({
            numero_facture: f.numero_facture || '',
            date_facture: f.date_facture ? f.date_facture.split('T')[0] : '',
            montant_ht: f.montant_ht || '',
            taux_tva: f.taux_tva || 20,
            achat_id: f.achat_id || '',
        });
        editForm.clearErrors();
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        editForm.put(route('factures.update', editingFacture.id), {
            onSuccess: () => setEditingFacture(null),
        });
    };

    const handleDelete = (id, num) => {
        if (confirm(`Supprimer la facture "${num}" ?`)) {
            router.delete(route('factures.destroy', id));
        }
    };

    const selectedAchatObject = useMemo(() => {
        if (achatFilter === 'all') return null;
        return achats.find((a) => String(a.id) === String(achatFilter));
    }, [achats, achatFilter]);

    return (
        <AuthenticatedLayout>
            <Head title={t('factures')} />
            <div className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                                <span>🧾</span>
                                <span>{t('factures_title')}</span>
                            </h1>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                                {t('factures_subtitle')}
                            </p>
                        </div>

                        {canCreate && (
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(true);
                                    createForm.reset();
                                    if (achatFilter !== 'all') {
                                        createForm.setData('achat_id', achatFilter);
                                    }
                                    createForm.clearErrors();
                                }}
                                className="btn-zellij px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md shadow-emerald-600/20"
                            >
                                <span>➕</span>
                                <span>{t('factures_add')}</span>
                            </button>
                        )}
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="lux-card p-5 border border-slate-200/80 dark:border-slate-800">
                            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {filteredFactures.length} {achatFilter !== 'all' ? <span className="text-xs font-normal text-slate-400">/ {factures.length}</span> : null}
                            </div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                                {t('factures')} {achatFilter !== 'all' ? 'filtrées' : 'enregistrées'}
                            </div>
                        </div>

                        <div className="lux-card p-5 border border-slate-200/80 dark:border-slate-800">
                            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                                {kpiTotalHt.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
                            </div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                                Total {t('facture_montant_ht')}
                            </div>
                        </div>

                        <div className="lux-card p-5 border border-slate-200/80 dark:border-slate-800">
                            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                                {kpiTotalTtc.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
                            </div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                                Total {t('facture_montant_ttc')}
                            </div>
                        </div>
                    </div>

                    {/* Active Achat Filter Banner */}
                    {selectedAchatObject && (
                        <div className="bg-indigo-50/80 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">🛒</span>
                                <div>
                                    <span className="font-extrabold text-indigo-900 dark:text-indigo-200">
                                        Filtré par Achat / Marché : {selectedAchatObject.numero_achat} — {selectedAchatObject.objet_achat}
                                    </span>
                                    <p className="text-[11px] text-indigo-700 dark:text-indigo-400 mt-0.5">
                                        Fournisseur : {selectedAchatObject.fournisseur?.nom_fournisseur || '—'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setAchatFilter('all')}
                                className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline self-start sm:self-center"
                            >
                                ✕ {t('all_achats')}
                            </button>
                        </div>
                    )}

                    {/* Invoices Table Card */}
                    <div className="lux-card p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
                        
                        {/* Filters & Search Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input
                                type="text"
                                placeholder={t('search_placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50/50 dark:bg-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                            />

                            <select
                                value={achatFilter}
                                onChange={(e) => setAchatFilter(e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50/50 dark:bg-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="all">-- {t('filter_achat')} ({t('all')}) --</option>
                                {achats.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        🛒 {a.numero_achat} - {a.objet_achat}
                                    </option>
                                ))}
                            </select>

                            {(searchQuery || achatFilter !== 'all') && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setAchatFilter('all');
                                    }}
                                    className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline self-center text-left sm:text-right"
                                >
                                    {t('reset_filters')}
                                </button>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                        <th className="py-3 px-3.5">{t('facture_numero')}</th>
                                        <th className="py-3 px-3">{t('achats')} / Marché</th>
                                        <th className="py-3 px-3">{t('fournisseurs')}</th>
                                        <th className="py-3 px-3">{t('facture_date')}</th>
                                        <th className="py-3 px-3 text-right">{t('facture_montant_ht')}</th>
                                        <th className="py-3 px-3 text-center">{t('facture_tva')}</th>
                                        <th className="py-3 px-3 text-right">{t('facture_montant_ttc')}</th>
                                        <th className="py-3 px-3.5 text-right">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-800">
                                    {paginatedItems.map((f) => (
                                        <tr key={f.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                                            <td className="py-3.5 px-3.5 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                                🧾 {f.numero_facture}
                                            </td>
                                            <td className="py-3.5 px-3 whitespace-nowrap">
                                                {f.achat ? (
                                                    <Link
                                                        href={route('achats.show', f.achat.id)}
                                                        className="font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                                    >
                                                        <span>🛒</span>
                                                        <span>{f.achat.numero_achat}</span>
                                                    </Link>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td className="py-3.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                                                {f.achat?.fournisseur?.nom_fournisseur || '—'}
                                            </td>
                                            <td className="py-3.5 px-3 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                {f.date_facture}
                                            </td>
                                            <td className="py-3.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                {(parseFloat(f.montant_ht) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
                                            </td>
                                            <td className="py-3.5 px-3 text-center font-bold text-slate-500">
                                                {f.taux_tva}%
                                            </td>
                                            <td className="py-3.5 px-3 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                                                {(parseFloat(f.montant_ttc) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
                                            </td>
                                            <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    {canEdit && (
                                                        <button
                                                            onClick={() => openEditModal(f)}
                                                            className="px-2.5 py-1 text-slate-600 hover:text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-xs font-bold"
                                                        >
                                                            ✏️ {t('edit')}
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => handleDelete(f.id, f.numero_facture)}
                                                            className="px-2.5 py-1 text-rose-600 hover:text-rose-800 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition text-xs font-bold"
                                                        >
                                                            🗑️ {t('delete')}
                                                        </button>
                                                    )}
                                                    {!canEdit && !canDelete && (
                                                        <span className="text-slate-400 text-xs">—</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {paginatedItems.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="py-8 text-center text-xs text-slate-400">
                                                {t('pagination_no_data')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

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

            {/* Create Modal */}
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} maxWidth="sm">
                <form onSubmit={handleCreate} className="p-6 space-y-4">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b pb-2">
                        {t('factures_add')}
                    </h2>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('achats')} / Marché *
                        </label>
                        <select
                            value={createForm.data.achat_id}
                            onChange={(e) => {
                                createForm.setData('achat_id', e.target.value);
                                createForm.clearErrors('achat_id');
                            }}
                            className={`w-full text-xs rounded-xl border px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white ${
                                createForm.errors.achat_id ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 dark:border-slate-700'
                            }`}
                            required
                        >
                            <option value="">-- {t('achats')} --</option>
                            {achats.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.numero_achat} - {a.objet_achat} ({a.fournisseur?.nom_fournisseur})
                                </option>
                            ))}
                        </select>
                        {createForm.errors.achat_id && (
                            <p className="text-[11px] text-rose-600 mt-1 font-semibold">⚠️ {createForm.errors.achat_id}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('facture_numero')} *
                        </label>
                        <input
                            type="text"
                            value={createForm.data.numero_facture}
                            onChange={(e) => {
                                createForm.setData('numero_facture', e.target.value);
                                createForm.clearErrors('numero_facture');
                            }}
                            placeholder="Ex: FACT-2026-088"
                            className={`w-full text-xs rounded-xl border px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white ${
                                createForm.errors.numero_facture ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 dark:border-slate-700'
                            }`}
                            required
                        />
                        {createForm.errors.numero_facture && (
                            <p className="text-[11px] text-rose-600 mt-1 font-semibold">⚠️ {createForm.errors.numero_facture}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('facture_date')} *
                        </label>
                        <input
                            type="date"
                            value={createForm.data.date_facture}
                            onChange={(e) => createForm.setData('date_facture', e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('facture_montant_ht')} *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={createForm.data.montant_ht}
                                onChange={(e) => createForm.setData('montant_ht', e.target.value)}
                                placeholder="0.00"
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white font-mono"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('facture_tva')}
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={createForm.data.taux_tva}
                                onChange={(e) => createForm.setData('taux_tva', parseInt(e.target.value) || 0)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white font-mono"
                            />
                        </div>
                    </div>

                    {createForm.data.montant_ht && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs">
                            <span className="text-emerald-700 dark:text-emerald-300 font-bold block">{t('facture_montant_ttc')} estimé :</span>
                            <span className="text-base font-extrabold text-emerald-800 dark:text-emerald-200 font-mono">
                                {(parseFloat(createForm.data.montant_ht) * (1 + (parseInt(createForm.data.taux_tva || 0) / 100))).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH
                            </span>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={createForm.processing}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition shadow-md shadow-emerald-600/20"
                        >
                            {createForm.processing ? t('loading') : t('create')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={editingFacture !== null} onClose={() => setEditingFacture(null)} maxWidth="sm">
                <form onSubmit={handleUpdate} className="p-6 space-y-4">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b pb-2">
                        {t('edit')} {t('factures')}
                    </h2>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('achats')} / Marché *
                        </label>
                        <select
                            value={editForm.data.achat_id}
                            onChange={(e) => editForm.setData('achat_id', e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            required
                        >
                            {achats.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.numero_achat} - {a.objet_achat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('facture_numero')} *
                        </label>
                        <input
                            type="text"
                            value={editForm.data.numero_facture}
                            onChange={(e) => editForm.setData('numero_facture', e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('facture_date')} *
                        </label>
                        <input
                            type="date"
                            value={editForm.data.date_facture}
                            onChange={(e) => editForm.setData('date_facture', e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('facture_montant_ht')} *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editForm.data.montant_ht}
                                onChange={(e) => editForm.setData('montant_ht', e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white font-mono"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('facture_tva')}
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={editForm.data.taux_tva}
                                onChange={(e) => editForm.setData('taux_tva', parseInt(e.target.value) || 0)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white font-mono"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setEditingFacture(null)}
                            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={editForm.processing}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl"
                        >
                            {editForm.processing ? t('loading') : t('save')}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
