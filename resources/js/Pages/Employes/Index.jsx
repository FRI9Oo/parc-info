import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Index({ employes, services }) {
    const { errors: pageErrors } = usePage().props;
    const [editingId, setEditingId] = useState(null);

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
        setEditingId(employe.id);
        editForm.setData({
            matricule: employe.matricule,
            prenom: employe.prenom,
            nom: employe.nom,
            fonction: employe.fonction,
            service_id: employe.service_id,
        });
    };

    const saveEdit = (e, id) => {
        e.preventDefault();
        editForm.put(route('employes.update', id), {
            onSuccess: () => setEditingId(null),
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

                    {/* Card: Ajouter un employé */}
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
                                className="border rounded px-3 py-2 text-sm"
                                required
                            >
                                <option value="">-- Choisir Service * --</option>
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
                                placeholder="Fonction / Poste"
                                className="border rounded px-3 py-2 text-sm md:col-span-2"
                            />
                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-gray-800 text-white px-5 py-2 rounded text-sm hover:bg-gray-700 transition disabled:opacity-50"
                                >
                                    Ajouter l'employé
                                </button>
                            </div>
                            {Object.keys(errors).length > 0 && (
                                <div className="md:col-span-2 text-red-600 text-xs mt-1">
                                    {Object.values(errors).map((err, i) => (
                                        <p key={i}>{err}</p>
                                    ))}
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Card: Liste avec Barre de recherche */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h1 className="text-xl font-semibold text-gray-800">Liste des Employés ({filteredEmployes.length})</h1>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 md:max-w-xl">
                                <input
                                    type="text"
                                    placeholder="Rechercher (Matricule, Nom, Prénom...)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="border rounded px-3 py-1.5 text-sm w-full"
                                />

                                <select
                                    value={serviceFilter}
                                    onChange={(e) => setServiceFilter(e.target.value)}
                                    className="border rounded px-3 py-1.5 text-sm w-full bg-white"
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
                                        <th className="py-2.5 px-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {filteredEmployes.map((employe) => (
                                        <tr key={employe.id} className="border-b hover:bg-gray-50 transition">
                                            {editingId === employe.id ? (
                                                <td colSpan={6} className="py-3 px-3 bg-yellow-50/50">
                                                    <form
                                                        onSubmit={(e) => saveEdit(e, employe.id)}
                                                        className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center text-xs"
                                                    >
                                                        <input
                                                            value={editForm.data.matricule}
                                                            onChange={(e) => editForm.setData('matricule', e.target.value)}
                                                            className="border rounded px-2 py-1"
                                                            placeholder="Matricule"
                                                            autoFocus
                                                        />
                                                        <input
                                                            value={editForm.data.nom}
                                                            onChange={(e) => editForm.setData('nom', e.target.value)}
                                                            className="border rounded px-2 py-1"
                                                            placeholder="Nom"
                                                        />
                                                        <input
                                                            value={editForm.data.prenom}
                                                            onChange={(e) => editForm.setData('prenom', e.target.value)}
                                                            className="border rounded px-2 py-1"
                                                            placeholder="Prénom"
                                                        />
                                                        <input
                                                            value={editForm.data.fonction}
                                                            onChange={(e) => editForm.setData('fonction', e.target.value)}
                                                            className="border rounded px-2 py-1"
                                                            placeholder="Fonction"
                                                        />
                                                        <select
                                                            value={editForm.data.service_id}
                                                            onChange={(e) => editForm.setData('service_id', e.target.value)}
                                                            className="border rounded px-2 py-1 bg-white"
                                                        >
                                                            {services.map((s) => (
                                                                <option key={s.id} value={s.id}>{s.nom_service}</option>
                                                            ))}
                                                        </select>

                                                        <div className="md:col-span-5 flex justify-end gap-2 pt-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => setEditingId(null)}
                                                                className="text-gray-500 font-medium px-2 py-1"
                                                            >
                                                                Annuler
                                                            </button>
                                                            <button type="submit" className="bg-green-700 text-white px-3 py-1 rounded font-medium">
                                                                Enregistrer
                                                            </button>
                                                        </div>
                                                    </form>
                                                </td>
                                            ) : (
                                                <>
                                                    <td className="py-2.5 px-3 font-mono font-medium text-gray-900">{employe.matricule}</td>
                                                    <td className="py-2.5 px-3 font-medium text-gray-900">
                                                        {employe.nom} {employe.prenom}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-gray-600">{employe.fonction || '—'}</td>
                                                    <td className="py-2.5 px-3 text-gray-600">{employe.service?.nom_service || '—'}</td>
                                                    <td className="py-2.5 px-3 text-center">{employe.affectations_count || 0}</td>
                                                    <td className="py-2.5 px-3">
                                                        <div className="flex gap-3">
                                                            <button
                                                                onClick={() => startEdit(employe)}
                                                                className="text-indigo-600 font-medium text-xs hover:underline"
                                                            >
                                                                Modifier
                                                            </button>
                                                            <button
                                                                onClick={() => destroy(employe.id)}
                                                                className="text-red-600 font-medium text-xs hover:underline"
                                                            >
                                                                Supprimer
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
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
        </AuthenticatedLayout>
    );
}