import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import usePagination from '@/Hooks/usePagination';
import { useLanguage } from '@/Context/LanguageContext';
import { Head, useForm, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Index({ marques = [] }) {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [editingMarque, setEditingMarque] = useState(null);
    const [editingModele, setEditingModele] = useState(null);
    const [addingModeleForMarque, setAddingModeleForMarque] = useState(null);

    // Create Marque Form
    const marqueForm = useForm({
        nom_marque: '',
    });

    // Edit Marque Form
    const editMarqueForm = useForm({
        nom_marque: '',
    });

    // Create Modele Form
    const modeleForm = useForm({
        nom_modele: '',
        marque_id: '',
    });

    // Edit Modele Form
    const editModeleForm = useForm({
        nom_modele: '',
        marque_id: '',
    });

    const filteredMarques = useMemo(() => {
        if (!searchQuery.trim()) return marques;
        const q = searchQuery.toLowerCase().trim();
        return marques.filter(
            (m) =>
                m.nom_marque?.toLowerCase().includes(q) ||
                m.modeles?.some((mod) => mod.nom_modele?.toLowerCase().includes(q))
        );
    }, [marques, searchQuery]);

    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalItems,
        totalPages,
        paginatedItems,
    } = usePagination(filteredMarques, 8, [searchQuery]);

    const handleCreateMarque = (e) => {
        e.preventDefault();
        marqueForm.post(route('marques.store'), {
            onSuccess: () => marqueForm.reset(),
        });
    };

    const handleUpdateMarque = (e) => {
        e.preventDefault();
        editMarqueForm.put(route('marques.update', editingMarque.id), {
            onSuccess: () => setEditingMarque(null),
        });
    };

    const handleDeleteMarque = (id, name) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer la marque "${name}" ?`)) {
            router.delete(route('marques.destroy', id));
        }
    };

    const handleCreateModele = (e) => {
        e.preventDefault();
        modeleForm.post(route('modeles.store'), {
            onSuccess: () => {
                modeleForm.reset();
                setAddingModeleForMarque(null);
            },
        });
    };

    const handleUpdateModele = (e) => {
        e.preventDefault();
        editModeleForm.put(route('modeles.update', editingModele.id), {
            onSuccess: () => setEditingModele(null),
        });
    };

    const handleDeleteModele = (id, name) => {
        if (confirm(`Supprimer le modèle "${name}" ?`)) {
            router.delete(route('modeles.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('marques_modeles')} />
            <div className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                                <span>🏷️</span>
                                <span>{t('marques_title')}</span>
                            </h1>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                                {t('marques_subtitle')}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Add Brand Form Card */}
                        <div className="lux-card p-6 h-fit border border-slate-200/80 dark:border-slate-800">
                            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span>➕</span>
                                <span>{t('marques_add')}</span>
                            </h2>

                            <form onSubmit={handleCreateMarque} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        {t('marque_name')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={marqueForm.data.nom_marque}
                                        onChange={(e) => {
                                            marqueForm.setData('nom_marque', e.target.value);
                                            marqueForm.clearErrors('nom_marque');
                                        }}
                                        placeholder="Ex: Dell, HP, Lenovo, Cisco..."
                                        className={`w-full text-xs rounded-xl border px-3.5 py-2.5 bg-slate-50/50 dark:bg-slate-900 dark:text-white transition ${
                                            marqueForm.errors.nom_marque
                                                ? 'border-rose-500 ring-1 ring-rose-400 bg-rose-50/30'
                                                : 'border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-indigo-500'
                                        }`}
                                    />
                                    {marqueForm.errors.nom_marque && (
                                        <p className="text-[11px] text-rose-600 mt-1 font-semibold">
                                            ⚠️ {marqueForm.errors.nom_marque}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={marqueForm.processing}
                                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20 transition"
                                >
                                    {marqueForm.processing ? t('loading') : t('add')}
                                </button>
                            </form>
                        </div>

                        {/* Brands & Associated Models Catalog Card */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="lux-card p-6 border border-slate-200/80 dark:border-slate-800">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                                    <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                        {t('marques_modeles')} ({filteredMarques.length})
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

                                <div className="space-y-4">
                                    {paginatedItems.map((m) => (
                                        <div
                                            key={m.id}
                                            className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm transition hover:border-indigo-300"
                                        >
                                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center gap-3">
                                                    <span className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-sm font-extrabold">
                                                        🏷️
                                                    </span>
                                                    <div>
                                                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                                                            {m.nom_marque}
                                                        </h3>
                                                        <span className="text-[10px] text-slate-400">
                                                            {m.modeles?.length || 0} {t('modeles_count')}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setAddingModeleForMarque(m);
                                                            modeleForm.setData('marque_id', m.id);
                                                            modeleForm.setData('nom_modele', '');
                                                        }}
                                                        className="px-2.5 py-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 rounded-lg transition"
                                                    >
                                                        ➕ {t('modeles_add')}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingMarque(m);
                                                            editMarqueForm.setData('nom_marque', m.nom_marque);
                                                        }}
                                                        className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg transition text-xs"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMarque(m.id, m.nom_marque)}
                                                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg transition text-xs"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Models Pills */}
                                            <div className="pt-3 flex flex-wrap gap-2 items-center">
                                                {m.modeles?.map((mod) => (
                                                    <div
                                                        key={mod.id}
                                                        className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700"
                                                    >
                                                        <span>💻 {mod.nom_modele}</span>
                                                        <span className="text-[10px] text-slate-400 font-normal">
                                                            ({mod.materiels_count || 0})
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                setEditingModele(mod);
                                                                editModeleForm.setData({
                                                                    nom_modele: mod.nom_modele,
                                                                    marque_id: mod.marque_id,
                                                                });
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 text-indigo-500 hover:text-indigo-700 transition"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteModele(mod.id, mod.nom_modele)}
                                                            className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 transition"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                                {(!m.modeles || m.modeles.length === 0) && (
                                                    <span className="text-[11px] text-slate-400 italic">
                                                        Aucun modèle configuré pour cette marque.
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {paginatedItems.length === 0 && (
                                        <p className="text-center text-xs text-slate-400 py-10">
                                            {t('pagination_no_data')}
                                        </p>
                                    )}
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

            {/* Edit Brand Modal */}
            <Modal show={editingMarque !== null} onClose={() => setEditingMarque(null)} maxWidth="sm">
                <form onSubmit={handleUpdateMarque} className="p-6 space-y-4">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b pb-2">
                        {t('marques_edit')}
                    </h2>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('marque_name')} *
                        </label>
                        <input
                            type="text"
                            value={editMarqueForm.data.nom_marque}
                            onChange={(e) => editMarqueForm.setData('nom_marque', e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 dark:text-white"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-3 border-t">
                        <button
                            type="button"
                            onClick={() => setEditingMarque(null)}
                            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={editMarqueForm.processing}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl"
                        >
                            {t('save')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Add Model Modal */}
            <Modal show={addingModeleForMarque !== null} onClose={() => setAddingModeleForMarque(null)} maxWidth="sm">
                <form onSubmit={handleCreateModele} className="p-6 space-y-4">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b pb-2">
                        {t('modeles_add')} ({addingModeleForMarque?.nom_marque})
                    </h2>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('modele_name')} *
                        </label>
                        <input
                            type="text"
                            value={modeleForm.data.nom_modele}
                            onChange={(e) => modeleForm.setData('nom_modele', e.target.value)}
                            placeholder="Ex: Latitude 5520, ThinkPad T14, ProBook 450..."
                            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 dark:text-white"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-3 border-t">
                        <button
                            type="button"
                            onClick={() => setAddingModeleForMarque(null)}
                            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={modeleForm.processing}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl"
                        >
                            {t('add')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Model Modal */}
            <Modal show={editingModele !== null} onClose={() => setEditingModele(null)} maxWidth="sm">
                <form onSubmit={handleUpdateModele} className="p-6 space-y-4">
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b pb-2">
                        {t('modeles_edit')}
                    </h2>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('modele_name')} *
                        </label>
                        <input
                            type="text"
                            value={editModeleForm.data.nom_modele}
                            onChange={(e) => editModeleForm.setData('nom_modele', e.target.value)}
                            className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 dark:text-white"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-3 border-t">
                        <button
                            type="button"
                            onClick={() => setEditingModele(null)}
                            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={editModeleForm.processing}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl"
                        >
                            {t('save')}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
