import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import usePagination from '@/Hooks/usePagination';
import { useLanguage } from '@/Context/LanguageContext';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Index({ fournisseurs = [] }) {
    const { auth = {} } = usePage().props;
    const { permissions = [], isAdmin = false } = auth;
    const canCreate = isAdmin || permissions.includes('gerer_fournisseurs') || permissions.includes('creer_fournisseur');
    const canEdit = isAdmin || permissions.includes('gerer_fournisseurs') || permissions.includes('modifier_fournisseur');
    const canDelete = isAdmin || permissions.includes('gerer_fournisseurs') || permissions.includes('supprimer_fournisseur');

    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [editingFournisseur, setEditingFournisseur] = useState(null);

    // Create Form
    const createForm = useForm({
        nom_fournisseur: '',
        adresse_fournisseur: '',
        telephone_fournisseur: '',
        contact_personne: '',
    });

    // Edit Form
    const editForm = useForm({
        nom_fournisseur: '',
        adresse_fournisseur: '',
        telephone_fournisseur: '',
        contact_personne: '',
    });

    const filteredFournisseurs = useMemo(() => {
        if (!searchQuery.trim()) return fournisseurs;
        const q = searchQuery.toLowerCase().trim();
        return fournisseurs.filter(
            (f) =>
                f.nom_fournisseur?.toLowerCase().includes(q) ||
                f.contact_personne?.toLowerCase().includes(q) ||
                f.telephone_fournisseur?.toLowerCase().includes(q) ||
                f.adresse_fournisseur?.toLowerCase().includes(q)
        );
    }, [fournisseurs, searchQuery]);

    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalItems,
        totalPages,
        paginatedItems,
    } = usePagination(filteredFournisseurs, 10, [searchQuery]);

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post(route('fournisseurs.store'), {
            onSuccess: () => createForm.reset(),
        });
    };

    const openEditModal = (f) => {
        setEditingFournisseur(f);
        editForm.setData({
            nom_fournisseur: f.nom_fournisseur || '',
            adresse_fournisseur: f.adresse_fournisseur || '',
            telephone_fournisseur: f.telephone_fournisseur || '',
            contact_personne: f.contact_personne || '',
        });
        editForm.clearErrors();
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        editForm.put(route('fournisseurs.update', editingFournisseur.id), {
            onSuccess: () => setEditingFournisseur(null),
        });
    };

    const handleDelete = (id, nom) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer le fournisseur "${nom}" ?`)) {
            router.delete(route('fournisseurs.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('fournisseurs')} />
            <div className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                                <span>🏢</span>
                                <span>{t('fournisseurs_title')}</span>
                            </h1>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                                {t('fournisseurs_subtitle')}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                🏢 {fournisseurs.length} {t('fournisseurs')}
                            </span>
                        </div>
                    </div>

                    <div className={canCreate ? "grid grid-cols-1 lg:grid-cols-3 gap-6" : "space-y-6"}>

                        {/* Add Form Card */}
                        {canCreate && (
                            <div className="lux-card p-6 h-fit border border-slate-200/80 dark:border-slate-800">
                                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <span>➕</span>
                                    <span>{t('fournisseurs_add')}</span>
                                </h2>

                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            {t('fournisseur_name')} *
                                        </label>
                                        <input
                                            type="text"
                                            value={createForm.data.nom_fournisseur}
                                            onChange={(e) => {
                                                createForm.setData('nom_fournisseur', e.target.value);
                                                createForm.clearErrors('nom_fournisseur');
                                            }}
                                            placeholder="Ex: Dell Maroc SA"
                                            className={`w-full text-xs rounded-xl border px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-900 dark:text-white transition ${
                                                createForm.errors.nom_fournisseur
                                                    ? 'border-rose-500 ring-1 ring-rose-400 bg-rose-50/30'
                                                    : 'border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-indigo-500'
                                            }`}
                                        />
                                        {createForm.errors.nom_fournisseur && (
                                            <p className="text-[11px] text-rose-600 mt-1 font-semibold">
                                                ⚠️ {createForm.errors.nom_fournisseur}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                            {t('fournisseur_contact')}
                                        </label>
                                        <input
                                            type="text"
                                            value={createForm.data.contact_personne}
                                            onChange={(e) => createForm.setData('contact_personne', e.target.value)}
                                            placeholder="Ex: M. Mohammed Alami"
                                            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-900 dark:text-white"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                {t('fournisseur_phone')}
                                            </label>
                                            <input
                                                type="text"
                                                value={createForm.data.telephone_fournisseur}
                                                onChange={(e) => createForm.setData('telephone_fournisseur', e.target.value)}
                                                placeholder="+212 5..."
                                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                {t('fournisseur_address')}
                                            </label>
                                            <input
                                                type="text"
                                                value={createForm.data.adresse_fournisseur}
                                                onChange={(e) => createForm.setData('adresse_fournisseur', e.target.value)}
                                                placeholder="Ex: Agadir, Maroc"
                                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-900 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={createForm.processing}
                                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20 transition duration-150"
                                    >
                                        {createForm.processing ? t('loading') : t('add')}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* List / Table Card */}
                        <div className={canCreate ? "lg:col-span-2 space-y-4" : "space-y-4"}>
                            <div className="lux-card p-6 border border-slate-200/80 dark:border-slate-800">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                        {t('fournisseurs')} ({filteredFournisseurs.length})
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
                                                <th className="py-3 px-3.5">{t('fournisseur_name')}</th>
                                                <th className="py-3 px-3">{t('fournisseur_contact')}</th>
                                                <th className="py-3 px-3">{t('fournisseur_phone')}</th>
                                                <th className="py-3 px-3">{t('fournisseur_achats_count')}</th>
                                                <th className="py-3 px-3.5 text-right">{t('actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-xs divide-y divide-slate-100 dark:divide-slate-800">
                                            {paginatedItems.map((f) => (
                                                <tr key={f.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                                                    <td className="py-3 px-3.5 font-extrabold text-slate-900 dark:text-white">
                                                        {f.nom_fournisseur}
                                                        {f.adresse_fournisseur && (
                                                            <span className="block text-[10px] font-normal text-slate-400">
                                                                📍 {f.adresse_fournisseur}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                                                        {f.contact_personne || '—'}
                                                    </td>
                                                    <td className="py-3 px-3 font-mono text-slate-500 dark:text-slate-400">
                                                        {f.telephone_fournisseur || '—'}
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                                            🛒 {f.achats_count || 0}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {canEdit && (
                                                                <button
                                                                    onClick={() => openEditModal(f)}
                                                                    className="px-2.5 py-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg text-xs font-bold transition"
                                                                >
                                                                    ✏️ {t('edit')}
                                                                </button>
                                                            )}
                                                            {canDelete && (
                                                                <button
                                                                    onClick={() => handleDelete(f.id, f.nom_fournisseur)}
                                                                    className="px-2.5 py-1 text-rose-600 hover:text-rose-800 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs font-bold transition"
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
                                                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
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

                </div>
            </div>

            {/* Edit Modal */}
            <Modal show={editingFournisseur !== null} onClose={() => setEditingFournisseur(null)} maxWidth="md">
                <form onSubmit={handleUpdate} className="p-6 space-y-4">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b pb-2">
                        {t('fournisseurs_edit')}
                    </h2>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('fournisseur_name')} *
                        </label>
                        <input
                            type="text"
                            value={editForm.data.nom_fournisseur}
                            onChange={(e) => {
                                editForm.setData('nom_fournisseur', e.target.value);
                                editForm.clearErrors('nom_fournisseur');
                            }}
                            className={`w-full text-xs rounded-xl border px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 dark:text-white transition ${
                                editForm.errors.nom_fournisseur
                                    ? 'border-rose-500 ring-1 ring-rose-400 bg-rose-50/30'
                                    : 'border-slate-200 dark:border-slate-700'
                            }`}
                        />
                        {editForm.errors.nom_fournisseur && (
                            <p className="text-[11px] text-rose-600 mt-1 font-semibold">
                                ⚠️ {editForm.errors.nom_fournisseur}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('fournisseur_contact')}
                        </label>
                        <input
                            type="text"
                            value={editForm.data.contact_personne}
                            onChange={(e) => editForm.setData('contact_personne', e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('fournisseur_phone')}
                            </label>
                            <input
                                type="text"
                                value={editForm.data.telephone_fournisseur}
                                onChange={(e) => editForm.setData('telephone_fournisseur', e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                {t('fournisseur_address')}
                            </label>
                            <input
                                type="text"
                                value={editForm.data.adresse_fournisseur}
                                onChange={(e) => editForm.setData('adresse_fournisseur', e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setEditingFournisseur(null)}
                            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={editForm.processing}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition"
                        >
                            {editForm.processing ? t('loading') : t('save')}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
