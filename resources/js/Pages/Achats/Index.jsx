import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import usePagination from '@/Hooks/usePagination';
import { useLanguage } from '@/Context/LanguageContext';
import { Head, useForm, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Index({ achats = [], fournisseurs = [] }) {
    const { auth = {} } = usePage().props;
    const { permissions = [], isAdmin = false } = auth;
    const canCreate = isAdmin || permissions.includes('gerer_achats') || permissions.includes('creer_achat');
    const canEdit = isAdmin || permissions.includes('gerer_achats') || permissions.includes('modifier_achat');
    const canDelete = isAdmin || permissions.includes('gerer_achats') || permissions.includes('supprimer_achat');

    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingAchat, setEditingAchat] = useState(null);

    const createForm = useForm({
        numero_achat: '',
        objet_achat: '',
        type_achat: 'Marché',
        date_achat: new Date().toISOString().split('T')[0],
        statut: 'En cours',
        fournisseur_id: '',
    });

    const editForm = useForm({
        numero_achat: '',
        objet_achat: '',
        type_achat: 'Marché',
        date_achat: '',
        statut: 'En cours',
        fournisseur_id: '',
    });

    const filteredAchats = useMemo(() => {
        return achats.filter((a) => {
            if (statusFilter !== 'all' && a.statut !== statusFilter) return false;
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchNum = a.numero_achat?.toLowerCase().includes(q);
                const matchObj = a.objet_achat?.toLowerCase().includes(q);
                const matchFourn = a.fournisseur?.nom_fournisseur?.toLowerCase().includes(q);
                const matchType = a.type_achat?.toLowerCase().includes(q);
                return matchNum || matchObj || matchFourn || matchType;
            }
            return true;
        });
    }, [achats, searchQuery, statusFilter]);

    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalItems,
        totalPages,
        paginatedItems,
    } = usePagination(filteredAchats, 10, [searchQuery, statusFilter]);

    // KPI aggregates
    const kpiTotalAchats = achats.length;
    const kpiTotalBudgetHt = useMemo(() => {
        return achats.reduce((acc, a) => acc + (parseFloat(a.total_ht) || 0), 0);
    }, [achats]);
    const kpiTotalFactureTtc = useMemo(() => {
        return achats.reduce((acc, a) => acc + (parseFloat(a.total_factures_ttc) || 0), 0);
    }, [achats]);

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('achats.store'), {
            onSuccess: () => {
                createForm.reset();
                setIsCreateModalOpen(false);
            },
        });
    };

    const openEditModal = (a) => {
        setEditingAchat(a);
        editForm.setData({
            numero_achat: a.numero_achat || '',
            objet_achat: a.objet_achat || '',
            type_achat: a.type_achat || 'Marché',
            date_achat: a.date_achat ? a.date_achat.split('T')[0] : '',
            statut: a.statut || 'En cours',
            fournisseur_id: a.fournisseur_id || '',
        });
        editForm.clearErrors();
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        editForm.put(route('achats.update', editingAchat.id), {
            onSuccess: () => setEditingAchat(null),
        });
    };

    const handleDelete = (id, num) => {
        if (confirm(`Supprimer l'achat/marché "${num}" et tous ses éléments associés ?`)) {
            router.delete(route('achats.destroy', id));
        }
    };

    const statusBadge = (statut) => {
        switch (statut) {
            case 'Validé':
            case 'Soldé':
                return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
            case 'Livré partiellement':
                return 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            case 'Annulé':
                return 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800';
            default:
                return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('achats')} />
            <div className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                                <span>🛒</span>
                                <span>{t('achats_title')}</span>
                            </h1>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                                {t('achats_subtitle')}
                            </p>
                        </div>

                        {canCreate && (
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(true);
                                    createForm.reset();
                                    createForm.clearErrors();
                                }}
                                className="btn-zellij px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md shadow-indigo-600/20"
                            >
                                <span>➕</span>
                                <span>{t('achats_add')}</span>
                            </button>
                        )}
                    </div>

                    {/* KPI Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="lux-card p-5 border border-slate-200/80 dark:border-slate-800">
                            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {kpiTotalAchats}
                            </div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                                {t('achats')}
                            </div>
                        </div>

                        <div className="lux-card p-5 border border-slate-200/80 dark:border-slate-800">
                            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                                {kpiTotalBudgetHt.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
                            </div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                                {t('achat_total_ht')}
                            </div>
                        </div>

                        <div className="lux-card p-5 border border-slate-200/80 dark:border-slate-800">
                            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                                {kpiTotalFactureTtc.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
                            </div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                                {t('achat_total_ttc')}
                            </div>
                        </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="lux-card p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input
                                type="text"
                                placeholder={t('search_placeholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50/50 dark:bg-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                            />

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50/50 dark:bg-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                            >
                                <option value="all">{t('all')} ({t('status')})</option>
                                <option value="En cours">En cours</option>
                                <option value="Validé">Validé</option>
                                <option value="Livré partiellement">Livré partiellement</option>
                                <option value="Soldé">Soldé</option>
                                <option value="Annulé">Annulé</option>
                            </select>

                            {(searchQuery || statusFilter !== 'all') && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setStatusFilter('all');
                                    }}
                                    className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline self-center"
                                >
                                    {t('reset_filters')}
                                </button>
                            )}
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                                        <th className="py-3 px-3.5">{t('achat_numero')}</th>
                                        <th className="py-3 px-3">{t('achat_objet')}</th>
                                        <th className="py-3 px-3">{t('fournisseurs')}</th>
                                        <th className="py-3 px-3">{t('achat_type')}</th>
                                        <th className="py-3 px-3">{t('date')}</th>
                                        <th className="py-3 px-3">{t('achat_total_ht')}</th>
                                        <th className="py-3 px-3">{t('status')}</th>
                                        <th className="py-3 px-3.5 text-right">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-800">
                                    {paginatedItems.map((a) => (
                                        <tr key={a.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                                            <td className="py-3.5 px-3.5 font-mono font-extrabold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                                <Link href={route('achats.show', a.id)} className="hover:underline flex items-center gap-1.5">
                                                    <span>🛒</span>
                                                    <span>{a.numero_achat}</span>
                                                </Link>
                                            </td>
                                            <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                                                {a.objet_achat}
                                                <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                                                    {a.total_lignes || 0} {t('achat_lignes_count')} • Livré : {a.total_livree || 0}/{a.total_quantite || 0} • Affecté : <span className={`font-bold ${a.total_affectee >= a.total_quantite && a.total_quantite > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{a.total_affectee || 0}/{a.total_quantite || 0}</span>
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                                                {a.fournisseur?.nom_fournisseur || '—'}
                                            </td>
                                            <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                    {a.type_achat}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-3 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                {a.date_achat}
                                            </td>
                                            <td className="py-3.5 px-3 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                                {(parseFloat(a.total_ht) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH
                                            </td>
                                            <td className="py-3.5 px-3 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${statusBadge(a.statut)}`}>
                                                    {a.statut}
                                                </span>
                                                {a.statut !== 'Validé' && a.can_be_valide && (
                                                    <span className="block text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                                                        ✓ Prêt pour validation
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={route('achats.show', a.id)}
                                                        className="px-2.5 py-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg text-xs font-bold transition"
                                                    >
                                                        👁️ {t('details')}
                                                    </Link>
                                                    {canEdit && (
                                                        <button
                                                            onClick={() => openEditModal(a)}
                                                            className="px-2.5 py-1 text-slate-600 hover:text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-bold transition"
                                                        >
                                                            ✏️ {t('edit')}
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => handleDelete(a.id, a.numero_achat)}
                                                            className="px-2.5 py-1 text-rose-600 hover:text-rose-800 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs font-bold transition"
                                                        >
                                                            🗑️ {t('delete')}
                                                        </button>
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
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} maxWidth="md">
                <form onSubmit={handleCreate} className="p-6 space-y-4">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b pb-2">
                        {t('achats_add')}
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('achat_numero')} *
                            </label>
                            <input
                                type="text"
                                value={createForm.data.numero_achat}
                                onChange={(e) => {
                                    createForm.setData('numero_achat', e.target.value);
                                    createForm.clearErrors('numero_achat');
                                }}
                                placeholder="Ex: M-2026/04"
                                className={`w-full text-xs rounded-xl border px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white transition ${
                                    createForm.errors.numero_achat
                                        ? 'border-rose-500 ring-1 ring-rose-400 bg-rose-50/30'
                                        : 'border-slate-200 dark:border-slate-700'
                                }`}
                            />
                            {createForm.errors.numero_achat && (
                                <p className="text-[11px] text-rose-600 mt-1 font-semibold">
                                    ⚠️ {createForm.errors.numero_achat}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('achat_type')} *
                            </label>
                            <select
                                value={createForm.data.type_achat}
                                onChange={(e) => createForm.setData('type_achat', e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            >
                                <option value="Marché">Marché</option>
                                <option value="Bon de commande">Bon de commande</option>
                                <option value="Consultation">Consultation</option>
                                <option value="Contrat cadre">Contrat cadre</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('achat_objet')} *
                        </label>
                        <input
                            type="text"
                            value={createForm.data.objet_achat}
                            onChange={(e) => {
                                createForm.setData('objet_achat', e.target.value);
                                createForm.clearErrors('objet_achat');
                            }}
                            placeholder="Ex: Acquisition d'ordinateurs portables et accessoires"
                            className={`w-full text-xs rounded-xl border px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white transition ${
                                createForm.errors.objet_achat
                                    ? 'border-rose-500 ring-1 ring-rose-400 bg-rose-50/30'
                                    : 'border-slate-200 dark:border-slate-700'
                            }`}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('fournisseurs')} *
                            </label>
                            <select
                                value={createForm.data.fournisseur_id}
                                onChange={(e) => {
                                    createForm.setData('fournisseur_id', e.target.value);
                                    createForm.clearErrors('fournisseur_id');
                                }}
                                className={`w-full text-xs rounded-xl border px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white ${
                                    createForm.errors.fournisseur_id
                                        ? 'border-rose-500 ring-1 ring-rose-400 bg-rose-50/30'
                                        : 'border-slate-200 dark:border-slate-700'
                                }`}
                            >
                                <option value="">-- {t('fournisseurs')} --</option>
                                {fournisseurs.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.nom_fournisseur}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('achat_date')} *
                            </label>
                            <input
                                type="date"
                                value={createForm.data.date_achat}
                                onChange={(e) => createForm.setData('date_achat', e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('status')} *
                        </label>
                        <select
                            value={createForm.data.statut}
                            onChange={(e) => createForm.setData('statut', e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                        >
                            <option value="En cours">En cours</option>
                            <option value="Validé">Validé</option>
                            <option value="Livré partiellement">Livré partiellement</option>
                            <option value="Soldé">Soldé</option>
                            <option value="Annulé">Annulé</option>
                        </select>
                    </div>

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
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition shadow-md shadow-indigo-600/20"
                        >
                            {createForm.processing ? t('loading') : t('create')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal show={editingAchat !== null} onClose={() => setEditingAchat(null)} maxWidth="md">
                <form onSubmit={handleUpdate} className="p-6 space-y-4">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b pb-2">
                        {t('achats_edit')}
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('achat_numero')} *
                            </label>
                            <input
                                type="text"
                                value={editForm.data.numero_achat}
                                onChange={(e) => editForm.setData('numero_achat', e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('achat_type')} *
                            </label>
                            <select
                                value={editForm.data.type_achat}
                                onChange={(e) => editForm.setData('type_achat', e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            >
                                <option value="Marché">Marché</option>
                                <option value="Bon de commande">Bon de commande</option>
                                <option value="Consultation">Consultation</option>
                                <option value="Contrat cadre">Contrat cadre</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('achat_objet')} *
                        </label>
                        <input
                            type="text"
                            value={editForm.data.objet_achat}
                            onChange={(e) => editForm.setData('objet_achat', e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('fournisseurs')} *
                            </label>
                            <select
                                value={editForm.data.fournisseur_id}
                                onChange={(e) => editForm.setData('fournisseur_id', e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            >
                                {fournisseurs.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.nom_fournisseur}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('achat_date')} *
                            </label>
                            <input
                                type="date"
                                value={editForm.data.date_achat}
                                onChange={(e) => editForm.setData('date_achat', e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('status')} *
                        </label>
                        <select
                            value={editForm.data.statut}
                            onChange={(e) => {
                                editForm.setData('statut', e.target.value);
                                editForm.clearErrors('statut');
                            }}
                            className={`w-full text-xs rounded-xl border px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white transition ${
                                editForm.errors.statut
                                    ? 'border-rose-500 ring-1 ring-rose-400 bg-rose-50/30'
                                    : 'border-slate-200 dark:border-slate-700'
                            }`}
                        >
                            <option value="En cours">En cours</option>
                            <option value="Validé">Validé</option>
                            <option value="Livré partiellement">Livré partiellement</option>
                            <option value="Soldé">Soldé</option>
                            <option value="Annulé">Annulé</option>
                        </select>
                        {editForm.errors.statut && (
                            <p className="text-[11px] text-rose-600 mt-1.5 font-semibold">
                                ⚠️ {editForm.errors.statut}
                            </p>
                        )}
                        {editForm.data.statut === 'Validé' && editingAchat && !editingAchat.can_be_valide && !editForm.errors.statut && (
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1.5 font-medium bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-900">
                                ⚠️ <strong>Condition de validation</strong> : Tous les matériels doivent être réceptionnés et affectés aux employés ({editingAchat.total_affectee || 0} / {editingAchat.total_quantite || 0} affectés).
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setEditingAchat(null)}
                            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={editForm.processing}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl"
                        >
                            {editForm.processing ? t('loading') : t('save')}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
