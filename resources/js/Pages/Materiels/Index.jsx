import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import usePagination from '@/Hooks/usePagination';
import { useLanguage } from '@/Context/LanguageContext';
import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Index({ materiels = [], categories = [], achats = [], marques = [], modeles = [] }) {
    const { auth = {}, errors: pageErrors, flash = {} } = usePage().props;
    const { permissions = [], isAdmin = false } = auth;
    const { t } = useLanguage();

    const canCreate = isAdmin || permissions.includes('gerer_materiels') || permissions.includes('creer_materiel');
    const canEdit = isAdmin || permissions.includes('gerer_materiels') || permissions.includes('modifier_materiel');
    const canDelete = isAdmin || permissions.includes('gerer_materiels') || permissions.includes('supprimer_materiel');
    const hasAnyAction = canEdit || canDelete;

    const [editingMateriel, setEditingMateriel] = useState(null);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const initialSearch = urlParams.get('search') || '';

    // ---------- Filters & Search State ----------
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'disponible', 'affecte'
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [achatFilter, setAchatFilter] = useState('all');

    // ---------- Computed Filtered List ----------
    const filteredMateriels = useMemo(() => {
        return materiels.filter((m) => {
            // Status filter
            if (statusFilter === 'disponible' && !m.is_disponible) return false;
            if (statusFilter === 'affecte' && m.is_disponible) return false;

            // Category filter
            if (categoryFilter !== 'all' && String(m.categorie_id) !== String(categoryFilter)) return false;

            // Achat filter
            if (achatFilter !== 'all' && String(m.achat_id) !== String(achatFilter)) return false;

            // Text search
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchNom = m.nom?.toLowerCase().includes(q);
                const matchMarque = m.marque?.toLowerCase().includes(q);
                const matchModele = m.modele?.toLowerCase().includes(q);
                const matchSerie = m.numero_serie?.toLowerCase().includes(q);
                const matchInv = m.numero_inventaire?.toLowerCase().includes(q);
                const matchCat = m.categorie?.nom_categorie?.toLowerCase().includes(q);
                const matchOccupant = m.occupant?.toLowerCase().includes(q);
                const matchAchat = m.achat?.numero_achat?.toLowerCase().includes(q) || m.achat?.objet_achat?.toLowerCase().includes(q);

                return matchNom || matchMarque || matchModele || matchSerie || matchInv || matchCat || matchOccupant || matchAchat;
            }

            return true;
        });
    }, [materiels, searchQuery, statusFilter, categoryFilter, achatFilter]);

    // ---------- Pagination ----------
    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalItems,
        totalPages,
        paginatedItems: paginatedMateriels,
    } = usePagination(filteredMateriels, 10, [searchQuery, statusFilter, categoryFilter, achatFilter]);

    // KPI metrics
    const totalCount = materiels.length;
    const disponibleCount = useMemo(() => materiels.filter((m) => m.is_disponible).length, [materiels]);
    const affecteCount = totalCount - disponibleCount;

    // ---------- Single Create Form ----------
    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        nom: '',
        marque: '',
        modele: '',
        numero_serie: '',
        numero_inventaire: '',
        caracteristique: '',
        categorie_id: '',
        achat_id: '',
    });

    // ---------- Single Edit Form ----------
    const editForm = useForm({
        nom: '',
        marque: '',
        modele: '',
        numero_serie: '',
        numero_inventaire: '',
        caracteristique: '',
        categorie_id: '',
        achat_id: '',
    });

    // ---------- Bulk Import Form ----------
    const bulkForm = useForm({
        file: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('materiels.store'), { onSuccess: () => reset() });
    };

    const startEdit = (m) => {
        setEditingMateriel(m);
        editForm.setData({
            nom: m.nom,
            marque: m.marque,
            modele: m.modele,
            numero_serie: m.numero_serie,
            numero_inventaire: m.numero_inventaire,
            caracteristique: m.caracteristique || '',
            categorie_id: m.categorie_id,
            achat_id: m.achat_id || '',
        });
        editForm.clearErrors();
    };

    const saveEdit = (e) => {
        e.preventDefault();
        if (!editingMateriel) return;
        editForm.put(route('materiels.update', editingMateriel.id), {
            onSuccess: () => setEditingMateriel(null),
        });
    };

    const destroy = (id) => {
        if (confirm('Supprimer ce matériel ?')) {
            router.delete(route('materiels.destroy', id));
        }
    };

    const handleBulkImport = (e) => {
        e.preventDefault();
        if (!bulkForm.data.file) return;

        bulkForm.post(route('materiels.bulk-import'), {
            forceFormData: true,
            onSuccess: () => {
                setIsBulkModalOpen(false);
                bulkForm.reset();
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('materiels_title')} />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {pageErrors?.delete && (
                        <div className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-sm p-4 rounded-xl border border-rose-200 dark:border-rose-800 shadow-sm flex items-center gap-2">
                            <span>⚠️</span> {pageErrors.delete}
                        </div>
                    )}

                    {pageErrors?.import && (
                        <div className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-sm p-4 rounded-xl border border-rose-200 dark:border-rose-800 shadow-sm flex items-center gap-2">
                            <span>⚠️</span> {pageErrors.import}
                        </div>
                    )}

                    {/* KPI Header Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="lux-card p-5 border border-slate-200/80 dark:border-slate-800">
                            <div className="text-2xl font-black text-slate-800 dark:text-white">{totalCount}</div>
                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{t('dashboard_total_hardware')}</div>
                        </div>
                        <div className="lux-card p-5 border border-slate-200/80 dark:border-slate-800">
                            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{disponibleCount}</div>
                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{t('dashboard_available_stock')}</div>
                        </div>
                        <div className="lux-card p-5 border border-slate-200/80 dark:border-slate-800">
                            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{affecteCount}</div>
                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{t('dashboard_assigned')}</div>
                        </div>
                    </div>

                    {/* Card: Ajouter un matériel */}
                    {canCreate && (
                        <div className="lux-card p-6 border border-slate-200/80 dark:border-slate-800">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                <h2 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                                    <span>➕</span> {t('materiels_add_new')}
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setIsBulkModalOpen(true)}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition shadow-md shadow-emerald-600/20"
                                >
                                    <span>📥</span>
                                    <span>{t('bulk_import_btn')}</span>
                                </button>
                            </div>

                            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('materiels_nom')} <span className="text-rose-500">*</span></label>
                                    <input
                                        placeholder="ex: PC Portable ProBook"
                                        value={data.nom}
                                        onChange={(e) => {
                                            setData('nom', e.target.value);
                                            if (errors.nom) clearErrors('nom');
                                        }}
                                        className={`border rounded-xl px-3.5 py-2.5 text-sm w-full bg-slate-50/50 dark:bg-slate-900 dark:text-white transition ${
                                            errors.nom ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900' : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
                                        }`}
                                        required
                                    />
                                    {errors.nom && <p className="text-rose-600 text-xs font-semibold mt-1 flex items-center gap-1"><span>⚠️</span> {errors.nom}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('materiels_marque')} <span className="text-rose-500">*</span></label>
                                    <input
                                        placeholder="ex: HP, Dell, Lenovo"
                                        value={data.marque}
                                        onChange={(e) => {
                                            setData('marque', e.target.value);
                                            if (errors.marque) clearErrors('marque');
                                        }}
                                        className={`border rounded-xl px-3.5 py-2.5 text-sm w-full bg-slate-50/50 dark:bg-slate-900 dark:text-white transition ${
                                            errors.marque ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900' : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
                                        }`}
                                        required
                                    />
                                    {errors.marque && <p className="text-rose-600 text-xs font-semibold mt-1 flex items-center gap-1"><span>⚠️</span> {errors.marque}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('materiels_modele')} <span className="text-rose-500">*</span></label>
                                    <input
                                        placeholder="ex: Latitude 5420"
                                        value={data.modele}
                                        onChange={(e) => {
                                            setData('modele', e.target.value);
                                            if (errors.modele) clearErrors('modele');
                                        }}
                                        className={`border rounded-xl px-3.5 py-2.5 text-sm w-full bg-slate-50/50 dark:bg-slate-900 dark:text-white transition ${
                                            errors.modele ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900' : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
                                        }`}
                                        required
                                    />
                                    {errors.modele && <p className="text-rose-600 text-xs font-semibold mt-1 flex items-center gap-1"><span>⚠️</span> {errors.modele}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('materiels_sn')} <span className="text-rose-500">*</span></label>
                                    <input
                                        placeholder="ex: SN-88392-ABC"
                                        value={data.numero_serie}
                                        onChange={(e) => {
                                            setData('numero_serie', e.target.value);
                                            if (errors.numero_serie) clearErrors('numero_serie');
                                        }}
                                        className={`border rounded-xl px-3.5 py-2.5 text-sm w-full bg-slate-50/50 dark:bg-slate-900 dark:text-white transition font-mono ${
                                            errors.numero_serie ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900' : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
                                        }`}
                                        required
                                    />
                                    {errors.numero_serie && <p className="text-rose-600 text-xs font-semibold mt-1 flex items-center gap-1"><span>⚠️</span> {errors.numero_serie}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('materiels_inv')} <span className="text-rose-500">*</span></label>
                                    <input
                                        placeholder="ex: INV-2026-0042"
                                        value={data.numero_inventaire}
                                        onChange={(e) => {
                                            setData('numero_inventaire', e.target.value);
                                            if (errors.numero_inventaire) clearErrors('numero_inventaire');
                                        }}
                                        className={`border rounded-xl px-3.5 py-2.5 text-sm w-full bg-slate-50/50 dark:bg-slate-900 dark:text-white transition font-mono ${
                                            errors.numero_inventaire ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900' : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
                                        }`}
                                        required
                                    />
                                    {errors.numero_inventaire && <p className="text-rose-600 text-xs font-semibold mt-1 flex items-center gap-1"><span>⚠️</span> {errors.numero_inventaire}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('materiels_categorie')} <span className="text-rose-500">*</span></label>
                                    <select
                                        value={data.categorie_id}
                                        onChange={(e) => {
                                            setData('categorie_id', e.target.value);
                                            if (errors.categorie_id) clearErrors('categorie_id');
                                        }}
                                        className={`border rounded-xl px-3.5 py-2.5 text-sm w-full bg-slate-50/50 dark:bg-slate-900 dark:text-white transition ${
                                            errors.categorie_id ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900' : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
                                        }`}
                                        required
                                    >
                                        <option value="">-- {t('materiels_filter_category')} --</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                🏷️ {c.nom_categorie}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.categorie_id && <p className="text-rose-600 text-xs font-semibold mt-1 flex items-center gap-1"><span>⚠️</span> {errors.categorie_id}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('materiel_achat')}</label>
                                    <select
                                        value={data.achat_id}
                                        onChange={(e) => setData('achat_id', e.target.value)}
                                        className="border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm w-full bg-slate-50/50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">{t('materiel_achat_placeholder')}</option>
                                        {achats.map((a) => (
                                            <option key={a.id} value={a.id}>
                                                🛒 {a.numero_achat} — {a.objet_achat} ({a.fournisseur?.nom_fournisseur})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-1 flex items-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-extrabold transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
                                    >
                                        {t('materiels_save_btn')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Card: Inventaire des matériels avec Recherche et Filtres */}
                    <div className="lux-card p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t('materiels_title')}</h1>
                                <a
                                    href={route('exports.materiels.csv')}
                                    className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/10"
                                >
                                    📥 {t('export_csv')}
                                </a>
                                {canCreate && (
                                    <button
                                        onClick={() => setIsBulkModalOpen(true)}
                                        className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-indigo-100 transition"
                                    >
                                        📄 {t('bulk_import')}
                                    </button>
                                )}
                            </div>

                            {/* Controls Bar */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 flex-1 md:max-w-3xl">
                                <input
                                    type="text"
                                    placeholder={t('search_placeholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs w-full focus:ring-1 focus:ring-indigo-500 bg-slate-50/50 dark:bg-slate-900 dark:text-white"
                                />

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs w-full bg-white dark:bg-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="all">{t('all')} ({t('status')})</option>
                                    <option value="disponible">{t('materiels_disponible')}</option>
                                    <option value="affecte">{t('materiels_affecte')}</option>
                                </select>

                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs w-full bg-white dark:bg-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                                >
                                    <option value="all">{t('all')} ({t('categories')})</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.nom_categorie}</option>
                                    ))}
                                </select>

                                <select
                                    value={achatFilter}
                                    onChange={(e) => setAchatFilter(e.target.value)}
                                    className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs w-full bg-white dark:bg-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 truncate"
                                >
                                    <option value="all">{t('all')} ({t('achats')})</option>
                                    {achats.map((a) => (
                                        <option key={a.id} value={a.id}>🛒 {a.numero_achat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || achatFilter !== 'all') && (
                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                <span>{filteredMateriels.length} {t('materiels')}</span>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setStatusFilter('all');
                                        setCategoryFilter('all');
                                        setAchatFilter('all');
                                    }}
                                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                                >
                                    {t('reset_filters')}
                                </button>
                            </div>
                        )}

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="py-3 px-3.5 whitespace-nowrap">{t('materiels_nom')}</th>
                                        <th className="py-3 px-3 whitespace-nowrap">{t('materiels_marque')} / {t('materiels_modele')}</th>
                                        <th className="py-3 px-3 whitespace-nowrap">{t('materiels_sn')}</th>
                                        <th className="py-3 px-3 whitespace-nowrap">{t('materiels_inv')}</th>
                                        <th className="py-3 px-3 whitespace-nowrap">{t('materiels_categorie')}</th>
                                        <th className="py-3 px-3 whitespace-nowrap">{t('achats')}</th>
                                        <th className="py-3 px-3 whitespace-nowrap">{t('status')}</th>
                                        <th className="py-3 px-3 whitespace-nowrap text-center">{t('affectations')}</th>
                                        {hasAnyAction && <th className="py-3 px-3.5 whitespace-nowrap text-right">{t('actions')}</th>}
                                    </tr>
                                </thead>
                                <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-800">
                                    {paginatedMateriels.map((m) => (
                                        <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                                            <td className="py-3.5 px-3.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                                {m.nom}
                                                {m.caracteristique && (
                                                    <div className="text-[10px] text-slate-400 font-normal truncate max-w-xs">{m.caracteristique}</div>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                {m.marque} {m.modele}
                                            </td>
                                            <td className="py-3.5 px-3 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                                {m.numero_serie}
                                            </td>
                                            <td className="py-3.5 px-3 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                {m.numero_inventaire}
                                            </td>
                                            <td className="py-3.5 px-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                    🏷️ {m.categorie?.nom_categorie}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-3 whitespace-nowrap">
                                                {m.achat ? (
                                                    <Link
                                                        href={route('achats.show', m.achat.id)}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 hover:underline border border-indigo-200 dark:border-indigo-800"
                                                    >
                                                        <span>🛒</span>
                                                        <span>{m.achat.numero_achat}</span>
                                                    </Link>
                                                ) : (
                                                    <span className="text-slate-400 text-[10px]">—</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-3 whitespace-nowrap">
                                                {m.is_disponible ? (
                                                    <span className="inline-flex items-center text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 me-1.5"></span>
                                                        {t('materiels_disponible')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 me-1.5"></span>
                                                        {t('materiels_affecte')} ({m.occupant})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                {m.affectations_count} {t('affectations')}
                                            </td>
                                            {hasAnyAction && (
                                                <td className="py-3.5 px-3.5 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {canEdit && (
                                                            <button
                                                                onClick={() => startEdit(m)}
                                                                title={t('edit')}
                                                                className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                                                            >
                                                                ✏️
                                                            </button>
                                                        )}
                                                        {canDelete && (
                                                            <button
                                                                onClick={() => destroy(m.id)}
                                                                title={t('delete')}
                                                                className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                                                            >
                                                                🗑️
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredMateriels.length === 0 && (
                                <p className="text-center text-slate-400 text-xs py-8">
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

            {/* Modal: Modification d'un Matériel */}
            <Modal show={editingMateriel !== null} onClose={() => setEditingMateriel(null)} maxWidth="lg">
                <form onSubmit={saveEdit} className="p-6 space-y-4">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                        {t('materiels_edit', { name: editingMateriel?.nom })}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('materiels_nom')} <span className="text-rose-500">*</span></label>
                            <input
                                type="text"
                                value={editForm.data.nom}
                                onChange={(e) => editForm.setData('nom', e.target.value)}
                                className={`border rounded-xl px-3.5 py-2 text-xs w-full bg-slate-50 dark:bg-slate-900 dark:text-white transition ${
                                    editForm.errors.nom ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40' : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
                                }`}
                                required
                            />
                            {editForm.errors.nom && <p className="text-rose-600 text-xs font-semibold mt-1">⚠️ {editForm.errors.nom}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('materiels_categorie')} <span className="text-rose-500">*</span></label>
                            <select
                                value={editForm.data.categorie_id}
                                onChange={(e) => editForm.setData('categorie_id', e.target.value)}
                                className={`border rounded-xl px-3.5 py-2 text-xs w-full bg-slate-50 dark:bg-slate-900 dark:text-white transition ${
                                    editForm.errors.categorie_id ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40' : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
                                }`}
                                required
                            >
                                <option value="">-- {t('materiels_filter_category')} --</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>🏷️ {cat.nom_categorie}</option>
                                ))}
                            </select>
                            {editForm.errors.categorie_id && <p className="text-rose-600 text-xs font-semibold mt-1">⚠️ {editForm.errors.categorie_id}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('materiels_marque')} <span className="text-rose-500">*</span></label>
                            <input
                                type="text"
                                value={editForm.data.marque}
                                onChange={(e) => editForm.setData('marque', e.target.value)}
                                className={`border rounded-xl px-3.5 py-2 text-xs w-full bg-slate-50 dark:bg-slate-900 dark:text-white transition ${
                                    editForm.errors.marque ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40' : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
                                }`}
                                required
                            />
                            {editForm.errors.marque && <p className="text-rose-600 text-xs font-semibold mt-1">⚠️ {editForm.errors.marque}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('materiels_modele')} <span className="text-rose-500">*</span></label>
                            <input
                                type="text"
                                value={editForm.data.modele}
                                onChange={(e) => editForm.setData('modele', e.target.value)}
                                className={`border rounded-xl px-3.5 py-2 text-xs w-full bg-slate-50 dark:bg-slate-900 dark:text-white transition ${
                                    editForm.errors.modele ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40' : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
                                }`}
                                required
                            />
                            {editForm.errors.modele && <p className="text-rose-600 text-xs font-semibold mt-1">⚠️ {editForm.errors.modele}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('materiels_sn')} <span className="text-rose-500">*</span></label>
                            <input
                                type="text"
                                value={editForm.data.numero_serie}
                                onChange={(e) => editForm.setData('numero_serie', e.target.value)}
                                className={`border rounded-xl px-3.5 py-2 text-xs w-full bg-slate-50 dark:bg-slate-900 dark:text-white transition font-mono ${
                                    editForm.errors.numero_serie ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40' : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
                                }`}
                                required
                            />
                            {editForm.errors.numero_serie && <p className="text-rose-600 text-xs font-semibold mt-1">⚠️ {editForm.errors.numero_serie}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('materiels_inv')} <span className="text-rose-500">*</span></label>
                            <input
                                type="text"
                                value={editForm.data.numero_inventaire}
                                onChange={(e) => editForm.setData('numero_inventaire', e.target.value)}
                                className={`border rounded-xl px-3.5 py-2 text-xs w-full bg-slate-50 dark:bg-slate-900 dark:text-white transition font-mono ${
                                    editForm.errors.numero_inventaire ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40' : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500'
                                }`}
                                required
                            />
                            {editForm.errors.numero_inventaire && <p className="text-rose-600 text-xs font-semibold mt-1">⚠️ {editForm.errors.numero_inventaire}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('materiel_achat')}</label>
                            <select
                                value={editForm.data.achat_id}
                                onChange={(e) => editForm.setData('achat_id', e.target.value)}
                                className="border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs w-full bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">{t('materiel_achat_placeholder')}</option>
                                {achats.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        🛒 {a.numero_achat} — {a.objet_achat} ({a.fournisseur?.nom_fournisseur})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('materiels_caracteristiques')}</label>
                            <textarea
                                value={editForm.data.caracteristique}
                                onChange={(e) => editForm.setData('caracteristique', e.target.value)}
                                className="border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs w-full bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                rows="2"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setEditingMateriel(null)}
                            className="text-slate-600 dark:text-slate-400 text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={editForm.processing}
                            className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-extrabold hover:bg-indigo-700 transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
                        >
                            {t('save')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Importation en Masse (Bulk Import Excel / CSV) */}
            <Modal show={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} maxWidth="lg">
                <form onSubmit={handleBulkImport} className="p-6 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-3">
                            <span className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-lg font-black">
                                📥
                            </span>
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                                    {t('bulk_import_title')}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {t('bulk_import_subtitle')}
                                </p>
                            </div>
                        </div>

                        <a
                            href={route('materiels.template')}
                            className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition inline-flex items-center gap-1.5 whitespace-nowrap shadow-sm"
                        >
                            <span>📄</span>
                            <span>{t('bulk_import_download_template')}</span>
                        </a>
                    </div>

                    {/* Step by step guide */}
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                        <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <span>💡</span> Format et colonnes attendues :
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">
                            Votre fichier doit comporter les colonnes suivantes (séparateur point-virgule <code>;</code> ou virgule <code>,</code>) :
                        </p>
                        <div className="font-mono text-[11px] bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 overflow-x-auto">
                            Nom du Materiel ; Marque ; Modele ; Numero de Serie ; Numero Inventaire ; Categorie ; Numero Achat ; Caracteristiques
                        </div>
                    </div>

                    {/* File Upload Box */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                            {t('bulk_import_file_label')} <span className="text-rose-500">*</span>
                        </label>
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-slate-900/50 transition cursor-pointer relative">
                            <input
                                type="file"
                                accept=".csv, .txt, .xlsx, .xls"
                                onChange={(e) => bulkForm.setData('file', e.target.files[0])}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                required
                            />
                            <div className="space-y-2">
                                <span className="text-3xl block">📊</span>
                                {bulkForm.data.file ? (
                                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                        ✓ Fichier sélectionné : {bulkForm.data.file.name} ({(bulkForm.data.file.size / 1024).toFixed(1)} Ko)
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {t('bulk_import_drag_drop')}
                                        </div>
                                        <p className="text-[11px] text-slate-400">
                                            Formats supportés : CSV, TXT (séparateurs <code>;</code> ou <code>,</code>), Excel
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                        {bulkForm.errors.file && (
                            <p className="text-rose-600 text-xs font-semibold mt-1">⚠️ {bulkForm.errors.file}</p>
                        )}
                    </div>

                    {/* Submit & Actions */}
                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setIsBulkModalOpen(false)}
                            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={bulkForm.processing || !bulkForm.data.file}
                            className="px-5 py-2 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
                        >
                            {bulkForm.processing && <span className="animate-spin">⏳</span>}
                            <span>{t('bulk_import_submit')}</span>
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}