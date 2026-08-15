import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import usePagination from '@/Hooks/usePagination';
import { useLanguage } from '@/Context/LanguageContext';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Index({ factures = [], achats = [] }) {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [editingFacture, setEditingFacture] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const createForm = useForm({
        numero_facture: '',
        date_facture: new Date().toISOString().split('T')[0],
        montant_ht: '',
        taux_tva: 20,
        achat_id: '',
    });

    const editForm = useForm({
        numero_facture: '',
        date_facture: '',
        montant_ht: '',
        taux_tva: 20,
        achat_id: '',
    });

    const filteredFactures = useMemo(() => {
        if (!searchQuery.trim()) return factures;
        const q = searchQuery.toLowerCase().trim();
        return factures.filter(
            (f) =>
                f.numero_facture?.toLowerCase().includes(q) ||
                f.achat?.numero_achat?.toLowerCase().includes(q) ||
                f.achat?.fournisseur?.nom_fournisseur?.toLowerCase().includes(q)
        );
    }, [factures, searchQuery]);

    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalItems,
        totalPages,
        paginatedItems,
    } = usePagination(filteredFactures, 10, [searchQuery]);

    // KPI aggregates
    const kpiTotalHt = useMemo(() => {
        return factures.reduce((acc, f) => acc + (parseFloat(f.montant_ht) || 0), 0);
    }, [factures]);
    const kpiTotalTtc = useMemo(() => {
        return factures.reduce((acc, f) => acc + (parseFloat(f.montant_ttc) || 0), 0);
    }, [factures]);

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

                        <button
                            onClick={() => {
                                setIsCreateModalOpen(true);
                                createForm.reset();
                                createForm.clearErrors();
                            }}
                            className="btn-zellij px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md shadow-emerald-600/20"
                        >
                            <span>➕</span>
                            <span>{t('factures_add')}</span>
                        </button>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="lux-card p-5 border border-slate-200/80 dark:border-slate-800">
                            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {factures.length}
                            </div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                                {t('factures')} enregistrées
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

                    {/* Invoices Table Card */}
                    <div className="lux-card p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                {t('factures')} ({filteredFactures.length})
                            </h2>
                            <div className="w-full sm:w-64">
                                <input
                                    type="text"
                                    placeholder={t('search_placeholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50/50 dark:bg-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
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
                                                        className="font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                                    >
                                                        🛒 {f.achat.numero_achat}
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
                                                    <button
                                                        onClick={() => openEditModal(f)}
                                                        className="px-2.5 py-1 text-slate-600 hover:text-slate-800 dark:text-slate-300 hover:bg-slate-100 rounded-lg transition text-xs font-bold"
                                                    >
                                                        ✏️ {t('edit')}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(f.id, f.numero_facture)}
                                                        className="px-2.5 py-1 text-rose-600 hover:text-rose-800 dark:text-rose-400 hover:bg-rose-50 rounded-lg transition text-xs font-bold"
                                                    >
                                                        🗑️ {t('delete')}
                                                    </button>
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
                            {t('achats')} *
                        </label>
                        <select
                            value={createForm.data.achat_id}
                            onChange={(e) => createForm.setData('achat_id', e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            required
                        >
                            <option value="">-- {t('achats')} --</option>
                            {achats.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.numero_achat} - {a.objet_achat} ({a.fournisseur?.nom_fournisseur})
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
                            value={createForm.data.numero_facture}
                            onChange={(e) => {
                                createForm.setData('numero_facture', e.target.value);
                                createForm.clearErrors('numero_facture');
                            }}
                            placeholder="Ex: FACT-2026-001"
                            className={`w-full text-xs rounded-xl border px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white transition ${
                                createForm.errors.numero_facture
                                    ? 'border-rose-500 ring-1 ring-rose-400 bg-rose-50/30'
                                    : 'border-slate-200 dark:border-slate-700'
                            }`}
                            required
                        />
                        {createForm.errors.numero_facture && (
                            <p className="text-[11px] text-rose-600 mt-1 font-semibold">
                                ⚠️ {createForm.errors.numero_facture}
                            </p>
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
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
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
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={createForm.processing}
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow"
                        >
                            {t('add')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={editingFacture !== null} onClose={() => setEditingFacture(null)} maxWidth="sm">
                <form onSubmit={handleUpdate} className="p-6 space-y-4">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b pb-2">
                        Modifier la Facture
                    </h2>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('achats')} *
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
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
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
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t">
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
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow"
                        >
                            {t('save')}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
