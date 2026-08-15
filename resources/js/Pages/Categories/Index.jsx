import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import usePagination from '@/Hooks/usePagination';
import { useLanguage } from '@/Context/LanguageContext';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ categories }) {
    const { auth = {}, errors: pageErrors } = usePage().props;
    const { permissions = [], isAdmin = false } = auth;
    const { t } = useLanguage();

    const canCreate = isAdmin || permissions.includes('gerer_materiels') || permissions.includes('creer_materiel');
    const canEdit = isAdmin || permissions.includes('gerer_materiels') || permissions.includes('modifier_materiel');
    const canDelete = isAdmin || permissions.includes('gerer_materiels') || permissions.includes('supprimer_materiel');
    const hasAnyAction = canEdit || canDelete;

    const [editingCategorie, setEditingCategorie] = useState(null);

    // ---------- Pagination ----------
    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalItems,
        totalPages,
        paginatedItems: paginatedCategories,
    } = usePagination(categories, 10);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        nom_categorie: '',
    });

    const editForm = useForm({ nom_categorie: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('categories.store'), { onSuccess: () => reset() });
    };

    const startEdit = (categorie) => {
        setEditingCategorie(categorie);
        editForm.setData('nom_categorie', categorie.nom_categorie);
        editForm.clearErrors();
    };

    const saveEdit = (e) => {
        e.preventDefault();
        if (!editingCategorie) return;
        editForm.put(route('categories.update', editingCategorie.id), {
            onSuccess: () => setEditingCategorie(null),
        });
    };

    const destroy = (id) => {
        if (confirm('Supprimer cette catégorie ?')) {
            router.delete(route('categories.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('categories_title')} />
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {pageErrors?.delete && (
                        <div className="bg-rose-50 text-rose-700 text-sm p-4 rounded-xl border border-rose-200 shadow-sm flex items-center gap-2">
                            <span>⚠️</span> {pageErrors.delete}
                        </div>
                    )}

                    {canCreate && (
                        <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 p-6">
                            <h2 className="text-base font-extrabold mb-4 text-slate-800 flex items-center gap-2">
                                <span>➕</span> {t('categories_add_new')}
                            </h2>
                            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={data.nom_categorie}
                                        onChange={(e) => {
                                            setData('nom_categorie', e.target.value);
                                            if (errors.nom_categorie) clearErrors('nom_categorie');
                                        }}
                                        placeholder="Nom de la catégorie (ex: Ordinateur portable, Imprimante, Switch...) *"
                                        className={`border rounded-xl px-3.5 py-2.5 text-sm w-full transition ${
                                            errors.nom_categorie
                                                ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900'
                                                : 'border-slate-200 focus:ring-2 focus:ring-[#11508f]'
                                        }`}
                                        required
                                    />
                                    {errors.nom_categorie && (
                                        <p className="text-rose-600 text-xs font-semibold mt-1.5 flex items-center gap-1">
                                            <span>⚠️</span> {errors.nom_categorie}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-[#11508f] text-white px-6 py-2.5 rounded-xl text-xs font-extrabold hover:bg-[#0d3d6e] transition shadow-md shadow-[#11508f]/20 disabled:opacity-50 h-full w-full sm:w-auto"
                                    >
                                        {t('save')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-xl font-black text-slate-900">{t('categories_title')}</h1>
                            <span className="bg-blue-50 text-[#11508f] border border-blue-200 px-3 py-1 rounded-xl text-xs font-bold shadow-sm">
                                {t('total')}: {categories.length} {t('categories')}
                            </span>
                        </div>

                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-slate-50 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                    <th className="py-3 px-4">{t('categories_name')}</th>
                                    <th className="py-3 px-4 text-center">{t('materiels')}</th>
                                    {hasAnyAction && <th className="py-3 px-4 text-right">{t('actions')}</th>}
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-100">
                                {paginatedCategories.map((categorie) => (
                                    <tr key={categorie.id} className="hover:bg-slate-50/80 transition">
                                        <td className="py-3.5 px-4 font-bold text-slate-900">
                                            🏷️ {categorie.nom_categorie}
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700">
                                                💻 {categorie.materiels_count}
                                            </span>
                                        </td>
                                        {hasAnyAction && (
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex justify-end items-center gap-1.5">
                                                    {canEdit && (
                                                        <button
                                                            onClick={() => startEdit(categorie)}
                                                            title={t('edit')}
                                                            className="p-2 rounded-xl text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition"
                                                        >
                                                            ✏️
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => destroy(categorie.id)}
                                                            title={t('delete')}
                                                            className="p-2 rounded-xl text-red-600 hover:text-red-800 hover:bg-red-50 transition"
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

            {/* Modal de Modification d'une Catégorie */}
            <Modal show={editingCategorie !== null} onClose={() => setEditingCategorie(null)} maxWidth="md">
                <form onSubmit={saveEdit} className="p-6 space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                        <h2 className="text-lg font-black text-slate-800">
                            {t('categories_edit', { name: editingCategorie?.nom_categorie })}
                        </h2>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">{t('categories_name')} <span className="text-rose-500">*</span></label>
                        <input
                            type="text"
                            value={editForm.data.nom_categorie}
                            onChange={(e) => editForm.setData('nom_categorie', e.target.value)}
                            className={`border rounded-xl px-3.5 py-2.5 text-sm w-full transition ${
                                editForm.errors.nom_categorie
                                    ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900'
                                    : 'border-slate-200 focus:ring-2 focus:ring-[#11508f]'
                            }`}
                            required
                        />
                        {editForm.errors.nom_categorie && (
                            <p className="text-rose-600 text-xs font-semibold mt-1.5 flex items-center gap-1">
                                <span>⚠️</span> {editForm.errors.nom_categorie}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setEditingCategorie(null)}
                            className="text-slate-600 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-100 transition"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={editForm.processing}
                            className="bg-[#11508f] text-white px-5 py-2.5 rounded-xl text-xs font-extrabold hover:bg-[#0d3d6e] transition shadow-md shadow-[#11508f]/20 disabled:opacity-50"
                        >
                            {t('save')}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}