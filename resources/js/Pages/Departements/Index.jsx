import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import usePagination from '@/Hooks/usePagination';
import { useLanguage } from '@/Context/LanguageContext';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Index({ departements = [], directions = [] }) {
    const { auth = {}, errors: pageErrors } = usePage().props;
    const { permissions = [], isAdmin = false } = auth;
    const { t } = useLanguage();

    const canCreate = isAdmin || permissions.includes('creer_departement') || permissions.includes('gerer_departements') || permissions.includes('gerer_structure') || permissions.includes('modifier_structure');
    const canEdit = isAdmin || permissions.includes('modifier_departement') || permissions.includes('gerer_departements') || permissions.includes('gerer_structure') || permissions.includes('modifier_structure');
    const canDelete = isAdmin || permissions.includes('supprimer_departement') || permissions.includes('gerer_departements') || permissions.includes('gerer_structure') || permissions.includes('supprimer_structure');
    const hasAnyAction = canEdit || canDelete;

    const [editingDepartement, setEditingDepartement] = useState(null);

    // ---------- Search & Filters ----------
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDirection, setSelectedDirection] = useState('all');

    const filteredDepartements = useMemo(() => {
        return departements.filter((dep) => {
            if (selectedDirection !== 'all' && String(dep.direction_id) !== String(selectedDirection)) {
                return false;
            }
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchName = dep.nom_departement?.toLowerCase().includes(q);
                const matchDir = dep.direction?.nom_direction?.toLowerCase().includes(q);
                return matchName || matchDir;
            }
            return true;
        });
    }, [departements, searchQuery, selectedDirection]);

    // ---------- Pagination ----------
    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalItems,
        totalPages,
        paginatedItems: paginatedDepartements,
    } = usePagination(filteredDepartements, 10, [searchQuery, selectedDirection]);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        nom_departement: '',
        direction_id: '',
    });

    const editForm = useForm({ nom_departement: '', direction_id: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('departements.store'), {
            onSuccess: () => reset(),
        });
    };

    const startEdit = (departement) => {
        setEditingDepartement(departement);
        editForm.setData({
            nom_departement: departement.nom_departement,
            direction_id: departement.direction_id,
        });
        editForm.clearErrors();
    };

    const saveEdit = (e) => {
        e.preventDefault();
        if (!editingDepartement) return;
        editForm.put(route('departements.update', editingDepartement.id), {
            onSuccess: () => setEditingDepartement(null),
        });
    };

    const destroy = (id) => {
        if (confirm('Supprimer ce département ?')) {
            router.delete(route('departements.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('structure_hierarchy_departements')} />
            <div className="py-12">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-extrabold text-[#11508f] uppercase tracking-wider mb-1">
                                <span>🏛️ {t('structure_hierarchy_directions')}</span>
                                <span>›</span>
                                <span>🏢 {t('departements')}</span>
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('structure_hierarchy_departements')}</h1>
                            <p className="text-xs text-slate-500 mt-1">
                                {t('directions_list')}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                                {t('total')}: {departements.length} {t('departements')}
                            </span>
                        </div>
                    </div>

                    {/* Formulaire d'ajout d'un Département */}
                    {canCreate && (
                        <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 p-6">
                            <h2 className="text-base font-extrabold mb-4 text-slate-800 flex items-center gap-2">
                                <span>➕</span> {t('structure_add_departement')}
                            </h2>
                            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        {t('departements_name')} <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nom_departement}
                                        onChange={(e) => {
                                            setData('nom_departement', e.target.value);
                                            if (errors.nom_departement) clearErrors('nom_departement');
                                        }}
                                        placeholder="ex: Département Études & Projets"
                                        className={`border rounded-xl px-3.5 py-2.5 text-sm w-full transition ${
                                            errors.nom_departement
                                                ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900'
                                                : 'border-slate-200 focus:ring-2 focus:ring-[#11508f]'
                                        }`}
                                        required
                                    />
                                    {errors.nom_departement && (
                                        <p className="text-rose-600 text-xs font-semibold mt-1.5 flex items-center gap-1">
                                            <span>⚠️</span> {errors.nom_departement}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        {t('directions')} <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.direction_id}
                                        onChange={(e) => {
                                            setData('direction_id', e.target.value);
                                            if (errors.direction_id) clearErrors('direction_id');
                                        }}
                                        className={`border rounded-xl px-3.5 py-2.5 text-sm w-full bg-white transition ${
                                            errors.direction_id
                                                ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900'
                                                : 'border-slate-200 focus:ring-2 focus:ring-[#11508f]'
                                        }`}
                                        required
                                    >
                                        <option value="">-- {t('directions_select')} --</option>
                                        {directions.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                🏛️ {d.nom_direction}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.direction_id && (
                                        <p className="text-rose-600 text-xs font-semibold mt-1.5 flex items-center gap-1">
                                            <span>⚠️</span> {errors.direction_id}
                                        </p>
                                    )}
                                </div>

                                <div className="md:col-span-2 flex justify-end pt-1">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-[#11508f] text-white px-6 py-2.5 rounded-xl text-xs font-extrabold hover:bg-[#0d3d6e] transition shadow-md shadow-[#11508f]/20 disabled:opacity-50"
                                    >
                                        {t('save')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Table des Départements */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-slate-200 p-6 space-y-4">
                        
                        {/* Filtres & Recherche Bar */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    🔍 {t('search')}
                                </label>
                                <input
                                    type="text"
                                    placeholder={t('search_placeholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs w-full focus:ring-1 focus:ring-[#11508f] bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    🏛️ {t('directions')}
                                </label>
                                <select
                                    value={selectedDirection}
                                    onChange={(e) => setSelectedDirection(e.target.value)}
                                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs w-full bg-white focus:ring-1 focus:ring-[#11508f]"
                                >
                                    <option value="all">{t('all')} ({directions.length})</option>
                                    {directions.map((dir) => (
                                        <option key={dir.id} value={dir.id}>
                                            🏛️ {dir.nom_direction}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Tableau */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b bg-slate-50 text-xs font-bold text-slate-600 uppercase tracking-wider">
                                        <th className="py-3 px-4">{t('departements')}</th>
                                        <th className="py-3 px-4">{t('directions')}</th>
                                        <th className="py-3 px-4 text-center">{t('divisions')}</th>
                                        {hasAnyAction && <th className="py-3 px-4 text-right">{t('actions')}</th>}
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-slate-100">
                                    {paginatedDepartements.map((departement) => (
                                        <tr key={departement.id} className="hover:bg-slate-50/80 transition">
                                            <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                                                🏢 {departement.nom_departement}
                                            </td>
                                            <td className="py-3.5 px-4">
                                                {departement.direction ? (
                                                    <span className="inline-flex items-center gap-1 bg-blue-50 text-[#11508f] border border-blue-200/80 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                                                        🏛️ {departement.direction.nom_direction}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic text-xs">{t('unattached')}</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-4 text-center">
                                                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700">
                                                    📑 {departement.divisions_count}
                                                </span>
                                            </td>
                                            {hasAnyAction && (
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex justify-end items-center gap-1.5">
                                                        {canEdit && (
                                                            <button
                                                                onClick={() => startEdit(departement)}
                                                                title={t('edit')}
                                                                className="p-2 rounded-xl text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition"
                                                            >
                                                                ✏️
                                                            </button>
                                                        )}
                                                        {canDelete && (
                                                            <button
                                                                onClick={() => destroy(departement.id)}
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
                                    {paginatedDepartements.length === 0 && (
                                        <tr>
                                            <td colSpan={hasAnyAction ? 4 : 3} className="py-8 text-center text-slate-400 italic text-xs">
                                                {t('pagination_no_data')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
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

            {/* Modal de Modification d'un Département */}
            <Modal show={editingDepartement !== null} onClose={() => setEditingDepartement(null)} maxWidth="lg">
                <form onSubmit={saveEdit} className="p-6 space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                        <h2 className="text-lg font-black text-slate-800">
                            {t('departements_edit', { name: editingDepartement?.nom_departement })}
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                {t('departements_name')} <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={editForm.data.nom_departement}
                                onChange={(e) => editForm.setData('nom_departement', e.target.value)}
                                className={`border rounded-xl px-3.5 py-2.5 text-sm w-full transition ${
                                    editForm.errors.nom_departement
                                        ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900'
                                        : 'border-slate-200 focus:ring-2 focus:ring-[#11508f]'
                                }`}
                                required
                            />
                            {editForm.errors.nom_departement && (
                                <p className="text-rose-600 text-xs font-semibold mt-1.5 flex items-center gap-1">
                                    <span>⚠️</span> {editForm.errors.nom_departement}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                {t('directions')} <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={editForm.data.direction_id}
                                onChange={(e) => editForm.setData('direction_id', e.target.value)}
                                className={`border rounded-xl px-3.5 py-2.5 text-sm w-full bg-white transition ${
                                    editForm.errors.direction_id
                                        ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900'
                                        : 'border-slate-200 focus:ring-2 focus:ring-[#11508f]'
                                }`}
                                required
                            >
                                <option value="">-- {t('directions_select')} --</option>
                                {directions.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        🏛️ {d.nom_direction}
                                    </option>
                                ))}
                            </select>
                            {editForm.errors.direction_id && (
                                <p className="text-rose-600 text-xs font-semibold mt-1.5 flex items-center gap-1">
                                    <span>⚠️</span> {editForm.errors.direction_id}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setEditingDepartement(null)}
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