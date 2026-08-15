import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import usePagination from '@/Hooks/usePagination';
import { useLanguage } from '@/Context/LanguageContext';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Index({ divisions = [], departements = [], directions = [] }) {
    const { auth = {}, errors: pageErrors } = usePage().props;
    const { permissions = [], isAdmin = false } = auth;
    const { t } = useLanguage();

    const canCreate = isAdmin || permissions.includes('creer_division') || permissions.includes('gerer_divisions') || permissions.includes('gerer_structure') || permissions.includes('modifier_structure');
    const canEdit = isAdmin || permissions.includes('modifier_division') || permissions.includes('gerer_divisions') || permissions.includes('gerer_structure') || permissions.includes('modifier_structure');
    const canDelete = isAdmin || permissions.includes('supprimer_division') || permissions.includes('gerer_divisions') || permissions.includes('gerer_structure') || permissions.includes('supprimer_structure');
    const hasAnyAction = canEdit || canDelete;

    const [editingDivision, setEditingDivision] = useState(null);

    // ---------- Search & Filters ----------
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDirection, setSelectedDirection] = useState('all');
    const [selectedDepartement, setSelectedDepartement] = useState('all');

    // Cascading Departements list based on selected Direction
    const filteredDepartementsList = useMemo(() => {
        if (selectedDirection === 'all') return departements;
        return departements.filter((dep) => String(dep.direction_id) === String(selectedDirection));
    }, [departements, selectedDirection]);

    // Filtered Divisions
    const filteredDivisions = useMemo(() => {
        return divisions.filter((div) => {
            const dirId = div.departement?.direction_id || div.departement?.direction?.id;
            const depId = div.departement_id || div.departement?.id;

            if (selectedDirection !== 'all' && String(dirId) !== String(selectedDirection)) return false;
            if (selectedDepartement !== 'all' && String(depId) !== String(selectedDepartement)) return false;

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchName = div.nom_division?.toLowerCase().includes(q);
                const matchDep = div.departement?.nom_departement?.toLowerCase().includes(q);
                const matchDir = div.departement?.direction?.nom_direction?.toLowerCase().includes(q);
                return matchName || matchDep || matchDir;
            }

            return true;
        });
    }, [divisions, searchQuery, selectedDirection, selectedDepartement]);

    // ---------- Pagination ----------
    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalItems,
        totalPages,
        paginatedItems: paginatedDivisions,
    } = usePagination(filteredDivisions, 10, [searchQuery, selectedDirection, selectedDepartement]);

    // Group departements by Direction for dropdowns
    const groupedDepartements = useMemo(() => {
        const groups = {};
        departements.forEach((dep) => {
            const dirName = dep.direction?.nom_direction || 'Direction non spécifiée';
            const groupKey = `🏛️ ${dirName}`;
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(dep);
        });
        return groups;
    }, [departements]);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        nom_division: '',
        departement_id: '',
    });

    const editForm = useForm({ nom_division: '', departement_id: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('divisions.store'), {
            onSuccess: () => reset(),
        });
    };

    const startEdit = (division) => {
        setEditingDivision(division);
        editForm.setData({
            nom_division: division.nom_division,
            departement_id: division.departement_id,
        });
        editForm.clearErrors();
    };

    const saveEdit = (e) => {
        e.preventDefault();
        if (!editingDivision) return;
        editForm.put(route('divisions.update', editingDivision.id), {
            onSuccess: () => setEditingDivision(null),
        });
    };

    const destroy = (id) => {
        if (confirm('Supprimer cette division ?')) {
            router.delete(route('divisions.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('structure_hierarchy_divisions')} />
            <div className="py-12">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-extrabold text-[#11508f] uppercase tracking-wider mb-1">
                                <span>🏛️ {t('structure_hierarchy_directions')}</span>
                                <span>›</span>
                                <span>📑 {t('divisions')}</span>
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('structure_hierarchy_divisions')}</h1>
                            <p className="text-xs text-slate-500 mt-1">
                                {t('directions_list')} ➜ {t('departements_list')}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                                {t('total')}: {divisions.length} {t('divisions')}
                            </span>
                        </div>
                    </div>

                    {/* Formulaire d'ajout d'une Division */}
                    {canCreate && (
                        <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 p-6">
                            <h2 className="text-base font-extrabold mb-4 text-slate-800 flex items-center gap-2">
                                <span>➕</span> {t('structure_add_division')}
                            </h2>
                            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        {t('divisions_name')} <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nom_division}
                                        onChange={(e) => {
                                            setData('nom_division', e.target.value);
                                            if (errors.nom_division) clearErrors('nom_division');
                                        }}
                                        placeholder="ex: Division Systèmes & Réseaux"
                                        className={`border rounded-xl px-3.5 py-2.5 text-sm w-full transition ${
                                            errors.nom_division
                                                ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900'
                                                : 'border-slate-200 focus:ring-2 focus:ring-[#11508f]'
                                        }`}
                                        required
                                    />
                                    {errors.nom_division && (
                                        <p className="text-rose-600 text-xs font-semibold mt-1.5 flex items-center gap-1">
                                            <span>⚠️</span> {errors.nom_division}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        {t('departements')} (🏛️ {t('directions')}) <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.departement_id}
                                        onChange={(e) => {
                                            setData('departement_id', e.target.value);
                                            if (errors.departement_id) clearErrors('departement_id');
                                        }}
                                        className={`border rounded-xl px-3.5 py-2.5 text-sm w-full bg-white transition ${
                                            errors.departement_id
                                                ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900'
                                                : 'border-slate-200 focus:ring-2 focus:ring-[#11508f]'
                                        }`}
                                        required
                                    >
                                        <option value="">-- {t('departements_select')} --</option>
                                        {Object.entries(groupedDepartements).map(([groupTitle, deps]) => (
                                            <optgroup key={groupTitle} label={groupTitle} className="font-bold text-slate-800 bg-slate-50">
                                                {deps.map((d) => (
                                                    <option key={d.id} value={d.id} className="font-medium text-slate-700">
                                                        🏢 {d.nom_departement}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                    {errors.departement_id && (
                                        <p className="text-rose-600 text-xs font-semibold mt-1.5 flex items-center gap-1">
                                            <span>⚠️</span> {errors.departement_id}
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

                    {/* Table des Divisions avec Filtres */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-2xl border border-slate-200 p-6 space-y-4">
                        
                        {/* Filtres & Recherche Bar */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
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
                                    onChange={(e) => {
                                        setSelectedDirection(e.target.value);
                                        setSelectedDepartement('all');
                                    }}
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

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    🏢 {t('departements')}
                                </label>
                                <select
                                    value={selectedDepartement}
                                    onChange={(e) => setSelectedDepartement(e.target.value)}
                                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs w-full bg-white focus:ring-1 focus:ring-[#11508f]"
                                >
                                    <option value="all">{t('all')} ({filteredDepartementsList.length})</option>
                                    {filteredDepartementsList.map((dep) => (
                                        <option key={dep.id} value={dep.id}>
                                            🏢 {dep.nom_departement}
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
                                        <th className="py-3 px-4">{t('divisions')}</th>
                                        <th className="py-3 px-4">{t('structure_lineage')}</th>
                                        <th className="py-3 px-4 text-center">{t('services')}</th>
                                        {hasAnyAction && <th className="py-3 px-4 text-right">{t('actions')}</th>}
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-slate-100">
                                    {paginatedDivisions.map((division) => {
                                        const dirName = division.departement?.direction?.nom_direction;
                                        const depName = division.departement?.nom_departement;

                                        return (
                                            <tr key={division.id} className="hover:bg-slate-50/80 transition">
                                                <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                                                    📑 {division.nom_division}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        {dirName && (
                                                            <span className="inline-flex items-center gap-1 bg-blue-50 text-[#11508f] border border-blue-200/80 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                                                                🏛️ {dirName}
                                                            </span>
                                                        )}
                                                        {depName && (
                                                            <>
                                                                <span className="text-slate-400 font-bold text-xs">›</span>
                                                                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
                                                                    🏢 {depName}
                                                                </span>
                                                            </>
                                                        )}
                                                        {!dirName && !depName && (
                                                            <span className="text-slate-400 italic text-xs">{t('unattached')}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700">
                                                        ⚙️ {division.services_count}
                                                    </span>
                                                </td>
                                                {hasAnyAction && (
                                                    <td className="py-3.5 px-4 text-right">
                                                        <div className="flex justify-end items-center gap-1.5">
                                                            {canEdit && (
                                                                <button
                                                                    onClick={() => startEdit(division)}
                                                                    title={t('edit')}
                                                                    className="p-2 rounded-xl text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition"
                                                                >
                                                                    ✏️
                                                                </button>
                                                            )}
                                                            {canDelete && (
                                                                <button
                                                                    onClick={() => destroy(division.id)}
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
                                        );
                                    })}
                                    {paginatedDivisions.length === 0 && (
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

            {/* Modal de Modification d'une Division */}
            <Modal show={editingDivision !== null} onClose={() => setEditingDivision(null)} maxWidth="lg">
                <form onSubmit={saveEdit} className="p-6 space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                        <h2 className="text-lg font-black text-slate-800">
                            {t('divisions_edit', { name: editingDivision?.nom_division })}
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                {t('divisions_name')} <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={editForm.data.nom_division}
                                onChange={(e) => editForm.setData('nom_division', e.target.value)}
                                className={`border rounded-xl px-3.5 py-2.5 text-sm w-full transition ${
                                    editForm.errors.nom_division
                                        ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900'
                                        : 'border-slate-200 focus:ring-2 focus:ring-[#11508f]'
                                }`}
                                required
                            />
                            {editForm.errors.nom_division && (
                                <p className="text-rose-600 text-xs font-semibold mt-1.5 flex items-center gap-1">
                                    <span>⚠️</span> {editForm.errors.nom_division}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                {t('departements')} <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={editForm.data.departement_id}
                                onChange={(e) => editForm.setData('departement_id', e.target.value)}
                                className={`border rounded-xl px-3.5 py-2.5 text-sm w-full bg-white transition ${
                                    editForm.errors.departement_id
                                        ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900'
                                        : 'border-slate-200 focus:ring-2 focus:ring-[#11508f]'
                                }`}
                                required
                            >
                                <option value="">-- {t('departements_select')} --</option>
                                {Object.entries(groupedDepartements).map(([groupTitle, deps]) => (
                                    <optgroup key={groupTitle} label={groupTitle} className="font-bold text-slate-800 bg-slate-50">
                                        {deps.map((d) => (
                                            <option key={d.id} value={d.id} className="font-medium text-slate-700">
                                                🏢 {d.nom_departement}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            {editForm.errors.departement_id && (
                                <p className="text-rose-600 text-xs font-semibold mt-1.5 flex items-center gap-1">
                                    <span>⚠️</span> {editForm.errors.departement_id}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setEditingDivision(null)}
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