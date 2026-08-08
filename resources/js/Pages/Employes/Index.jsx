import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Index({ employes, services }) {
    const { auth = {}, errors: pageErrors } = usePage().props;
    const { permissions = [], isAdmin = false } = auth;

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

    // ---------- Forms ----------
    const { data, setData, post, processing, reset, errors } = useForm({
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
            <Head title="Gestion des Employés" />
            <div className="py-12">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {pageErrors?.delete && (
                        <div className="bg-red-50 text-red-700 text-sm p-3 rounded shadow-sm">
                            {pageErrors.delete}
                        </div>
                    )}

                    {canCreate && (
                        <div className="bg-white shadow-sm sm:rounded-lg p-6">
                            <h1 className="text-xl font-semibold mb-4 text-gray-800">Ajouter un employé</h1>
                            <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={data.matricule}
                                    onChange={(e) => setData('matricule', e.target.value)}
                                    placeholder="Matricule *"
                                    className="border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-gray-800"
                                    required
                                />
                                <select
                                    value={data.service_id}
                                    onChange={(e) => setData('service_id', e.target.value)}
                                    className="border rounded px-3 py-2 text-sm bg-white focus:ring-1 focus:ring-gray-800"
                                >
                                    <option value="">Sélectionner un service...</option>
                                    {services.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {serviceLabel(s)}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={data.nom}
                                    onChange={(e) => setData('nom', e.target.value)}
                                    placeholder="Nom *"
                                    className="border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-gray-800"
                                    required
                                />
                                <input
                                    type="text"
                                    value={data.prenom}
                                    onChange={(e) => setData('prenom', e.target.value)}
                                    placeholder="Prénom *"
                                    className="border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-gray-800"
                                    required
                                />
                                <input
                                    type="text"
                                    value={data.fonction}
                                    onChange={(e) => setData('fonction', e.target.value)}
                                    placeholder="Fonction (ex: Technicien, Ingénieur...)"
                                    className="border rounded px-3 py-2 text-sm md:col-span-2 focus:ring-1 focus:ring-gray-800"
                                />

                                <div className="md:col-span-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-[#11508f] text-white px-5 py-2 rounded text-sm font-medium hover:bg-[#0d3d6e] transition disabled:opacity-50"
                                    >
                                        Enregistrer l'employé
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Card: Liste avec Barre de recherche */}
                    <div className="lux-card p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Liste des Employés ({filteredEmployes.length})</h1>
                                <a
                                    href={route('exports.employes.csv')}
                                    className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/10"
                                >
                                    📥 Exporter CSV
                                </a>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 md:max-w-xl">
                                <input
                                    type="text"
                                    placeholder="Rechercher (Matricule, Nom, Prénom...)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm w-full focus:ring-1 focus:ring-[#11508f] bg-slate-50/50"
                                />

                                <select
                                    value={serviceFilter}
                                    onChange={(e) => setServiceFilter(e.target.value)}
                                    className="border border-slate-200 rounded-xl px-3.5 py-2 text-sm w-full bg-white focus:ring-1 focus:ring-[#11508f]"
                                >
                                    <option value="all">Tous les services</option>
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
                                        <th className="py-2.5 px-3">Matricule</th>
                                        <th className="py-2.5 px-3">Nom & Prénom</th>
                                        <th className="py-2.5 px-3">Fonction</th>
                                        <th className="py-2.5 px-3">Service</th>
                                        <th className="py-2.5 px-3 text-center">Matériels Affectés</th>
                                        {hasAnyAction && <th className="py-2.5 px-3">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {filteredEmployes.map((employe) => (
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
                                                                title="Modifier l'employé"
                                                                className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition"
                                                            >
                                                                ✏️
                                                            </button>
                                                        )}
                                                        {canDelete && (
                                                            <button
                                                                onClick={() => destroy(employe.id)}
                                                                title="Supprimer l'employé"
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
                                    Aucun employé ne correspond aux critères de recherche.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Modification d'un Employé */}
            <Modal show={editingEmploye !== null} onClose={() => setEditingEmploye(null)} maxWidth="lg">
                <form onSubmit={saveEdit} className="p-6 space-y-4">
                    <h2 className="text-lg font-bold text-slate-800 border-b pb-2">
                        Modifier l'employé : {editingEmploye?.nom} {editingEmploye?.prenom}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Matricule *</label>
                            <input
                                type="text"
                                value={editForm.data.matricule}
                                onChange={(e) => editForm.setData('matricule', e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-1 focus:ring-[#11508f]"
                                required
                            />
                            {editForm.errors.matricule && <p className="text-red-600 text-xs mt-1">{editForm.errors.matricule}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Service</label>
                            <select
                                value={editForm.data.service_id}
                                onChange={(e) => editForm.setData('service_id', e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm w-full bg-white focus:ring-1 focus:ring-[#11508f]"
                            >
                                <option value="">Sélectionner un service...</option>
                                {services.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {serviceLabel(s)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Nom *</label>
                            <input
                                type="text"
                                value={editForm.data.nom}
                                onChange={(e) => editForm.setData('nom', e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-1 focus:ring-[#11508f]"
                                required
                            />
                            {editForm.errors.nom && <p className="text-red-600 text-xs mt-1">{editForm.errors.nom}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Prénom *</label>
                            <input
                                type="text"
                                value={editForm.data.prenom}
                                onChange={(e) => editForm.setData('prenom', e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-1 focus:ring-[#11508f]"
                                required
                            />
                            {editForm.errors.prenom && <p className="text-red-600 text-xs mt-1">{editForm.errors.prenom}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Fonction</label>
                            <input
                                type="text"
                                value={editForm.data.fonction}
                                onChange={(e) => editForm.setData('fonction', e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-1 focus:ring-[#11508f]"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => setEditingEmploye(null)}
                            className="text-slate-600 text-sm font-medium px-4 py-2 hover:text-slate-900"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={editForm.processing}
                            className="bg-[#11508f] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#0d3d6e] transition disabled:opacity-50"
                        >
                            Enregistrer les modifications
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}