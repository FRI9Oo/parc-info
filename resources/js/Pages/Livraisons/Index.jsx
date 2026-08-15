import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import usePagination from '@/Hooks/usePagination';
import { useLanguage } from '@/Context/LanguageContext';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Index({ livraisons = [], bordereaux = [] }) {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const createForm = useForm({
        reference_livraison: '',
        date_livraison: new Date().toISOString().split('T')[0],
        quantite_livraison: 1,
        bordereau_materiel_id: '',
        auto_generate_materiels: true,
        prefix_inventaire: 'INV',
    });

    const filteredLivraisons = useMemo(() => {
        if (!searchQuery.trim()) return livraisons;
        const q = searchQuery.toLowerCase().trim();
        return livraisons.filter(
            (l) =>
                l.reference_livraison?.toLowerCase().includes(q) ||
                l.bordereau?.nom_materiel?.toLowerCase().includes(q) ||
                l.bordereau?.achat?.numero_achat?.toLowerCase().includes(q) ||
                l.bordereau?.achat?.fournisseur?.nom_fournisseur?.toLowerCase().includes(q)
        );
    }, [livraisons, searchQuery]);

    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalItems,
        totalPages,
        paginatedItems,
    } = usePagination(filteredLivraisons, 10, [searchQuery]);

    // KPI Total quantity received
    const totalQteRecue = useMemo(() => {
        return livraisons.reduce((acc, l) => acc + (parseInt(l.quantite_livraison) || 0), 0);
    }, [livraisons]);

    const selectedBordereau = useMemo(() => {
        return bordereaux.find((b) => String(b.id) === String(createForm.data.bordereau_materiel_id));
    }, [bordereaux, createForm.data.bordereau_materiel_id]);

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('livraisons.store'), {
            onSuccess: () => {
                createForm.reset();
                setIsCreateModalOpen(false);
            },
        });
    };

    const handleDelete = (id, ref) => {
        if (confirm(`Supprimer le bon de livraison "${ref}" ?`)) {
            router.delete(route('livraisons.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('livraisons')} />
            <div className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                                <span>📦</span>
                                <span>{t('livraisons_title')}</span>
                            </h1>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                                {t('livraisons_subtitle')}
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                setIsCreateModalOpen(true);
                                createForm.reset();
                                createForm.clearErrors();
                            }}
                            className="btn-zellij px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md shadow-indigo-600/20"
                        >
                            <span>➕</span>
                            <span>{t('livraisons_add')}</span>
                        </button>
                    </div>

                    {/* KPI Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="lux-card p-5 border border-slate-200/80 dark:border-slate-800">
                            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {livraisons.length}
                            </div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                                Bons de Livraison (BL)
                            </div>
                        </div>

                        <div className="lux-card p-5 border border-slate-200/80 dark:border-slate-800">
                            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                                {totalQteRecue}
                            </div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                                Unités Matériels Réceptionnées
                            </div>
                        </div>

                        <div className="lux-card p-5 border border-slate-200/80 dark:border-slate-800">
                            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                {bordereaux.length}
                            </div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                                Lignes de Commandes Actives
                            </div>
                        </div>
                    </div>

                    {/* Table Card */}
                    <div className="lux-card p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                {t('livraisons')} ({filteredLivraisons.length})
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
                                        <th className="py-3 px-3.5">{t('livraison_ref')}</th>
                                        <th className="py-3 px-3">{t('bordereau_designation')}</th>
                                        <th className="py-3 px-3">{t('achats')} / Marché</th>
                                        <th className="py-3 px-3">{t('fournisseurs')}</th>
                                        <th className="py-3 px-3 text-center">{t('livraison_date')}</th>
                                        <th className="py-3 px-3 text-center">{t('livraison_qte')}</th>
                                        <th className="py-3 px-3 text-center">Immobilisations</th>
                                        <th className="py-3 px-3.5 text-right">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-800">
                                    {paginatedItems.map((l) => (
                                        <tr key={l.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                                            <td className="py-3.5 px-3.5 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                                📦 {l.reference_livraison}
                                            </td>
                                            <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white">
                                                {l.bordereau?.nom_materiel || '—'}
                                                {l.bordereau?.modele && (
                                                    <span className="block text-[10px] text-slate-400 font-normal">
                                                        {l.bordereau.modele.marque?.nom_marque} {l.bordereau.modele.nom_modele}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-3 whitespace-nowrap">
                                                {l.bordereau?.achat ? (
                                                    <Link
                                                        href={route('achats.show', l.bordereau.achat.id)}
                                                        className="font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                                    >
                                                        🛒 {l.bordereau.achat.numero_achat}
                                                    </Link>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td className="py-3.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                                                {l.bordereau?.achat?.fournisseur?.nom_fournisseur || '—'}
                                            </td>
                                            <td className="py-3.5 px-3 text-center font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                {l.date_livraison}
                                            </td>
                                            <td className="py-3.5 px-3 text-center font-bold text-indigo-600 dark:text-indigo-400">
                                                +{l.quantite_livraison}
                                            </td>
                                            <td className="py-3.5 px-3 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                    💻 {l.materiels?.length || 0} générés
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => handleDelete(l.id, l.reference_livraison)}
                                                    className="p-1.5 text-rose-600 hover:text-rose-800 dark:text-rose-400 hover:bg-rose-50 rounded-lg transition text-xs font-bold"
                                                >
                                                    🗑️ {t('delete')}
                                                </button>
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
                        {t('livraisons_add')}
                    </h2>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Ligne de Commande / Bordereau Matériel *
                        </label>
                        <select
                            value={createForm.data.bordereau_materiel_id}
                            onChange={(e) => createForm.setData('bordereau_materiel_id', e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            required
                        >
                            <option value="">-- Sélectionner la ligne de commande --</option>
                            {bordereaux.map((b) => {
                                const deliveredQty = b.livraisons?.reduce((sum, l) => sum + l.quantite_livraison, 0) || 0;
                                const remaining = Math.max(0, b.quantite_materiel - deliveredQty);
                                return (
                                    <option key={b.id} value={b.id}>
                                        {b.achat?.numero_achat} | {b.nom_materiel} (Commandé: {b.quantite_materiel}, Reste: {remaining})
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('livraison_ref')} *
                            </label>
                            <input
                                type="text"
                                value={createForm.data.reference_livraison}
                                onChange={(e) => createForm.setData('reference_livraison', e.target.value)}
                                placeholder="Ex: BL-2026-041"
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('livraison_date')} *
                            </label>
                            <input
                                type="date"
                                value={createForm.data.date_livraison}
                                onChange={(e) => createForm.setData('date_livraison', e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('livraison_qte')} *
                            {selectedBordereau && (
                                <span className="text-[11px] font-normal text-indigo-600 dark:text-indigo-400 ms-2">
                                    (Max disponible : {Math.max(0, selectedBordereau.quantite_materiel - (selectedBordereau.livraisons?.reduce((s, l) => s + l.quantite_livraison, 0) || 0))})
                                </span>
                            )}
                        </label>
                        <input
                            type="number"
                            min="1"
                            max={selectedBordereau ? Math.max(1, selectedBordereau.quantite_materiel - (selectedBordereau.livraisons?.reduce((s, l) => s + l.quantite_livraison, 0) || 0)) : undefined}
                            value={createForm.data.quantite_livraison}
                            onChange={(e) => {
                                createForm.setData('quantite_livraison', parseInt(e.target.value) || 1);
                                createForm.clearErrors('quantite_livraison');
                            }}
                            className={`w-full text-xs rounded-xl border px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white transition ${
                                createForm.errors.quantite_livraison
                                    ? 'border-rose-500 ring-1 ring-rose-400 bg-rose-50/30'
                                    : 'border-slate-200 dark:border-slate-700'
                            }`}
                            required
                        />
                        {createForm.errors.quantite_livraison && (
                            <p className="text-[11px] text-rose-600 mt-1 font-semibold">
                                ⚠️ {createForm.errors.quantite_livraison}
                            </p>
                        )}
                    </div>

                    {/* Auto-generate Immobilisations Switch */}
                    <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-3">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={createForm.data.auto_generate_materiels}
                                onChange={(e) => createForm.setData('auto_generate_materiels', e.target.checked)}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                                {t('livraison_auto_generate')}
                            </span>
                        </label>

                        {createForm.data.auto_generate_materiels && (
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                    {t('livraison_prefix')}
                                </label>
                                <input
                                    type="text"
                                    value={createForm.data.prefix_inventaire}
                                    onChange={(e) => createForm.setData('prefix_inventaire', e.target.value)}
                                    placeholder="INV"
                                    className="w-32 text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 bg-white dark:bg-slate-900 dark:text-white uppercase font-mono"
                                />
                            </div>
                        )}
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
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow"
                        >
                            {createForm.processing ? t('loading') : t('confirm')}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
