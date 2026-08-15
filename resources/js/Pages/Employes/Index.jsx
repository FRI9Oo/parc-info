import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import usePagination from '@/Hooks/usePagination';
import { useLanguage } from '@/Context/LanguageContext';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Index({ employes, services }) {
    const { auth = {}, errors: pageErrors } = usePage().props;
    const { permissions = [], isAdmin = false } = auth;
    const { t } = useLanguage();

    const canCreate = isAdmin || permissions.includes('gerer_employes') || permissions.includes('creer_employe');
    const canEdit = isAdmin || permissions.includes('gerer_employes') || permissions.includes('modifier_employe');
    const canDelete = isAdmin || permissions.includes('gerer_employes') || permissions.includes('supprimer_employe');
    const hasAnyAction = canEdit || canDelete;

    const [editingEmploye, setEditingEmploye] = useState(null);

    // ---------- Search & Filter State ----------
    const [searchQuery, setSearchQuery] = useState('');
    const [serviceFilter, setServiceFilter] = useState('all');

    const filteredEmployes = useMemo(() => {
        return employes.filter((e) => {
            if (serviceFilter !== 'all' && String(e.service_id) !== String(serviceFilter)) {
                return false;
            }

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchMat = e.matricule?.toLowerCase().includes(q);
                const matchNom = e.nom?.toLowerCase().includes(q);
                const matchPrenom = e.prenom?.toLowerCase().includes(q);
                const matchFonction = e.fonction?.toLowerCase().includes(q);
                const matchService = e.service?.nom_service?.toLowerCase().includes(q);

                return matchMat || matchNom || matchPrenom || matchFonction || matchService;
            }

            return true;
        });
    }, [employes, searchQuery, serviceFilter]);

    // ---------- Pagination ----------
    const {
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalItems,
        totalPages,
        paginatedItems: paginatedEmployes,
    } = usePagination(filteredEmployes, 10, [searchQuery, serviceFilter]);

    // ---------- Forms ----------
    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        matricule: '',
        prenom: '',
        nom: '',
        fonction: '',
        service_id: '',
    });

    const editForm = useForm({
        matricule: '',
        prenom: '',
        nom: '',
        fonction: '',
        service_id: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('employes.store'), { onSuccess: () => reset() });
    };

    const startEdit = (employe) => {
        setEditingEmploye(employe);
        editForm.setData({
            matricule: employe.matricule,
            prenom: employe.prenom,
            nom: employe.nom,
            fonction: employe.fonction || '',
            service_id: employe.service_id || '',
        });
        editForm.clearErrors();
    };

    const saveEdit = (e) => {
        e.preventDefault();
        if (!editingEmploye) return;
        editForm.put(route('employes.update', editingEmploye.id), {
            onSuccess: () => setEditingEmploye(null),
        });
    };

    const destroy = (id) => {
        if (confirm('Supprimer cet employé ?')) {
            router.delete(route('employes.destroy', id));
        }
    };

    const serviceLabel = (service) => {
        if (!service) return '';
        const dep = service.division?.departement;
        return `${service.nom_service}${dep ? ` (${dep.nom_departement})` : ''}`;
    };

    return (
        <AuthenticatedLayout>
            <Head title={t('employes_title')} />
            <div className="py-12">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {pageErrors?.delete && (
                        <div className="bg-rose-50 text-rose-700 text-sm p-4 rounded-xl border border-rose-200 shadow-sm flex items-center gap-2">
                            <span>⚠️</span> {pageErrors.delete}
                        </div>
                    )}

                    {canCreate && (
                        <div className="bg-white shadow-sm sm:rounded-2xl border border-slate-200 p-6">
                            <h2 className="text-base font-extrabold mb-4 text-slate-800 flex items-center gap-2">
                                <span>➕</span> {t('employes_add_new')}
                            </h2>
                            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('employes_matricule')} <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        value={data.matricule}
                                        onChange={(e) => {
                                            setData('matricule', e.target.value);
                                            if (errors.matricule) clearErrors('matricule');
                                        }}
                                        placeholder="ex: EMP-2026-01"
                                        className={`border rounded-xl px-3.5 py-2.5 text-sm w-full transition font-mono ${
                                            errors.matricule ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900' : 'border-slate-200 focus:ring-2 focus:ring-[#11508f]'
                                        }`}
                                        required
                                    />
                                    {errors.matricule && <p className="text-rose-600 text-xs font-semibold mt-1 flex items-center gap-1"><span>⚠️</span> {errors.matricule}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('services')}</label>
                                    <select
                                        value={data.service_id}
                                        onChange={(e) => {
                                            setData('service_id', e.target.value);
                                            if (errors.service_id) clearErrors('service_id');
                                        }}
                                        className={`border rounded-xl px-3.5 py-2.5 text-sm w-full bg-white transition ${
                                            errors.service_id ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900' : 'border-slate-200 focus:ring-2 focus:ring-[#11508f]'
                                        }`}
                                    >
                                        <option value="">-- {t('employes_filter_service')} --</option>
                                        {services.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                ⚙️ {serviceLabel(s)}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.service_id && <p className="text-rose-600 text-xs font-semibold mt-1 flex items-center gap-1"><span>⚠️</span> {errors.service_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('employes_nom')} <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        value={data.nom}
                                        onChange={(e) => {
                                            setData('nom', e.target.value);
                                            if (errors.nom) clearErrors('nom');
                                        }}
                                        placeholder={t('employes_nom') + " *"}
                                        className={`border rounded-xl px-3.5 py-2.5 text-sm w-full transition ${
                                            errors.nom ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900' : 'border-slate-200 focus:ring-2 focus:ring-[#11508f]'
                                        }`}
                                        required
                                    />
                                    {errors.nom && <p className="text-rose-600 text-xs font-semibold mt-1 flex items-center gap-1"><span>⚠️</span> {errors.nom}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('employes_prenom')} <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        value={data.prenom}
                                        onChange={(e) => {
                                            setData('prenom', e.target.value);
                                            if (errors.prenom) clearErrors('prenom');
                                        }}
                                        placeholder={t('employes_prenom') + " *"}
                                        className={`border rounded-xl px-3.5 py-2.5 text-sm w-full transition ${
                                            errors.prenom ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900' : 'border-slate-200 focus:ring-2 focus:ring-[#11508f]'
                                        }`}
                                        required
                                    />
                                    {errors.prenom && <p className="text-rose-600 text-xs font-semibold mt-1 flex items-center gap-1"><span>⚠️</span> {errors.prenom}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('employes_fonction')}</label>
                                    <input
                                        type="text"
                                        value={data.fonction}
                                        onChange={(e) => {
                                            setData('fonction', e.target.value);
                                            if (errors.fonction) clearErrors('fonction');
                                        }}
                                        placeholder="ex: Ingénieur Systèmes, Technicien Support, Responsable RH..."
                                        className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm w-full focus:ring-2 focus:ring-[#11508f]"
                                    />
                                </div>

                                <div className="md:col-span-2 flex justify-end pt-1">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-[#11508f] text-white px-6 py-2.5 rounded-xl text-xs font-extrabold hover:bg-[#0d3d6e] transition shadow-md shadow-[#11508f]/20 disabled:opacity-50"
                                    >
                                        {t('employes_save_btn')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Card: Liste avec Barre de recherche */}
                    <div className="lux-card p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{t('employes_title')} ({filteredEmployes.length})</h1>
                                <a
                                    href={route('exports.employes.csv')}
                                    className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/10"
                                >
                                    📥 {t('export_csv')}
                                </a>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 md:max-w-xl">
                                <input
                                    type="text"
                                    placeholder={t('search_placeholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm w-full focus:ring-1 focus:ring-[#11508f] bg-slate-50/50"
                                />

                                <select
                                    value={serviceFilter}
                                    onChange={(e) => setServiceFilter(e.target.value)}
                                    className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm w-full bg-white focus:ring-1 focus:ring-[#11508f]"
                                >
                                    <option value="all">{t('all')}</option>
                                    {services.map((s) => (
                                        <option key={s.id} value={s.id}>{s.nom_service}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b bg-gray-50 text-sm">
                                        <th className="py-2.5 px-3">{t('employes_matricule')}</th>
                                        <th className="py-2.5 px-3">{t('employes_nom')} & {t('employes_prenom')}</th>
                                        <th className="py-2.5 px-3">{t('employes_fonction')}</th>
                                        <th className="py-2.5 px-3">{t('services')}</th>
                                        <th className="py-2.5 px-3 text-center">{t('affectations')}</th>
                                        {hasAnyAction && <th className="py-2.5 px-3">{t('actions')}</th>}
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {paginatedEmployes.map((employe) => (
                                        <tr key={employe.id} className="border-b hover:bg-gray-50 transition">
                                            <td className="py-2.5 px-3 font-mono font-medium text-gray-900">{employe.matricule}</td>
                                            <td className="py-2.5 px-3 font-medium text-gray-900">
                                                {employe.nom} {employe.prenom}
                                            </td>
                                            <td className="py-2.5 px-3 text-gray-600">{employe.fonction || '—'}</td>
                                            <td className="py-2.5 px-3 text-gray-600">{employe.service?.nom_service || '—'}</td>
                                            <td className="py-2.5 px-3 text-center">{employe.affectations_count || 0}</td>
                                            {hasAnyAction && (
                                                <td className="py-2.5 px-3">
                                                    <div className="flex items-center gap-1.5">
                                                        {canEdit && (
                                                            <button
                                                                onClick={() => startEdit(employe)}
                                                                title={t('edit')}
                                                                className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition"
                                                            >
                                                                ✏️
                                                            </button>
                                                        )}
                                                        {canDelete && (
                                                            <button
                                                                onClick={() => destroy(employe.id)}
                                                                title={t('delete')}
                                                                className="p-1.5 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition"
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

                            {filteredEmployes.length === 0 && (
                                <p className="text-center text-gray-500 text-sm py-8">
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

            {/* Modal de Modification d'un Employé */}
            <Modal show={editingEmploye !== null} onClose={() => setEditingEmploye(null)} maxWidth="lg">
                <form onSubmit={saveEdit} className="p-6 space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 border-b pb-2">
                        {t('employes_edit', { name: `${editingEmploye?.nom} ${editingEmploye?.prenom}` })}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">{t('employes_matricule')} <span className="text-rose-500">*</span></label>
                            <input
                                type="text"
                                value={editForm.data.matricule}
                                onChange={(e) => editForm.setData('matricule', e.target.value)}
                                className={`border rounded-xl px-3.5 py-2.5 text-sm w-full transition font-mono ${
                                    editForm.errors.matricule ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900' : 'border-slate-200 focus:ring-2 focus:ring-[#11508f]'
                                }`}
                                required
                            />
                            {editForm.errors.matricule && <p className="text-rose-600 text-xs font-semibold mt-1 flex items-center gap-1"><span>⚠️</span> {editForm.errors.matricule}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">{t('services')}</label>
                            <select
                                value={editForm.data.service_id}
                                onChange={(e) => editForm.setData('service_id', e.target.value)}
                                className={`border rounded-xl px-3.5 py-2.5 text-sm w-full bg-white transition ${
                                    editForm.errors.service_id ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900' : 'border-slate-200 focus:ring-2 focus:ring-[#11508f]'
                                }`}
                            >
                                <option value="">-- {t('employes_filter_service')} --</option>
                                {services.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        ⚙️ {serviceLabel(s)}
                                    </option>
                                ))}
                            </select>
                            {editForm.errors.service_id && <p className="text-rose-600 text-xs font-semibold mt-1 flex items-center gap-1"><span>⚠️</span> {editForm.errors.service_id}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">{t('employes_nom')} <span className="text-rose-500">*</span></label>
                            <input
                                type="text"
                                value={editForm.data.nom}
                                onChange={(e) => editForm.setData('nom', e.target.value)}
                                className={`border rounded-xl px-3.5 py-2.5 text-sm w-full transition ${
                                    editForm.errors.nom ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900' : 'border-slate-200 focus:ring-2 focus:ring-[#11508f]'
                                }`}
                                required
                            />
                            {editForm.errors.nom && <p className="text-rose-600 text-xs font-semibold mt-1 flex items-center gap-1"><span>⚠️</span> {editForm.errors.nom}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">{t('employes_prenom')} <span className="text-rose-500">*</span></label>
                            <input
                                type="text"
                                value={editForm.data.prenom}
                                onChange={(e) => editForm.setData('prenom', e.target.value)}
                                className={`border rounded-xl px-3.5 py-2.5 text-sm w-full transition ${
                                    editForm.errors.prenom ? 'border-rose-500 ring-2 ring-rose-400 bg-rose-50/40 text-rose-900' : 'border-slate-200 focus:ring-2 focus:ring-[#11508f]'
                                }`}
                                required
                            />
                            {editForm.errors.prenom && <p className="text-rose-600 text-xs font-semibold mt-1 flex items-center gap-1"><span>⚠️</span> {editForm.errors.prenom}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1">{t('employes_fonction')}</label>
                            <input
                                type="text"
                                value={editForm.data.fonction}
                                onChange={(e) => editForm.setData('fonction', e.target.value)}
                                className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm w-full focus:ring-2 focus:ring-[#11508f]"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setEditingEmploye(null)}
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