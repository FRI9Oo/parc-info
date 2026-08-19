import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import usePagination from '@/Hooks/usePagination';
import { useLanguage } from '@/Context/LanguageContext';
import { Head, useForm, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Index({ livraisons = [], bordereaux = [], achats = [] }) {
    const { auth = {} } = usePage().props;
    const { permissions = [], isAdmin = false } = auth;
    const canCreate = isAdmin || permissions.includes('gerer_livraisons') || permissions.includes('creer_livraison');
    const canDelete = isAdmin || permissions.includes('gerer_livraisons') || permissions.includes('supprimer_livraison');

    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [achatFilter, setAchatFilter] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            return params.get('achat_id') || 'all';
        }
        return 'all';
    });
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
        return livraisons.filter((l) => {
            if (achatFilter !== 'all' && String(l.bordereau?.achat_id) !== String(achatFilter)) {
                return false;
            }
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchRef = l.reference_livraison?.toLowerCase().includes(q);
                const matchMat = l.bordereau?.nom_materiel?.toLowerCase().includes(q);
                const matchAchat = l.bordereau?.achat?.numero_achat?.toLowerCase().includes(q);
                const matchObj = l.bordereau?.achat?.objet_achat?.toLowerCase().includes(q);
                const matchFourn = l.bordereau?.achat?.fournisseur?.nom_fournisseur?.toLowerCase().includes(q);
                return matchRef || matchMat || matchAchat || matchObj || matchFourn;
            }
            return true;
        });
    }, [livraisons, searchQuery, achatFilter]);

    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalItems,
        totalPages,
        paginatedItems,
    } = usePagination(filteredLivraisons, 10, [searchQuery, achatFilter]);

    // KPI Total quantity received
    const totalQteRecue = useMemo(() => {
        return filteredLivraisons.reduce((acc, l) => acc + (parseInt(l.quantite_livraison) || 0), 0);
    }, [filteredLivraisons]);

    const selectedBordereau = useMemo(() => {
        return bordereaux.find((b) => String(b.id) === String(createForm.data.bordereau_materiel_id));
    }, [bordereaux, createForm.data.bordereau_materiel_id]);

    const availableBordereaux = useMemo(() => {
        if (achatFilter === 'all') return bordereaux;
        return bordereaux.filter((b) => String(b.achat_id) === String(achatFilter));
    }, [bordereaux, achatFilter]);

    const selectedAchatObject = useMemo(() => {
        if (achatFilter === 'all') return null;
        return achats.find((a) => String(a.id) === String(achatFilter));
    }, [achats, achatFilter]);

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
                                <span>{t('livraisons_add')}</span>
                            </button>
                        )}
                    </div>

                    {/* KPI Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="lux-card p-5 border border-slate-200/80 dark:border-slate-800">
                            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {filteredLivraisons.length} {achatFilter !== 'all' ? <span className="text-xs font-normal text-slate-400">/ {livraisons.length}</span> : null}
                            </div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                                Bons de Livraison (BL) {achatFilter !== 'all' ? 'filtrés' : ''}
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
                                {availableBordereaux.length}
                            </div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                                Lignes de Commandes Concernées
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

                    {/* Table Card */}
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
                                                        className="font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                                    >
                                                        <span>🛒</span>
                                                        <span>{l.bordereau.achat.numero_achat}</span>
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
                                            <td className="py-3.5 px-3 text-center font-mono font-extrabold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900">
                                                    +{l.quantite_livraison}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                                {l.materiels && l.materiels.length > 0 ? (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                        ✨ {l.materiels.length} matériel(s)
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400">Manuel</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => handleDelete(l.id, l.reference_livraison)}
                                                            className="px-2.5 py-1 text-rose-600 hover:text-rose-800 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition text-xs font-bold"
                                                        >
                                                            🗑️ {t('delete')}
                                                        </button>
                                                    )}
                                                    {!canDelete && (
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
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} maxWidth="md">
                <form onSubmit={handleCreate} className="p-6 space-y-4">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b pb-2">
                        {t('livraisons_add')}
                    </h2>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Ligne de Commande & Matériel *
                        </label>
                        <select
                            value={createForm.data.bordereau_materiel_id}
                            onChange={(e) => {
                                createForm.setData('bordereau_materiel_id', e.target.value);
                                createForm.clearErrors('bordereau_materiel_id');
                            }}
                            className={`w-full text-xs rounded-xl border px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white ${
                                createForm.errors.bordereau_materiel_id ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 dark:border-slate-700'
                            }`}
                            required
                        >
                            <option value="">-- {t('select')} --</option>
                            {availableBordereaux.map((b) => {
                                const dejaLivre = b.livraisons?.reduce((sum, l) => sum + l.quantite_livraison, 0) || 0;
                                const reste = Math.max(0, b.quantite_materiel - dejaLivre);
                                return (
                                    <option key={b.id} value={b.id} disabled={reste <= 0}>
                                        [{b.achat?.numero_achat}] {b.nom_materiel} ({reste > 0 ? `Reste: ${reste}/${b.quantite_materiel}` : 'Soldé'})
                                    </option>
                                );
                            })}
                        </select>
                        {createForm.errors.bordereau_materiel_id && (
                            <p className="text-[11px] text-rose-600 mt-1 font-semibold">⚠️ {createForm.errors.bordereau_materiel_id}</p>
                        )}
                    </div>

                    {selectedBordereau && (
                        <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-xs space-y-1">
                            <div className="font-bold text-blue-950 dark:text-blue-200">
                                🛒 {selectedBordereau.achat?.numero_achat} — {selectedBordereau.achat?.objet_achat}
                            </div>
                            <div className="text-blue-800 dark:text-blue-300">
                                Fournisseur : <strong>{selectedBordereau.achat?.fournisseur?.nom_fournisseur || '—'}</strong>
                            </div>
                            <div className="flex gap-4 pt-1 font-mono text-[11px]">
                                <span>Commandé : <strong>{selectedBordereau.quantite_materiel}</strong></span>
                                <span>Déjà reçu : <strong>{selectedBordereau.livraisons?.reduce((sum, l) => sum + l.quantite_livraison, 0) || 0}</strong></span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                                    Reste : <strong>{Math.max(0, selectedBordereau.quantite_materiel - (selectedBordereau.livraisons?.reduce((sum, l) => sum + l.quantite_livraison, 0) || 0))}</strong>
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('livraison_ref')} *
                            </label>
                            <input
                                type="text"
                                value={createForm.data.reference_livraison}
                                onChange={(e) => {
                                    createForm.setData('reference_livraison', e.target.value);
                                    createForm.clearErrors('reference_livraison');
                                }}
                                placeholder="Ex: BL-2026-0044"
                                className={`w-full text-xs rounded-xl border px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white ${
                                    createForm.errors.reference_livraison ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 dark:border-slate-700'
                                }`}
                                required
                            />
                            {createForm.errors.reference_livraison && (
                                <p className="text-[11px] text-rose-600 mt-1 font-semibold">⚠️ {createForm.errors.reference_livraison}</p>
                            )}
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
                            {t('livraison_qte')} à Réceptionner *
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={createForm.data.quantite_livraison}
                            onChange={(e) => {
                                createForm.setData('quantite_livraison', parseInt(e.target.value) || 1);
                                createForm.clearErrors('quantite_livraison');
                            }}
                            className={`w-full text-xs rounded-xl border px-3.5 py-2 bg-slate-50 dark:bg-slate-900 dark:text-white font-mono ${
                                createForm.errors.quantite_livraison ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200 dark:border-slate-700'
                            }`}
                            required
                        />
                        {createForm.errors.quantite_livraison && (
                            <p className="text-[11px] text-rose-600 mt-1 font-semibold">⚠️ {createForm.errors.quantite_livraison}</p>
                        )}
                    </div>

                    {/* Auto generate stock hardware items */}
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/60 space-y-2.5">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                            <input
                                type="checkbox"
                                checked={createForm.data.auto_generate_materiels}
                                onChange={(e) => createForm.setData('auto_generate_materiels', e.target.checked)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Générer automatiquement les {createForm.data.quantite_livraison || 1} immobilisations en stock</span>
                        </label>

                        {createForm.data.auto_generate_materiels && (
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <div>
                                    <label className="block text-[11px] text-slate-500 mb-1">Préfixe N° Inventaire</label>
                                    <input
                                        type="text"
                                        value={createForm.data.prefix_inventaire}
                                        onChange={(e) => createForm.setData('prefix_inventaire', e.target.value)}
                                        placeholder="INV"
                                        className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 bg-white dark:bg-slate-800 font-mono"
                                    />
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center pt-4">
                                    <span>Traçabilité automatique S/N & Inventaire</span>
                                </div>
                            </div>
                        )}
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
        </AuthenticatedLayout>
    );
}
